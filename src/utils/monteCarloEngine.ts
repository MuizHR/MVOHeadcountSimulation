import {
  ProbabilityRange,
  DistributionType,
  SimulationResult,
  MonteCarloOutput,
  MonteCarloInputs,
} from '../types/monteCarlo';

function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

function randomUniform(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomTriangular(min: number, max: number, mode: number): number {
  const u = Math.random();
  const f = (mode - min) / (max - min);

  if (u < f) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

export function sampleFromDistribution(range: ProbabilityRange): number {
  const { min, max, mostLikely, distribution } = range;

  switch (distribution) {
    case 'normal': {
      const mean = (min + max) / 2;
      const stdDev = (max - min) / 6;
      let value = randomNormal(mean, stdDev);
      value = Math.max(min, Math.min(max, value));
      return value;
    }
    case 'uniform':
      return randomUniform(min, max);
    case 'triangular':
      return randomTriangular(min, max, mostLikely || (min + max) / 2);
    default:
      return randomUniform(min, max);
  }
}

function calculatePercentile(sortedData: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedData.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) {
    return sortedData[lower];
  }

  return sortedData[lower] * (1 - weight) + sortedData[upper] * weight;
}

function calculateMode(data: number[], binCount: number = 50): number {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binSize = (max - min) / binCount;

  const bins = new Array(binCount).fill(0);

  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    bins[binIndex]++;
  });

  const maxFrequencyIndex = bins.indexOf(Math.max(...bins));
  return min + (maxFrequencyIndex + 0.5) * binSize;
}

function createHistogram(data: number[], binCount: number = 50): { bins: number[]; frequencies: number[] } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binSize = (max - min) / binCount;

  const bins: number[] = [];
  const frequencies: number[] = new Array(binCount).fill(0);

  for (let i = 0; i < binCount; i++) {
    bins.push(min + i * binSize + binSize / 2);
  }

  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
    frequencies[binIndex]++;
  });

  const total = data.length;
  const normalizedFrequencies = frequencies.map(f => (f / total) * 100);

  return { bins, frequencies: normalizedFrequencies };
}

export function runMonteCarloSimulation(
  baseWorkloadHours: number,
  baseComplexity: number,
  baseService: number,
  baseAutomation: number,
  baseCoverage: number,
  inputs: MonteCarloInputs,
  workTypeCoefficients?: {
    productivityRate: number;
    complexityFactor: number;
    varianceLevel: number;
    riskMultiplier: number;
  }
): MonteCarloOutput {
  const results: SimulationResult[] = [];
  const availableHoursPerFTE = 160;

  for (let i = 0; i < inputs.iterations; i++) {
    const variables: Record<string, number> = {};

    const workloadVariance = inputs.variables.workloadVolume?.enabled
      ? sampleFromDistribution(inputs.variables.workloadVolume.range)
      : 1.0;

    let complexityFactor = inputs.variables.complexityFactor?.enabled
      ? baseComplexity * sampleFromDistribution(inputs.variables.complexityFactor.range)
      : baseComplexity;

    if (workTypeCoefficients) {
      complexityFactor = complexityFactor * workTypeCoefficients.complexityFactor;
    }

    const serviceFactor = inputs.variables.serviceFactor?.enabled
      ? baseService * sampleFromDistribution(inputs.variables.serviceFactor.range)
      : baseService;

    const automationReduction = inputs.variables.automationFactor?.enabled
      ? sampleFromDistribution(inputs.variables.automationFactor.range)
      : baseAutomation;

    let utilizationRate = inputs.variables.utilizationRate?.enabled
      ? sampleFromDistribution(inputs.variables.utilizationRate.range)
      : 0.85;

    if (workTypeCoefficients) {
      utilizationRate = utilizationRate * workTypeCoefficients.productivityRate;
    }

    variables.workloadVariance = workloadVariance;
    variables.complexityFactor = complexityFactor;
    variables.serviceFactor = serviceFactor;
    variables.automationReduction = automationReduction;
    variables.utilizationRate = utilizationRate;

    let requiredHours = baseWorkloadHours * workloadVariance;
    requiredHours = requiredHours * complexityFactor * serviceFactor * baseCoverage;
    requiredHours = requiredHours * (1 - automationReduction);

    if (workTypeCoefficients) {
      const randomFactor = randomNormal(1.0, workTypeCoefficients.varianceLevel);
      requiredHours = requiredHours * randomFactor * workTypeCoefficients.riskMultiplier;
    }

    const effectiveCapacity = availableHoursPerFTE * utilizationRate;
    const fte = requiredHours / effectiveCapacity;

    results.push({
      iteration: i + 1,
      fte: Math.max(1, fte),
      variables,
    });
  }

  const fteValues = results.map(r => r.fte).sort((a, b) => a - b);

  const mean = fteValues.reduce((sum, val) => sum + val, 0) / fteValues.length;
  const median = calculatePercentile(fteValues, 50);
  const mode = calculateMode(fteValues);

  const variance = fteValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / fteValues.length;
  const stdDev = Math.sqrt(variance);

  const min = fteValues[0];
  const max = fteValues[fteValues.length - 1];
  const p10 = calculatePercentile(fteValues, 10);
  const p25 = calculatePercentile(fteValues, 25);
  const p75 = calculatePercentile(fteValues, 75);
  const p90 = calculatePercentile(fteValues, 90);

  const alpha = (100 - inputs.confidenceLevel) / 2;
  const lowerPercentile = alpha;
  const upperPercentile = 100 - alpha;

  const confidenceIntervals = {
    level: inputs.confidenceLevel,
    lower: calculatePercentile(fteValues, lowerPercentile),
    upper: calculatePercentile(fteValues, upperPercentile),
  };

  const distribution = createHistogram(fteValues, 50);

  return {
    results,
    statistics: {
      mean,
      median,
      mode,
      stdDev,
      min,
      max,
      p10,
      p25,
      p75,
      p90,
    },
    confidenceIntervals,
    distribution,
  };
}

export function calculateConfidenceLevel(
  baselineFTE: number,
  monteCarloOutput: MonteCarloOutput
): number {
  const sortedResults = monteCarloOutput.results
    .map(r => r.fte)
    .sort((a, b) => a - b);

  const countBelowOrEqual = sortedResults.filter(fte => fte <= baselineFTE).length;
  return (countBelowOrEqual / sortedResults.length) * 100;
}

export function assessRiskLevel(
  baselineFTE: number,
  monteCarloOutput: MonteCarloOutput
): 'low' | 'medium' | 'high' {
  const { p10, p90 } = monteCarloOutput.statistics;

  if (baselineFTE >= p10 && baselineFTE <= p90) {
    return 'low';
  } else if (baselineFTE >= monteCarloOutput.statistics.min && baselineFTE <= monteCarloOutput.statistics.max) {
    return 'medium';
  } else {
    return 'high';
  }
}
