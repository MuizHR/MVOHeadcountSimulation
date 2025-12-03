import React, { useState } from 'react';
import { HelpCircle, Briefcase } from 'lucide-react';
import { SystemRoleComposition } from '../../types/dashboardResult';

interface SystemRoleCompositionPanelProps {
  composition: SystemRoleComposition;
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

export function SystemRoleCompositionPanel({ composition }: SystemRoleCompositionPanelProps) {
  const totalUnits = composition.rows.reduce((sum, row) => sum + row.units, 0);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm">
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-6 py-4 border-b-2 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-teal-700" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">System-Suggested Role Composition</h3>
              <p className="text-sm text-gray-600 mt-0.5">Based on JLG salary bands and Support / Admin / Back-office profile</p>
            </div>
          </div>
          <Tooltip content="The simulator recommends a default role mix using JLG salary bands. You can use this as a starting point and adjust in workforce planning or recruitment discussions." />
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <div>
            <span className="text-sm text-gray-600">Recommended Pattern:</span>
            <span className="ml-2 text-base font-bold text-teal-700">{composition.patternLabel}</span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total FTE:</span>
            <span className="ml-2 text-base font-bold text-gray-900">{composition.totalFte.toFixed(2)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-2 font-semibold text-gray-900">Role</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-900">Level</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-900">Units</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-900">FTE Share</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-900">Monthly Cost (RM)</th>
              </tr>
            </thead>
            <tbody>
              {composition.rows.map((row, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gray-900">{row.roleLabel}</td>
                  <td className="py-3 px-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {row.levelLabel}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-gray-700">{row.units}</td>
                  <td className="py-3 px-2 text-right text-gray-700 font-medium">
                    {row.fteShare.toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-700 font-medium">
                    {row.monthlyCostRm.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-teal-50 font-bold">
                <td className="py-3 px-2 text-gray-900">Total</td>
                <td className="py-3 px-2"></td>
                <td className="py-3 px-2 text-center text-gray-900">{totalUnits}</td>
                <td className="py-3 px-2 text-right text-gray-900">
                  {composition.totalFte.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right text-teal-700 text-base">
                  RM {composition.totalMonthlyCostRm.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="text-blue-700 font-medium text-sm">Rationale:</div>
            <div className="text-sm text-gray-700">{composition.rationale}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
