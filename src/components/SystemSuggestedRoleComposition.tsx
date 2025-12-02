import React from 'react';
import { Lightbulb } from 'lucide-react';
import { calculateMonthlyCost } from '../utils/calculateCost';
import { getRoleBandKey, ROLE_MAP } from '../utils/roleMap';
import { getWorkerType, RecommendedStrategy, WorkerType } from '../utils/workerType';

interface RoleUnit {
  label: string;
  units: number;
}

interface SystemSuggestedRoleCompositionProps {
  roles: RoleUnit[];
  recommendedStrategy: RecommendedStrategy;
  totalFte?: number;
  subtitle?: string;
}

interface RoleRow {
  role: string;
  units: number;
  fteShare: number;
  unitCost: number;
  monthlyCost: number;
}

export function SystemSuggestedRoleComposition({
  roles,
  recommendedStrategy,
  totalFte,
  subtitle = "Based on JLG salary bands"
}: SystemSuggestedRoleCompositionProps) {
  const workerType: WorkerType = getWorkerType(recommendedStrategy);

  const roleRows: RoleRow[] = roles.map(role => {
    const roleKey = ROLE_MAP[role.label] || getRoleBandKey(role.label);
    const unitCost = calculateMonthlyCost(roleKey, workerType);
    const fteShare = role.units * 1.0;
    const totalRoleCost = unitCost * role.units;

    return {
      role: role.label,
      units: role.units,
      fteShare,
      unitCost,
      monthlyCost: totalRoleCost
    };
  });

  const totalUnits = roleRows.reduce((sum, row) => sum + row.units, 0);
  const totalFteCalculated = roleRows.reduce((sum, row) => sum + row.fteShare, 0);
  const totalMonthlyCost = roleRows.reduce((sum, row) => sum + row.monthlyCost, 0);

  const displayTotalFte = totalFte ?? totalFteCalculated;

  const formatCurrency = (amount: number): string => {
    return `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            System-Suggested Role Composition
          </h3>
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Role
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                Units
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                FTE Share
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                Monthly Cost (RM)
              </th>
            </tr>
          </thead>
          <tbody>
            {roleRows.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {row.role}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-700">
                  {row.units}
                </td>
                <td className="px-4 py-3 text-sm text-center text-gray-700">
                  {row.fteShare.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                  {formatCurrency(row.monthlyCost)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 border-t-2 border-blue-300">
              <td className="px-4 py-3 text-sm font-bold text-gray-900">
                Total
              </td>
              <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">
                {totalUnits}
              </td>
              <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">
                {displayTotalFte.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-right font-bold text-blue-700 text-base">
                {formatCurrency(totalMonthlyCost)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold">Cost Calculation:</span> Cost includes salary, fixed allowance, employer statutory contributions (EPF, SOCSO, EIS, HRD Corp), GPA/GTL, medical, and GHS based on JLG salary bands and employment type (Permanent / GIG).
        </p>
      </div>
    </div>
  );
}
