import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, HelpCircle, Shield } from 'lucide-react';
import { SubFunctionResult } from '../../types/dashboardResult';

interface SubFunctionAccordionProps {
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

function getRiskBadgeColor(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH') {
  switch (riskLevel) {
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'HIGH':
      return 'bg-red-100 text-red-800 border-red-300';
  }
}

function getStrategyLabel(strategy: string) {
  switch (strategy) {
    case 'hire_permanent':
      return 'Hire Permanent Staff';
    case 'hybrid_perm_gig':
      return 'Hybrid (Permanent + Contract)';
    case 'outsource':
      return 'Outsource / Vendor';
    case 'automate':
      return 'Automate / Optimize Process';
    default:
      return strategy;
  }
}

function getStrategyTooltip(strategy: string) {
  switch (strategy) {
    case 'hire_permanent':
      return 'Best when workload is stable and you need long-term internal capability and control.';
    case 'hybrid_perm_gig':
      return 'Good for peak periods or projects – core internal team plus flexible capacity.';
    case 'outsource':
      return 'Use when you want external specialist capability or to shift non-core work to vendors.';
    case 'automate':
      return 'Suitable where repetitive tasks can be digitised, freeing up headcount for higher value work.';
    default:
      return 'Recommended approach for this work type.';
  }
}

export function SubFunctionAccordion({ subFunctions }: SubFunctionAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAI, setShowAI] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleAI = (id: string) => {
    setShowAI(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">Sub-Function Breakdown</h3>
      </div>

      {subFunctions.map((subFunc) => {
        const isExpanded = expandedId === subFunc.id;

        return (
          <div
            key={subFunc.id}
            className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleExpand(subFunc.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900 mb-1">{subFunc.name}</h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded border border-blue-300">
                      {subFunc.workTypeLabel}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      Baseline: {subFunc.baselineHeadcount} persons
                    </span>
                    <span className="text-xs px-2 py-1 bg-teal-100 text-teal-800 rounded font-medium">
                      MVO: {subFunc.mvoHeadcount} persons
                    </span>
                    <span className={`text-xs px-2 py-1 rounded border ${getRiskBadgeColor(subFunc.riskLevel)}`}>
                      {subFunc.riskLevel} RISK
                    </span>
                  </div>
                </div>
              </div>
              <div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">Baseline Headcount (Excel-style)</h5>
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {subFunc.baselineHeadcount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Failure Risk: <span className="font-semibold text-amber-700">{subFunc.baselineFailureRiskPct.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-teal-300 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3">MVO Recommended Headcount</h5>
                    <div className="text-4xl font-bold text-teal-700 mb-2">
                      {subFunc.mvoHeadcount}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Failure Risk: <span className="font-semibold text-teal-700">{subFunc.mvoFailureRiskPct.toFixed(1)}%</span>
                    </div>
                    {subFunc.minHeadcountSafeguardApplied && (
                      <div className="flex items-start gap-2 mt-2 bg-yellow-50 border border-yellow-300 rounded p-2">
                        <Shield className="w-4 h-4 text-yellow-700 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-yellow-800">
                          Includes minimum headcount safeguard for this work type (coverage / maker-checker).
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border-2 border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">Recommended Strategy</h5>
                    <Tooltip content={getStrategyTooltip(subFunc.recommendedStrategy)} />
                  </div>
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-900 rounded-lg font-medium">
                      {getStrategyLabel(subFunc.recommendedStrategy)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Avg Duration</div>
                      <div className="font-bold text-gray-900">{subFunc.recommendedStrategyStats.avgDurationDays} days</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">P90 Duration</div>
                      <div className="font-bold text-gray-900">{subFunc.recommendedStrategyStats.p90DurationDays} days</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Avg Cost</div>
                      <div className="font-bold text-gray-900">RM {Math.round(subFunc.recommendedStrategyStats.avgMonthlyCostRm).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Success Rate</div>
                      <div className="font-bold text-green-700">{subFunc.recommendedStrategyStats.successRatePct.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => toggleAI(subFunc.id)}
                    className="flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800"
                  >
                    {showAI[subFunc.id] ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Hide AI View
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show AI View for this Sub-Function
                      </>
                    )}
                  </button>
                  {showAI[subFunc.id] && (
                    <div className="mt-3 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                      <h6 className="font-semibold text-gray-900 mb-2">AI View for this Sub-Function</h6>
                      <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                        {subFunc.aiSummaryMarkdown.split('\n').map((line, i) => (
                          <p key={i} className="mb-2">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
