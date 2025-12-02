import React from 'react';
import { Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { RangeValue } from '../../types/subfunction';
import { getAllWorkTypes, getWorkTypeCoefficients } from '../../data/workTypeCoefficients';
import { processWorkloadWithWorkType } from '../../utils/workTypeCalculator';

interface RangeInputProps {
  label: string;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  suffix?: string;
  help?: string;
}

function RangeInput({ label, value, onChange, suffix = '', help }: RangeInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Min</label>
          <div className="relative">
            <input
              type="number"
              value={value.min}
              onChange={e => onChange({ ...value, min: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 pr-12"
            />
            {suffix && <span className="absolute right-3 top-2 text-gray-500 text-sm">{suffix}</span>}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Typical</label>
          <div className="relative">
            <input
              type="number"
              value={value.typical}
              onChange={e => onChange({ ...value, typical: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-teal-400 border-2 rounded-lg focus:ring-2 focus:ring-teal-500 font-semibold pr-12"
            />
            {suffix && <span className="absolute right-3 top-2 text-gray-500 text-sm">{suffix}</span>}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Max</label>
          <div className="relative">
            <input
              type="number"
              value={value.max}
              onChange={e => onChange({ ...value, max: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 pr-12"
            />
            {suffix && <span className="absolute right-3 top-2 text-gray-500 text-sm">{suffix}</span>}
          </div>
        </div>
      </div>
      {help && (
        <div className="flex items-start gap-2 mt-2">
          <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">{help}</p>
        </div>
      )}
    </div>
  );
}

export function Step3WorkloadDriversEnhanced() {
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

  const wd = currentSubFunction.workloadDrivers;

  const updateWorkloadField = (field: string, value: any) => {
    updateSubFunction(currentSubFunction.id, {
      workloadDrivers: {
        ...wd,
        [field]: value,
      },
    });
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    updateSubFunction(currentSubFunction.id, {
      workloadDrivers: {
        ...wd,
        [parent]: {
          ...(wd as any)[parent],
          [field]: value,
        },
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
      previousStep();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Workload & Risk Inputs</h2>
            <p className="text-gray-600 mt-1">
              Provide min-typical-max ranges for Monte Carlo simulation
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Range-Based Inputs</p>
                <p className="text-blue-800">
                  Provide <strong>Min</strong> (best case), <strong>Typical</strong> (expected), and{' '}
                  <strong>Max</strong> (worst case) values. The Monte Carlo simulation will randomly
                  sample within these ranges to model uncertainty.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Type Selection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Work Type
                </label>
                <select
                  value={currentSubFunction.workTypeId || ''}
                  onChange={(e) => {
                    const workTypeId = e.target.value;
                    const coefficients = getWorkTypeCoefficients(workTypeId);
                    if (coefficients) {
                      updateSubFunction(currentSubFunction.id, {
                        workTypeId,
                        workTypeCoefficients: {
                          productivityRate: coefficients.productivityRate,
                          complexityFactor: coefficients.complexityFactor,
                          varianceLevel: coefficients.varianceLevel,
                          minHeadcountRule: coefficients.minHeadcountRule,
                          riskMultiplier: coefficients.riskMultiplier,
                        },
                      });
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">-- Select a Work Type --</option>
                  {getAllWorkTypes().map((wt) => (
                    <option key={wt.id} value={wt.id}>
                      {wt.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentSubFunction.workTypeCoefficients && (
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-teal-900 mb-3">
                    Work Type Coefficients (Auto-loaded)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-teal-700">Productivity Rate:</span>
                      <span className="ml-2 font-medium text-teal-900">
                        {currentSubFunction.workTypeCoefficients.productivityRate.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-teal-700">Complexity Factor:</span>
                      <span className="ml-2 font-medium text-teal-900">
                        {currentSubFunction.workTypeCoefficients.complexityFactor.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-teal-700">Variance Level:</span>
                      <span className="ml-2 font-medium text-teal-900">
                        {currentSubFunction.workTypeCoefficients.varianceLevel.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-teal-700">Min Headcount:</span>
                      <span className="ml-2 font-medium text-teal-900">
                        {currentSubFunction.workTypeCoefficients.minHeadcountRule}
                      </span>
                    </div>
                    <div>
                      <span className="text-teal-700">Risk Multiplier:</span>
                      <span className="ml-2 font-medium text-teal-900">
                        {currentSubFunction.workTypeCoefficients.riskMultiplier.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workload & Productivity</h3>
            <div className="space-y-4">
              <RangeInput
                label="Total Work Units / Tasks"
                value={wd.totalWorkUnits!}
                onChange={v => updateWorkloadField('totalWorkUnits', v)}
                help="Total amount of work to be completed (e.g., transactions, tickets, projects)"
              />

              <RangeInput
                label="Productivity (units per person per day)"
                value={wd.productivityUnitsPerPersonPerDay!}
                onChange={v => updateWorkloadField('productivityUnitsPerPersonPerDay', v)}
                suffix="units"
                help="How many work units one person can complete in one day"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">People Risk Factors</h3>
            <div className="space-y-4">
              <RangeInput
                label="Absenteeism Rate"
                value={wd.peopleRiskFactors!.absenteeismRate}
                onChange={v => updateNestedField('peopleRiskFactors', 'absenteeismRate', v)}
                suffix="%"
                help="Percentage of time staff are absent (sick leave, personal days, etc.)"
              />

              <RangeInput
                label="Turnover Risk"
                value={wd.peopleRiskFactors!.turnoverRisk}
                onChange={v => updateNestedField('peopleRiskFactors', 'turnoverRisk', v)}
                suffix="%"
                help="Expected staff turnover rate during project period"
              />

              <RangeInput
                label="Learning Curve Impact"
                value={wd.peopleRiskFactors!.learningCurveImpact}
                onChange={v => updateNestedField('peopleRiskFactors', 'learningCurveImpact', v)}
                suffix="%"
                help="Productivity reduction for new hires during ramp-up"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Variables</h3>
            <div className="space-y-4">
              <RangeInput
                label="Monthly Salary (Permanent Staff)"
                value={wd.costVariables!.monthlySalaryPermanent}
                onChange={v => updateNestedField('costVariables', 'monthlySalaryPermanent', v)}
                suffix="RM"
                help="Monthly cost per permanent employee including benefits"
              />

              <RangeInput
                label="Average Overtime Hours per Month"
                value={wd.costVariables!.avgOvertimeHoursPerMonth}
                onChange={v => updateNestedField('costVariables', 'avgOvertimeHoursPerMonth', v)}
                suffix="hrs"
                help="Expected overtime hours per person per month"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overtime Rate Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={wd.costVariables!.overtimeRate}
                  onChange={e =>
                    updateNestedField('costVariables', 'overtimeRate', parseFloat(e.target.value) || 1.5)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Typically 1.5× (50% premium)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Cost per New Hire
                </label>
                <input
                  type="number"
                  value={wd.costVariables!.trainingCostPerHire}
                  onChange={e =>
                    updateNestedField('costVariables', 'trainingCostPerHire', parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">One-time cost per new employee (RM)</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Constraints & Thresholds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Completion Time
                </label>
                <input
                  type="number"
                  value={wd.constraints!.targetCompletionDays}
                  onChange={e =>
                    updateNestedField('constraints', 'targetCompletionDays', parseInt(e.target.value) || 90)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Deadline in days</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Budget (Optional)
                </label>
                <input
                  type="number"
                  value={wd.constraints!.maxBudget || ''}
                  onChange={e =>
                    updateNestedField('constraints', 'maxBudget', parseFloat(e.target.value) || undefined)
                  }
                  placeholder="Leave blank for no budget limit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Total budget in RM (optional)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Failure Risk
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="50"
                  value={wd.constraints!.allowedFailureRisk}
                  onChange={e =>
                    updateNestedField('constraints', 'allowedFailureRisk', parseInt(e.target.value) || 15)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum acceptable risk of missing deadline (%) - typically 10-15%
                </p>
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
          {currentSubFunctionIndex === subFunctions.length - 1
            ? 'Continue to Review'
            : 'Next Sub-Function'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
