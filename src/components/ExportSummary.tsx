import React, { useState } from 'react';
import { SimulationInputs } from '../types/simulation';
import { ScenarioResult } from '../types/scenario';
import { FileDown, Printer, Mail } from 'lucide-react';

interface ExportSummaryProps {
  inputs: SimulationInputs;
  scenarios: ScenarioResult[];
  selectedScenario: ScenarioResult | null;
  onClose: () => void;
}

export function ExportSummary({ inputs, scenarios, selectedScenario, onClose }: ExportSummaryProps) {
  const [isEmailSending, setIsEmailSending] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    setIsEmailSending(true);
    try {
      const reportData = {
        simulationName: inputs.simulationName,
        planningType: inputs.planningType,
        functionType: inputs.functionType,
        natureOfWork: inputs.natureOfWork,
        workloadLevel: inputs.workloadLevel,
        complexityLevel: inputs.complexityLevel,
        projectLength: inputs.projectLength,
        totalProjectValue: inputs.totalProjectValue,
        automationPotential: inputs.automationPotential,
        scenarios: scenarios.map(s => ({
          name: s.name,
          type: s.type,
          description: s.description,
          headcount: s.headcount,
          duration: s.duration,
          costPerMonth: s.costPerMonth,
          riskLevel: s.riskLevel,
          sustainability: s.sustainability,
          isRecommended: s.isRecommended
        })),
        selectedScenario: selectedScenario ? {
          name: selectedScenario.name,
          type: selectedScenario.type,
          description: selectedScenario.description,
          headcount: selectedScenario.headcount,
          duration: selectedScenario.duration,
          costPerMonth: selectedScenario.costPerMonth,
          riskLevel: selectedScenario.riskLevel,
          sustainability: selectedScenario.sustainability
        } : null,
        generatedAt: new Date().toISOString()
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-report-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Report sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsEmailSending(false);
    }
  };

  const formatLabel = (value: string): string => {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFunctionDisplayName = (): string => {
    if (inputs.isCustomFunction && inputs.customFunctionName) {
      return inputs.customFunctionName;
    }
    return formatLabel(inputs.functionType);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(amount);
  };

  const compareScenarios = [
    scenarios.find(s => s.type === 'status_quo'),
    scenarios.find(s => s.type === 'lean_mvo'),
    scenarios.find(s => s.type === 'resilience_model'),
  ].filter(Boolean) as ScenarioResult[];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between print:hidden">
          <h2 className="text-2xl font-bold text-gray-900">Export Summary</h2>
          <div className="flex gap-2">
            <button
              onClick={handleEmail}
              disabled={isEmailSending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Mail className="w-4 h-4" />
              {isEmailSending ? 'Sending...' : 'Email'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-8 print:p-0">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center print:bg-gray-800">
                <FileDown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">JLG Group MVO & Headcount Simulator</h1>
                <p className="text-gray-600">Workforce Planning Analysis Report</p>
              </div>
            </div>
          </div>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg print:bg-white print:border print:border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Simulation Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Simulation Name</p>
                <p className="font-semibold text-gray-900">{inputs.simulationName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Planning Type</p>
                <p className="font-semibold text-gray-900">{formatLabel(inputs.planningType)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Function Type</p>
                <p className="font-semibold text-gray-900">{getFunctionDisplayName()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nature of Work</p>
                <p className="font-semibold text-gray-900">{formatLabel(inputs.natureOfWork)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Workload / Complexity</p>
                <p className="font-semibold text-gray-900">{formatLabel(inputs.workloadLevel)} / {formatLabel(inputs.complexityLevel)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Project Length</p>
                <p className="font-semibold text-gray-900">{inputs.projectLength} months</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Project Value</p>
                <p className="font-semibold text-gray-900">{formatCurrency(inputs.totalProjectValue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Automation Potential</p>
                <p className="font-semibold text-gray-900">{inputs.automationPotential}%</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Scenario Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 print:bg-gray-200">
                    <th className="border border-gray-300 p-3 text-left text-sm font-semibold">Scenario</th>
                    <th className="border border-gray-300 p-3 text-center text-sm font-semibold">Headcount</th>
                    <th className="border border-gray-300 p-3 text-center text-sm font-semibold">Duration</th>
                    <th className="border border-gray-300 p-3 text-center text-sm font-semibold">Cost/Month</th>
                    <th className="border border-gray-300 p-3 text-center text-sm font-semibold">Risk</th>
                    <th className="border border-gray-300 p-3 text-center text-sm font-semibold">Sustainability</th>
                  </tr>
                </thead>
                <tbody>
                  {compareScenarios.map((scenario) => (
                    <tr key={scenario.type} className={scenario.isRecommended ? 'bg-teal-50 print:bg-gray-100' : ''}>
                      <td className="border border-gray-300 p-3">
                        <div className="font-semibold">{scenario.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{scenario.description}</div>
                      </td>
                      <td className="border border-gray-300 p-3 text-center font-semibold">{scenario.headcount}</td>
                      <td className="border border-gray-300 p-3 text-center">{scenario.duration} months</td>
                      <td className="border border-gray-300 p-3 text-center">{formatCurrency(scenario.costPerMonth.total)}</td>
                      <td className="border border-gray-300 p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scenario.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                          scenario.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {formatLabel(scenario.riskLevel)}
                        </span>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          scenario.sustainability === 'high' ? 'bg-green-100 text-green-700' :
                          scenario.sustainability === 'medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {formatLabel(scenario.sustainability)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedScenario && (
            <div className="mb-8 p-6 bg-teal-50 rounded-lg print:bg-white print:border-2 print:border-teal-600">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recommended Scenario: {selectedScenario.name}</h3>
              <p className="text-gray-700 mb-4">{selectedScenario.description}</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Total Headcount</p>
                  <p className="text-2xl font-bold text-teal-600">{selectedScenario.headcount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Project Duration</p>
                  <p className="text-2xl font-bold text-teal-600">{selectedScenario.duration} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Cost</p>
                  <p className="text-2xl font-bold text-teal-600">{formatCurrency(selectedScenario.costPerMonth.total)}</p>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Cost Breakdown:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Permanent Staff: {formatCurrency(selectedScenario.costPerMonth.permanent)}</li>
                  <li>Contract Workers: {formatCurrency(selectedScenario.costPerMonth.contract)}</li>
                  <li>Gig Workers: {formatCurrency(selectedScenario.costPerMonth.gig)}</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-300">
            <p className="text-xs text-gray-600 italic">
              This simulator provides indicative estimates based on standardised assumptions and the Headcount Planning Framework & MVO Simulation Principles.
              Final decisions should also consider real operational data, management judgement and latest business conditions.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
