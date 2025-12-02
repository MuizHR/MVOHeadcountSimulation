import React from 'react';
import { CheckCircle, AlertTriangle, TrendingUp, DollarSign, Clock, Target, Shield, HelpCircle } from 'lucide-react';
import { MVOResult, RecommendedStrategy, strategyConfig } from '../types/monteCarlo';
import { getWorkTypeCoefficients } from '../data/workTypeCoefficients';

function formatHeadcount(value: number): string {
  return value === 1 ? '1 person' : `${value} persons`;
}

interface MVOResultsProps {
  mvoResult: MVOResult;
  subFunctionName: string;
  workTypeId?: string;
  sizeOfOperation?: string;
}

export function MVOResults({ mvoResult, subFunctionName, workTypeId, sizeOfOperation }: MVOResultsProps) {
  const { baselineHeadcount, recommendedHeadcount, selectedResult, testResults, strategy, explanation, suggestions, comparison } = mvoResult;

  const workType = workTypeId ? getWorkTypeCoefficients(workTypeId) : null;
  const showMinHeadcountNote = selectedResult.minHeadcountApplied && selectedResult.minHeadcountValue;

  const cfg = strategyConfig[strategy];

  const strategyColors: Record<RecommendedStrategy, string> = {
    hire_permanent: 'bg-blue-50 border-blue-200 text-blue-900',
    hybrid_perm_gig: 'bg-purple-50 border-purple-200 text-purple-900',
    outsource: 'bg-orange-50 border-orange-200 text-orange-900',
    automate: 'bg-green-50 border-green-200 text-green-900',
  };

  const getRiskBadge = (risk: number) => {
    if (risk <= 10) {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">✓ LOW RISK</span>;
    } else if (risk <= 20) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">⚠ MEDIUM RISK</span>;
    } else {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">✕ HIGH RISK</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-semibold text-blue-900">
              Baseline Headcount (Excel-style)
            </h3>
          </div>
          <div className="text-5xl font-bold text-blue-900 mb-2">
            {formatHeadcount(baselineHeadcount)}
          </div>
          <div className="text-sm text-blue-800">
            Calculated using a simple workload÷capacity formula with minimal risk buffer (similar to traditional Excel calculations)
          </div>
          {comparison.baselineRisk > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Failure Risk:</span>
                <span className="font-semibold text-blue-900">{comparison.baselineRisk.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-300 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-teal-700" />
            <h3 className="text-lg font-semibold text-teal-900">
              MVO Recommended Headcount
            </h3>
          </div>
          <div className="text-5xl font-bold text-teal-900 mb-2">
            {formatHeadcount(recommendedHeadcount)}
          </div>
          <div className="text-sm text-teal-800">
            Minimum viable headcount for very high confidence (≥ {(100 - selectedResult.failureRisk).toFixed(0)}%), after applying risk, variability and governance safeguards
          </div>
          <div className="mt-3 pt-3 border-t border-teal-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-800">Failure Risk:</span>
              {getRiskBadge(selectedResult.failureRisk)}
            </div>
          </div>
        </div>
      </div>

      {showMinHeadcountNote && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-2">Minimum Headcount Safeguard Applied</h4>
              <p className="text-sm text-amber-800">
                Includes a minimum headcount safeguard of <strong>{selectedResult.minHeadcountValue} FTE</strong> based on work type
                {workType && ` "${workType.name}"`}
                {sizeOfOperation && ` and size of operation "${sizeOfOperation}"`}.
                This prevents under-estimation for functions that require coverage, maker-checker or safety controls.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`border-2 rounded-lg p-6 ${strategyColors[strategy]}`}>
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold text-lg">Recommended Strategy</h4>
          <div className="relative group">
            <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
            <div className="absolute left-0 top-6 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {cfg.tooltip}
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold mb-3">{cfg.label}</div>
        <div className="text-sm mb-4 leading-relaxed">{cfg.explanation}</div>
        <div className="grid grid-cols-3 gap-4 text-sm border-t pt-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <div>
              <div className="text-xs opacity-75">Avg Duration</div>
              <div className="font-semibold">{selectedResult.avgDuration.toFixed(0)} days</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <div>
              <div className="text-xs opacity-75">Avg Cost</div>
              <div className="font-semibold">RM {Math.round(selectedResult.avgCost / 1000)}k</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <div>
              <div className="text-xs opacity-75">Success Rate</div>
              <div className="font-semibold">{selectedResult.deadlineMetProbability.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Headcount Comparison Table</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-2 font-semibold">Headcount</th>
                <th className="text-right py-3 px-2 font-semibold">Avg Duration</th>
                <th className="text-right py-3 px-2 font-semibold">P90 Duration</th>
                <th className="text-right py-3 px-2 font-semibold">Avg Cost (RM)</th>
                <th className="text-right py-3 px-2 font-semibold">Success %</th>
                <th className="text-center py-3 px-2 font-semibold">Risk</th>
                <th className="text-center py-3 px-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map(result => {
                const isBaseline = result.headcount === baselineHeadcount;
                const isMVO = result.headcount === recommendedHeadcount;
                const rowClass = isMVO
                  ? 'bg-teal-50 border-l-4 border-teal-600'
                  : isBaseline
                  ? 'bg-blue-50 border-l-4 border-blue-600'
                  : result.rejected
                  ? 'bg-gray-50 opacity-60'
                  : '';

                return (
                  <tr key={result.headcount} className={`border-b border-gray-200 ${rowClass}`}>
                    <td className="py-3 px-2">
                      <div className="font-semibold">{formatHeadcount(result.headcount)}</div>
                      {isBaseline && <div className="text-xs text-blue-700">Baseline</div>}
                      {isMVO && <div className="text-xs text-teal-700">✓ MVO</div>}
                    </td>
                    <td className="text-right py-3 px-2">{result.avgDuration.toFixed(0)} days</td>
                    <td className="text-right py-3 px-2">{result.p90Duration.toFixed(0)} days</td>
                    <td className="text-right py-3 px-2">{Math.round(result.avgCost).toLocaleString()}</td>
                    <td className="text-right py-3 px-2 font-semibold">{result.deadlineMetProbability.toFixed(0)}%</td>
                    <td className="text-center py-3 px-2">
                      <div className={`inline-block w-3 h-3 rounded-full ${
                        result.failureRisk <= 10 ? 'bg-green-500' :
                        result.failureRisk <= 20 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </td>
                    <td className="text-center py-3 px-2 text-xs">
                      {result.rejected ? (
                        <span className="text-red-600 font-medium">✕ Rejected</span>
                      ) : isMVO ? (
                        <span className="px-2 py-1 bg-teal-600 text-white rounded-full font-semibold">MVO recommended</span>
                      ) : (
                        <span className="text-gray-500">Valid</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low Risk (≤10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium Risk (10-20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>High Risk (&gt;20%)</span>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
          <p className="font-semibold mb-2">How to read this table</p>
          <p>
            The simulator tests different team sizes and shows their average & P90 duration, cost and risk.
            The MVO recommendation is the <strong>lowest headcount</strong> that meets your risk and deadline criteria.
            Other rows may still be feasible but with tighter utilisation or lower buffer.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3 text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-gray-700" />
          AI Analysis & Explanation
        </h4>
        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
          {explanation}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">Recommendations & Suggestions</h4>
          <ul className="space-y-2">
            {suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-blue-900">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Key Statistics (MVO Headcount: {recommendedHeadcount})</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1">Duration Range</div>
            <div className="font-semibold text-gray-900">
              {selectedResult.minDuration.toFixed(0)} - {selectedResult.maxDuration.toFixed(0)} days
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Cost Range</div>
            <div className="font-semibold text-gray-900">
              RM {Math.round(selectedResult.minCost / 1000)}k - {Math.round(selectedResult.maxCost / 1000)}k
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">P50 / P75 Duration</div>
            <div className="font-semibold text-gray-900">
              {selectedResult.p50Duration.toFixed(0)} / {selectedResult.p75Duration.toFixed(0)} days
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Within Budget</div>
            <div className="font-semibold text-gray-900">
              {selectedResult.withinBudgetProbability.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
