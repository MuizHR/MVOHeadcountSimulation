import { SubFunction, RangeValue } from '../types/subfunction';
import { BaselineHeadcount, HeadcountTestResult, MVOResult, RecommendedStrategy } from '../types/monteCarlo';
import { OperationSize, SimulationInputs } from '../types/simulation';
import { sampleFromDistribution } from './monteCarloEngine';
import { getMinHeadcount } from '../data/workTypeCoefficients';
import { planningTypeConfig, sizeOfOperationConfig } from '../types/planningConfig';

function randomFromRange(range: RangeValue): number {
  return sampleFromDistribution({
    min: range.min,
    max: range.max,
    mostLikely: range.typical,
    distribution: 'triangular',
  });
}

export function calculateBaselineHeadcount(sf: SubFunction): BaselineHeadcount {
  const { workloadDrivers } = sf;

  if (!workloadDrivers.totalWorkUnits || !workloadDrivers.productivityUnitsPerPersonPerDay) {
    throw new Error('Missing required workload data');
  }

  const totalWorkload = workloadDrivers.totalWorkUnits.typical;
  const avgProductivity = workloadDrivers.productivityUnitsPerPersonPerDay.typical;
  const targetDays = workloadDrivers.constraints.targetCompletionDays;

  const totalWorkDays = targetDays * 0.85;

  const headcount = Math.ceil(totalWorkload / (avgProductivity * totalWorkDays));

  const formula = `${totalWorkload} units ÷ (${avgProductivity} units/person/day × ${totalWorkDays.toFixed(0)} working days)`;

  const rationale = `
Baseline Headcount (No-Risk) Calculation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Work Units: ${totalWorkload.toLocaleString()}
Average Productivity: ${avgProductivity} units/person/day
Target Duration: ${targetDays} days
Available Working Days: ${totalWorkDays.toFixed(0)} days (85% availability)

Formula: Total Workload ÷ (Average Productivity × Available Working Days)

Baseline Headcount = ${totalWorkload} ÷ (${avgProductivity} × ${totalWorkDays.toFixed(0)})
                   = ${headcount} persons

⚠️ This is a deterministic estimate with NO RISK BUFFER.
   Monte Carlo simulation will add risk adjustment.
  `.trim();

  return {
    headcount,
    calculation: {
      totalWorkload,
      averageProductivity: avgProductivity,
      availableWorkingDays: totalWorkDays,
      formula,
    },
    rationale,
  };
}

