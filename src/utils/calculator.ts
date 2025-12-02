import { SimulationInputs } from '../types/simulation';
import { ScenarioResult, ScenarioType, RiskLevel, SustainabilityLevel, LeannessLevel, CostBreakdown } from '../types/scenario';

const COST_PER_PERSON_MONTH = {
  permanent: 8000,
  contract: 10000,
  gig: 6000,
};

function getWorkloadMultiplier(level: string): number {
  const multipliers = { low: 0.7, medium: 1.0, high: 1.4, very_high: 1.8 };
  return multipliers[level as keyof typeof multipliers] || 1.0;
}

function getComplexityMultiplier(level: string): number {
  const multipliers = { low: 0.8, medium: 1.0, high: 1.3, very_high: 1.6 };
  return multipliers[level as keyof typeof multipliers] || 1.0;
}

function getServiceLevelMultiplier(level: string): number {
  const multipliers = { basic: 0.9, normal: 1.0, high: 1.2, critical: 1.5 };
  return multipliers[level as keyof typeof multipliers] || 1.0;
}

function getComplianceMultiplier(level: string): number {
  const multipliers = { low: 1.0, medium: 1.15, high: 1.35 };
  return multipliers[level as keyof typeof multipliers] || 1.0;
}

function getGrowthBuffer(growth: string): number {
  const buffers = { stable: 1.0, moderate: 1.1, high: 1.25, aggressive: 1.4 };
  return buffers[growth as keyof typeof buffers] || 1.0;
}

function getNatureOfWorkMultiplier(nature: string): number {
  const multipliers = {
    frontline: 1.2,
    back_office: 1.0,
    twenty_four_seven: 1.6,
    project_based: 0.9,
    mixed: 1.1,
  };
  return multipliers[nature as keyof typeof multipliers] || 1.0;
}

function calculateBaseWorkload(inputs: SimulationInputs): number {
  const workload = getWorkloadMultiplier(inputs.workloadLevel);
  const complexity = getComplexityMultiplier(inputs.complexityLevel);
  const serviceLevel = getServiceLevelMultiplier(inputs.serviceLevel);
  const compliance = getComplianceMultiplier(inputs.complianceIntensity);
  const nature = getNatureOfWorkMultiplier(inputs.natureOfWork);

  return 10 * workload * complexity * serviceLevel * compliance * nature;
}

function calculateHeadcount(
  baseWorkload: number,
  automationFactor: number,
  productivityFactor: number,
  riskBuffer: number,
  growthBuffer: number,
  minimumRoles: number
): number {
  const adjusted = baseWorkload * (1 - automationFactor / 100) * (1 / productivityFactor);
  const withBuffers = adjusted * riskBuffer * growthBuffer;
  return Math.max(Math.ceil(withBuffers), minimumRoles);
}

function calculateDuration(
  headcount: number,
  complexity: number,
  automation: number,
  digitalMaturity: string
): number {
  const maturityFactor = digitalMaturity === 'high' ? 0.8 : digitalMaturity === 'medium' ? 1.0 : 1.2;
  const automationFactor = 1 - automation / 200;
  const base = 12;

  return Math.max(
    3,
    Math.round(base * complexity * automationFactor * maturityFactor * (15 / Math.max(headcount, 5)))
  );
}

function calculateCost(headcount: number, workforceMix: SimulationInputs['workforceMix']): CostBreakdown {
  const permanentCount = Math.round((headcount * workforceMix.permanent) / 100);
  const contractCount = Math.round((headcount * workforceMix.contract) / 100);
  const gigCount = Math.round((headcount * workforceMix.gig) / 100);

  const permanent = permanentCount * COST_PER_PERSON_MONTH.permanent;
  const contract = contractCount * COST_PER_PERSON_MONTH.contract;
  const gig = gigCount * COST_PER_PERSON_MONTH.gig;

  return {
    permanent,
    contract,
    gig,
    total: permanent + contract + gig,
  };
}

function determineRiskLevel(
  headcount: number,
  automation: number,
  compliance: string,
  scenarioType: ScenarioType
): RiskLevel {
  let riskScore = 0;

  if (headcount < 5) riskScore += 2;
  else if (headcount < 10) riskScore += 1;

  if (automation > 60) riskScore += 1;
  if (automation > 80) riskScore += 1;

  if (compliance === 'high') riskScore += 1;

  if (scenarioType === 'resilience_model') riskScore -= 2;
  if (scenarioType === 'lean_mvo') riskScore += 1;

  if (riskScore <= 0) return 'low';
  if (riskScore <= 2) return 'medium';
  return 'high';
}

