import React from 'react';
import { X, Calendar, Users, DollarSign } from 'lucide-react';

interface SimulationPreviewModalProps {
  simulation: any;
  onClose: () => void;
}

export default function SimulationPreviewModal({ simulation, onClose }: SimulationPreviewModalProps) {
  const selectedScenario = simulation.scenarios?.[simulation.selected_scenario_type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{simulation.simulation_name}</h2>
              <p className="text-sm text-slate-600 mt-1">Simulation Preview</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Created</span>
              </div>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(simulation.created_at).toLocaleDateString()}
              </p>
            </div>

            {selectedScenario && (
              <>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Total FTE</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedScenario.totalFte?.toFixed(2) || 'N/A'}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm font-medium">Total Cost</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">
                    ${selectedScenario.totalCost?.toLocaleString() || 'N/A'}
                  </p>
                </div>
              </>
            )}
          </div>

          {simulation.inputs?.planningContext && (
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Planning Context</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Function Name</p>
                  <p className="font-medium text-slate-900">
                    {simulation.inputs.planningContext.functionName || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Planning Horizon</p>
                  <p className="font-medium text-slate-900">
                    {simulation.inputs.planningContext.planningHorizon || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Headcount Target</p>
                  <p className="font-medium text-slate-900">
                    {simulation.inputs.planningContext.headcountTarget || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Geographic Scope</p>
                  <p className="font-medium text-slate-900">
                    {simulation.inputs.planningContext.geographicScope || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {simulation.inputs?.subFunctions && simulation.inputs.subFunctions.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Sub-Functions</h3>
              <div className="space-y-3">
                {simulation.inputs.subFunctions.map((sf: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-2">{sf.name}</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Workload Driver</p>
                        <p className="font-medium text-slate-900">{sf.workloadDriver || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Current Volume</p>
                        <p className="font-medium text-slate-900">{sf.currentVolume || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Target Volume</p>
                        <p className="font-medium text-slate-900">{sf.targetVolume || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedScenario && selectedScenario.roleBreakdown && selectedScenario.roleBreakdown.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Role Breakdown - {simulation.selected_scenario_type}
              </h3>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Role</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">FTE</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedScenario.roleBreakdown.map((role: any, index: number) => (
                      <tr key={index} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-sm text-slate-900">{role.role}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-right">
                          {role.fte?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-right">
                          ${role.cost?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
