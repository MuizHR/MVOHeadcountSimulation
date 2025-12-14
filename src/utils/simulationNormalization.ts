/**
 * Universal Simulation Data Normalization Utility
 *
 * This module provides a single, consistent normalization process for all simulation data
 * Used by: Library views, exports, duplication, and any other component that needs simulation data
 *
 * Ensures:
 * - Backward compatibility with old field names
 * - Missing optional fields display as "-"
 * - No crashes from missing keys
 * - Consistent data representation across the application
 */

import { planningTypeConfig, sizeOfOperationConfig } from '../types/planningConfig';

export interface NormalizedSimulationData {
  // Meta
  id: string;
  created_at: string;
  updated_at?: string;
  user_id: string;

  // Step 1: Planning Context
  simulationName: string;
  companyName: string;
  businessPillar: string;
  country: string;
  region: string;
  countryCode: string;
  scopeDriverType: string | null;
  scopeDriverValue: number | null;
  employeesSupported: number | null;
  workLocations: number | null;
  activeWorkstreams: number | null;
  scopeDriverLabel: string;
  planningType: string;
  planningTypeLabel: string;
  sizeOfOperation: string;
  sizeOfOperationLabel: string;
  contextObjectives: string;

  // Step 2: Function Setup
  businessArea: string;
  subFunctions: any[];

  // Step 3: Workload (HR Questions)
  workloadScore: number;

  // Step 4: Operating Model
  // (Captured in subFunctions)

  // Step 5: Review
  // (Calculated data)

  // Step 6: Results
  totalFte: number;
  totalMonthlyCost: number;
  scenarios: any[];

  // Full payloads for detailed rendering
  input_payload: any;
  result_payload: any;
}

/**
 * Normalizes a raw simulation record from database into a consistent format
 * Handles backward compatibility and missing fields
 */
export function normalizeSimulationData(rawSimulation: any): NormalizedSimulationData {
  if (!rawSimulation) {
    throw new Error('Cannot normalize null or undefined simulation data');
  }

  const inputPayload = rawSimulation.input_payload || {};
  const resultPayload = rawSimulation.result_payload || {};
  const simulationInputs = inputPayload.simulationInputs || {};
  const subFunctions = inputPayload.subFunctions || [];
  const simulationResult = resultPayload.simulationResult || null;

  // Step 1: Planning Context normalization
  const companyName = simulationInputs.companyName || simulationInputs.entity || '-';
  const businessPillar = simulationInputs.businessPillar || '-';
  const country = simulationInputs.country || '-';
  const region = simulationInputs.region || '-';
  const countryCode = simulationInputs.countryCode || '';

  // Scope driver normalization
  const scopeDriverType = simulationInputs.scopeDriverType || null;
  const scopeDriverValue = simulationInputs.scopeDriverValue || null;

  let employeesSupported = null;
  let workLocations = null;
  let activeWorkstreams = null;

  if (scopeDriverType === 'employees_supported') {
    employeesSupported = scopeDriverValue;
  } else if (scopeDriverType === 'sites_locations') {
    workLocations = scopeDriverValue;
  } else if (scopeDriverType === 'projects_portfolios') {
    activeWorkstreams = scopeDriverValue;
  }

  // Scope driver label
  let scopeDriverLabel = '-';
  if (scopeDriverType === 'employees_supported') {
    scopeDriverLabel = 'Employees Supported';
  } else if (scopeDriverType === 'sites_locations') {
    scopeDriverLabel = 'Work Locations Supported';
  } else if (scopeDriverType === 'projects_portfolios') {
    scopeDriverLabel = 'Active Workstreams';
  }

  // Planning type normalization
  const planningTypeKey = simulationInputs.planningTypeKey || simulationInputs.planningType || 'new_function';
  const planningTypeLabel = planningTypeKey && planningTypeConfig[planningTypeKey]
    ? planningTypeConfig[planningTypeKey].label
    : rawSimulation.planning_type || 'Not specified';

  // Size of operation normalization
  const sizeOfOperationKey = simulationInputs.sizeOfOperationKey || simulationInputs.operationSize || 'medium_standard';
  const sizeOfOperationLabel = sizeOfOperationKey && sizeOfOperationConfig[sizeOfOperationKey]
    ? sizeOfOperationConfig[sizeOfOperationKey].label
    : rawSimulation.size_of_operation || 'Not specified';

  // Context & objectives (supports both snake_case and camelCase)
  const contextObjectives = simulationInputs.contextObjectives || simulationInputs.context_objectives || '-';

  // Step 2: Function Setup normalization
  const businessArea = rawSimulation.business_area || simulationInputs.businessArea || 'Not specified';

  // Step 6: Results normalization
  const totalFte = rawSimulation.total_fte || 0;
  const totalMonthlyCost = rawSimulation.total_monthly_cost || 0;
  const workloadScore = rawSimulation.workload_score || 0;
  const scenarios = resultPayload.scenarios || [];

  return {
    // Meta
    id: rawSimulation.id,
    created_at: rawSimulation.created_at,
    updated_at: rawSimulation.updated_at,
    user_id: rawSimulation.user_id,

    // Step 1: Planning Context
    simulationName: rawSimulation.simulation_name || 'Untitled Simulation',
    companyName,
    businessPillar,
    country,
    region,
    countryCode,
    scopeDriverType,
    scopeDriverValue,
    employeesSupported,
    workLocations,
    activeWorkstreams,
    scopeDriverLabel,
    planningType: planningTypeKey,
    planningTypeLabel,
    sizeOfOperation: sizeOfOperationKey,
    sizeOfOperationLabel,
    contextObjectives,

    // Step 2: Function Setup
    businessArea,
    subFunctions,

    // Step 3: Workload
    workloadScore,

    // Step 6: Results
    totalFte,
    totalMonthlyCost,
    scenarios,

    // Full payloads for detailed rendering
    input_payload: inputPayload,
    result_payload: resultPayload,
  };
}

/**
 * Formats a date for display in simulation views
 */
export function formatSimulationDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Formats numbers for display with thousands separators
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString();
}

/**
 * Formats currency for display
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return '-';
  return `$${value.toLocaleString()}`;
}

/**
 * Returns display-friendly location text
 */
export function getLocationDisplay(country: string, region: string): string {
  if (country !== '-' && country) {
    if (region !== '-' && region !== 'Custom' && region) {
      return `${country} (${region})`;
    }
    return country;
  }
  if (region !== '-' && region) {
    return region;
  }
  return '-';
}

/**
 * Returns display-friendly company text
 */
export function getCompanyDisplay(companyName: string, businessPillar: string): string {
  if (companyName === '-') return '-';
  if (businessPillar !== '-' && businessPillar !== 'Custom') {
    return `${companyName} (${businessPillar})`;
  }
  return companyName;
}