function determineSustainability(
  headcount: number,
  complexity: number,
  workload: number,
  scenarioType: ScenarioType
): SustainabilityLevel {
  const demandScore = complexity * workload;
  const capacityRatio = headcount / demandScore;

  if (scenarioType === 'resilience_model') return 'high';
  if (scenarioType === 'lean_mvo' && capacityRatio < 0.5) return 'low';

  if (capacityRatio >= 0.6) return 'high';
  if (capacityRatio >= 0.4) return 'medium';
  return 'low';
}

function determineLeanness(headcount: number, baseWorkload: number): LeannessLevel {
  const ratio = headcount / baseWorkload;

  if (ratio < 0.6) return 'very_lean';
  if (ratio < 0.8) return 'lean';
  if (ratio < 1.0) return 'balanced';
  return 'heavy';
}

function calculateScenario(
  inputs: SimulationInputs,
  type: ScenarioType,
  baseWorkload: number
): ScenarioResult {
  let automation = inputs.automationPotential;
  let productivity = 1.0;
  let riskBuffer = 1.0;
  let minimumRoles = 3;
  let name = '';
  let description = '';

  const growthBuffer = getGrowthBuffer(inputs.expectedGrowth);
  const complexityMultiplier = getComplexityMultiplier(inputs.complexityLevel);
  const workloadMultiplier = getWorkloadMultiplier(inputs.workloadLevel);

  switch (type) {
    case 'status_quo':
      name = 'Status Quo';
      description = 'Current way of working with existing processes and automation levels';
      automation = Math.min(automation, 30);
      productivity = 0.9;
      riskBuffer = 1.0;
      minimumRoles = 5;
      break;

    case 'manpower_intensive':
      name = 'Manpower-Intensive';
      description = 'Maximize headcount, minimize automation for safer operations';
      automation = Math.min(automation, 20);
      productivity = 0.85;
      riskBuffer = 1.15;
      minimumRoles = 8;
      break;

    case 'ai_supported':
      name = 'AI-Supported';
      description = 'Leverage AI and automation to reduce headcount and accelerate delivery';
      automation = Math.min(automation + 25, 85);
      productivity = 1.25;
      riskBuffer = 0.95;
      minimumRoles = 4;
      break;

    case 'hybrid':
      name = 'Hybrid Model';
      description = 'Balanced mix of people and automation for flexibility';
      automation = Math.min(automation + 15, 60);
      productivity = 1.1;
      riskBuffer = 1.0;
      minimumRoles = 5;
      break;

    case 'lean_mvo':
      name = 'Lean MVO';
      description = 'Minimum viable headcount with high productivity and automation';
      automation = Math.min(automation + 30, 90);
      productivity = 1.3;
      riskBuffer = 0.85;
      minimumRoles = 3;
      break;

    case 'resilience_model':
      name = 'Resilience Model';
      description = 'Extra buffer roles for backup, compliance, and business continuity';
      automation = Math.min(automation + 10, 50);
      productivity = 1.0;
      riskBuffer = 1.35;
      minimumRoles = 7;
      break;
  }

  const headcount = calculateHeadcount(
    baseWorkload,
    automation,
    productivity,
    riskBuffer,
    growthBuffer,
    minimumRoles
  );

  const duration = calculateDuration(
    headcount,
    complexityMultiplier,
    automation,
    inputs.digitalMaturity
  );

  const costPerMonth = calculateCost(headcount, inputs.workforceMix);

  const riskLevel = determineRiskLevel(headcount, automation, inputs.complianceIntensity, type);
  const sustainability = determineSustainability(headcount, complexityMultiplier, workloadMultiplier, type);
  const leanness = determineLeanness(headcount, baseWorkload);

  return {
    type,
    name,
    description,
    headcount,
    duration,
    costPerMonth,
    riskLevel,
    sustainability,
    leanness,
    isRecommended: type === 'lean_mvo',
  };
}

export function calculateAllScenarios(inputs: SimulationInputs): ScenarioResult[] {
  const baseWorkload = calculateBaseWorkload(inputs);

  const scenarios: ScenarioType[] = [
    'status_quo',
    'manpower_intensive',
    'ai_supported',
    'hybrid',
    'lean_mvo',
    'resilience_model',
  ];

  return scenarios.map((type) => calculateScenario(inputs, type, baseWorkload));
}