export function runHeadcountSimulation(
  sf: SubFunction,
  headcount: number,
  iterations: number = 5000
): HeadcountTestResult {
  const { workloadDrivers } = sf;

  if (!workloadDrivers.totalWorkUnits || !workloadDrivers.productivityUnitsPerPersonPerDay) {
    throw new Error('Missing required workload data');
  }

  const targetDays = workloadDrivers.constraints.targetCompletionDays;
  const maxBudget = workloadDrivers.constraints.maxBudget;
  const allowedRisk = workloadDrivers.constraints.allowedFailureRisk / 100;

  const durations: number[] = [];
  const costs: number[] = [];
  let deadlineMetCount = 0;
  let withinBudgetCount = 0;

  for (let i = 0; i < iterations; i++) {
    const workload = randomFromRange(workloadDrivers.totalWorkUnits);
    let productivity = randomFromRange(workloadDrivers.productivityUnitsPerPersonPerDay);

    const absenteeism = randomFromRange(workloadDrivers.peopleRiskFactors.absenteeismRate) / 100;
    const turnover = randomFromRange(workloadDrivers.peopleRiskFactors.turnoverRisk) / 100;
    const learningCurve = randomFromRange(workloadDrivers.peopleRiskFactors.learningCurveImpact) / 100;

    productivity = productivity * (1 - absenteeism);
    productivity = productivity * (1 - learningCurve * turnover);
    productivity = productivity * (0.9 + Math.random() * 0.2);

    const effectiveHeadcount = headcount * (1 - absenteeism);

    const dailyOutput = effectiveHeadcount * productivity;
    const daysNeeded = workload / dailyOutput;

    durations.push(daysNeeded);

    const baseSalary = randomFromRange(workloadDrivers.costVariables.monthlySalaryPermanent);
    const otHours = randomFromRange(workloadDrivers.costVariables.avgOvertimeHoursPerMonth);
    const otRate = workloadDrivers.costVariables.overtimeRate;

    const monthsNeeded = daysNeeded / 22;
    const totalBaseCost = headcount * baseSalary * monthsNeeded;
    const totalOTCost = headcount * (otHours * (baseSalary / 160) * otRate) * monthsNeeded;
    const trainingCost = headcount * workloadDrivers.costVariables.trainingCostPerHire * turnover;

    const totalCost = totalBaseCost + totalOTCost + trainingCost;
    costs.push(totalCost);

    if (daysNeeded <= targetDays) {
      deadlineMetCount++;
    }

    if (!maxBudget || totalCost <= maxBudget) {
      withinBudgetCount++;
    }
  }

  durations.sort((a, b) => a - b);
  costs.sort((a, b) => a - b);

  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = durations[0];
  const maxDuration = durations[durations.length - 1];

  const p50Duration = durations[Math.floor(durations.length * 0.5)];
  const p75Duration = durations[Math.floor(durations.length * 0.75)];
  const p90Duration = durations[Math.floor(durations.length * 0.9)];

  const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
  const minCost = costs[0];
  const maxCost = costs[costs.length - 1];

  const deadlineMetProbability = (deadlineMetCount / iterations) * 100;
  const failureRisk = 100 - deadlineMetProbability;
  const withinBudgetProbability = (withinBudgetCount / iterations) * 100;

  const riskLevel: 'low' | 'medium' | 'high' =
    failureRisk <= allowedRisk * 100 ? 'low' : failureRisk <= allowedRisk * 100 * 1.5 ? 'medium' : 'high';

  return {
    headcount,
    iterations,
    avgDuration,
    minDuration,
    maxDuration,
    p50Duration,
    p75Duration,
    p90Duration,
    avgCost,
    minCost,
    maxCost,
    deadlineMetProbability,
    successRate: deadlineMetProbability,
    failureRisk,
    withinBudgetProbability,
    riskLevel,
    rejected: false,
  };
}

