import { IntensityLevel, ServiceLevel } from './simulation';
import { StaffMixItem, StaffConfiguration, SuggestedRoleComposition } from './staffType';

export type OperatingStructure = 'centralized' | 'decentralized' | 'hybrid';
export type DeliveryModel = 'in_house' | 'outsourced' | 'hybrid';
export type AutomationLevel = 'manual' | 'partially_automated' | 'highly_automated';
export type CoveragePattern = 'office_hours' | 'extended_hours' | 'twenty_four_seven';
export type RiskSensitivity = 'low' | 'medium' | 'high';
export type ChangeFrequency = 'low' | 'medium' | 'high';
export type SubFunctionStatus = 'not_configured' | 'partially_configured' | 'fully_configured';

export interface RangeValue {
  min: number;
  typical: number;
  max: number;
}

export interface PeopleRiskFactors {
  absenteeismRate: RangeValue;
  turnoverRisk: RangeValue;
  learningCurveImpact: RangeValue;
}

export interface CostVariables {
  monthlySalaryPermanent: RangeValue;
  hourlyRateContract?: RangeValue;
  avgOvertimeHoursPerMonth: RangeValue;
  overtimeRate: number;
  trainingCostPerHire: number;
  outsourcingCost?: number;
}

export interface Constraints {
  targetCompletionDays: number;
  maxBudget?: number;
  allowedFailureRisk: number;
}

export interface WorkloadDrivers {
  totalWorkUnits: RangeValue;
  taskComplexity: IntensityLevel;
  productivityUnitsPerPersonPerDay: RangeValue;
  peopleRiskFactors: PeopleRiskFactors;
  costVariables: CostVariables;
  constraints: Constraints;
  employeesSupported?: number;
  transactionsPerMonth?: number;
  sitesOrLocations?: number;
  timeZones?: number;
  highlyRegulated?: boolean;
  riskSensitivity?: RiskSensitivity;
  changeFrequency?: ChangeFrequency;
}

export interface OperatingModel {
  structure: OperatingStructure;
  delivery: DeliveryModel;
  automationLevel: AutomationLevel;
  coverage: CoveragePattern;
}

export interface FTERange {
  min: number;
  max: number;
  recommended: number;
  rationale: string;
}

export interface SubFunction {
  id: string;
  name: string;
  description?: string;
  currentHeadcount?: number;
  currentMonthlyCost?: number;
  workloadDrivers: WorkloadDrivers;
  complexity: IntensityLevel;
  serviceLevel: ServiceLevel;
  operatingModel: OperatingModel;
  recommendedFTE?: FTERange;
  gap?: number;
  status: SubFunctionStatus;
  workTypeId?: string;
  workTypeCoefficients?: {
    productivityRate: number;
    complexityFactor: number;
    varianceLevel: number;
    minHeadcountRule: number;
    riskMultiplier: number;
  };
  calculatedResults?: {
    baselineDuration: number;
    baselineHeadcount: number;
    mvoHeadcount: number;
    mvoConfidenceLevel: number;
    mvoRiskNotes: string;
  };
  staffMix?: StaffMixItem[];
  selectedPlanningGroup?: string;
  staffConfiguration?: StaffConfiguration;
  suggestedRoleComposition?: SuggestedRoleComposition;
  workCategory?: string;
  hrAnswers?: any;
}

export const DEFAULT_OPERATING_MODEL: OperatingModel = {
  structure: 'centralized',
  delivery: 'in_house',
  automationLevel: 'partially_automated',
  coverage: 'office_hours',
};

export const DEFAULT_WORKLOAD_DRIVERS: Partial<WorkloadDrivers> = {
  totalWorkUnits: { min: 1000, typical: 1500, max: 2000 },
  taskComplexity: 'medium',
  productivityUnitsPerPersonPerDay: { min: 10, typical: 15, max: 20 },
  peopleRiskFactors: {
    absenteeismRate: { min: 3, typical: 5, max: 10 },
    turnoverRisk: { min: 5, typical: 10, max: 20 },
    learningCurveImpact: { min: 10, typical: 20, max: 40 },
  },
  costVariables: {
    monthlySalaryPermanent: { min: 3500, typical: 5000, max: 7000 },
    avgOvertimeHoursPerMonth: { min: 0, typical: 10, max: 30 },
    overtimeRate: 1.5,
    trainingCostPerHire: 2000,
  },
  constraints: {
    targetCompletionDays: 90,
    allowedFailureRisk: 15,
  },
  highlyRegulated: false,
  riskSensitivity: 'medium',
  changeFrequency: 'medium',
};

export function createEmptySubFunction(name: string): SubFunction {
  return {
    id: crypto.randomUUID(),
    name,
    workloadDrivers: { ...DEFAULT_WORKLOAD_DRIVERS } as WorkloadDrivers,
    complexity: 'medium',
    serviceLevel: 'normal',
    operatingModel: { ...DEFAULT_OPERATING_MODEL },
    status: 'not_configured',
  };
}
