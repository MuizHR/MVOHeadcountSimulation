import { SimulationInputs } from './simulation';
import { SubFunction } from './subfunction';
import { ScenarioResult } from './scenario';

export type WizardStep =
  | 'planning_context'
  | 'function_setup'
  | 'workload_drivers'
  | 'operating_model'
  | 'review'
  | 'results';

export interface WizardState {
  currentStep: WizardStep;
  simulationInputs: SimulationInputs;
  subFunctions: SubFunction[];
  currentSubFunctionIndex: number;
  scenarios: ScenarioResult[];
  selectedScenario: ScenarioResult | null;
  isCalculated: boolean;
}

export interface StepValidation {
  isValid: boolean;
  errors: string[];
}

export const WIZARD_STEPS: { id: WizardStep; title: string; description: string }[] = [
  {
    id: 'planning_context',
    title: 'Context',
    description: 'Planning scope and objectives',
  },
  {
    id: 'function_setup',
    title: 'Setup',
    description: 'Functions and sub-functions',
  },
  {
    id: 'workload_drivers',
    title: 'Workload',
    description: 'Volume and complexity',
  },
  {
    id: 'operating_model',
    title: 'Model',
    description: 'Structure and delivery',
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Validate and calculate',
  },
  {
    id: 'results',
    title: 'Results',
    description: 'FTE recommendations',
  },
];

export function getStepIndex(step: WizardStep): number {
  return WIZARD_STEPS.findIndex(s => s.id === step);
}

export function isStepComplete(step: WizardStep, state: WizardState): boolean {
  switch (step) {
    case 'planning_context':
      return !!state.simulationInputs.simulationName && !!state.simulationInputs.planningType;
    case 'function_setup':
      return state.subFunctions.length > 0;
    case 'workload_drivers':
      return state.subFunctions.every(sf =>
        sf.status === 'fully_configured' || sf.status === 'partially_configured'
      );
    case 'operating_model':
      return state.subFunctions.every(sf => sf.status === 'fully_configured');
    case 'review':
      return state.isCalculated;
    case 'results':
      return state.isCalculated && state.scenarios.length > 0;
    default:
      return false;
  }
}
