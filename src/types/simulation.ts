import { PlanningTypeKey, SizeOfOperationKey } from './planningConfig';

export type PlanningType = 'new_project' | 'new_function' | 'new_business_unit' | 'restructuring';

export type OperationSize = 'small_lean' | 'medium_standard' | 'large_extended';

export type FunctionType =
  | 'cleaning_housekeeping'
  | 'corporate_communication'
  | 'customer_stakeholder_management'
  | 'finance_accounting'
  | 'governance_risk_compliance'
  | 'hr'
  | 'it'
  | 'legal_company_secretarial'
  | 'maintenance_engineering'
  | 'operations_service_delivery'
  | 'procurement_vendor_management'
  | 'project_development_management'
  | 'property_facilities_management'
  | 'property_investment'
  | 'sales_leasing_tenancy'
  | 'security_safety';

export type WorkNature =
  | 'frontline'
  | 'back_office'
  | 'twenty_four_seven'
  | 'project_based'
  | 'mixed';

export type IntensityLevel = 'low' | 'medium' | 'high' | 'very_high';

export type ServiceLevel = 'basic' | 'normal' | 'high' | 'critical';

export type ComplianceIntensity = 'low' | 'medium' | 'high';

export type GrowthExpectation = 'stable' | 'moderate' | 'high' | 'aggressive';

export type DigitalMaturity = 'low' | 'medium' | 'high';

export interface WorkforceMix {
  permanent: number;
  contract: number;
  gig: number;
}

export interface SimulationInputs {
  simulationName: string;
  planningType: PlanningType;
  operationSize: OperationSize;
  planningTypeKey?: PlanningTypeKey;
  sizeOfOperationKey?: SizeOfOperationKey;
  contextNotes?: string;
  functionType: FunctionType;
  natureOfWork: WorkNature;
  projectLength: number;
  totalProjectValue: number;
  workloadLevel: IntensityLevel;
  complexityLevel: IntensityLevel;
  serviceLevel: ServiceLevel;
  complianceIntensity: ComplianceIntensity;
  automationPotential: number;
  outsourcingLevel: number;
  expectedGrowth: GrowthExpectation;
  digitalMaturity: DigitalMaturity;
  workforceMix: WorkforceMix;
  existingHeadcount?: number;
  currentMonthlyCost?: number;
  restructuringGoal?: 'cost_reduction' | 'efficiency_improvement' | 'capability_building' | 'digital_transformation';
  targetSavings?: number;
}

export const DEFAULT_SIMULATION_INPUTS: SimulationInputs = {
  simulationName: '',
  planningType: 'new_project',
  operationSize: 'medium_standard',
  functionType: 'hr',
  natureOfWork: 'back_office',
  projectLength: 12,
  totalProjectValue: 1000000,
  workloadLevel: 'medium',
  complexityLevel: 'medium',
  serviceLevel: 'normal',
  complianceIntensity: 'medium',
  automationPotential: 30,
  outsourcingLevel: 0,
  expectedGrowth: 'moderate',
  digitalMaturity: 'medium',
  workforceMix: {
    permanent: 70,
    contract: 20,
    gig: 10,
  },
};

export interface FieldVisibility {
  functionType: boolean;
  natureOfWork: boolean;
  projectLength: boolean;
  totalProjectValue: boolean;
  workloadLevel: boolean;
  complexityLevel: boolean;
  serviceLevel: boolean;
  complianceIntensity: boolean;
  automationPotential: boolean;
  outsourcingLevel: boolean;
  expectedGrowth: boolean;
  digitalMaturity: boolean;
  workforceMix: boolean;
  existingHeadcount: boolean;
  currentMonthlyCost: boolean;
  restructuringGoal: boolean;
  targetSavings: boolean;
}

export function getFieldVisibility(planningType: PlanningType): FieldVisibility {
  switch (planningType) {
    case 'new_project':
      return {
        functionType: true,
        natureOfWork: true,
        projectLength: true,
        totalProjectValue: true,
        workloadLevel: true,
        complexityLevel: true,
        serviceLevel: true,
        complianceIntensity: true,
        automationPotential: true,
        outsourcingLevel: true,
        expectedGrowth: false,
        digitalMaturity: true,
        workforceMix: true,
        existingHeadcount: false,
        currentMonthlyCost: false,
        restructuringGoal: false,
        targetSavings: false,
      };

    case 'new_function':
      return {
        functionType: true,
        natureOfWork: true,
        projectLength: false,
        totalProjectValue: false,
        workloadLevel: true,
        complexityLevel: true,
        serviceLevel: true,
        complianceIntensity: true,
        automationPotential: true,
        outsourcingLevel: true,
        expectedGrowth: true,
        digitalMaturity: true,
        workforceMix: true,
        existingHeadcount: false,
        currentMonthlyCost: false,
        restructuringGoal: false,
        targetSavings: false,
      };

    case 'new_business_unit':
      return {
        functionType: true,
        natureOfWork: true,
        projectLength: false,
        totalProjectValue: true,
        workloadLevel: true,
        complexityLevel: true,
        serviceLevel: true,
        complianceIntensity: true,
        automationPotential: true,
        outsourcingLevel: true,
        expectedGrowth: true,
        digitalMaturity: true,
        workforceMix: true,
        existingHeadcount: false,
        currentMonthlyCost: false,
        restructuringGoal: false,
        targetSavings: false,
      };

    case 'restructuring':
      return {
        functionType: true,
        natureOfWork: true,
        projectLength: false,
        totalProjectValue: false,
        workloadLevel: true,
        complexityLevel: true,
        serviceLevel: true,
        complianceIntensity: true,
        automationPotential: true,
        outsourcingLevel: true,
        expectedGrowth: false,
        digitalMaturity: true,
        workforceMix: true,
        existingHeadcount: true,
        currentMonthlyCost: true,
        restructuringGoal: true,
        targetSavings: true,
      };

    default:
      return {
        functionType: true,
        natureOfWork: true,
        projectLength: true,
        totalProjectValue: true,
        workloadLevel: true,
        complexityLevel: true,
        serviceLevel: true,
        complianceIntensity: true,
        automationPotential: true,
        outsourcingLevel: true,
        expectedGrowth: true,
        digitalMaturity: true,
        workforceMix: true,
        existingHeadcount: false,
        currentMonthlyCost: false,
        restructuringGoal: false,
        targetSavings: false,
      };
  }
}
