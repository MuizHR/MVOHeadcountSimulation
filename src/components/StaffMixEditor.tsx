import React, { useState, useEffect } from 'react';
import { Info, Plus, Trash2, AlertCircle } from 'lucide-react';
import { StaffType, StaffMixItem, calculateStaffMixMetrics } from '../types/staffType';
import { fetchAllStaffTypes, getUniquePlanningGroups } from '../services/staffTypeService';

interface StaffMixEditorProps {
  totalFteRequired: number;
  staffMix: StaffMixItem[];
  onChange: (staffMix: StaffMixItem[]) => void;
  title?: string;
}

export function StaffMixEditor({ totalFteRequired, staffMix, onChange, title = 'Staff Mix' }: StaffMixEditorProps) {
  const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
  const [planningGroups, setPlanningGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffTypes();
  }, []);

  const loadStaffTypes = async () => {
    try {
      const types = await fetchAllStaffTypes();
      setStaffTypes(types);
      setPlanningGroups(getUniquePlanningGroups(types));
    } catch (error) {
      console.error('Error loading staff types:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = calculateStaffMixMetrics(staffMix, totalFteRequired, staffTypes);

  const addRow = () => {
    const firstStaffType = staffTypes[0];
    if (!firstStaffType) return;

    onChange([
      ...staffMix,
      {
        staffTypeId: firstStaffType.id,
        percentage: 0,
      },
    ]);
  };

  const removeRow = (index: number) => {
    const newMix = staffMix.filter((_, i) => i !== index);
    onChange(newMix);
  };

  const updateRow = (index: number, field: 'staffTypeId' | 'percentage', value: string | number) => {
    const newMix = [...staffMix];
    if (field === 'staffTypeId') {
      newMix[index].staffTypeId = value as string;
    } else if (field === 'percentage') {
      newMix[index].percentage = typeof value === 'number' ? value : parseFloat(value) || 0;
    }
    onChange(newMix);
  };

  const getStaffTypeInfo = (staffTypeId: string) => {
    return staffTypes.find(st => st.id === staffTypeId);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600">Loading staff types...</div>
      </div>
    );
  }

  const percentageValid = Math.abs(metrics.totalPercentage - 100) < 0.01;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={addRow}
          className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900">
            <p className="font-medium mb-1">Understanding % of Work</p>
            <p>
              Use % of Work to show how the total workload is split across staff types and JLG bands.
              <strong> Example:</strong> If total FTE required is 1.0 and you set Executive / Officer at 40%,
              Clerical / Admin at 30% and General Worker / Operator at 30%, it means:
            </p>
            <ul className="list-disc ml-4 mt-1">
              <li>40% of the work is done by Executive / Officer (0.4 FTE – Executive band)</li>
              <li>30% by Clerical / Admin (0.3 FTE – Non-Executive band)</li>
              <li>30% by General Worker / Operator (0.3 FTE – Non-Executive band)</li>
            </ul>
            <p className="mt-1 font-medium">The total must always equal 100%.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-3 px-2 font-semibold text-gray-900">Staff Type</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-900">Level</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-900">% of Work</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-900">FTE Share</th>
              <th className="text-right py-3 px-2 font-semibold text-gray-900">Monthly Cost (RM)</th>
              <th className="text-center py-3 px-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {staffMix.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No staff mix defined. Click "Add Row" to start.
                </td>
              </tr>
            ) : (
              staffMix.map((item, index) => {
                const staffType = getStaffTypeInfo(item.staffTypeId);
                const enrichedItem = metrics.items[index];

                return (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <select
                        value={item.staffTypeId}
                        onChange={(e) => updateRow(index, 'staffTypeId', e.target.value)}
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
                        value={item.percentage}
                        onChange={(e) => updateRow(index, 'percentage', e.target.value)}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 text-right text-sm"
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
                        onClick={() => removeRow(index)}
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
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
              <td className="py-3 px-2 text-gray-900">Total</td>
              <td className="py-3 px-2"></td>
              <td className="py-3 px-2 text-right text-gray-900">
                <span className={percentageValid ? 'text-green-700' : 'text-red-700'}>
                  {metrics.totalPercentage.toFixed(1)}%
                </span>
              </td>
              <td className="py-3 px-2 text-right text-gray-900">
                {metrics.totalFte.toFixed(2)}
              </td>
              <td className="py-3 px-2 text-right text-gray-900">
                RM {metrics.totalMonthlyCost.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="py-3 px-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!percentageValid && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">
              <strong>Warning:</strong> Total percentage must equal 100%.
              Current total: {metrics.totalPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-600 mb-1">Total FTE Required</div>
          <div className="text-2xl font-bold text-gray-900">{totalFteRequired.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-600 mb-1">Allocated FTE</div>
          <div className="text-2xl font-bold text-teal-700">{metrics.totalFte.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-600 mb-1">Total Monthly Cost</div>
          <div className="text-2xl font-bold text-teal-700">
            RM {Math.round(metrics.totalMonthlyCost).toLocaleString('en-MY')}
          </div>
        </div>
      </div>
    </div>
  );
}
