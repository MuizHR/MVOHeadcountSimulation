import { SubFunction } from '../types/subfunction';
import { IntensityLevel, ServiceLevel, SimulationInputs } from '../types/simulation';
import {
  BaselineResult,
  SynchronizedResults,
  MonteCarloInputs,
  DEFAULT_MONTE_CARLO_INPUTS,
} from '../types/monteCarlo';
import {
  runMonteCarloSimulation,
  calculateConfidenceLevel,
  assessRiskLevel,
} from './monteCarloEngine';
import { StaffType } from '../types/staffType';
import { categorizeWorkByName } from '../types/workType';
import { generateWorkTypeAwareRoleComposition } from './workTypeRoleComposition';
import { planningTypeConfig, sizeOfOperationConfig } from '../types/planningConfig';

const COMPLEXITY_FACTORS: Record<IntensityLevel, number> = {
  low: 0.8,
  medium: 1.0,
  high: 1.4,
  very_high: 1.8,
};

const SERVICE_LEVEL_FACTORS: Record<ServiceLevel, number> = {
  basic: 0.9,
  normal: 1.0,
  high: 1.2,
  critical: 1.5,
};

const AUTOMATION_FACTORS = {
  manual: 0.0,
  partially_automated: 0.3,
  highly_automated: 0.6,
};

const COVERAGE_FACTORS = {
  office_hours: 1.0,
  extended_hours: 1.5,
  twenty_four_seven: 3.0,
};

function calculateWorkloadHours(sf: SubFunction): number {
  let hours = 0;
  const { workloadDrivers } = sf;

  if (workloadDrivers.employeesSupported) {
    hours += workloadDrivers.employeesSupported * 0.5;
  }

  if (workloadDrivers.transactionsPerMonth) {
    hours += (workloadDrivers.transactionsPerMonth * 5) / 60;
  }

  if (workloadDrivers.sitesOrLocations) {
    hours += workloadDrivers.sitesOrLocations * 20;
  }

  if (workloadDrivers.timeZones && workloadDrivers.timeZones > 1) {
    hours *= 1 + (workloadDrivers.timeZones - 1) * 0.15;
  }

  return Math.max(hours, 100);
}

export function calculateBaselineResult(sf: SubFunction): BaselineResult {
  const baseWorkload = calculateWorkloadHours(sf);

  const complexityFactor = COMPLEXITY_FACTORS[sf.complexity];
  const serviceFactor = SERVICE_LEVEL_FACTORS[sf.serviceLevel];
  const automationFactor = AUTOMATION_FACTORS[sf.operatingModel.automationLevel];
  const coverageFactor = COVERAGE_FACTORS[sf.operatingModel.coverage];

  let requiredHours = baseWorkload * complexityFactor * serviceFactor * coverageFactor;
  const adjustedHours = requiredHours * (1 - automationFactor);

  const availableHoursPerFTE = 160;
  const targetUtilization = 0.85;
  const effectiveCapacity = availableHoursPerFTE * targetUtilization;

  const fte = Math.max(1, Math.round(adjustedHours / effectiveCapacity));

  const rationale = `
Baseline Calculation (Deterministic):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Base Workload: ${Math.round(baseWorkload)} hours/month

Applied Factors:
• Complexity (${sf.complexity}): ${complexityFactor}×
• Service Level (${sf.serviceLevel}): ${serviceFactor}×
• Coverage (${sf.operatingModel.coverage.replace('_', ' ')}): ${coverageFactor}×
• Automation (${sf.operatingModel.automationLevel.replace('_', ' ')}): -${(automationFactor * 100).toFixed(0)}%

Calculation:
• Required hours: ${Math.round(requiredHours)}/month
• After automation: ${Math.round(adjustedHours)}/month
• Capacity per FTE: ${Math.round(effectiveCapacity)} hrs (${(targetUtilization * 100).toFixed(0)}% utilization)
• Baseline FTE: ${fte}
  `.trim();

  return {
    fte,
    workloadHours: baseWorkload,
    adjustedHours,
    effectiveCapacity,
    factors: {
      complexity: complexityFactor,
      service: serviceFactor,
      automation: automationFactor,
      coverage: coverageFactor,
      utilization: targetUtilization,
    },
    rationale,
  };
}

