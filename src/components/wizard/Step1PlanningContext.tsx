import React, { useEffect, useState } from 'react';
import { Info, CheckCircle } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { useAuth } from '../../contexts/AuthContext';
import { PlanningType, OperationSize, ScopeDriverType } from '../../types/simulation';
import { WizardNavigation } from './WizardNavigation';
import { Tooltip } from '../Tooltip';
import { CompanySelector } from '../CompanySelector';
import { planningTypeConfig, sizeOfOperationConfig, mapPlanningTypeToKey, mapSizeOfOperationToKey } from '../../types/planningConfig';
import { scopeThresholdService, ScopeThreshold } from '../../services/scopeThresholdService';

const ENTITIES = [
  'Group / Multi-entity',
  'Single Company',
  'Subsidiary',
  'Joint Venture',
  'Division',
  'Branch',
];

const REGIONS = [
  'Asia Pacific',
  'Europe',
  'Middle East',
  'North America',
  'South America',
  'Africa',
  'Global / Multi-region',
];

const PLANNING_TYPES: {
  id: PlanningType;
  title: string;
  description: string;
}[] = [
  {
    id: 'new_project',
    title: 'New Project',
    description: 'Setting up a new project with temporary or dedicated resources.',
  },
  {
    id: 'new_function',
    title: 'New Function',
    description: 'Creating a new permanent function or department from scratch.',
  },
  {
    id: 'new_business_unit',
    title: 'New Business Unit',
    description: 'Launching a new business unit with multiple functions and teams.',
  },
  {
    id: 'restructuring',
    title: 'Restructuring',
    description: 'Reorganizing an existing function to improve efficiency or reduce costs.',
  },
  {
    id: 'bau_monthly_operations',
    title: 'BAU / Monthly Operations',
    description: 'Recurring monthly workload like payroll cycle, HR operations, or routine business processes.',
  },
];

const SCOPE_DRIVER_TYPES: {
  id: ScopeDriverType;
  label: string;
  description: string;
  placeholder: string;
  inputLabel: string;
  examples: string;
  thresholds: { small: number; medium: number; large: number };
}[] = [
  {
    id: 'employees_supported',
    label: 'Employees Supported (Headcount served)',
    description: 'Total number of employees your team supports or serves',
    placeholder: 'e.g., 2700',
    inputLabel: 'How many employees are in scope?',
    examples: 'e.g., 300 / 2,700',
    thresholds: { small: 500, medium: 2000, large: 5000 },
  },
  {
    id: 'sites_locations',
    label: 'Work Locations Supported (Sites/outlets/buildings)',
    description: 'Number of physical locations, sites, outlets, or buildings covered',
    placeholder: 'e.g., 30',
    inputLabel: 'How many locations are in scope?',
    examples: 'e.g., 5 / 30 / 200',
    thresholds: { small: 5, medium: 15, large: 30 },
  },
  {
    id: 'projects_portfolios',
    label: 'Active Workstreams (Projects/initiatives)',
    description: 'Number of concurrent projects, programs, or initiatives managed',
    placeholder: 'e.g., 10',
    inputLabel: 'How many workstreams are in scope?',
    examples: 'e.g., 3 / 10',
    thresholds: { small: 3, medium: 10, large: 20 },
  },
];

const OPERATION_SIZES: {
  id: OperationSize;
  title: string;
  subtitle: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    id: 'small_lean',
    title: 'Small / Lean',
    subtitle: '(minimum team)',
    description: 'For pilot projects, small sites, low workload or tight budget situations.',
  },
  {
    id: 'medium_standard',
    title: 'Medium / Standard',
    subtitle: '(normal operations)',
    description: 'For regular daily operations with a balanced workload.',
    recommended: true,
  },
  {
    id: 'large_extended',
    title: 'Large / Extended',
    subtitle: '(full scale / growth)',
    description: 'For big projects, multiple locations, high demand or rapid expansion.',
  },
];

function getSuggestedSize(
  thresholds: ScopeThreshold[],
  driverType: ScopeDriverType | undefined,
  value: number | undefined
): OperationSize | null {
  if (!driverType || !value) return null;

  const operationSize = scopeThresholdService.determineOperationSize(thresholds, driverType, value);

  return operationSize === 'small' ? 'small_lean' :
         operationSize === 'medium' ? 'medium_standard' :
         'large_extended';
}

function getRecommendationText(
  thresholds: ScopeThreshold[],
  driverType: ScopeDriverType | undefined,
  value: number | undefined
): string {
  if (!driverType || !value) return '';

  const size = getSuggestedSize(thresholds, driverType, value);
  if (!size) return '';

  const sizeConfig = OPERATION_SIZES.find(s => s.id === size);
  const driverName = scopeThresholdService.getDriverDisplayName(driverType);

  return `Recommended size: ${sizeConfig?.title} ${sizeConfig?.subtitle} (based on ${driverName} = ${value})`;
}

