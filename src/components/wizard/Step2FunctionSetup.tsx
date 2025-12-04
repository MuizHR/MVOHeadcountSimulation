import React, { useState } from 'react';
import { Plus, Trash2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { FunctionType } from '../../types/simulation';
import { createEmptySubFunction } from '../../types/subfunction';
import { getTemplatesForFunction } from '../../data/subfunctionTemplates';
import { WizardNavigation } from './WizardNavigation';

const FUNCTION_OPTIONS: { value: FunctionType; label: string }[] = [
  { value: 'cleaning_housekeeping', label: 'Cleaning & Housekeeping' },
  { value: 'corporate_communication', label: 'Corporate Communication' },
  { value: 'customer_stakeholder_management', label: 'Customer & Stakeholder Management' },
  { value: 'finance_accounting', label: 'Finance & Accounting' },
  { value: 'governance_risk_compliance', label: 'Governance, Risk & Compliance (GRC)' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'it', label: 'Information Technology' },
  { value: 'legal_company_secretarial', label: 'Legal & Company Secretarial' },
  { value: 'maintenance_engineering', label: 'Maintenance & Engineering' },
  { value: 'operations_service_delivery', label: 'Operations & Service Delivery' },
  { value: 'procurement_vendor_management', label: 'Procurement & Vendor Management' },
  { value: 'project_development_management', label: 'Project & Development Management' },
  { value: 'property_facilities_management', label: 'Property & Facilities Management' },
  { value: 'property_investment', label: 'Property Investment' },
  { value: 'sales_leasing_tenancy', label: 'Sales, Leasing & Tenancy' },
  { value: 'security_safety', label: 'Security & Safety' },
];

export function Step2FunctionSetup() {
  const { state, updateSimulationInputs, addSubFunction, removeSubFunction, previousStep, nextStep } = useWizard();
  const { simulationInputs, subFunctions } = state;

  const [expandedSubFunction, setExpandedSubFunction] = useState<string | null>(null);
  const [customSubFunctionName, setCustomSubFunctionName] = useState('');
  const [showCustomFunctionInput, setShowCustomFunctionInput] = useState(false);
  const [customFunctionName, setCustomFunctionName] = useState('');
  const [customFunctionError, setCustomFunctionError] = useState('');

  const templates = getTemplatesForFunction(simulationInputs.functionType);
  const canContinue = subFunctions.length > 0;
  const isCustomFunction = simulationInputs.isCustomFunction || false;
  const displayFunctionName = isCustomFunction && simulationInputs.customFunctionName
    ? simulationInputs.customFunctionName
    : FUNCTION_OPTIONS.find(f => f.value === simulationInputs.functionType)?.label || '';

  const handleAddTemplate = (name: string) => {
    const newSubFunction = createEmptySubFunction(name);
    addSubFunction(newSubFunction);
  };

  const handleAddCustom = () => {
    if (customSubFunctionName.trim()) {
      const newSubFunction = createEmptySubFunction(customSubFunctionName.trim());
      addSubFunction(newSubFunction);
      setCustomSubFunctionName('');
    }
  };

  const handleMainFunctionChange = (value: string) => {
    if (value === '__custom__') {
      setShowCustomFunctionInput(true);
      setCustomFunctionName('');
      setCustomFunctionError('');
    } else {
      updateSimulationInputs({
        functionType: value as FunctionType,
        isCustomFunction: false,
        customFunctionName: undefined,
      });
      setShowCustomFunctionInput(false);
    }
  };

  const validateCustomFunctionName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Function name is required';
    }
    if (name.length > 100) {
      return 'Function name must be 100 characters or less';
    }
    const existsInPreset = FUNCTION_OPTIONS.some(
      opt => opt.label.toLowerCase() === name.trim().toLowerCase()
    );
    if (existsInPreset) {
      return 'This function already exists in presets. Please select it from the dropdown.';
    }
    return null;
  };

  const handleSaveCustomFunction = () => {
    const error = validateCustomFunctionName(customFunctionName);
    if (error) {
      setCustomFunctionError(error);
      return;
    }

    updateSimulationInputs({
      functionType: 'hr',
      isCustomFunction: true,
      customFunctionName: customFunctionName.trim(),
    });
    setShowCustomFunctionInput(false);
    setCustomFunctionError('');
  };

  const handleCancelCustomFunction = () => {
    setShowCustomFunctionInput(false);
    setCustomFunctionName('');
    setCustomFunctionError('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fully_configured':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            ✓ Configured
          </span>
        );
      case 'partially_configured':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            ⚠ Partial
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            Not configured
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Function & Sub-Function Setup
          {isCustomFunction && (
            <span className="ml-2 text-sm font-normal text-teal-600">(Custom)</span>
          )}
        </h2>
        <p className="text-gray-600 mb-8">
          Define what functions you're planning for
        </p>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main Function *
            </label>
            {!showCustomFunctionInput ? (
              <>
                <select
                  value={isCustomFunction ? '__custom_selected__' : simulationInputs.functionType}
                  onChange={e => handleMainFunctionChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {isCustomFunction && (
                    <option value="__custom_selected__">
                      {displayFunctionName} (Custom)
                    </option>
                  )}
                  {FUNCTION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  <option value="__custom__">+ Add Custom Function...</option>
                </select>
              </>
            ) : (
              <div className="border border-teal-300 rounded-lg p-4 bg-teal-50">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Custom Function Name
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customFunctionName}
                      onChange={e => {
                        setCustomFunctionName(e.target.value);
                        setCustomFunctionError('');
                      }}
                      onKeyPress={e => e.key === 'Enter' && handleSaveCustomFunction()}
                      placeholder="Enter function name (e.g., Marketing & Communications)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      maxLength={100}
                      autoFocus
                    />
                    {customFunctionError && (
                      <p className="mt-1 text-sm text-red-600">{customFunctionError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSaveCustomFunction}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelCustomFunction}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sub-Functions
            </h3>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-2 mb-4">
                <div className="text-2xl">🎯</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-teal-900 mb-2">
                    Quick Add from Templates
                  </h4>
                  {!isCustomFunction ? (
                    <p className="text-sm text-teal-800 mb-4">
                      Common {displayFunctionName} sub-functions:
                    </p>
                  ) : (
                    <p className="text-sm text-teal-800 mb-4">
                      No default templates for custom functions. Add your own sub-functions below.
                    </p>
                  )}
                </div>
              </div>

              {!isCustomFunction && templates.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {templates.map(template => {
                    const alreadyAdded = subFunctions.some(
                      sf => sf.name.toLowerCase() === template.toLowerCase()
                    );
                    return (
                      <button
                        key={template}
                        onClick={() => handleAddTemplate(template)}
                        disabled={alreadyAdded}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${
                            alreadyAdded
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-white text-teal-700 border border-teal-300 hover:bg-teal-100'
                          }
                        `}
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        {template}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className={!isCustomFunction && templates.length > 0 ? 'border-t border-teal-200 pt-4' : ''}>
                <p className="text-sm text-teal-800 mb-3">
                  {!isCustomFunction && templates.length > 0 ? 'or add a' : 'Add a'} custom sub-function:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSubFunctionName}
                    onChange={e => setCustomSubFunctionName(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleAddCustom()}
                    placeholder="Enter custom sub-function name"
                    className="flex-1 px-4 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddCustom}
                    disabled={!customSubFunctionName.trim()}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  Your Sub-Functions ({subFunctions.length})
                </h4>
              </div>

              {subFunctions.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <p className="text-gray-500 mb-2">No sub-functions added yet</p>
                  <p className="text-sm text-gray-400">
                    Click a template above to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subFunctions.map((sf, index) => (
                    <div
                      key={sf.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-medium text-gray-500">
                            {index + 1}.
                          </span>
                          <span className="font-medium text-gray-900">
                            {sf.name}
                          </span>
                          {getStatusBadge(sf.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setExpandedSubFunction(
                                expandedSubFunction === sf.id ? null : sf.id
                              )
                            }
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          >
                            {expandedSubFunction === sf.id ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => removeSubFunction(sf.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {expandedSubFunction === sf.id && (
                        <div className="p-4 border-t border-gray-200 bg-white">
                          <p className="text-sm text-gray-600">
                            You'll configure workload and operating model for this sub-function in the next steps.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {subFunctions.length > 0 && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    You'll configure workload and operating model for each sub-function in the next steps
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <WizardNavigation
        onBack={previousStep}
        onNext={nextStep}
        canGoBack={true}
        canGoNext={true}
        isNextDisabled={!canContinue}
      />
    </div>
  );
}
