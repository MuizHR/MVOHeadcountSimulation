import React from 'react';
import { SubFunction } from '../types/subfunction';
import { SimulationInputs } from '../types/simulation';
import { FinancialSummary, formatCurrency } from '../utils/financialSummary';

interface MvoReportLayoutProps {
  simulationInputs: SimulationInputs;
  subFunctions: SubFunction[];
  synchronizedResults: Map<string, any>;
  totalBaseline: number;
  totalMVO: number;
  baselineComposition?: any;
  mvoComposition?: any;
  financialSummary?: FinancialSummary | null;
  forPrint?: boolean;
}

function formatHeadcount(value: number): string {
  return value === 1 ? '1 person' : `${value} persons`;
}

export function MvoReportLayout({
  simulationInputs,
  subFunctions,
  synchronizedResults,
  totalBaseline,
  totalMVO,
  baselineComposition,
  mvoComposition,
  financialSummary,
  forPrint = false
}: MvoReportLayoutProps) {
  const firstResult = Array.from(synchronizedResults.values())[0] as any;
  const summaryLine = firstResult && firstResult.mvo ? (() => {
    const mvo = firstResult.mvo;
    const selectedResult = mvo.selectedResult;
    const recommendedFte = mvo.recommendedHeadcount;
    const avgDuration = Math.round(selectedResult.avgDuration);
    const p90Duration = Math.round(selectedResult.p90Duration);
    const successPercent = Math.round(selectedResult.deadlineMetProbability);
    const monthlyCost = Math.round(selectedResult.avgCost / 1000);
    return `${recommendedFte} FTE – ~${avgDuration} days Avg, ${p90Duration} days P90, ${successPercent}% success, ~RM ${monthlyCost}k/month`;
  })() : null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className={forPrint ? "p-8" : "bg-white rounded-lg shadow-md p-8 mb-6"}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            MVO Results: {simulationInputs.simulationName}
          </h2>
          {summaryLine && (
            <p className="text-gray-700 text-sm bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 inline-block">
              <strong>Recommended:</strong> {summaryLine}
            </p>
          )}
        </div>

        {financialSummary && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {financialSummary.sectionTitle}
            </h3>
            <div className="space-y-3">
              {financialSummary.projectDurationMonths != null && (
                <div className="text-sm">
                  <span className="font-semibold">Project Duration:</span> {financialSummary.projectDurationMonths} months
                </div>
              )}

              {financialSummary.mvoProjectCost != null && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-teal-700">MVO Project Cost</div>
                    <div className="text-xl font-bold text-teal-900">{formatCurrency(financialSummary.mvoProjectCost)}</div>
                  </div>
                  {financialSummary.baselineProjectCost != null && (
                    <div>
                      <div className="text-sm font-semibold text-blue-700">Baseline Project Cost</div>
                      <div className="text-xl font-bold text-blue-900">{formatCurrency(financialSummary.baselineProjectCost)}</div>
                    </div>
                  )}
                </div>
              )}

              {financialSummary.mvoAnnualCost != null && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-teal-700">MVO Monthly Cost</div>
                    <div className="text-xl font-bold text-teal-900">{formatCurrency(financialSummary.mvoMonthlyCost)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-teal-700">MVO Annual Cost</div>
                    <div className="text-xl font-bold text-teal-900">{formatCurrency(financialSummary.mvoAnnualCost)}</div>
                  </div>
                </div>
              )}

              {financialSummary.baselineAnnualCost != null && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-blue-700">Baseline Monthly Cost</div>
                    <div className="text-xl font-bold text-blue-900">{formatCurrency(financialSummary.baselineMonthlyCost || 0)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-blue-700">Baseline Annual Cost</div>
                    <div className="text-xl font-bold text-blue-900">{formatCurrency(financialSummary.baselineAnnualCost)}</div>
                  </div>
                </div>
              )}

              {financialSummary.monthlySavings != null && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-600">Current Monthly Cost</div>
                      <div className="text-xl font-bold text-gray-900">{formatCurrency(financialSummary.currentMonthlyCost || 0)}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-teal-700">Recommended MVO Monthly Cost</div>
                      <div className="text-xl font-bold text-teal-900">{formatCurrency(financialSummary.mvoMonthlyCost)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-green-700">Estimated Monthly Savings</div>
                      <div className="text-2xl font-bold text-green-900">{formatCurrency(financialSummary.monthlySavings)}</div>
                      {financialSummary.monthlySavingsPercent != null && (
                        <div className="text-sm text-green-700">({financialSummary.monthlySavingsPercent.toFixed(1)}% reduction)</div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-green-700">Estimated Annual Savings</div>
                      <div className="text-2xl font-bold text-green-900">{formatCurrency(financialSummary.annualSavings || 0)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Combined Summary - All Sub-Functions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
              <div className="text-sm text-blue-700 mb-1">📌 Baseline Headcount (Excel-style)</div>
              <div className="text-4xl font-bold text-blue-900">{formatHeadcount(totalBaseline)}</div>
              <div className="text-xs text-blue-600 mt-2">
                Calculated using a simple workload÷capacity formula with minimal risk buffer (similar to traditional Excel calculations).
              </div>
              {baselineComposition && (
                <div className="text-xs text-gray-600 mt-3 pt-3 border-t border-blue-200">
                  <span className="font-medium text-gray-700">Suggested mix:</span>{' '}
                  {baselineComposition.pattern.map((p: any, idx: number) => (
                    <span key={p.roleId}>
                      {idx > 0 && ' + '}
                      {p.units} {p.roleTitle}{p.units > 1 ? 's' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-teal-300">
              <div className="text-sm text-teal-700 mb-1 flex items-center gap-2">
                ✅ MVO Recommended Headcount
              </div>
              <div className="text-4xl font-bold text-teal-900">
                {formatHeadcount(totalMVO)}
              </div>
              <div className="text-xs text-teal-600 mt-2">
                Minimum viable headcount for very high confidence (≥ 95%), after applying risk, variability and governance safeguards.
              </div>
              {mvoComposition && (
                <div className="text-xs text-gray-600 mt-3 pt-3 border-t border-teal-200">
                  <span className="font-medium text-gray-700">Suggested mix:</span>{' '}
                  {mvoComposition.pattern.map((p: any, idx: number) => (
                    <span key={p.roleId}>
                      {idx > 0 && ' + '}
                      {p.units} {p.roleTitle}{p.units > 1 ? 's' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sub-Function Breakdown ({subFunctions.length})
          </h3>
          <div className="space-y-3">
            {subFunctions.map(sf => {
              const result = synchronizedResults.get(sf.id);
              if (!result) return null;

              const mvo = (result as any).mvo;
              const riskLevel = mvo?.selectedResult?.riskLevel || 'medium';

              return (
                <div key={sf.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">{sf.name}</div>
                  <div className="flex items-center gap-3 text-sm flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                      Baseline: {formatHeadcount(mvo?.baselineHeadcount || 0)}
                    </span>
                    <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full font-medium">
                      MVO: {formatHeadcount(mvo?.recommendedHeadcount || 0)}
                    </span>
                    <span
                      className={`
                        px-3 py-1 rounded-full font-medium text-xs
                        ${riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}
                    >
                      {riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-3">Understanding the Results</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span>
                <strong>Baseline Headcount (Excel-style)</strong> is the traditional calculation with NO risk buffer.
                It assumes perfect conditions with no absences, turnover, or productivity variance.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span>
                <strong>MVO Recommended Headcount</strong> is the MINIMUM headcount that achieves very high confidence (≥ 95%).
                This accounts for real-world variability, risk factors and governance safeguards through Monte Carlo simulation.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span>
                <strong>How to read the comparison table:</strong> The simulator tests different team sizes and shows their average & P90 duration, cost and risk.
                The MVO recommendation is the <strong>lowest headcount</strong> that meets your risk and deadline criteria.
                Other rows may still be feasible but with tighter utilisation or lower buffer.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold mt-0.5">•</span>
              <span>
                <strong>P90 Duration</strong> means 90% of simulation runs finished on or before this duration.
                It's safer than the average because it includes bad days and variability.
              </span>
            </li>
          </ul>
        </div>

        {!forPrint && (
          <div className="mt-6 text-xs text-gray-500 text-center">
            Generated by JLG Group – Internal Workforce Planning Tool (Confidential) – {new Date().toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
