import React, { useState } from 'react';
import { Check, HelpCircle } from 'lucide-react';
import { SubFunctionResult, ComparisonRow } from '../../types/dashboardResult';

interface HeadcountComparisonTableProps {
  subFunctions: SubFunctionResult[];
}

function Tooltip({ content }: { content: string }) {
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

function getRiskColor(riskBucket: 'LOW' | 'MEDIUM' | 'HIGH') {
  switch (riskBucket) {
    case 'LOW':
      return 'text-green-700 bg-green-100';
    case 'MEDIUM':
      return 'text-amber-700 bg-amber-100';
    case 'HIGH':
      return 'text-red-700 bg-red-100';
  }
}

export function HeadcountComparisonTable({ subFunctions }: HeadcountComparisonTableProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  const allComparisons = subFunctions.length > 0 ? subFunctions[0].comparisonRows : [];

  const activeSubFunction = activeTab === 'all' ? null : subFunctions.find(sf => sf.id === activeTab);
  const displayRows = activeTab === 'all' ? allComparisons : (activeSubFunction?.comparisonRows || []);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm mt-6">
      <div className="px-6 py-4 border-b-2 border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">Headcount Comparison</h3>
            <Tooltip content="Use this table to see how different team sizes affect time, cost and risk. The green row shows the MVO recommendation that best balances these factors." />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-teal-600 text-teal-700 bg-teal-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            All Sub-Functions (combined)
          </button>
          {subFunctions.map((sf) => (
            <button
              key={sf.id}
              onClick={() => setActiveTab(sf.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === sf.id
                  ? 'border-teal-600 text-teal-700 bg-teal-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {sf.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-center py-3 px-3 font-semibold text-gray-900">Headcount</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-900">Avg Duration (days)</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-900">P90 Duration (days)</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-900">Avg Cost (RM)</th>
                <th className="text-right py-3 px-3 font-semibold text-gray-900">Success %</th>
                <th className="text-center py-3 px-3 font-semibold text-gray-900">Risk</th>
                <th className="text-center py-3 px-3 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, index) => {
                const isMvoRow = row.isMvo;
                const rowClass = isMvoRow
                  ? 'bg-green-50 border-2 border-green-300'
                  : 'border-b border-gray-200 hover:bg-gray-50';

                return (
                  <tr key={index} className={rowClass}>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-bold ${isMvoRow ? 'text-teal-700 text-lg' : 'text-gray-900'}`}>
                        {row.headcount}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {row.avgDurationDays.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {row.p90DurationDays.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-700">
                      {Math.round(row.avgCostRm).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-gray-900">
                      {row.successRatePct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${getRiskColor(row.riskBucket)}`}>
                        {row.riskPct.toFixed(1)}% {row.riskBucket}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isMvoRow && (
                        <div className="flex items-center justify-center gap-1 text-green-700 font-medium">
                          <Check className="w-4 h-4" />
                          <span className="text-xs">Selected</span>
                        </div>
                      )}
                      {row.isBaseline && !isMvoRow && (
                        <span className="text-xs text-gray-500">Baseline</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span>Low Risk (&lt; 10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-amber-100 border border-amber-300"></div>
            <span>Medium Risk (10-25%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span>High Risk (&gt; 25%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
