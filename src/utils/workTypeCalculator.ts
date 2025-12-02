import { WorkTypeCoefficients, HeadcountScenario, MonteCarloResults } from '../types/workType';

export function normalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z0 * stdDev;
}

export function percentile(sortedArray: number[], p: number): number {
  if (sortedArray.length === 0) return 0;
  const index = (p / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

export function mean(array: number[]): number {
  if (array.length === 0) return 0;
  return array.reduce((sum, val) => sum + val, 0) / array.length;
}

export function calculateBaselineWorkload(
  volume: number,
  complexityFactor: number,
  productivityRate: number,
  hoursPerFTE: number = 160
): { baselineDuration: number; baselineHeadcount: number } {
  const baselineDuration = (volume * complexityFactor) / productivityRate;
  const baselineHeadcount = Math.max(1, Math.ceil(baselineDuration / hoursPerFTE));

  return {
    baselineDuration,
    baselineHeadcount,
  };
}

export function runMonteCarloSimulation(
  baselineDuration: number,
  varianceLevel: number,
  riskMultiplier: number,
  targetDeadlineDays: number | undefined,
  iterations: number = 10000
): MonteCarloResults {
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const randomFactor = normalRandom(1.0, varianceLevel);
    const simulatedDuration = baselineDuration * randomFactor * riskMultiplier;
    results.push(simulatedDuration);
  }

  results.sort((a, b) => a - b);

  const p50Duration = percentile(results, 50);
  const p75Duration = percentile(results, 75);
  const p90Duration = percentile(results, 90);
  const avgDuration = mean(results);

  let failureRiskBaseline = 0;
  if (targetDeadlineDays) {
    const failures = results.filter((d) => d > targetDeadlineDays).length;
    failureRiskBaseline = (failures / iterations) * 100;
  }

  return {
    iterations,
    p50Duration,
    p75Duration,
    p90Duration,
    avgDuration,
    failureRiskBaseline,
    rawResults: results,
    headcountScenarios: [],
  };
}

export function calculateHeadcountScenarios(
  monteCarloResults: MonteCarloResults,
  minHeadcountRule: number,
  targetDeadlineDays: number | undefined,
  costPerFTE: number = 5000
): HeadcountScenario[] {
  const scenarios: HeadcountScenario[] = [];
  const maxHeadcount = 6;

  for (let h = 1; h <= maxHeadcount; h++) {
    const scalingFactor = Math.sqrt(h);
    const scaledDuration = monteCarloResults.avgDuration / scalingFactor;

    let failureRisk = 0;
    if (targetDeadlineDays) {
      const scaledResults = monteCarloResults.rawResults.map((d) => d / scalingFactor);
      const failures = scaledResults.filter((d) => d > targetDeadlineDays).length;
      failureRisk = (failures / scaledResults.length) * 100;
    }

    const monthlyCost = h * costPerFTE;
    const meetsThreshold = h >= minHeadcountRule && failureRisk <= 15;

    scenarios.push({
      headcount: h,
      scaledDuration,
      failureRisk,
      monthlyCost,
      meetsThreshold,
    });
  }

  return scenarios;
}

export function determineMVO(
  headcountScenarios: HeadcountScenario[],
  minHeadcountRule: number
): { mvoHeadcount: number; mvoConfidenceLevel: number; mvoRiskNotes: string } {
  const viableScenarios = headcountScenarios.filter(
    (s) => s.headcount >= minHeadcountRule && s.meetsThreshold
  );

  if (viableScenarios.length === 0) {
    return {
      mvoHeadcount: minHeadcountRule + 1,
      mvoConfidenceLevel: 70,
      mvoRiskNotes:
        'HIGH RISK: No scenario met 15% failure threshold. Consider increasing headcount or extending deadline.',
    };
  }

  const mvoScenario = viableScenarios[0];
  const confidenceLevel = 100 - mvoScenario.failureRisk;

  let riskNotes = '';
  if (mvoScenario.failureRisk <= 5) {
    riskNotes = 'LOW RISK: High confidence in delivery within timeline.';
  } else if (mvoScenario.failureRisk <= 10) {
    riskNotes = 'MODERATE RISK: Delivery likely but monitor closely.';
  } else {
    riskNotes = 'ELEVATED RISK: Consider buffer or additional resources.';
  }

  return {
    mvoHeadcount: mvoScenario.headcount,
    mvoConfidenceLevel: confidenceLevel,
    mvoRiskNotes: riskNotes,
  };
}

export function processWorkloadWithWorkType(
  workTypeCoefficients: WorkTypeCoefficients,
  volume: number,
  targetDeadlineDays?: number,
  costPerFTE: number = 5000
): {
  baselineDuration: number;
  baselineHeadcount: number;
  monteCarloResults: MonteCarloResults;
  mvoHeadcount: number;
  mvoConfidenceLevel: number;
  mvoRiskNotes: string;
} {
  const { baselineDuration, baselineHeadcount } = calculateBaselineWorkload(
    volume,
    workTypeCoefficients.complexityFactor,
    workTypeCoefficients.productivityRate
  );

  const monteCarloResults = runMonteCarloSimulation(
    baselineDuration,
    workTypeCoefficients.varianceLevel,
    workTypeCoefficients.riskMultiplier,
    targetDeadlineDays,
    10000
  );

  const headcountScenarios = calculateHeadcountScenarios(
    monteCarloResults,
    workTypeCoefficients.minHeadcountRule,
    targetDeadlineDays,
    costPerFTE
  );

  monteCarloResults.headcountScenarios = headcountScenarios;

  const { mvoHeadcount, mvoConfidenceLevel, mvoRiskNotes } = determineMVO(
    headcountScenarios,
    workTypeCoefficients.minHeadcountRule
  );

  return {
    baselineDuration,
    baselineHeadcount,
    monteCarloResults,
    mvoHeadcount,
    mvoConfidenceLevel,
    mvoRiskNotes,
  };
}
