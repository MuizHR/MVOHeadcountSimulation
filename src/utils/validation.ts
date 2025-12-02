import { SimulationInputs } from '../types/simulation';

export interface ValidationErrors {
  simulationName?: string;
  workforceMix?: string;
}

export function validateSimulationInputs(inputs: SimulationInputs): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!inputs.simulationName.trim()) {
    errors.simulationName = 'Simulation name is required';
  }

  const mixTotal = inputs.workforceMix.permanent + inputs.workforceMix.contract + inputs.workforceMix.gig;
  if (Math.abs(mixTotal - 100) > 0.01) {
    errors.workforceMix = `Workforce mix must total 100% (currently ${mixTotal.toFixed(1)}%)`;
  }

  return errors;
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
