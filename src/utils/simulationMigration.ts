import type { SimulationInputs } from '../types/simulation';
import type {
  CanonicalSimulation,
  SimulationContext,
  SimulationSetup,
  SimulationWorkload,
  SimulationOperatingModel,
  SimulationResults,
  CURRENT_SCHEMA_VERSION,
  CURRENT_ENGINE_VERSION,
} from '../types/canonicalSimulation';
import { inferPillarFromCompanyName } from '../config/companies';

export function migrateSimulation(rawSimulation: any): CanonicalSimulation {
  if (!rawSimulation) {
    throw new Error('Cannot migrate null or undefined simulation');
  }

  const schemaVersion = rawSimulation.schemaVersion || rawSimulation.schema_version || 'v0';

  if (schemaVersion === 'v1') {
    return rawSimulation as CanonicalSimulation;
  }

  return migrateFromLegacy(rawSimulation);
}

function migrateFromLegacy(raw: any): CanonicalSimulation {
  const inputs = raw.inputs || raw;
  const scenarios = raw.scenarios;
  const selectedScenarioType = raw.selected_scenario_type || raw.selectedScenarioType;

  const companyName = inputs.companyName || inputs.company_name || inputs.entity || '';
  const businessPillar = inputs.businessPillar || inputs.business_pillar || inferPillarFromCompanyName(companyName);

  const context: SimulationContext = {
    simulationName: inputs.simulationName || inputs.simulation_name || 'Untitled Simulation',
    companyName: companyName,
    businessPillar: businessPillar,
    entity: inputs.entity || null,
    region: inputs.region || null,
    planningType: inputs.planningType || inputs.planning_type || 'new_function',
    planningTypeKey: inputs.planningTypeKey || inputs.planning_type_key || undefined,
    scopeDriverType: inputs.scopeDriverType || inputs.scope_driver_type || null,
    scopeDriverValue: inputs.scopeDriverValue || inputs.scope_driver_value || null,
    autoSizeEnabled: inputs.autoSizeEnabled !== undefined ? inputs.autoSizeEnabled : (inputs.auto_size_enabled !== undefined ? inputs.auto_size_enabled : true),
    operationSize: inputs.operationSize || inputs.operation_size || 'medium_standard',
    sizeOfOperationKey: inputs.sizeOfOperationKey || inputs.size_of_operation_key || undefined,
    contextNotes: inputs.contextNotes || inputs.context_notes || null,
    contextObjectives: inputs.contextObjectives || inputs.context_objectives || null,
  };

  const setup: SimulationSetup = {
    functionType: inputs.functionType || inputs.function_type || 'hr',
    isCustomFunction: inputs.isCustomFunction || inputs.is_custom_function || false,
    customFunctionName: inputs.customFunctionName || inputs.custom_function_name || null,
  };

  const workload: SimulationWorkload = {
    natureOfWork: inputs.natureOfWork || inputs.nature_of_work || 'back_office',
    projectLength: inputs.projectLength || inputs.project_length || null,
    totalProjectValue: inputs.totalProjectValue || inputs.total_project_value || null,
    workloadLevel: inputs.workloadLevel || inputs.workload_level || 'medium',
    complexityLevel: inputs.complexityLevel || inputs.complexity_level || 'medium',
    serviceLevel: inputs.serviceLevel || inputs.service_level || 'normal',
    complianceIntensity: inputs.complianceIntensity || inputs.compliance_intensity || 'medium',
    automationPotential: inputs.automationPotential !== undefined ? inputs.automationPotential : (inputs.automation_potential !== undefined ? inputs.automation_potential : 30),
    outsourcingLevel: inputs.outsourcingLevel !== undefined ? inputs.outsourcingLevel : (inputs.outsourcing_level !== undefined ? inputs.outsourcing_level : 0),
    expectedGrowth: inputs.expectedGrowth || inputs.expected_growth || null,
    digitalMaturity: inputs.digitalMaturity || inputs.digital_maturity || 'medium',
    existingHeadcount: inputs.existingHeadcount || inputs.existing_headcount || null,
    currentMonthlyCost: inputs.currentMonthlyCost || inputs.current_monthly_cost || null,
    restructuringGoal: inputs.restructuringGoal || inputs.restructuring_goal || null,
    targetSavings: inputs.targetSavings || inputs.target_savings || null,
  };

  const operatingModel: SimulationOperatingModel = {
    workforceMix: inputs.workforceMix || inputs.workforce_mix || {
      permanent: 70,
      contract: 20,
      gig: 10,
    },
  };

  const results: SimulationResults | undefined = scenarios
    ? {
        engineVersion: raw.engineVersion || raw.engine_version || '1.0.0',
        scenarios: scenarios,
        selectedScenario: selectedScenarioType
          ? scenarios.find((s: any) => s.type === selectedScenarioType)
          : undefined,
        calculatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
      }
    : undefined;

  const canonical: CanonicalSimulation = {
    id: raw.id,
    schemaVersion: 'v1',
    context,
    setup,
    workload,
    operatingModel,
    results,
    selectedScenarioType: selectedScenarioType || null,
    createdAt: raw.created_at || raw.createdAt,
    updatedAt: raw.updated_at || raw.updatedAt,
    userId: raw.user_id || raw.userId || null,
  };

  const knownFields = new Set([
    'id',
    'simulationName',
    'simulation_name',
    'companyName',
    'company_name',
    'businessPillar',
    'business_pillar',
    'entity',
    'region',
    'planningType',
    'planning_type',
    'planningTypeKey',
    'planning_type_key',
    'scopeDriverType',
    'scope_driver_type',
    'scopeDriverValue',
    'scope_driver_value',
    'autoSizeEnabled',
    'auto_size_enabled',
    'operationSize',
    'operation_size',
    'sizeOfOperationKey',
    'size_of_operation_key',
    'contextNotes',
    'context_notes',
    'contextObjectives',
    'context_objectives',
    'functionType',
    'function_type',
    'isCustomFunction',
    'is_custom_function',
    'customFunctionName',
    'custom_function_name',
    'natureOfWork',
    'nature_of_work',
    'projectLength',
    'project_length',
    'totalProjectValue',
    'total_project_value',
    'workloadLevel',
    'workload_level',
    'complexityLevel',
    'complexity_level',
    'serviceLevel',
    'service_level',
    'complianceIntensity',
    'compliance_intensity',
    'automationPotential',
    'automation_potential',
    'outsourcingLevel',
    'outsourcing_level',
    'expectedGrowth',
    'expected_growth',
    'digitalMaturity',
    'digital_maturity',
    'existingHeadcount',
    'existing_headcount',
    'currentMonthlyCost',
    'current_monthly_cost',
    'restructuringGoal',
    'restructuring_goal',
    'targetSavings',
    'target_savings',
    'workforceMix',
    'workforce_mix',
    'created_at',
    'createdAt',
    'updated_at',
    'updatedAt',
    'user_id',
    'userId',
    'scenarios',
    'selected_scenario_type',
    'selectedScenarioType',
    'schemaVersion',
    'schema_version',
    'engineVersion',
    'engine_version',
    'inputs',
  ]);

  const legacyFields: Record<string, any> = {};
  for (const key of Object.keys(raw)) {
    if (!knownFields.has(key)) {
      legacyFields[key] = raw[key];
    }
  }
  if (Object.keys(legacyFields).length > 0) {
    canonical.legacy = legacyFields;
  }

  return canonical;
}

