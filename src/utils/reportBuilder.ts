import type { CanonicalSimulation, SimulationResults } from '../types/canonicalSimulation';
import type { ExportData } from './resultsExporter';

export interface ReportPayload extends ExportData {
  schemaVersion: string;
  engineVersion: string;
  generatedAt: string;
  entity: string;
  region: string;
  scopeDriver: string;
  contextObjectives: string;
}

function formatScopeDriver(simulation: CanonicalSimulation): string {
  if (!simulation.context.scopeDriverType || !simulation.context.scopeDriverValue) {
    return 'Not specified';
  }

  let label = '';
  switch (simulation.context.scopeDriverType) {
    case 'employees_supported':
      label = 'Employees Supported';
      break;
    case 'sites_locations':
      label = 'Work Locations';
      break;
    case 'projects_portfolios':
      label = 'Active Workstreams';
      break;
  }

  return `${label}: ${simulation.context.scopeDriverValue}`;
}

function formatPlanningType(planningType: string): string {
  const mapping: Record<string, string> = {
    new_project: 'New Project',
    new_function: 'New Function',
    new_business_unit: 'New Business Unit',
    restructuring: 'Restructuring',
    bau_monthly_operations: 'BAU Monthly Operations',
  };
  return mapping[planningType] || planningType;
}

function formatOperationSize(operationSize: string): string {
  const mapping: Record<string, string> = {
    small_lean: 'Small / Lean',
    medium_standard: 'Medium / Standard',
    large_extended: 'Large / Extended',
  };
  return mapping[operationSize] || operationSize;
}

export function buildReportPayload(
  simulation: CanonicalSimulation,
  results?: SimulationResults
): ReportPayload {
  const selectedScenario = results?.selectedScenario || results?.scenarios?.[0];

  return {
    simulationName: simulation.context.simulationName,
    entity: simulation.context.entity || 'Not specified',
    region: simulation.context.region || 'Not specified',
    planningType: formatPlanningType(simulation.context.planningType),
    scopeDriverType: simulation.context.scopeDriverType || undefined,
    scopeDriverValue: simulation.context.scopeDriverValue || undefined,
    scopeDriver: formatScopeDriver(simulation),
    operationSize: formatOperationSize(simulation.context.operationSize),
    sizeOfOperation: formatOperationSize(simulation.context.operationSize),
    autoSizeEnabled: simulation.context.autoSizeEnabled,
    contextObjectives: simulation.context.contextObjectives || 'Not specified',
    totalFte: selectedScenario?.totalFte || 0,
    avgDurationDays: selectedScenario?.avgDurationDays || 0,
    p90DurationDays: selectedScenario?.p90DurationDays || 0,
    successRatePct: selectedScenario?.successRatePct || 0,
    avgMonthlyCostRm: selectedScenario?.avgMonthlyCostRm || 0,
    schemaVersion: simulation.schemaVersion,
    engineVersion: results?.engineVersion || '1.0.0',
    generatedAt: new Date().toISOString(),
  };
}

export function getSimulationMetadataSummary(simulation: CanonicalSimulation): string[] {
  const lines: string[] = [
    `Simulation: ${simulation.context.simulationName}`,
    `Planning Type: ${formatPlanningType(simulation.context.planningType)}`,
    `Operation Size: ${formatOperationSize(simulation.context.operationSize)}`,
  ];

  if (simulation.context.entity) {
    lines.push(`Entity: ${simulation.context.entity}`);
  }

  if (simulation.context.region) {
    lines.push(`Region: ${simulation.context.region}`);
  }

  if (simulation.context.scopeDriverType && simulation.context.scopeDriverValue) {
    lines.push(`Scope: ${formatScopeDriver(simulation)}`);
  }

  if (simulation.context.contextObjectives) {
    lines.push(`Objectives: ${simulation.context.contextObjectives}`);
  }

  return lines;
}

export function getSimulationContextForExport(simulation: CanonicalSimulation): Record<string, string> {
  return {
    'Simulation Name': simulation.context.simulationName,
    'Schema Version': simulation.schemaVersion,
    'Planning Type': formatPlanningType(simulation.context.planningType),
    'Operation Size': formatOperationSize(simulation.context.operationSize),
    'Entity': simulation.context.entity || 'Not specified',
    'Region': simulation.context.region || 'Not specified',
    'Scope': formatScopeDriver(simulation),
    'Auto-Size Enabled': simulation.context.autoSizeEnabled ? 'Yes' : 'No',
    'Context & Objectives': simulation.context.contextObjectives || 'Not specified',
    'Function Type': simulation.setup.functionType,
    'Created At': simulation.createdAt || 'N/A',
    'Updated At': simulation.updatedAt || 'N/A',
  };
}
