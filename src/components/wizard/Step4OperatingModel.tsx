import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import {
  OperatingStructure,
  DeliveryModel,
  AutomationLevel,
  CoveragePattern,
} from '../../types/subfunction';

export function Step4OperatingModel() {
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

  const updateOperatingModel = (field: string, value: any) => {
    updateSubFunction(currentSubFunction.id, {
      operatingModel: {
        ...currentSubFunction.operatingModel,
        [field]: value,
      },
    });
  };

  const handleNext = () => {
    if (currentSubFunctionIndex < subFunctions.length - 1) {
      setCurrentSubFunctionIndex(currentSubFunctionIndex + 1);
    } else {
      updateSubFunction(currentSubFunction.id, { status: 'fully_configured' });
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (currentSubFunctionIndex > 0) {
      setCurrentSubFunctionIndex(currentSubFunctionIndex - 1);
    } else {
      setCurrentSubFunctionIndex(0);
      previousStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Operating Model</h2>
            <p className="text-gray-600 mt-1">
              Define how work is structured and delivered
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

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Organizational Structure *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'centralized' as OperatingStructure, label: 'Centralized', desc: 'Single team serves all' },
                { value: 'decentralized' as OperatingStructure, label: 'Decentralized', desc: 'Teams at each location' },
                { value: 'hybrid' as OperatingStructure, label: 'Hybrid', desc: 'Mix of both approaches' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateOperatingModel('structure', option.value)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      currentSubFunction.operatingModel.structure === option.value
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                  `}
                >
                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Delivery Model *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'in_house' as DeliveryModel, label: 'In-House', desc: 'All internal resources' },
                { value: 'outsourced' as DeliveryModel, label: 'Outsourced', desc: '3rd party vendor' },
                { value: 'hybrid' as DeliveryModel, label: 'Hybrid', desc: 'Mix of both models' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateOperatingModel('delivery', option.value)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      currentSubFunction.operatingModel.delivery === option.value
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                  `}
                >
                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Automation Level *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'manual' as AutomationLevel, label: 'Manual', desc: 'Paper-based, manual tasks' },
                { value: 'partially_automated' as AutomationLevel, label: 'Partially Automated', desc: 'Some digital tools, mixed' },
                { value: 'highly_automated' as AutomationLevel, label: 'Highly Automated', desc: 'End-to-end automation' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateOperatingModel('automationLevel', option.value)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      currentSubFunction.operatingModel.automationLevel === option.value
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                  `}
                >
                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Operating Hours / Coverage *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'office_hours' as CoveragePattern, label: 'Office Hours', desc: '8am - 5pm weekdays' },
                { value: 'extended_hours' as CoveragePattern, label: 'Extended Hours', desc: '7am - 10pm + weekends' },
                { value: 'twenty_four_seven' as CoveragePattern, label: '24/7', desc: 'Round-the-clock shifts' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => updateOperatingModel('coverage', option.value)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${
                      currentSubFunction.operatingModel.coverage === option.value
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                  `}
                >
                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </button>
              ))}
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
          {currentSubFunctionIndex === 0 ? 'Back to Workload' : 'Previous Sub-Function'}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          {currentSubFunctionIndex === subFunctions.length - 1 ? 'Continue to Review' : 'Next Sub-Function'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
