import React from 'react';
import { Info, CheckCircle } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { PlanningType, OperationSize } from '../../types/simulation';
import { WizardNavigation } from './WizardNavigation';
import { Tooltip } from '../Tooltip';
import { planningTypeConfig, sizeOfOperationConfig, mapPlanningTypeToKey, mapSizeOfOperationToKey } from '../../types/planningConfig';

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

export function Step1PlanningContext() {
  const { state, updateSimulationInputs, nextStep } = useWizard();
  const { simulationInputs } = state;

  const selectedType = PLANNING_TYPES.find(
    t => t.id === simulationInputs.planningType
  );

  const selectedPlanningTypeKey = simulationInputs.planningTypeKey ||
    (simulationInputs.planningType ? mapPlanningTypeToKey(PLANNING_TYPES.find(t => t.id === simulationInputs.planningType)?.title || '') : undefined);

  const selectedSizeKey = simulationInputs.sizeOfOperationKey ||
    (simulationInputs.operationSize ? mapSizeOfOperationToKey(OPERATION_SIZES.find(s => s.id === simulationInputs.operationSize)?.title + ' ' + OPERATION_SIZES.find(s => s.id === simulationInputs.operationSize)?.subtitle || '') : undefined);

  const canContinue = !!simulationInputs.simulationName && !!simulationInputs.planningType;

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
            <div className="flex items-center gap-2 mb-3">
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
                      <div className="text-sm text-gray-600 italic">
                        {size.description}
                      </div>
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
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Context & Objectives
              <span className="text-gray-500 font-normal ml-2">(Optional)</span>
            </label>
            <textarea
              value={simulationInputs.contextNotes || ''}
              onChange={e =>
                updateSimulationInputs({ contextNotes: e.target.value })
              }
              placeholder="Describe the business context, drivers, and expected outcomes..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
            />
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-500">
                This helps provide context when reviewing the simulation later
              </p>
            </div>
          </div>
        </div>
      </div>

      <WizardNavigation
        onNext={nextStep}
        canGoBack={false}
        canGoNext={true}
        isNextDisabled={!canContinue}
      />
    </div>
  );
}