export function Step1PlanningContext() {
  const { state, updateSimulationInputs, nextStep } = useWizard();
  const { simulationInputs } = state;
  const { appUser } = useAuth();
  const [thresholds, setThresholds] = useState<ScopeThreshold[]>([]);
  const [loadingThresholds, setLoadingThresholds] = useState(true);
  const [companyError, setCompanyError] = useState('');

  const selectedType = PLANNING_TYPES.find(
    t => t.id === simulationInputs.planningType
  );

  const selectedPlanningTypeKey = simulationInputs.planningTypeKey ||
    (simulationInputs.planningType ? mapPlanningTypeToKey(PLANNING_TYPES.find(t => t.id === simulationInputs.planningType)?.title || '') : undefined);

  const selectedSizeKey = simulationInputs.sizeOfOperationKey ||
    (simulationInputs.operationSize ? mapSizeOfOperationToKey(OPERATION_SIZES.find(s => s.id === simulationInputs.operationSize)?.title + ' ' + OPERATION_SIZES.find(s => s.id === simulationInputs.operationSize)?.subtitle || '') : undefined);

  const selectedScopeDriver = SCOPE_DRIVER_TYPES.find(d => d.id === simulationInputs.scopeDriverType);

  const autoSizeEnabled = simulationInputs.autoSizeEnabled !== false;

  useEffect(() => {
    async function loadThresholds() {
      setLoadingThresholds(true);
      const data = await scopeThresholdService.fetchThresholds();
      setThresholds(data);
      setLoadingThresholds(false);
    }
    loadThresholds();
  }, []);

  useEffect(() => {
    if (autoSizeEnabled && simulationInputs.scopeDriverType && simulationInputs.scopeDriverValue && thresholds.length > 0) {
      const suggestedSize = getSuggestedSize(thresholds, simulationInputs.scopeDriverType, simulationInputs.scopeDriverValue);
      if (suggestedSize && suggestedSize !== simulationInputs.operationSize) {
        const sizeConfig = OPERATION_SIZES.find(s => s.id === suggestedSize);
        if (sizeConfig) {
          const sizeKey = mapSizeOfOperationToKey(sizeConfig.title + ' ' + sizeConfig.subtitle);
          updateSimulationInputs({
            operationSize: suggestedSize,
            sizeOfOperationKey: sizeKey
          });
        }
      }
    }
  }, [autoSizeEnabled, simulationInputs.scopeDriverType, simulationInputs.scopeDriverValue, thresholds]);

  const canContinue =
    !!simulationInputs.simulationName &&
    !!simulationInputs.planningType &&
    !!simulationInputs.companyName;

  const handleNext = () => {
    if (!simulationInputs.companyName) {
      setCompanyError('Please select a company/entity');
      return;
    }
    setCompanyError('');
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Planning Context</h2>
        <p className="text-gray-600 mb-8">
          Define the scope and purpose of your workforce planning
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Simulation Name *
            </label>
            <input
              type="text"
              value={simulationInputs.simulationName}
              onChange={e =>
                updateSimulationInputs({ simulationName: e.target.value })
              }
              placeholder="e.g., Q1 2024 HR Restructuring"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-500">
                Give your simulation a descriptive name for easy reference
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Entity / Company *
              </label>
              <CompanySelector
                value={simulationInputs.companyName || ''}
                businessPillar={simulationInputs.businessPillar || 'Custom'}
                onChange={(companyName, businessPillar) => {
                  updateSimulationInputs({ companyName, businessPillar });
                  setCompanyError('');
                }}
                userId={appUser?.id}
                required={true}
                error={companyError}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location / Region *
              </label>
              <select
                value={simulationInputs.region || ''}
                onChange={e =>
                  updateSimulationInputs({ region: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select region...</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Scope Size (What are you supporting?)
              </label>
              <button
                type="button"
                onClick={() => updateSimulationInputs({ scopeDriverType: 'employees_supported' })}
                className="text-xs text-teal-600 hover:text-teal-700 underline"
              >
                Not sure? Use Employees Supported (recommended)
              </button>
            </div>
            <div className="flex items-start gap-2 mb-4">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                Choose one number that best represents how big the operation/workload is. This helps the system suggest team size and defaults (you can override later).
              </p>
            </div>
            <div className="space-y-3">
              {SCOPE_DRIVER_TYPES.map(driver => (
                <div key={driver.id} className="border border-gray-200 rounded-lg p-4 hover:border-teal-300 transition-colors">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="scopeDriverType"
                      value={driver.id}
                      checked={simulationInputs.scopeDriverType === driver.id}
                      onChange={e =>
                        updateSimulationInputs({
                          scopeDriverType: e.target.value as ScopeDriverType,
                        })
                      }
                      className="w-4 h-4 mt-0.5 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">
                        {driver.label}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {driver.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {driver.examples}
                      </div>
                    </div>
                  </label>
                  {simulationInputs.scopeDriverType === driver.id && (
                    <div className="mt-3 pl-7">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {driver.inputLabel}
                      </label>
                      <input
                        type="number"
                        value={simulationInputs.scopeDriverValue || ''}
                        onChange={e =>
                          updateSimulationInputs({
                            scopeDriverValue: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder={driver.placeholder}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-900">
                <strong>What should I pick?</strong> Choose the metric that best defines your workload scope. For most HR/support functions, "Employees Supported" works best. For site-based operations (facilities, security), use "Work Locations". For project offices, use "Active Workstreams".
              </div>
            </div>
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-gray-600">
                  <strong>Used for:</strong> Auto-suggest operation size, default assumptions, reporting context
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-semibold text-gray-700">
                Planning Type *
              </label>
              {selectedPlanningTypeKey && (
                <Tooltip
                  title="How Planning Type affects the simulation"
                  content={`The simulator adjusts uncertainty, governance rules and risk limits based on your Planning Type.\n\n${planningTypeConfig[selectedPlanningTypeKey].tooltip}`}
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PLANNING_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => {
                    const planningTypeKey = mapPlanningTypeToKey(type.title);
                    updateSimulationInputs({
                      planningType: type.id,
                      planningTypeKey
                    });
                  }}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      simulationInputs.planningType === type.id
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <div className="font-semibold text-gray-900 mb-1">
                    {type.title}
                  </div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </button>
              ))}
            </div>

            {selectedType && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">
                      {selectedType.title}
                    </div>
                    <div className="text-sm text-blue-800">
                      {selectedType.description}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Size of Operation *
                </label>
                {selectedSizeKey && (
                  <Tooltip
                    title="How Size of Operation affects the simulation"
                    content={`Size of Operation tells the simulator how big and complex your environment is. It scales the workload, minimum headcount floor and realism of productivity.\n\n${sizeOfOperationConfig[selectedSizeKey].tooltip}`}
                  />
                )}
              </div>
              {selectedScopeDriver && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSizeEnabled}
                    onChange={e =>
                      updateSimulationInputs({ autoSizeEnabled: e.target.checked })
                    }
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-600">
                    Auto-suggest size based on scope driver
                  </span>
                </label>
              )}
            </div>
            <div className="flex items-start gap-2 mb-4">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                How big is the operation you want to run? This helps the system suggest the most suitable team size for your planning.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {OPERATION_SIZES.map(size => (
                <button
                  key={size.id}
                  onClick={() => {
                    const sizeKey = mapSizeOfOperationToKey(size.title + ' ' + size.subtitle);
                    updateSimulationInputs({
                      operationSize: size.id,
                      sizeOfOperationKey: sizeKey
                    });
                  }}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all relative
                    ${
                      simulationInputs.operationSize === size.id
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">
                          {size.title}
                        </span>
                        <span className="text-sm text-gray-600">
                          {size.subtitle}
                        </span>
                        {size.recommended && (
                          <span className="ml-2 px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 italic mb-2">
                        {size.description}
                      </div>
                      {getSuggestedSize(thresholds, simulationInputs.scopeDriverType, simulationInputs.scopeDriverValue) === size.id && autoSizeEnabled && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Auto-suggested
                          </span>
                        </div>
                      )}
                    </div>
                    {simulationInputs.operationSize === size.id && (
                      <div className="ml-3">
                        <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {simulationInputs.scopeDriverType && simulationInputs.scopeDriverValue && !loadingThresholds && (
              <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-teal-900">
                    <strong>Live Recommendation:</strong> {getRecommendationText(thresholds, simulationInputs.scopeDriverType, simulationInputs.scopeDriverValue)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Context & Objectives
              <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            </label>
            <textarea
              value={simulationInputs.contextObjectives || ''}
              onChange={e =>
                updateSimulationInputs({ contextObjectives: e.target.value })
              }
              placeholder="Business problem: Scaling HR operations to support company growth&#10;Constraints: Budget cap of $500K, hiring freeze until Q3, must launch by June&#10;Success criteria: Process 300+ transactions/day, 95% SLA compliance, 20% cost reduction"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-500">
                Describe the business problem, key constraints (budget, deadline, hiring freeze), and success criteria (SLA, cost targets, turnaround time)
              </p>
            </div>
          </div>
        </div>
      </div>

      <WizardNavigation
        onNext={handleNext}
        canGoBack={false}
        canGoNext={true}
        isNextDisabled={!canContinue}
      />
    </div>
  );
}