export function identifyMVO(
  sf: SubFunction,
  operationSize: OperationSize = 'medium_standard',
  simulationContext?: SimulationInputs
): MVOResult {
  const baseline = calculateBaselineHeadcount(sf);
  let baselineCount = baseline.headcount;
  const allowedRisk = sf.workloadDrivers.constraints.allowedFailureRisk;
  const maxBudget = sf.workloadDrivers.constraints.maxBudget;

  if (simulationContext?.sizeOfOperationKey && simulationContext?.planningTypeKey) {
    const sizeConfig = sizeOfOperationConfig[simulationContext.sizeOfOperationKey];
    const ptConfig = planningTypeConfig[simulationContext.planningTypeKey];

    baselineCount = Math.max(
      Math.ceil(baselineCount * sizeConfig.productivityScale),
      sizeConfig.minHeadcountBase
    );
  }

  let lowerOffset = 2;
  let upperOffset = 5;

  if (operationSize === 'small_lean') {
    lowerOffset = 1;
    upperOffset = 3;
  } else if (operationSize === 'large_extended') {
    lowerOffset = 3;
    upperOffset = 7;
  }

  const headcountsToTest: number[] = [];
  for (let i = Math.max(1, baselineCount - lowerOffset); i <= baselineCount + upperOffset; i++) {
    headcountsToTest.push(i);
  }

  const testResults: HeadcountTestResult[] = [];

  for (const hc of headcountsToTest) {
    const result = runHeadcountSimulation(sf, hc, 5000);

    if (result.failureRisk > allowedRisk) {
      result.rejected = true;
      result.rejectionReason = `Failure risk ${result.failureRisk.toFixed(1)}% exceeds threshold ${allowedRisk}%`;
    } else if (maxBudget && result.avgCost > maxBudget) {
      result.rejected = true;
      result.rejectionReason = `Average cost RM${Math.round(result.avgCost).toLocaleString()} exceeds budget RM${Math.round(maxBudget).toLocaleString()}`;
    }

    testResults.push(result);
  }

  const validResults = testResults.filter(r => !r.rejected);

  let selectedResult: HeadcountTestResult;
  if (validResults.length === 0) {
    selectedResult = testResults[testResults.length - 1];
  } else {
    validResults.sort((a, b) => {
      if (Math.abs(a.failureRisk - allowedRisk) < Math.abs(b.failureRisk - allowedRisk)) {
        return -1;
      }
      if (a.avgCost < b.avgCost) {
        return -1;
      }
      return a.headcount - b.headcount;
    });
    selectedResult = validResults[0];
  }

  const sizeMapping: Record<OperationSize, 'Small' | 'Medium' | 'Large'> = {
    small_lean: 'Small',
    medium_standard: 'Medium',
    large_extended: 'Large',
  };

  const sizeOfOperation = sizeMapping[operationSize] || 'Medium';
  const minHeadcount = sf.workTypeId ? getMinHeadcount(sf.workTypeId, sizeOfOperation) : 1;

  let fteRoundedFromMVO = selectedResult.headcount;
  let fteRecommended = Math.max(fteRoundedFromMVO, minHeadcount);

  if (simulationContext?.planningTypeKey && simulationContext?.sizeOfOperationKey) {
    const ptConfig = planningTypeConfig[simulationContext.planningTypeKey];
    const sizeConfig = sizeOfOperationConfig[simulationContext.sizeOfOperationKey];

    if (ptConfig.overheadFactor) {
      fteRecommended = Math.ceil(fteRecommended * ptConfig.overheadFactor);
    }

    if (ptConfig.minHeadcountMode === 'reduction' && ptConfig.maxReductionPercent) {
      const currentFte = simulationContext.existingHeadcount || fteRecommended;
      const minAllowed = Math.ceil(currentFte * (1 - ptConfig.maxReductionPercent));
      fteRecommended = Math.max(fteRecommended, minAllowed);
    }

    if (ptConfig.minHeadcountMode === 'governed') {
      fteRecommended = Math.max(fteRecommended, sizeConfig.minHeadcountBase);
    }
  }

  if (fteRecommended > fteRoundedFromMVO) {
    const adjustedResult = testResults.find(r => r.headcount === fteRecommended);
    if (adjustedResult) {
      selectedResult = adjustedResult;
      selectedResult.minHeadcountApplied = true;
      selectedResult.minHeadcountValue = minHeadcount;
    } else {
      const newResult = runHeadcountSimulation(sf, fteRecommended, 5000);
      newResult.minHeadcountApplied = true;
      newResult.minHeadcountValue = minHeadcount;
      selectedResult = newResult;
      testResults.push(newResult);
    }
  }

  let strategy: RecommendedStrategy = 'hire_permanent';
  const diff = selectedResult.headcount - baselineCount;
  if (diff <= 1) {
    strategy = 'hire_permanent';
  } else if (diff <= 3) {
    strategy = 'hybrid_perm_gig';
  } else if (diff > 3 && sf.operatingModel.automationLevel === 'manual') {
    strategy = 'automate';
  } else {
    strategy = 'outsource';
  }

  const explanation = generateExplanation(baseline, selectedResult, testResults, allowedRisk);

  const suggestions = generateSuggestions(sf, baseline, selectedResult);

  const baselineResult = testResults.find(r => r.headcount === baselineCount);

  return {
    recommendedHeadcount: selectedResult.headcount,
    baselineHeadcount: baselineCount,
    testResults,
    selectedResult,
    strategy,
    explanation,
    suggestions,
    comparison: {
      baselineRisk: baselineResult?.failureRisk || 100,
      mvoRisk: selectedResult.failureRisk,
      costDifference: baselineResult ? selectedResult.avgCost - baselineResult.avgCost : 0,
      timeDifference: baselineResult ? baselineResult.avgDuration - selectedResult.avgDuration : 0,
    },
  };
}

