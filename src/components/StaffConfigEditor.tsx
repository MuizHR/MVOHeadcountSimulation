import React, { useState, useEffect } from 'react';
import { Info, Plus, Trash2, AlertCircle } from 'lucide-react';
import { StaffType, RolePatternItem, calculateRolePatternMetrics, calculateSimpleRoleCost, StaffConfiguration } from '../types/staffType';
import { fetchAllStaffTypes } from '../services/staffTypeService';

interface StaffConfigEditorProps {
  totalFteRequired: number;
  configuration: StaffConfiguration;
  onChange: (configuration: StaffConfiguration) => void;
  title?: string;
}

export function StaffConfigEditor({ totalFteRequired, configuration, onChange, title = 'Staff Type & Cost' }: StaffConfigEditorProps) {
  const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffTypes();
  }, []);

  const loadStaffTypes = async () => {
    try {
      const types = await fetchAllStaffTypes();
      setStaffTypes(types);

      if (types.length > 0 && !configuration.simpleRoleId) {
        onChange({
          ...configuration,
          simpleRoleId: types.find(st => st.title === 'Executive')?.id || types[0].id,
        });
      }
    } catch (error) {
      console.error('Error loading staff types:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    const newMode = configuration.mode === 'simple' ? 'advanced' : 'simple';

    if (newMode === 'advanced' && (!configuration.advancedPattern || configuration.advancedPattern.length === 0)) {
      const defaultRole = staffTypes.find(st => st.id === configuration.simpleRoleId) || staffTypes[0];
      onChange({
        mode: newMode,
        simpleRoleId: configuration.simpleRoleId,
        advancedPattern: defaultRole ? [{
          staffTypeId: defaultRole.id,
          pattern: 1,
        }] : [],
      });
    } else {
      onChange({
        ...configuration,
        mode: newMode,
      });
    }
  };

  const updateSimpleRole = (staffTypeId: string) => {
    onChange({
      ...configuration,
      simpleRoleId: staffTypeId,
    });
  };

  const addPatternRow = () => {
    const firstStaffType = staffTypes[0];
    if (!firstStaffType) return;

    const currentPattern = configuration.advancedPattern || [];
    onChange({
      ...configuration,
      advancedPattern: [
        ...currentPattern,
        {
          staffTypeId: firstStaffType.id,
          pattern: 1,
        },
      ],
    });
  };

  const removePatternRow = (index: number) => {
    const currentPattern = configuration.advancedPattern || [];
    onChange({
      ...configuration,
      advancedPattern: currentPattern.filter((_, i) => i !== index),
    });
  };

  const updatePatternRow = (index: number, field: 'staffTypeId' | 'pattern', value: string | number) => {
    const currentPattern = [...(configuration.advancedPattern || [])];
    if (field === 'staffTypeId') {
      currentPattern[index].staffTypeId = value as string;
    } else if (field === 'pattern') {
      currentPattern[index].pattern = typeof value === 'number' ? value : parseInt(value) || 1;
    }
    onChange({
      ...configuration,
      advancedPattern: currentPattern,
    });
  };

  const getStaffTypeInfo = (staffTypeId: string) => {
    return staffTypes.find(st => st.id === staffTypeId);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600">Loading JLG salary bands...</div>
      </div>
    );
  }

  const simpleCost = configuration.simpleRoleId
    ? calculateSimpleRoleCost(configuration.simpleRoleId, totalFteRequired, staffTypes)
    : 0;

  const selectedSimpleRole = configuration.simpleRoleId
    ? getStaffTypeInfo(configuration.simpleRoleId)
    : null;

  const advancedMetrics = configuration.mode === 'advanced' && configuration.advancedPattern
    ? calculateRolePatternMetrics(configuration.advancedPattern, totalFteRequired, staffTypes)
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={configuration.mode === 'advanced'}
            onChange={toggleMode}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <span className="text-sm text-gray-700">Enable role mix (Advanced)</span>
        </label>
      </div>

      {configuration.mode === 'simple' ? (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Which role is usually assigned to this work?
            </label>
            <select
              value={configuration.simpleRoleId || ''}
              onChange={(e) => updateSimpleRole(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-base"
            >
              {staffTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.title} – {st.level}
                </option>
              ))}
            </select>
          </div>

          {selectedSimpleRole && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">JLG Salary Band</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Level:</span>
                  <span className="ml-2 font-medium text-gray-900">{selectedSimpleRole.level}</span>
                </div>
                <div>
                  <span className="text-gray-600">Salary Range:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    RM {selectedSimpleRole.min_salary.toLocaleString()} – {selectedSimpleRole.max_salary.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Midpoint:</span>
                  <span className="ml-2 font-medium text-teal-700">
                    RM {selectedSimpleRole.mid_salary.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Employer Cost/FTE:</span>
                  <span className="ml-2 font-medium text-teal-700">
                    RM {(selectedSimpleRole.mid_salary * selectedSimpleRole.cost_multiplier).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-600 mb-1">Total FTE Required</div>
              <div className="text-2xl font-bold text-gray-900">{totalFteRequired.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-600 mb-1">Cost per FTE</div>
              <div className="text-2xl font-bold text-teal-700">
                RM {selectedSimpleRole ? (selectedSimpleRole.mid_salary * selectedSimpleRole.cost_multiplier).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-600 mb-1">Total Monthly Cost</div>
              <div className="text-2xl font-bold text-teal-700">
                RM {Math.round(simpleCost).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900">
                <p className="font-medium mb-1">Understanding Role Patterns</p>
                <p>
                  Use the role pattern to show how this work is usually structured (for example 1 Senior Manager + 2 Managers + 1 Executive + 1 Non-Executive).
                  The simulator will convert this pattern into FTE and cost based on the total FTE required from the MVO calculation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mb-3">
            <button
              onClick={addPatternRow}
              className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Role</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Level</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">Pattern</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-900">FTE Share</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-900">Monthly Cost (RM)</th>
                  <th className="text-center py-3 px-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {(!configuration.advancedPattern || configuration.advancedPattern.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No role pattern defined. Click "Add Role" to start.
                    </td>
                  </tr>
                ) : (
                  configuration.advancedPattern.map((item, index) => {
                    const staffType = getStaffTypeInfo(item.staffTypeId);
                    const enrichedItem = advancedMetrics?.items[index];

                    return (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <select
                            value={item.staffTypeId}
                            onChange={(e) => updatePatternRow(index, 'staffTypeId', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-sm"
                          >
                            {staffTypes.map((st) => (
                              <option key={st.id} value={st.id}>
                                {st.title}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2 text-gray-700">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {staffType?.level || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.pattern}
                            onChange={(e) => updatePatternRow(index, 'pattern', e.target.value)}
                            min="1"
                            step="1"
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-center text-sm"
                          />
                        </td>
                        <td className="py-3 px-2 text-right text-gray-700 font-medium">
                          {enrichedItem?.fteShare?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-700 font-medium">
                          {enrichedItem?.monthlyCost?.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => removePatternRow(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {advancedMetrics && advancedMetrics.items.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                    <td className="py-3 px-2 text-gray-900">Total</td>
                    <td className="py-3 px-2"></td>
                    <td className="py-3 px-2 text-center text-gray-900">
                      {advancedMetrics.totalUnits} units
                    </td>
                    <td className="py-3 px-2 text-right text-gray-900">
                      {advancedMetrics.totalFte.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-900">
                      RM {advancedMetrics.totalMonthlyCost.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {advancedMetrics && Math.abs(advancedMetrics.totalFte - totalFteRequired) > 0.01 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> Total FTE Share ({advancedMetrics.totalFte.toFixed(2)}) matches the required FTE ({totalFteRequired.toFixed(2)}) based on your pattern distribution.
                </p>
              </div>
            </div>
          )}

          {advancedMetrics && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 mb-1">Total FTE Required</div>
                <div className="text-2xl font-bold text-gray-900">{totalFteRequired.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 mb-1">Pattern Units</div>
                <div className="text-2xl font-bold text-teal-700">{advancedMetrics.totalUnits}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-gray-600 mb-1">Total Monthly Cost</div>
                <div className="text-2xl font-bold text-teal-700">
                  RM {Math.round(advancedMetrics.totalMonthlyCost).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
