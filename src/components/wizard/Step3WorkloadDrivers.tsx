import React from 'react';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { IntensityLevel, ServiceLevel } from '../../types/simulation';
import { WizardNavigation } from './WizardNavigation';

const COMPLEXITY_DEFINITIONS: Record<IntensityLevel, string> = {
  low: 'Simple, standardized work with few exceptions. Minimal training required.',
  medium: 'Moderate complexity. Requires some training and judgment, occasional problem-solving needed.',
  high: 'Complex work with frequent exceptions and cross-functional coordination required.',
  very_high: 'Highly complex, high-risk work with strict regulatory requirements and deep expertise needed.',
};

const SERVICE_LEVEL_DEFINITIONS: Record<ServiceLevel, string> = {
  basic: 'Basic service level. Flexible timelines, standard support during business hours.',
  normal: 'Standard service level. Timely response expected with some flexibility allowed.',
  high: 'High service level. Quick turnaround needed, prompt response required.',
  critical: 'Critical service level. Immediate response required, zero tolerance for delays.',
};

export function Step3WorkloadDrivers() {
  const {
    state,
    updateSubFunction,
    setCurrentSubFunctionIndex,
    previousStep,
    nextStep,
  } = useWizard();
  const { subFunctions, currentSubFunctionIndex } = state;

  const currentSubFunction = subFunctions[currentSubFunctionIndex];

  if (!currentSubFunction) {
    return null;
  }

  const handleDriverChange = (field: string, value: any) => {
    updateSubFunction(currentSubFunction.id, {
      workloadDrivers: {
        ...currentSubFunction.workloadDrivers,
        [field]: value,
      },
    });
  };

  const handleNext = () => {
    if (currentSubFunctionIndex < subFunctions.length - 1) {
      setCurrentSubFunctionIndex(currentSubFunctionIndex + 1);
    } else {
      updateSubFunction(currentSubFunction.id, { status: 'partially_configured' });
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (currentSubFunctionIndex > 0) {
      setCurrentSubFunctionIndex(currentSubFunctionIndex - 1);
    } else {
      previousStep();
    }
  };

  const updateComplexity = (level: IntensityLevel) => {
    updateSubFunction(currentSubFunction.id, { complexity: level });
  };

  const updateServiceLevel = (level: ServiceLevel) => {
    updateSubFunction(currentSubFunction.id, { serviceLevel: level });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Workload Drivers</h2>
            <p className="text-gray-600 mt-1">
              Define volume and demand metrics for each sub-function
            </p>
          </div>
        </div>

        <div className="bg-teal-600 text-white px-6 py-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">
                Sub-Function {currentSubFunctionIndex + 1} of {subFunctions.length}
              </div>
              <div className="text-xl font-bold mt-1">{currentSubFunction.name}</div>
            </div>
            <div className="flex gap-2">
              {subFunctions.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentSubFunctionIndex ? 'bg-white' : 'bg-teal-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Volume & Demand Drivers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employees Supported
                </label>
                <input
                  type="number"
                  value={currentSubFunction.workloadDrivers.employeesSupported || ''}
                  onChange={e =>
                    handleDriverChange('employeesSupported', parseInt(e.target.value) || undefined)
                  }
                  placeholder="e.g., 2700"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total number of employees this sub-function supports
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transactions per Month
                </label>
                <input
                  type="number"
                  value={currentSubFunction.workloadDrivers.transactionsPerMonth || ''}
                  onChange={e =>
                    handleDriverChange('transactionsPerMonth', parseInt(e.target.value) || undefined)
                  }
                  placeholder="e.g., 3000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of transactions, tickets, or cases processed monthly
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sites/Locations Supported
                </label>
                <input
                  type="number"
                  value={currentSubFunction.workloadDrivers.sitesOrLocations || ''}
                  onChange={e =>
                    handleDriverChange('sitesOrLocations', parseInt(e.target.value) || undefined)
                  }
                  placeholder="e.g., 15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of physical locations, sites, or branches served
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Zones
                </label>
                <input
                  type="number"
                  value={currentSubFunction.workloadDrivers.timeZones || ''}
                  onChange={e =>
                    handleDriverChange('timeZones', parseInt(e.target.value) || undefined)
                  }
                  placeholder="e.g., 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of different time zones covered
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Complexity & Service Requirements
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Complexity Level *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.keys(COMPLEXITY_DEFINITIONS) as IntensityLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => updateComplexity(level)}
                      className={`
                        px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all capitalize
                        ${
                          currentSubFunction.complexity === level
                            ? 'border-teal-600 bg-teal-50 text-teal-900'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      {level.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                {currentSubFunction.complexity && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-blue-900">
                        {COMPLEXITY_DEFINITIONS[currentSubFunction.complexity]}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Service Level / Criticality *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(Object.keys(SERVICE_LEVEL_DEFINITIONS) as ServiceLevel[]).map(level => (
                    <button
                      key={level}
                      onClick={() => updateServiceLevel(level)}
                      className={`
                        px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all capitalize
                        ${
                          currentSubFunction.serviceLevel === level
                            ? 'border-teal-600 bg-teal-50 text-teal-900'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                {currentSubFunction.serviceLevel && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <p className="text-sm text-blue-900">
                        {SERVICE_LEVEL_DEFINITIONS[currentSubFunction.serviceLevel]}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-8 pb-8">
        <button
          onClick={handlePrevious}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          {currentSubFunctionIndex === 0 ? 'Back to Setup' : 'Previous Sub-Function'}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          {currentSubFunctionIndex === subFunctions.length - 1 ? 'Continue to Operating Model' : 'Next Sub-Function'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
