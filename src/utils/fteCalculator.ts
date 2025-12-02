import { SubFunction, FTERange } from '../types/subfunction';
import { IntensityLevel, ServiceLevel } from '../types/simulation';

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

export function calculateFTEForSubFunction(sf: SubFunction): SubFunction {
  const baseWorkload = calculateWorkloadHours(sf);

  const complexityFactor = COMPLEXITY_FACTORS[sf.complexity];
  const serviceFactor = SERVICE_LEVEL_FACTORS[sf.serviceLevel];
  const automationFactor = AUTOMATION_FACTORS[sf.operatingModel.automationLevel];
  const coverageFactor = COVERAGE_FACTORS[sf.operatingModel.coverage];

  let requiredHours = baseWorkload * complexityFactor * serviceFactor * coverageFactor;

  requiredHours = requiredHours * (1 - automationFactor);

  const availableHoursPerFTE = 160;
  const targetUtilization = 0.85;
  const effectiveCapacity = availableHoursPerFTE * targetUtilization;

  const rawFTE = requiredHours / effectiveCapacity;

  const buffer = 0.2;
  const min = Math.max(1, Math.floor(rawFTE * (1 - buffer)));
  const max = Math.ceil(rawFTE * (1 + buffer));
  const recommended = Math.round(rawFTE);

  const rationale = `
Based on workload of ${Math.round(baseWorkload)} hours/month:
• Complexity factor (${sf.complexity}): ${complexityFactor}×
• Service level (${sf.serviceLevel}): ${serviceFactor}×
• Coverage (${sf.operatingModel.coverage.replace('_', ' ')}): ${coverageFactor}×
• Automation (${sf.operatingModel.automationLevel.replace('_', ' ')}): -${automationFactor * 100}%
• Required hours: ${Math.round(requiredHours)}/month
• Available per FTE: ${Math.round(effectiveCapacity)} hours (85% utilization)
• Calculated FTE: ${rawFTE.toFixed(1)} → Recommended ${recommended} FTE
  `.trim();

  const recommendedFTE: FTERange = {
    min,
    max,
    recommended,
    rationale,
  };

  const gap = sf.currentHeadcount ? sf.currentHeadcount - recommended : 0;

  return {
    ...sf,
    recommendedFTE,
    gap,
  };
}

export function calculateFTEForSubFunctions(subFunctions: SubFunction[]): SubFunction[] {
  return subFunctions.map(sf => calculateFTEForSubFunction(sf));
}