function generateExplanation(
  baseline: BaselineHeadcount,
  mvo: HeadcountTestResult,
  allResults: HeadcountTestResult[],
  allowedRisk: number
): string {
  const rejected = allResults.filter(r => r.rejected);

  let explanation = `## MVO Identification Analysis\n\n`;

  explanation += `### Baseline Headcount (No-Risk)\n`;
  explanation += `**${baseline.headcount} persons** – Calculated using standard formula without risk buffer.\n\n`;

  explanation += `### Monte Carlo Simulation Results\n`;
  explanation += `Tested ${allResults.length} headcount scenarios with ${mvo.iterations.toLocaleString()} iterations each.\n\n`;

  if (rejected.length > 0) {
    explanation += `### Rejected Options\n`;
    rejected.forEach(r => {
      explanation += `- **${r.headcount} persons**: ${r.rejectionReason}\n`;
    });
    explanation += `\n`;
  }

  explanation += `### Recommended MVO: ${mvo.headcount} Persons\n`;
  explanation += `This is the **minimum viable organization** that achieves:\n`;
  explanation += `- ✅ ${mvo.deadlineMetProbability.toFixed(1)}% probability of meeting deadline\n`;
  explanation += `- ✅ ${mvo.failureRisk.toFixed(1)}% failure risk (${allowedRisk}% threshold)\n`;
  explanation += `- ✅ P90 completion: ${mvo.p90Duration.toFixed(0)} days\n`;
  explanation += `- ✅ Average cost: RM${Math.round(mvo.avgCost).toLocaleString()}\n\n`;

  const diff = mvo.headcount - baseline.headcount;
  if (diff > 0) {
    explanation += `### Why ${diff} Additional Person${diff > 1 ? 's' : ''}?\n`;
    explanation += `The baseline does not account for:\n`;
    explanation += `- People risks (absenteeism, turnover, learning curves)\n`;
    explanation += `- Workload variability (min-max ranges)\n`;
    explanation += `- Productivity fluctuations\n`;
    explanation += `- Required safety buffer for ${(100 - allowedRisk).toFixed(0)}% confidence\n`;
  } else if (diff === 0) {
    explanation += `### Baseline = MVO\n`;
    explanation += `The baseline headcount already provides sufficient buffer to meet risk threshold.\n`;
  }

  return explanation;
}

function generateSuggestions(
  sf: SubFunction,
  baseline: BaselineHeadcount,
  mvo: HeadcountTestResult
): string[] {
  const suggestions: string[] = [];

  const diff = mvo.headcount - baseline.headcount;

  if (diff > 2) {
    suggestions.push(
      `Consider automation or process optimization to reduce required headcount from ${mvo.headcount} to closer to baseline ${baseline.headcount}`
    );
  }

  if (sf.operatingModel.automationLevel === 'manual' || sf.operatingModel.automationLevel === 'partially_automated') {
    suggestions.push(
      `Increase automation level to reduce productivity variance and lower required headcount`
    );
  }

  if (sf.workloadDrivers.peopleRiskFactors.turnoverRisk.typical > 15) {
    suggestions.push(
      `High turnover risk (${sf.workloadDrivers.peopleRiskFactors.turnoverRisk.typical}%) increases headcount needs. Focus on retention to optimize team size`
    );
  }

  if (mvo.failureRisk > sf.workloadDrivers.constraints.allowedFailureRisk * 0.8) {
    suggestions.push(
      `Current configuration is near risk threshold. Adding 1 more person would reduce failure risk significantly`
    );
  }

  if (diff === 0) {
    suggestions.push(
      `Baseline headcount already meets risk requirements. No additional buffer needed`
    );
  }

  return suggestions;
}