export function calculateSynchronizedResults(
  sf: SubFunction,
  monteCarloInputs: MonteCarloInputs = DEFAULT_MONTE_CARLO_INPUTS,
  simulationContext?: SimulationInputs
): SynchronizedResults {
  const baseline = calculateBaselineResult(sf);

  let baseWorkload = calculateWorkloadHours(sf);
  let complexityFactor = COMPLEXITY_FACTORS[sf.complexity];
  let serviceFactor = SERVICE_LEVEL_FACTORS[sf.serviceLevel];
  const automationFactor = AUTOMATION_FACTORS[sf.operatingModel.automationLevel];
  const coverageFactor = COVERAGE_FACTORS[sf.operatingModel.coverage];

  if (simulationContext?.sizeOfOperationKey && simulationContext?.planningTypeKey) {
    const sizeConfig = sizeOfOperationConfig[simulationContext.sizeOfOperationKey];
    const ptConfig = planningTypeConfig[simulationContext.planningTypeKey];

    baseWorkload = baseWorkload * sizeConfig.workloadScale;

    const adjustedMonteCarloInputs = {
      ...monteCarloInputs,
      workloadUncertainty: {
        ...monteCarloInputs.workloadUncertainty,
        min: monteCarloInputs.workloadUncertainty.min * ptConfig.varianceMultiplier,
        max: monteCarloInputs.workloadUncertainty.max * ptConfig.varianceMultiplier,
      },
    };

    const monteCarlo = runMonteCarloSimulation(
      baseWorkload,
      complexityFactor,
      serviceFactor,
      automationFactor,
      coverageFactor,
      adjustedMonteCarloInputs
    );

    const probabilityOfBaseline = calculateConfidenceLevel(baseline.fte, monteCarlo);
    const riskLevel = assessRiskLevel(baseline.fte, monteCarlo);

    const baselineWithinRange =
      baseline.fte >= monteCarlo.confidenceIntervals.lower &&
      baseline.fte <= monteCarlo.confidenceIntervals.upper;

    return {
      baseline,
      monteCarlo,
      comparison: {
        baselineWithinRange,
        probabilityOfBaseline,
        riskLevel,
      },
    };
  }

  const monteCarlo = runMonteCarloSimulation(
    baseWorkload,
    complexityFactor,
    serviceFactor,
    automationFactor,
    coverageFactor,
    monteCarloInputs
  );

  const probabilityOfBaseline = calculateConfidenceLevel(baseline.fte, monteCarlo);
  const riskLevel = assessRiskLevel(baseline.fte, monteCarlo);

  const baselineWithinRange =
    baseline.fte >= monteCarlo.confidenceIntervals.lower &&
    baseline.fte <= monteCarlo.confidenceIntervals.upper;

  return {
    baseline,
    monteCarlo,
    comparison: {
      baselineWithinRange,
      probabilityOfBaseline,
      riskLevel,
    },
  };
}

export function calculateSynchronizedForAllSubFunctions(
  subFunctions: SubFunction[],
  monteCarloInputs: MonteCarloInputs = DEFAULT_MONTE_CARLO_INPUTS,
  simulationContext?: SimulationInputs
): Map<string, SynchronizedResults> {
  const resultsMap = new Map<string, SynchronizedResults>();

  subFunctions.forEach(sf => {
    const results = calculateSynchronizedResults(sf, monteCarloInputs, simulationContext);
    resultsMap.set(sf.id, results);
  });

  return resultsMap;
}

export async function generateRoleCompositionsForSubFunctions(
  subFunctions: SubFunction[],
  synchronizedResults: Map<string, SynchronizedResults>,
  staffTypes: StaffType[]
): Promise<SubFunction[]> {
  return subFunctions.map(sf => {
    const result = synchronizedResults.get(sf.id);
    if (!result) return sf;

    const totalFteRequired = result.monteCarlo.recommendedFTE;
    const workCategory = categorizeWorkByName(sf.name);

    const suggestedComposition = generateWorkTypeAwareRoleComposition(
      totalFteRequired,
      workCategory,
      sf.name,
      staffTypes
    );

    return {
      ...sf,
      suggestedRoleComposition: suggestedComposition,
      workCategory,
    };
  });
}
