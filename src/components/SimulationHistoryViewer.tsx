import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Briefcase } from 'lucide-react';
import { SimulationHistory } from '../types/simulationHistory';
import { simulationHistoryService } from '../services/simulationHistoryService';
import { useAuth } from '../contexts/AuthContext';
import { planningTypeConfig, sizeOfOperationConfig } from '../types/planningConfig';

interface SimulationHistoryViewerProps {
  simulationId: string;
  onBack: () => void;
}

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
  const simulationResult = resultPayload.simulationResult || null;
  const synchronizedResults = resultPayload.synchronizedResults || [];

  const getPlanningTypeLabel = (key: string): string => {
    const config = planningTypeConfig[key as keyof typeof planningTypeConfig];
    return config?.label || key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const getSizeOfOperationLabel = (key: string): string => {
    const config = sizeOfOperationConfig[key as keyof typeof sizeOfOperationConfig];
    return config?.label || key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const tabs = [
    { id: 0, label: 'Context', key: 'planning_context' },
    { id: 1, label: 'Setup', key: 'function_setup' },
    { id: 2, label: 'Workload', key: 'workload' },
    { id: 3, label: 'Model', key: 'operating_model' },
    { id: 4, label: 'Review', key: 'review' },
    { id: 5, label: 'Results', key: 'results' }
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
            {isAdmin() && (simulation.user_name || simulation.user_email) && (
              <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Created by: {simulation.user_name || simulation.user_email}</span>
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
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Planning Context</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Planning Type</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {simulation.planning_type ? getPlanningTypeLabel(simulation.planning_type) : 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size of Operation</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {simulation.size_of_operation ? getSizeOfOperationLabel(simulation.size_of_operation) : 'Not specified'}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Area</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                      {simulation.business_area || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Function Setup</h2>
                {subFunctions && Array.isArray(subFunctions) && subFunctions.length > 0 ? (
                  <div className="space-y-4">
                    {subFunctions.map((sf: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{sf.name}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Work Type:</span>{' '}
                            <span className="font-medium text-gray-900">{sf.workType || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Complexity:</span>{' '}
                            <span className="font-medium text-gray-900 capitalize">{sf.complexity || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No sub-functions configured</p>
                )}
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Workload Drivers</h2>
                {subFunctions && Array.isArray(subFunctions) && subFunctions.length > 0 ? (
                  <div className="space-y-4">
                    {subFunctions.map((sf: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{sf.name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <label className="block text-gray-600 mb-1">Volume</label>
                            <div className="font-medium text-gray-900">{sf.volume || 'Not set'}</div>
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">Complexity</label>
                            <div className="font-medium text-gray-900 capitalize">{sf.complexity || 'Not set'}</div>
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">Workload Band</label>
                            <div className="font-medium text-gray-900">{sf.workloadBand || 'Not set'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No workload data available</p>
                )}
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Operating Model</h2>
                {subFunctions && Array.isArray(subFunctions) && subFunctions.length > 0 ? (
                  <div className="space-y-4">
                    {subFunctions.map((sf: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{sf.name}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="block text-gray-600 mb-1">Structure</label>
                            <div className="font-medium text-gray-900">{sf.structure || 'Not set'}</div>
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">Delivery Model</label>
                            <div className="font-medium text-gray-900">{sf.deliveryModel || 'Not set'}</div>
                          </div>
                          <div>
                            <label className="block text-gray-600 mb-1">Automation Level</label>
                            <div className="font-medium text-gray-900">{sf.automationLevel || 'Not set'}</div>
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
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Summary</h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">Summary Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-sm text-gray-600 mb-1">Total FTE</div>
                      <div className="text-2xl font-bold text-gray-900">{simulation.total_fte || 'N/A'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-sm text-gray-600 mb-1">Monthly Cost</div>
                      <div className="text-2xl font-bold text-gray-900">
                        MYR {(simulation.total_monthly_cost || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <div className="text-sm text-gray-600 mb-1">Workload Score</div>
                      <div className="text-2xl font-bold text-gray-900">{simulation.workload_score || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 5 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Simulation Results</h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-yellow-800 font-medium">
                      Read-Only View
                    </p>
                  </div>
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
                                    Work Type: <span className="font-medium">{sf.workType || 'N/A'}</span> •
                                    Complexity: <span className="font-medium capitalize">{sf.complexity || 'N/A'}</span>
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

                {simulationResult?.mvoComposition && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">System-Suggested Role Composition</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {simulationResult.mvoComposition.map((role: any, index: number) => (
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
