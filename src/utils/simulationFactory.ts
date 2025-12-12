import type { CanonicalSimulation, SimulationContext, SimulationSetup, SimulationWorkload, SimulationOperatingModel } from '../types/canonicalSimulation';
import { CURRENT_SCHEMA_VERSION, SCHEMA_CHANGELOG } from '../types/canonicalSimulation';

export function getDefaultSimulation(): CanonicalSimulation {
  const context: SimulationContext = {
    simulationName: '',
    entity: null,
    region: null,
    planningType: 'new_project',
    planningTypeKey: undefined,
    scopeDriverType: null,
    scopeDriverValue: null,
    autoSizeEnabled: true,
    operationSize: 'medium_standard',
    sizeOfOperationKey: undefined,
    contextNotes: null,
    contextObjectives: null,
  };

  const setup: SimulationSetup = {
    functionType: 'hr',
    isCustomFunction: false,
    customFunctionName: null,
  };

  const workload: SimulationWorkload = {
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
    existingHeadcount: null,
    currentMonthlyCost: null,
    restructuringGoal: null,
    targetSavings: null,
  };

  const operatingModel: SimulationOperatingModel = {
    workforceMix: {
      permanent: 70,
      contract: 20,
      gig: 10,
    },
  };

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    context,
    setup,
    workload,
    operatingModel,
    selectedScenarioType: null,
  };
}

export function getSchemaChangelog() {
  return SCHEMA_CHANGELOG;
}

export function getDefaultContext(): SimulationContext {
  return {
    simulationName: '',
    entity: null,
    region: null,
    planningType: 'new_project',
    planningTypeKey: undefined,
    scopeDriverType: null,
    scopeDriverValue: null,
    autoSizeEnabled: true,
    operationSize: 'medium_standard',
    sizeOfOperationKey: undefined,
    contextNotes: null,
    contextObjectives: null,
  };
}

export function getDefaultSetup(): SimulationSetup {
  return {
    functionType: 'hr',
    isCustomFunction: false,
    customFunctionName: null,
  };
}

export function getDefaultWorkload(): SimulationWorkload {
  return {
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
    existingHeadcount: null,
    currentMonthlyCost: null,
    restructuringGoal: null,
    targetSavings: null,
  };
}

export function getDefaultOperatingModel(): SimulationOperatingModel {
  return {
    workforceMix: {
      permanent: 70,
      contract: 20,
      gig: 10,
    },
  };
}
