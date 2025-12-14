import React from 'react';
import { Info, HelpCircle, AlertCircle } from 'lucide-react';
import { RolePatternItem, StaffConfiguration } from '../types/staffType';
import {
  ROLE_OPTIONS,
  computeMonthlyCost,
  findRoleOption,
  getSalaryBandSummary,
  formatMoney
} from '../config/staffCost';
import { SALARY_BANDS } from '../utils/salaryBands';

interface StaffConfigDisplayProps {
  totalFteRequired: number;
  configuration: StaffConfiguration;
  title?: string;
}

export function StaffConfigDisplay({ totalFteRequired, configuration, title = 'Staff Type & Cost' }: StaffConfigDisplayProps) {
  const [tooltipVisible, setTooltipVisible] = React.useState<string | null>(null);

  if (ROLE_OPTIONS.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Salary band configuration is empty</p>
            <p className="text-sm text-yellow-800 mt-1">Please check salaryBands / SALARY_BANDS configuration.</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedSimpleRole = configuration.simpleRoleId
    ? findRoleOption(configuration.simpleRoleId)
    : null;

  const simpleCost = selectedSimpleRole
    ? computeMonthlyCost(selectedSimpleRole.employmentType, selectedSimpleRole.bandKey) * totalFteRequired
    : 0;

  const simpleCostPerFte = selectedSimpleRole
    ? computeMonthlyCost(selectedSimpleRole.employmentType, selectedSimpleRole.bandKey)
    : 0;

  const advancedMetrics = configuration.mode === 'advanced' && configuration.advancedPattern
    ? calculateRolePatternMetricsFromBands(configuration.advancedPattern, totalFteRequired)
    : null;

  function calculateRolePatternMetricsFromBands(
    items: RolePatternItem[],
    totalFteRequired: number
  ) {
    const totalUnits = items.reduce((sum, item) => sum + item.pattern, 0);

    if (totalUnits === 0) {
      return {
        items: [],
        totalUnits: 0,
        totalFte: 0,
        totalMonthlyCost: 0,
      };
    }

    const ftePerUnit = totalFteRequired / totalUnits;

    const enrichedItems = items.map(item => {
      const roleOption = findRoleOption(item.staffTypeId);
      if (!roleOption) return { ...item, fteShare: 0, monthlyCost: 0 };

      const fteShare = item.pattern * ftePerUnit;
      const costPerFte = computeMonthlyCost(roleOption.employmentType, roleOption.bandKey);
      const monthlyCost = fteShare * costPerFte;

      return {
        ...item,
        fteShare,
        monthlyCost,
      };
    });

    const totalFte = enrichedItems.reduce((sum, item) => sum + (item.fteShare || 0), 0);
    const totalMonthlyCost = enrichedItems.reduce((sum, item) => sum + (item.monthlyCost || 0), 0);

    return {
      items: enrichedItems,
      totalUnits,
      totalFte,
      totalMonthlyCost,
    };
  }

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {configuration.mode === 'advanced' ? 'Role mix enabled' : 'Single role'}
          </span>
        </div>
      </div>

      {configuration.mode === 'simple' ? (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned Role
            </label>
            <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-base font-medium text-gray-900">
              {selectedSimpleRole ? `${selectedSimpleRole.label} – ${selectedSimpleRole.level}` : 'Not specified'}
            </div>
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
                    RM {SALARY_BANDS[selectedSimpleRole.employmentType][selectedSimpleRole.bandKey].min.toLocaleString()} – {SALARY_BANDS[selectedSimpleRole.employmentType][selectedSimpleRole.bandKey].max.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Midpoint:</span>
                  <span className="ml-2 font-medium text-teal-700">
                    RM {Math.round((SALARY_BANDS[selectedSimpleRole.employmentType][selectedSimpleRole.bandKey].min + SALARY_BANDS[selectedSimpleRole.employmentType][selectedSimpleRole.bandKey].max) / 2).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Employer Cost/FTE:</span>
                  <span className="ml-2 font-medium text-teal-700">
                    RM {simpleCostPerFte.toLocaleString()}/mo
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-gray-600 mb-1">Total FTE Required</div>
              <div className="text-2xl font-bold text-gray-900">{totalFteRequired.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-gray-600 mb-1">Cost per FTE</div>
              <div className="text-2xl font-bold text-teal-700">
                RM {simpleCostPerFte.toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
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
                  The role pattern shows how this work is structured across different role levels.
                  The simulator converts this pattern into FTE and cost based on the total FTE required.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Role</th>
                  <th className="text-center py-3 px-2 w-8 font-semibold text-gray-900">Info</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Level</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-900">Pattern</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-900">FTE Share</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-900">Monthly Cost (RM)</th>
                </tr>
              </thead>
              <tbody>
                {(!configuration.advancedPattern || configuration.advancedPattern.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No role pattern configured
                    </td>
                  </tr>
                ) : (
                  configuration.advancedPattern.map((item, index) => {
                    const roleOption = findRoleOption(item.staffTypeId);
                    const enrichedItem = advancedMetrics?.items[index];
                    const bandSummary = roleOption ? getSalaryBandSummary(roleOption.employmentType, roleOption.bandKey) : null;
                    const tooltipId = `tooltip-${index}`;

                    return (
                      <tr key={index} className="border-b border-gray-200 bg-gray-50">
                        <td className="py-3 px-2 font-medium text-gray-900">
                          {roleOption?.label || 'Unknown Role'}
                        </td>
                        <td className="py-3 px-2 text-center relative">
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onMouseEnter={() => setTooltipVisible(tooltipId)}
                              onMouseLeave={() => setTooltipVisible(null)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                            {tooltipVisible === tooltipId && bandSummary && (
                              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-72 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 text-xs">
                                <div className="font-semibold mb-2 text-gray-900">Salary Band Details</div>
                                <div className="space-y-1 text-gray-700">
                                  <div className="flex justify-between">
                                    <span>Salary Range:</span>
                                    <span className="font-medium">{formatMoney(bandSummary.min)} – {formatMoney(bandSummary.max)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Fixed Allowance:</span>
                                    <span className="font-medium">{formatMoney(bandSummary.allowance)} / month</span>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t border-gray-200">
                                    <span>Est. Cost / FTE:</span>
                                    <span className="font-bold text-teal-700">{formatMoney(bandSummary.monthlyCost)}</span>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-gray-200 text-slate-600">
                                    <div className="font-medium mb-1">Includes:</div>
                                    <div>• Statutory: {bandSummary.statRate * 100}%</div>
                                    <div>• GPA/GTL: {bandSummary.gpaRate * 100}%</div>
                                    <div>• GHS: {bandSummary.ghsRate * 100}%</div>
                                    <div>• Medical: {formatMoney(bandSummary.medical)}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-700">
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {roleOption?.level || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-medium text-gray-900">
                          {item.pattern}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-700 font-medium">
                          {enrichedItem?.fteShare?.toFixed(2) || '0.00'}
                        </td>
                        <td className="py-3 px-2 text-right text-gray-700 font-medium">
                          {enrichedItem?.monthlyCost?.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {advancedMetrics && advancedMetrics.items.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-gray-300 bg-gray-100 font-semibold">
                    <td className="py-3 px-2 text-gray-900">Total</td>
                    <td className="py-3 px-2"></td>
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
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {advancedMetrics && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-gray-600 mb-1">Total FTE Required</div>
                <div className="text-2xl font-bold text-gray-900">{totalFteRequired.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="text-gray-600 mb-1">Pattern Units</div>
                <div className="text-2xl font-bold text-teal-700">{advancedMetrics.totalUnits}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
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
