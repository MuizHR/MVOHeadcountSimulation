import React, { useEffect, useState } from 'react';
import { Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';
import { StaffType, RolePatternItem, calculateRolePatternMetrics, calculateSimpleRoleCost, StaffConfiguration } from '../types/staffType';
import { fetchAllStaffTypes } from '../services/staffTypeService';
import { suggestRoleComposition } from '../utils/roleCompositionSuggester';

interface SuggestedRoleCompositionProps {
  totalFteRequired: number;
  userConfiguration?: StaffConfiguration;
  dominantLevel?: 'Senior Management' | 'Middle Management' | 'Executive' | 'Non-Executive';
}

export function SuggestedRoleComposition({
  totalFteRequired,
  userConfiguration,
  dominantLevel = 'Executive',
}: SuggestedRoleCompositionProps) {
  const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffTypes();
  }, []);

  const loadStaffTypes = async () => {
    try {
      const types = await fetchAllStaffTypes();
      setStaffTypes(types);
    } catch (error) {
      console.error('Error loading staff types:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-gray-600">Loading suggestions...</div>
      </div>
    );
  }

  const suggested = suggestRoleComposition(totalFteRequired, dominantLevel, staffTypes);
  const suggestedMetrics = calculateRolePatternMetrics(suggested.pattern, totalFteRequired, staffTypes);

  let userCost = 0;
  let userDescription = '';

  if (userConfiguration) {
    if (userConfiguration.mode === 'simple' && userConfiguration.simpleRoleId) {
      userCost = calculateSimpleRoleCost(userConfiguration.simpleRoleId, totalFteRequired, staffTypes);
      const role = staffTypes.find(st => st.id === userConfiguration.simpleRoleId);
      userDescription = role ? `${totalFteRequired.toFixed(2)} ${role.title}${totalFteRequired > 1 ? 's' : ''}` : '';
    } else if (userConfiguration.mode === 'advanced' && userConfiguration.advancedPattern) {
      const userMetrics = calculateRolePatternMetrics(userConfiguration.advancedPattern, totalFteRequired, staffTypes);
      userCost = userMetrics.totalMonthlyCost;

      const patternDesc = userConfiguration.advancedPattern
        .map(item => {
          const st = staffTypes.find(s => s.id === item.staffTypeId);
          return st ? `${item.pattern} ${st.title}` : '';
        })
        .filter(Boolean)
        .join(' + ');
      userDescription = patternDesc;
    }
  }

  const costDifference = userCost - suggestedMetrics.totalMonthlyCost;
  const costSavings = costDifference > 0;

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Suggested Role Composition
          </h3>
          <p className="text-sm text-gray-600">
            Based on the total FTE required ({totalFteRequired.toFixed(2)}), here's a recommended staffing structure following JLG's organizational principles.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-blue-900">Recommended Pattern</h4>
          <div className="text-xs text-blue-700 font-medium">
            {suggestedMetrics.totalUnits} role units
          </div>
        </div>

        <div className="text-base font-medium text-blue-900 mb-3">
          {suggested.description}
        </div>

        <div className="space-y-2 text-sm">
          {suggestedMetrics.items.map((item, index) => {
            const staffType = staffTypes.find(st => st.id === item.staffTypeId);
            if (!staffType) return null;

            return (
              <div key={index} className="flex justify-between items-center py-2 border-b border-blue-200 last:border-0">
                <div>
                  <div className="font-medium text-gray-900">{staffType.title}</div>
                  <div className="text-xs text-gray-600">{staffType.level}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-900">
                    Pattern: {item.pattern} → {item.fteShare?.toFixed(2)} FTE
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    RM {item.monthlyCost?.toLocaleString('en-MY', { maximumFractionDigits: 0 })}/mo
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t-2 border-blue-300 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">Total Monthly Cost</span>
          <span className="text-lg font-bold text-blue-700">
            RM {Math.round(suggestedMetrics.totalMonthlyCost).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
        <div className="text-xs text-gray-700">
          <div className="font-semibold mb-1">Rationale</div>
          <p>{suggested.rationale}</p>
        </div>
      </div>

      {userConfiguration && userCost > 0 && (
        <div className={`border rounded-lg p-4 ${costSavings ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-start gap-2">
            {costSavings ? (
              <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`text-sm font-semibold mb-2 ${costSavings ? 'text-green-900' : 'text-yellow-900'}`}>
                Comparison with Your Configuration
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-700">Your configuration:</span>
                  <span className="font-medium text-gray-900">{userDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Your monthly cost:</span>
                  <span className="font-medium text-gray-900">RM {Math.round(userCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Suggested cost:</span>
                  <span className="font-medium text-blue-700">RM {Math.round(suggestedMetrics.totalMonthlyCost).toLocaleString()}</span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${costSavings ? 'border-green-300' : 'border-yellow-300'}`}>
                  <span className={`font-semibold ${costSavings ? 'text-green-900' : 'text-yellow-900'}`}>
                    {costSavings ? 'Potential savings:' : 'Additional cost:'}
                  </span>
                  <span className={`font-bold ${costSavings ? 'text-green-700' : 'text-yellow-700'}`}>
                    RM {Math.abs(Math.round(costDifference)).toLocaleString()}
                    {costSavings ? ' saved' : ' more'}
                  </span>
                </div>
              </div>
              {costSavings && (
                <p className="mt-2 text-xs text-green-800">
                  System-suggested mix reduces monthly cost by RM {Math.abs(Math.round(costDifference)).toLocaleString()} compared to your current role pattern while maintaining the same total FTE required.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