export function canonicalToLegacy(canonical: CanonicalSimulation): SimulationInputs {
  return {
    simulationName: canonical.context.simulationName,
    companyName: canonical.context.companyName,
    businessPillar: canonical.context.businessPillar,
    entity: canonical.context.entity || undefined,
    region: canonical.context.region || undefined,
    planningType: canonical.context.planningType,
    planningTypeKey: canonical.context.planningTypeKey,
    scopeDriverType: canonical.context.scopeDriverType || undefined,
    scopeDriverValue: canonical.context.scopeDriverValue || undefined,
    autoSizeEnabled: canonical.context.autoSizeEnabled,
    operationSize: canonical.context.operationSize,
    sizeOfOperationKey: canonical.context.sizeOfOperationKey,
    contextNotes: canonical.context.contextNotes || undefined,
    contextObjectives: canonical.context.contextObjectives || undefined,
    functionType: canonical.setup.functionType,
    isCustomFunction: canonical.setup.isCustomFunction,
    customFunctionName: canonical.setup.customFunctionName || undefined,
    natureOfWork: canonical.workload.natureOfWork,
    projectLength: canonical.workload.projectLength || 12,
    totalProjectValue: canonical.workload.totalProjectValue || 1000000,
    workloadLevel: canonical.workload.workloadLevel,
    complexityLevel: canonical.workload.complexityLevel,
    serviceLevel: canonical.workload.serviceLevel,
    complianceIntensity: canonical.workload.complianceIntensity,
    automationPotential: canonical.workload.automationPotential,
    outsourcingLevel: canonical.workload.outsourcingLevel,
    expectedGrowth: canonical.workload.expectedGrowth || 'moderate',
    digitalMaturity: canonical.workload.digitalMaturity,
    existingHeadcount: canonical.workload.existingHeadcount || undefined,
    currentMonthlyCost: canonical.workload.currentMonthlyCost || undefined,
    restructuringGoal: canonical.workload.restructuringGoal || undefined,
    targetSavings: canonical.workload.targetSavings || undefined,
    workforceMix: canonical.operatingModel.workforceMix,
  };
}

export function validateSimulation(simulation: CanonicalSimulation): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!simulation.context.simulationName || simulation.context.simulationName.trim() === '') {
    warnings.push('Simulation name is empty or missing');
  }

  if (!simulation.context.planningType) {
    warnings.push('Planning type is missing');
  }

  if (!simulation.context.operationSize) {
    warnings.push('Operation size is missing');
  }

  if (!simulation.setup.functionType) {
    warnings.push('Function type is missing');
  }

  if (!simulation.workload.workloadLevel) {
    warnings.push('Workload level is missing');
  }

  if (!simulation.workload.complexityLevel) {
    warnings.push('Complexity level is missing');
  }

  if (
    simulation.operatingModel.workforceMix.permanent +
      simulation.operatingModel.workforceMix.contract +
      simulation.operatingModel.workforceMix.gig !==
    100
  ) {
    warnings.push('Workforce mix percentages do not sum to 100%');
  }

  const valid = warnings.length === 0;

  return { valid, warnings };
}
