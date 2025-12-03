import React, { useState } from 'react';
import { Users, Clock, DollarSign, AlertTriangle, HelpCircle } from 'lucide-react';
import { KeyStats } from '../../types/dashboardResult';

interface KPICardsProps {
  keyStats: KeyStats;
}

interface TooltipProps {
  content: string;
}

function Tooltip({ content }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        type="button"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute z-50 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl -top-2 left-full ml-2">
          <div className="whitespace-pre-line">{content}</div>
        </div>
      )}
    </div>
  );
}

export function KPICards({ keyStats }: KPICardsProps) {
  const headcountChange = keyStats.mvoHeadcount - keyStats.baselineHeadcount;
  const headcountChangePercent = keyStats.baselineHeadcount > 0
    ? ((headcountChange / keyStats.baselineHeadcount) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-700" />
            <h3 className="font-semibold text-gray-900">Headcount</h3>
          </div>
          <Tooltip content="Baseline reflects traditional Excel-style calculation with minimal risk buffer. MVO is the minimum headcount that still meets your risk and delivery targets." />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Baseline:</span>
            <span className="text-lg font-bold text-gray-900">{keyStats.baselineHeadcount} FTE</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">MVO:</span>
            <span className="text-lg font-bold text-teal-700">{keyStats.mvoHeadcount} FTE</span>
          </div>
          <div className="pt-2 border-t border-teal-200">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Change:</span>
              <span className={`text-sm font-semibold ${headcountChange > 0 ? 'text-amber-700' : headcountChange < 0 ? 'text-green-700' : 'text-gray-700'}`}>
                {headcountChange > 0 ? '+' : ''}{headcountChange} FTE ({headcountChange > 0 ? '+' : ''}{headcountChangePercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-700" />
            <h3 className="font-semibold text-gray-900">Delivery Time</h3>
          </div>
          <Tooltip content="P-values show how often work finishes on or before this duration across the Monte Carlo runs (e.g. P90 = 90% of scenarios)." />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            <div className="flex-1 min-w-[80px] bg-white rounded-lg px-2 py-1.5 border border-blue-200">
              <div className="text-xs text-gray-600">P50</div>
              <div className="text-sm font-bold text-blue-700">{keyStats.p50DurationDays}d</div>
            </div>
            <div className="flex-1 min-w-[80px] bg-white rounded-lg px-2 py-1.5 border border-blue-200">
              <div className="text-xs text-gray-600">P75</div>
              <div className="text-sm font-bold text-blue-700">{keyStats.p75DurationDays}d</div>
            </div>
            <div className="flex-1 min-w-[80px] bg-white rounded-lg px-2 py-1.5 border border-blue-200">
              <div className="text-xs text-gray-600">P90</div>
              <div className="text-sm font-bold text-blue-700">{keyStats.p90DurationDays}d</div>
            </div>
          </div>
          <div className="pt-1 border-t border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Average:</span>
              <span className="text-base font-bold text-gray-900">{keyStats.avgDurationDays} days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-700" />
            <h3 className="font-semibold text-gray-900">Cost & Savings</h3>
          </div>
          <Tooltip content="Costs include salary bands, allowances and employer contributions based on JLG structures. Savings compare your baseline versus the MVO recommendation." />
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Baseline:</span>
            <span className="font-medium text-gray-900">RM {keyStats.baselineMonthlyCostRm.toLocaleString()}/mo</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">MVO:</span>
            <span className="font-medium text-purple-700">RM {keyStats.mvoMonthlyCostRm.toLocaleString()}/mo</span>
          </div>
          <div className="pt-2 border-t border-purple-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Monthly Savings:</span>
              <span className="text-sm font-bold text-green-700">RM {keyStats.monthlySavingsRm.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Annual Savings:</span>
              <span className="text-sm font-bold text-green-700">RM {keyStats.annualSavingsRm.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h3 className="font-semibold text-gray-900">Failure Risk</h3>
          </div>
          <Tooltip content="Failure risk reflects the chance of missing your delivery timeframe or workload, considering absence, turnover, variance and other risk factors." />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Baseline Risk:</span>
            <span className="text-lg font-bold text-gray-900">{keyStats.baselineFailureRiskPct.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">MVO Risk:</span>
            <span className="text-lg font-bold text-amber-700">{keyStats.mvoFailureRiskPct.toFixed(1)}%</span>
          </div>
          <div className="pt-2 border-t border-amber-200">
            <div className="text-xs text-gray-600 text-center">
              {keyStats.mvoFailureRiskPct < 10 ? 'Low risk range' :
               keyStats.mvoFailureRiskPct < 25 ? 'Medium risk range' :
               'High risk - consider adding buffer'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
