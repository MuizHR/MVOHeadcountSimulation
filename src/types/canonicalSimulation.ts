import type {
  PlanningType,
  OperationSize,
  ScopeDriverType,
  FunctionType,
  WorkNature,
  IntensityLevel,
  ServiceLevel,
  ComplianceIntensity,
  GrowthExpectation,
  DigitalMaturity,
  WorkforceMix
} from './simulation';
import type { PlanningTypeKey, SizeOfOperationKey } from './planningConfig';

export const CURRENT_SCHEMA_VERSION = 'v1';
export const CURRENT_ENGINE_VERSION = '1.0.0';

export interface SimulationContext {
  simulationName: string;
  entity?: string | null;
  region?: string | null;
  planningType: PlanningType;
  planningTypeKey?: PlanningTypeKey;
  scopeDriverType?: ScopeDriverType | null;
  scopeDriverValue?: number | null;
  autoSizeEnabled?: boolean;
  operationSize: OperationSize;
  sizeOfOperationKey?: SizeOfOperationKey;
  contextNotes?: string | null;
  contextObjectives?: string | null;
}

export interface SimulationSetup {
  functionType: FunctionType;
  isCustomFunction?: boolean;
  customFunctionName?: string | null;
}

export interface SimulationWorkload {
  natureOfWork: WorkNature;
  projectLength?: number | null;
  totalProjectValue?: number | null;
  workloadLevel: IntensityLevel;
  complexityLevel: IntensityLevel;
  serviceLevel: ServiceLevel;
  complianceIntensity: ComplianceIntensity;
  automationPotential: number;
  outsourcingLevel: number;
  expectedGrowth?: GrowthExpectation | null;
  digitalMaturity: DigitalMaturity;
  existingHeadcount?: number | null;
  currentMonthlyCost?: number | null;
  restructuringGoal?: 'cost_reduction' | 'efficiency_improvement' | 'capability_building' | 'digital_transformation' | null;
  targetSavings?: number | null;
}

export interface SimulationOperatingModel {
  workforceMix: WorkforceMix;
}

export interface CanonicalSimulation {
  id?: string;
  schemaVersion: string;
  context: SimulationContext;
  setup: SimulationSetup;
  workload: SimulationWorkload;
  operatingModel: SimulationOperatingModel;
  results?: SimulationResults;
  selectedScenarioType?: string | null;
  createdAt?: string;
  updatedAt?: string;
  userId?: string | null;
  legacy?: Record<string, any>;
}

export interface SimulationResults {
  engineVersion: string;
  scenarios: any[];
  selectedScenario?: any;
  calculatedAt: string;
}

export interface SchemaChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const SCHEMA_CHANGELOG: SchemaChangelogEntry[] = [
  {
    version: 'v1',
    date: '2025-12-12',
    changes: [
      'Initial canonical schema implementation',
      'Separated simulation into context/setup/workload/operatingModel',
      'Added schemaVersion and engineVersion tracking',
      'Added entity and region fields to context',
      'Added autoSizeEnabled field to context',
      'Added scopeDriverType and scopeDriverValue to context',
    ],
  },
];
