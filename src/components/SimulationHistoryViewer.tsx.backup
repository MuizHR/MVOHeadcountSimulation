import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Briefcase, Lock, Info, Check, Sparkles } from 'lucide-react';
import { SimulationHistory } from '../types/simulationHistory';
import { simulationHistoryService } from '../services/simulationHistoryService';
import { useAuth } from '../contexts/AuthContext';
import { planningTypeConfig, sizeOfOperationConfig, PlanningTypeKey, SizeOfOperationKey } from '../types/planningConfig';

interface SimulationHistoryViewerProps {
  simulationId: string;
  onBack: () => void;
}

const ReadOnlyBadge = () => (
  <div className="inline-flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-sm">
    <Lock className="w-5 h-5" />
    <span className="font-semibold text-sm">Read-Only View</span>
  </div>
);

const FUNCTION_OPTIONS: { value: string; label: string }[] = [
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

export function SimulationHistoryViewer({ simulationId, onBack }: SimulationHistoryViewerProps) {
  const { isAdmin } = useAuth();
  const [simulation, setSimulation] = useState<SimulationHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    loadSimulation();
  }, [simulationId]);

  const loadSimulation = async () => {
    setLoading(true);
    try {
      const data = await simulationHistoryService.getSimulationById(simulationId);
      setSimulation(data);
    } catch (error) {
      console.error('Error loading simulation:', error);
      alert('Failed to load simulation');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return null;
  }

  const inputPayload = simulation.input_payload || {};
  const resultPayload = simulation.result_payload || {};

  const simulationInputs = inputPayload.simulationInputs || {};
  const subFunctions = inputPayload.subFunctions || [];
  const synchronizedResults = resultPayload.synchronizedResults || [];

  const getFunctionDisplayName = (): string => {
    if (simulationInputs.isCustomFunction && simulationInputs.customFunctionName) {
      return simulationInputs.customFunctionName;
    }
    return FUNCTION_OPTIONS.find(f => f.value === simulationInputs.functionType)?.label ||
           simulationInputs.functionType?.replace(/_/g, ' ') || 'Not specified';
  };

  const tabs = [
    { id: 0, label: 'Context' },
    { id: 1, label: 'Setup' },
    { id: 2, label: 'Workload' },
    { id: 3, label: 'Model' },
    { id: 4, label: 'Review' },
    { id: 5, label: 'Results' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Simulations
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {simulation.simulation_name}
              </h1>
              <p className="text-gray-600">Viewing saved simulation (Read-Only)</p>
            </div>
            {isAdmin() && simulation.created_by_email && (
              <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Created by: {simulation.created_by_email}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(simulation.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            {simulation.business_area && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{simulation.business_area}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-cyan-600 text-cyan-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 0 && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Planning Context</h2>
                    <p className="text-gray-600 mt-1">
                      Define the scope and purpose of your workforce planning
                    </p>
                  </div>
                  <ReadOnlyBadge />
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Simulation Name *
                    </label>
                    <input
                      type="text"
                      value={simulation.simulation_name}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(planningTypeConfig).map((key) => {
                        const config = planningTypeConfig[key as PlanningTypeKey];
                        const isSelected = simulation.planning_type === key;
                        return (
                          <div
                            key={key}
                            className={`
                              p-4 rounded-lg border-2 cursor-not-allowed
                              ${
                                isSelected
                                  ? 'border-teal-600 bg-teal-50'
                                  : 'border-gray-200 bg-gray-50 opacity-60'
                              }
                            `}
                          >
                            <div className="font-semibold text-gray-900 mb-1">
                              {config.label}
                            </div>
                            <div className="text-sm text-gray-600">{config.description}</div>
                          </div>
                        );
                      })}
                    </div>

                    {simulation.planning_type && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex gap-2">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-blue-900 mb-1">
                              {planningTypeConfig[simulation.planning_type as PlanningTypeKey]?.label}
                            </div>
                            <div className="text-sm text-blue-800">
                              {planningTypeConfig[simulation.planning_type as PlanningTypeKey]?.description}
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
                    </div>
                    <div className="flex items-start gap-2 mb-4">
                      <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        How big is the operation you want to run? This helps the system suggest the most suitable team size for your planning.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.keys(sizeOfOperationConfig).map((key) => {
                        const config = sizeOfOperationConfig[key as SizeOfOperationKey];
                        const isSelected = simulation.size_of_operation === key;
                        return (
                          <div
                            key={key}
                            className={`
                              p-4 rounded-lg border-2 cursor-not-allowed relative
                              ${
                                isSelected
                                  ? 'border-teal-600 bg-teal-50'
                                  : 'border-gray-200 bg-gray-50 opacity-60'
                              }
                            `}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900">
                                    {config.label}
                                  </span>
                                  {config.subtitle && (
                                    <span className="text-sm text-gray-600">
                                      {config.subtitle}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 italic">
                                  {config.description}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="ml-3">
                                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Context & Objectives
                      <span className="text-gray-500 font-normal ml-2">(Optional)</span>
                    </label>
                    <textarea
                      value={simulationInputs.contextNotes || ''}
                      disabled
                      placeholder="Describe the business context, drivers, and expected outcomes..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed resize-none"
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
            )}

            {activeTab === 1 && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Function & Sub-Function Setup
                      {simulationInputs.isCustomFunction && (
                        <span className="ml-2 text-sm font-normal text-teal-600">(Custom)</span>
                      )}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Define what functions you're planning for
                    </p>
                  </div>
                  <ReadOnlyBadge />
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Main Function *
                    </label>
                    <input
                      type="text"
                      value={getFunctionDisplayName() + (simulationInputs.isCustomFunction ? ' (Custom)' : '')}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                    />
                  </div>

                  <div className="border-t pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Sub-Functions
                    </h3>

                    {subFunctions && Array.isArray(subFunctions) && subFunctions.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900">
                            Your Sub-Functions ({subFunctions.length})
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {subFunctions.map((sf: any, index: number) => (
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
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    ✓ Configured
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-blue-800">
                            You'll configure workload and operating model for each sub-function in the next steps
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <p className="text-gray-500">No sub-functions configured</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Workload & Risk Inputs</h2>
                    <p className="text-gray-600 mt-1">
                      Provide min-typical-max ranges for Monte Carlo simulation
                    </p>
                  </div>
                  <ReadOnlyBadge />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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

                {subFunctions && Array.isArray(subFunctions) && subFunctions.length > 0 ? (
                  <div className="space-y-6">
                    {subFunctions.map((sf: any, index: number) => {
                      const wd = sf.workloadDrivers || {};
                      return (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                          <div className="bg-teal-600 text-white px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm opacity-90">
                                  Sub-Function {index + 1} of {subFunctions.length}
                                </div>
                                <div className="text-xl font-bold mt-1">{sf.name}</div>
                              </div>
                              <div className="flex gap-2">
                                {subFunctions.map((_: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full ${
                                      idx === index ? 'bg-white' : 'bg-teal-400'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="p-6 space-y-8">
                            {sf.workTypeId && (
                              <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Type Selection</h3>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Select Work Type
                                    </label>
                                    <input
                                      type="text"
                                      value={sf.workTypeId}
                                      disabled
                                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 cursor-not-allowed"
                                    />
                                  </div>

                                  {sf.workTypeCoefficients && (
                                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                      <h4 className="text-sm font-semibold text-teal-900 mb-3">
                                        Work Type Coefficients (Auto-loaded)
                                      </h4>
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                          <span className="text-teal-700">Productivity Rate:</span>
                                          <span className="ml-2 font-medium text-teal-900">
                                            {sf.workTypeCoefficients.productivityRate?.toFixed(2) || 'N/A'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-teal-700">Complexity Factor:</span>
                                          <span className="ml-2 font-medium text-teal-900">
                                            {sf.workTypeCoefficients.complexityFactor?.toFixed(2) || 'N/A'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-teal-700">Variance Level:</span>
                                          <span className="ml-2 font-medium text-teal-900">
                                            {sf.workTypeCoefficients.varianceLevel?.toFixed(2) || 'N/A'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-teal-700">Min Headcount:</span>
                                          <span className="ml-2 font-medium text-teal-900">
                                            {sf.workTypeCoefficients.minHeadcountRule || 'N/A'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-teal-700">Risk Multiplier:</span>
                                          <span className="ml-2 font-medium text-teal-900">
                                            {sf.workTypeCoefficients.riskMultiplier?.toFixed(2) || 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {wd.totalWorkUnits && (
                              <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workload & Productivity</h3>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Total Work Units / Tasks
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Min</label>
                                        <input
                                          type="number"
                                          value={wd.totalWorkUnits.min || 0}
                                          disabled
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Typical</label>
                                        <input
                                          type="number"
                                          value={wd.totalWorkUnits.typical || 0}
                                          disabled
                                          className="w-full px-3 py-2 border border-teal-400 border-2 rounded-lg bg-gray-50 font-semibold cursor-not-allowed"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">Max</label>
                                        <input
                                          type="number"
                                          value={wd.totalWorkUnits.max || 0}
                                          disabled
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2 mt-2">
                                      <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                      <p className="text-xs text-gray-500">
                                        Total amount of work to be completed (e.g., transactions, tickets, projects)
                                      </p>
                                    </div>
                                  </div>

                                  {wd.productivityUnitsPerPersonPerDay && (
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Productivity (units per person per day)
                                      </label>
                                      <div className="grid grid-cols-3 gap-3">
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">Min</label>
                                          <div className="relative">
                                            <input
                                              type="number"
                                              value={wd.productivityUnitsPerPersonPerDay.min || 0}
                                              disabled
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed pr-12"
                                            />
                                            <span className="absolute right-3 top-2 text-gray-500 text-sm">units</span>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">Typical</label>
                                          <div className="relative">
                                            <input
                                              type="number"
                                              value={wd.productivityUnitsPerPersonPerDay.typical || 0}
                                              disabled
                                              className="w-full px-3 py-2 border border-teal-400 border-2 rounded-lg bg-gray-50 font-semibold cursor-not-allowed pr-12"
                                            />
                                            <span className="absolute right-3 top-2 text-gray-500 text-sm">units</span>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="block text-xs text-gray-600 mb-1">Max</label>
                                          <div className="relative">
                                            <input
                                              type="number"
                                              value={wd.productivityUnitsPerPersonPerDay.max || 0}
                                              disabled
                                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed pr-12"
                                            />
                                            <span className="absolute right-3 top-2 text-gray-500 text-sm">units</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 mt-2">
                                        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-gray-500">
                                          How many work units one person can complete in one day
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">No workload data available</p>
                )}
              </div>
            )}

            {activeTab === 3 && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Operating Model</h2>
                    <p className="text-gray-600 mt-1">
                      Define how work is structured and delivered
                    </p>
                  </div>
                  <ReadOnlyBadge />
                </div>

                {subFunctions && Array.isArray(subFunctions) && subFunctions.length > 0 ? (
                  <div className="space-y-6">
                    {subFunctions.map((sf: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-teal-600 text-white px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm opacity-90">
                                Sub-Function {index + 1} of {subFunctions.length}
                              </div>
                              <div className="text-xl font-bold mt-1">{sf.name}</div>
                            </div>
                            <div className="flex gap-2">
                              {subFunctions.map((_: any, idx: number) => (
                                <div
                                  key={idx}
                                  className={`w-2 h-2 rounded-full ${
                                    idx === index ? 'bg-white' : 'bg-teal-400'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-6 space-y-8">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Organizational Structure *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[
                                { value: 'centralized', label: 'Centralized', desc: 'Single team serves all' },
                                { value: 'decentralized', label: 'Decentralized', desc: 'Teams at each location' },
                                { value: 'hybrid', label: 'Hybrid', desc: 'Mix of both approaches' },
                              ].map(option => (
                                <div
                                  key={option.value}
                                  className={`
                                    p-4 rounded-lg border-2 cursor-not-allowed
                                    ${
                                      sf.operatingModel?.structure === option.value
                                        ? 'border-teal-600 bg-teal-50'
                                        : 'border-gray-300 bg-gray-50 opacity-60'
                                    }
                                  `}
                                >
                                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                                  <div className="text-sm text-gray-600">{option.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Delivery Model *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[
                                { value: 'in_house', label: 'In-House', desc: 'All internal resources' },
                                { value: 'outsourced', label: 'Outsourced', desc: '3rd party vendor' },
                                { value: 'hybrid', label: 'Hybrid', desc: 'Mix of both models' },
                              ].map(option => (
                                <div
                                  key={option.value}
                                  className={`
                                    p-4 rounded-lg border-2 cursor-not-allowed
                                    ${
                                      sf.operatingModel?.delivery === option.value
                                        ? 'border-teal-600 bg-teal-50'
                                        : 'border-gray-300 bg-gray-50 opacity-60'
                                    }
                                  `}
                                >
                                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                                  <div className="text-sm text-gray-600">{option.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Automation Level *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[
                                { value: 'manual', label: 'Manual', desc: 'Paper-based, manual tasks' },
                                { value: 'partially_automated', label: 'Partially Automated', desc: 'Some digital tools, mixed' },
                                { value: 'highly_automated', label: 'Highly Automated', desc: 'End-to-end automation' },
                              ].map(option => (
                                <div
                                  key={option.value}
                                  className={`
                                    p-4 rounded-lg border-2 cursor-not-allowed
                                    ${
                                      sf.operatingModel?.automationLevel === option.value
                                        ? 'border-teal-600 bg-teal-50'
                                        : 'border-gray-300 bg-gray-50 opacity-60'
                                    }
                                  `}
                                >
                                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                                  <div className="text-sm text-gray-600">{option.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Operating Hours / Coverage *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {[
                                { value: 'office_hours', label: 'Office Hours', desc: '8am - 5pm weekdays' },
                                { value: 'extended_hours', label: 'Extended Hours', desc: '7am - 10pm + weekends' },
                                { value: 'twenty_four_seven', label: '24/7', desc: 'Round-the-clock shifts' },
                              ].map(option => (
                                <div
                                  key={option.value}
                                  className={`
                                    p-4 rounded-lg border-2 cursor-not-allowed
                                    ${
                                      sf.operatingModel?.coverage === option.value
                                        ? 'border-teal-600 bg-teal-50'
                                        : 'border-gray-300 bg-gray-50 opacity-60'
                                    }
                                  `}
                                >
                                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                                  <div className="text-sm text-gray-600">{option.desc}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No operating model data available</p>
                )}
              </div>
            )}

            {activeTab === 4 && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Review & Calculate</h2>
                    <p className="text-gray-600 mt-1">
                      Review your inputs and run the calculation
                    </p>
                  </div>
                  <ReadOnlyBadge />
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Planning Summary</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Simulation Name:</span>
                        <span className="font-medium text-gray-900">{simulation.simulation_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Planning Type:</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {planningTypeConfig[simulation.planning_type as PlanningTypeKey]?.label || simulation.planning_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Function:</span>
                        <span className="font-medium text-gray-900">
                          {getFunctionDisplayName()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Operation Size:</span>
                        <span className="font-medium text-teal-700 capitalize">
                          {sizeOfOperationConfig[simulation.size_of_operation as SizeOfOperationKey]?.label || simulation.size_of_operation.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Sub-Functions Overview ({subFunctions.length})
                    </h3>
                    <div className="space-y-3">
                      {subFunctions.map((sf: any, index: number) => (
                        <div key={sf.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{index + 1}.</span>
                            <span className="font-medium text-gray-900">{sf.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-gray-600">Fully configured</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-teal-900 mb-2">
                          Ready to Calculate MVO
                        </h4>
                        <p className="text-sm text-teal-800 mb-4">
                          The system will:
                        </p>
                        <ul className="text-sm text-teal-800 mb-4 space-y-1 list-disc list-inside">
                          <li>
                            <strong>Calculate Baseline Headcount:</strong> Using standard formula (Total Workload ÷ Productivity × Days)
                          </li>
                          <li>
                            <strong>Run Monte Carlo Simulation:</strong> Test headcounts from Baseline-2 to Baseline+5 with 5,000 iterations each
                          </li>
                          <li>
                            <strong>Identify MVO:</strong> Auto-select minimum headcount meeting your risk threshold
                          </li>
                          <li>
                            <strong>Generate AI Explanation:</strong> Professional rationale for management approval
                          </li>
                        </ul>
                        <p className="text-sm text-teal-800">
                          Results show Baseline (no-risk) vs Recommended MVO (Monte Carlo) with full
                          risk analysis, cost projections, and strategic recommendations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Simulation Results</h2>
                  <ReadOnlyBadge />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200 shadow-sm">
                    <div className="text-sm text-cyan-700 mb-1 font-medium">Total FTE</div>
                    <div className="text-3xl font-bold text-cyan-900">{simulation.total_fte || 0}</div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                    <div className="text-sm text-blue-700 mb-1 font-medium">Monthly Cost</div>
                    <div className="text-3xl font-bold text-blue-900">
                      MYR {(simulation.total_monthly_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-700 mb-1 font-medium">Workload Score</div>
                    <div className="text-3xl font-bold text-gray-900">{simulation.workload_score || 0}</div>
                  </div>
                </div>

                {subFunctions && subFunctions.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Sub-Functions Breakdown</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {subFunctions.map((sf: any, index: number) => {
                          const sfResult = synchronizedResults.find((r: any) => r.subFunctionId === sf.id);
                          const mvo = sfResult?.result?.mvo;

                          return (
                            <div key={index} className="border border-gray-200 rounded-lg p-5 bg-gray-50 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">{sf.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Work Type: <span className="font-medium">{sf.workTypeId || 'N/A'}</span>
                                  </p>
                                </div>
                                {mvo?.recommendedHeadcount && (
                                  <div className="text-right bg-white px-4 py-2 rounded-lg border border-cyan-200">
                                    <div className="text-xs text-gray-600 mb-1">Recommended FTE</div>
                                    <div className="text-2xl font-bold text-cyan-700">{mvo.recommendedHeadcount}</div>
                                  </div>
                                )}
                              </div>

                              {mvo && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                                  <div>
                                    <div className="text-xs text-gray-600 mb-1">Avg Duration</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {mvo.avgDurationDays ? `${Math.round(mvo.avgDurationDays)} days` : 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-600 mb-1">Success Rate</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {mvo.successRatePct ? `${Math.round(mvo.successRatePct)}%` : 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-600 mb-1">Monthly Cost</div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      MYR {mvo.avgMonthlyCostRm ? Math.round(mvo.avgMonthlyCostRm).toLocaleString() : 'N/A'}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-gray-600 mb-1">Risk Level</div>
                                    <div className="text-sm font-semibold text-gray-900 capitalize">
                                      {mvo.riskCategory || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {resultPayload.mvoComposition && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">System-Suggested Role Composition</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {resultPayload.mvoComposition.map((role: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                              <div className="font-semibold text-gray-900">{role.roleName}</div>
                              <div className="text-sm text-gray-600">
                                {role.minSalary && role.maxSalary ? (
                                  <>MYR {role.minSalary.toLocaleString()} - {role.maxSalary.toLocaleString()}</>
                                ) : (
                                  'Salary range not available'
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-cyan-700">{role.count}</div>
                              <div className="text-xs text-gray-600">positions</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
