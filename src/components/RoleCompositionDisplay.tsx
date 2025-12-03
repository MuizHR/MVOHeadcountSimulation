import React from 'react';
import { Users, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { SuggestedRoleComposition } from '../types/staffType';
import { StaffConfiguration } from '../types/staffType';
import { computeMonthlyCost, findRoleOption } from '../config/staffCost';

interface RoleCompositionDisplayProps {
  suggestedComposition: SuggestedRoleComposition;
  userConfiguration?: StaffConfiguration;
  staffTypes?: any[];
}

export function RoleCompositionDisplay({
  suggestedComposition,
  userConfiguration,
  staffTypes = [],
}: RoleCompositionDisplayProps) {
  let userCost = 0;
  let userDescription = '';

  if (userConfiguration) {
    if (userConfiguration.mode === 'simple' && userConfiguration.simpleRoleId) {
      const roleOption = findRoleOption(userConfiguration.simpleRoleId);
      if (roleOption) {
        const costPerFte = computeMonthlyCost(roleOption.employmentType, roleOption.bandKey);
        userCost = costPerFte * suggestedComposition.totalFteRequired;
        userDescription = `${suggestedComposition.totalFteRequired.toFixed(2)} ${roleOption.label}${suggestedComposition.totalFteRequired > 1 ? 's' : ''}`;
      }
    } else if (userConfiguration.mode === 'advanced' && userConfiguration.advancedPattern) {
      const totalUnits = userConfiguration.advancedPattern.reduce((sum, item) => sum + item.pattern, 0);

      if (totalUnits > 0) {
        const ftePerUnit = suggestedComposition.totalFteRequired / totalUnits;

        userConfiguration.advancedPattern.forEach(item => {
          const roleOption = findRoleOption(item.staffTypeId);
          if (roleOption) {
            const fteShare = item.pattern * ftePerUnit;
            const costPerFte = computeMonthlyCost(roleOption.employmentType, roleOption.bandKey);
            userCost += fteShare * costPerFte;
          }
        });
      }

      const patternDesc = userConfiguration.advancedPattern
        .map(item => {
          const roleOption = findRoleOption(item.staffTypeId);
          return roleOption ? `${item.pattern} ${roleOption.label}` : '';
        })
        .filter(Boolean)
        .join(' + ');
      userDescription = patternDesc;
    }
  }

  const costDifference = userCost - suggestedComposition.suggestedTotalMonthlyCost;
  const hasCostComparison = userCost > 0;

  return (
    <div className="bg-white border-2 border-blue-300 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            System-Suggested Role Composition
          </h3>
          <p className="text-sm text-gray-600">
            Based on JLG salary bands and {suggestedComposition.workCategory}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-blue-900">Recommended Pattern</h4>
          <div className="text-xs text-blue-700 font-medium">
            Total FTE: {suggestedComposition.totalFteRequired.toFixed(2)}
          </div>
        </div>

        <div className="text-base font-medium text-blue-900 mb-3">
          {suggestedComposition.pattern.map((p, idx) => (
            <span key={p.roleId}>
              {idx > 0 && ' + '}
              {p.units} {p.roleTitle}{p.units > 1 ? 's' : ''}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-300">
                <th className="text-left py-2 px-2 font-semibold text-blue-900">Role</th>
                <th className="text-right py-2 px-2 font-semibold text-blue-900">Units</th>
                <th className="text-right py-2 px-2 font-semibold text-blue-900">FTE Share</th>
                <th className="text-right py-2 px-2 font-semibold text-blue-900">Monthly Cost (RM)</th>
              </tr>
            </thead>
            <tbody>
              {suggestedComposition.fteBreakdown.map((item, index) => (
                <tr key={index} className="border-b border-blue-200 last:border-0">
                  <td className="py-2 px-2 text-gray-900">{item.roleTitle}</td>
                  <td className="py-2 px-2 text-right text-gray-700">
                    {suggestedComposition.pattern[index]?.units || 0}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700 font-medium">
                    {item.fteShare.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700 font-medium">
                    {item.monthlyCost.toLocaleString('en-MY', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-blue-300 bg-blue-100 font-semibold">
                <td className="py-2 px-2 text-gray-900">Total</td>
                <td className="py-2 px-2 text-right text-gray-900">
                  {suggestedComposition.pattern.reduce((sum, p) => sum + p.units, 0)}
                </td>
                <td className="py-2 px-2 text-right text-gray-900">
                  {suggestedComposition.totalFteRequired.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-right text-blue-700 text-base">
                  RM {Math.round(suggestedComposition.suggestedTotalMonthlyCost).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
        <div className="text-xs text-gray-700">
          <div className="font-semibold mb-1">Rationale</div>
          <p>{suggestedComposition.narrative}</p>
        </div>
      </div>

      {hasCostComparison && (
        <div
          className={`border rounded-lg p-4 ${
            costDifference > 0
              ? 'bg-green-50 border-green-200'
              : costDifference < 0
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-start gap-2">
            {costDifference > 0 ? (
              <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : costDifference < 0 ? (
              <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            ) : (
              <DollarSign className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4
                className={`text-sm font-semibold mb-2 ${
                  costDifference > 0
                    ? 'text-green-900'
                    : costDifference < 0
                    ? 'text-yellow-900'
                    : 'text-gray-900'
                }`}
              >
                Comparison with Your Configuration
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-700">Your configuration:</span>
                  <span className="font-medium text-gray-900">{userDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Your monthly cost:</span>
                  <span className="font-medium text-gray-900">
                    RM {Math.round(userCost).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Suggested cost:</span>
                  <span className="font-medium text-blue-700">
                    RM {Math.round(suggestedComposition.suggestedTotalMonthlyCost).toLocaleString()}
                  </span>
                </div>
                <div
                  className={`flex justify-between pt-2 border-t ${
                    costDifference > 0
                      ? 'border-green-300'
                      : costDifference < 0
                      ? 'border-yellow-300'
                      : 'border-gray-300'
                  }`}
                >
                  <span
                    className={`font-semibold ${
                      costDifference > 0
                        ? 'text-green-900'
                        : costDifference < 0
                        ? 'text-yellow-900'
                        : 'text-gray-900'
                    }`}
                  >
                    {costDifference > 0
                      ? 'Potential savings:'
                      : costDifference < 0
                      ? 'Additional cost:'
                      : 'Cost difference:'}
                  </span>
                  <span
                    className={`font-bold ${
                      costDifference > 0
                        ? 'text-green-700'
                        : costDifference < 0
                        ? 'text-yellow-700'
                        : 'text-gray-700'
                    }`}
                  >
                    RM {Math.abs(Math.round(costDifference)).toLocaleString()}
                    {costDifference > 0 ? ' saved' : costDifference < 0 ? ' more' : ''}
                  </span>
                </div>
              </div>
              {costDifference > 0 && (
                <p className="mt-2 text-xs text-green-800">
                  System-suggested mix reduces monthly cost by RM{' '}
                  {Math.abs(Math.round(costDifference)).toLocaleString()} compared to your current role
                  pattern while maintaining the same total FTE required.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
