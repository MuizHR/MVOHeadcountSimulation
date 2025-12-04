import React, { useState, useEffect } from 'react';
import { FileDown, FileText, FileSpreadsheet, Mail, Info, HelpCircle } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { useAuth } from '../../contexts/AuthContext';
import { WizardNavigation } from './WizardNavigation';
import { KPICards } from '../dashboard/KPICards';
import { SystemRoleCompositionPanel } from '../dashboard/SystemRoleCompositionPanel';
import { SubFunctionAccordion } from '../dashboard/SubFunctionAccordion';
import { HeadcountComparisonTable } from '../dashboard/HeadcountComparisonTable';
import { transformToSimulationResult } from '../../utils/dashboardDataTransformer';
import { generateOverallRoleComposition } from '../../utils/overallRoleComposition';
import { fetchAllStaffTypes } from '../../services/staffTypeService';
import { simulationHistoryService } from '../../services/simulationHistoryService';
import { SimulationResult } from '../../types/dashboardResult';
import { planningTypeConfig, sizeOfOperationConfig } from '../../types/planningConfig';
import { exportToWord, exportToPDF, exportToExcel, ExportData } from '../../utils/resultsExporter';

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

export function Step6ResultsDashboard() {
  const { state, previousStep, reset, synchronizedResults, duplicateSimulationId } = useWizard();
  const { simulationInputs, subFunctions } = state;
  const { user } = useAuth();

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    const calculateResult = async () => {
      console.log('Step6 Dashboard - Starting calculation');
      console.log('synchronizedResults size:', synchronizedResults.size);
      console.log('synchronizedResults:', synchronizedResults);
      console.log('subFunctions:', subFunctions);

      try {
        if (synchronizedResults.size === 0) {
          console.warn('No synchronized results available');
          return;
        }

        console.log('Fetching staff types...');
        const staffTypes = await fetchAllStaffTypes();
        console.log('Fetched staff types:', staffTypes.length, staffTypes);

        if (!staffTypes || staffTypes.length === 0) {
          console.error('No staff types available');
          alert('No salary bands found in the database. Please configure salary bands first.');
          return;
        }

        console.log('Calculating MVO FTE...');
        const mvoFte = Array.from(synchronizedResults.values()).reduce(
          (sum, result: any) => {
            console.log('Processing result:', result);
            return sum + (result.mvo?.recommendedHeadcount || 0);
          },
          0
        );
        console.log('Total MVO FTE:', mvoFte);

        console.log('Generating role composition...');
        const mvoComposition = generateOverallRoleComposition(mvoFte, staffTypes);
        console.log('Generated MVO composition:', mvoComposition);

        console.log('Transforming to simulation result...');
        const result = transformToSimulationResult(
          simulationInputs,
          subFunctions,
          synchronizedResults,
          mvoComposition
        );
        console.log('Transformed simulation result:', result);

        setSimulationResult(result);
        console.log('Simulation result set successfully');
      } catch (error: any) {
        console.error('Error calculating simulation result:', error);
        console.error('Error stack:', error.stack);
        alert(`Error calculating results: ${error.message || 'Unknown error'}\n\nPlease check the console for details or go back to review.`);
      }
    };

    calculateResult();
  }, [synchronizedResults, simulationInputs, subFunctions]);

  const handleSaveSimulation = async () => {
    if (!user || !simulationResult) {
      alert('You must be logged in to save simulations');
      return;
    }

    if (isSaved) {
      return;
    }

    setIsSaving(true);

    try {
      const workloadScore = Array.from(synchronizedResults.values()).reduce(
        (sum, result: any) => {
          const workTypes = result.mvo?.workTypes || {};
          const workTypeTotal = Object.values(workTypes).reduce((s: number, v: any) => s + (v || 0), 0);
          return sum + workTypeTotal;
        },
        0
      );

      const inputPayload = {
        simulationInputs,
        subFunctions
      };

      const resultPayload = {
        synchronizedResults: Array.from(synchronizedResults.entries()).map(([key, value]) => ({
          subFunctionId: key,
          result: value
        })),
        simulationResult
      };

      if (duplicateSimulationId) {
        await simulationHistoryService.updateSimulation(duplicateSimulationId, {
          simulation_name: simulationInputs.simulationName || 'Untitled Simulation',
          business_area: simulationInputs.businessArea || 'Not specified',
          planning_type: simulationInputs.planningTypeKey || 'new_function',
          size_of_operation: simulationInputs.sizeOfOperationKey || 'medium',
          workload_score: Math.round(workloadScore),
          total_fte: simulationResult.totalFte,
          total_monthly_cost: simulationResult.avgMonthlyCostRm,
          input_payload: inputPayload,
          result_payload: resultPayload
        });
      } else {
        await simulationHistoryService.saveSimulation({
          user_id: user.id,
          simulation_id: simulationResult.simulationId,
          simulation_name: simulationInputs.simulationName || 'Untitled Simulation',
          business_area: simulationInputs.businessArea || 'Not specified',
          planning_type: simulationInputs.planningTypeKey || 'new_function',
          size_of_operation: simulationInputs.sizeOfOperationKey || 'medium',
          workload_score: Math.round(workloadScore),
          total_fte: simulationResult.totalFte,
          total_monthly_cost: simulationResult.avgMonthlyCostRm,
          input_payload: inputPayload,
          result_payload: resultPayload
        });
      }

      setIsSaved(true);
      setShowSaveSuccess(true);

      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving simulation:', error);
      alert('Failed to save simulation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewSimulation = () => {
    reset();
  };

  const planningTypeLabel = simulationInputs.planningTypeKey
    ? planningTypeConfig[simulationInputs.planningTypeKey]?.label
    : simulationInputs.planningType
    ? simulationInputs.planningType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Not specified';

  const sizeOfOperationLabel = simulationInputs.sizeOfOperationKey
    ? sizeOfOperationConfig[simulationInputs.sizeOfOperationKey]?.label
    : simulationInputs.operationSize
    ? simulationInputs.operationSize.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Not specified';

  const getExportData = (): ExportData => {
    if (!simulationResult) {
      throw new Error('No simulation result available');
    }
    return {
      simulationName: simulationResult.simulationName,
      planningType: planningTypeLabel,
      sizeOfOperation: sizeOfOperationLabel,
      totalFte: simulationResult.totalFte,
      avgDurationDays: simulationResult.avgDurationDays,
      p90DurationDays: simulationResult.p90DurationDays,
      successRatePct: simulationResult.successRatePct,
      avgMonthlyCostRm: simulationResult.avgMonthlyCostRm
    };
  };

  const handleExportWord = async () => {
    try {
      const data = getExportData();
      await exportToWord(data);
    } catch (error) {
      console.error('Export to Word failed:', error);
      alert('Failed to export to Word. Please try again.');
    }
  };

  const handleExportPDF = () => {
    try {
      const data = getExportData();
      exportToPDF(data);
    } catch (error) {
      console.error('Export to PDF failed:', error);
      alert('Failed to export to PDF. Please try again.');
    }
  };

  const handleExportExcel = () => {
    try {
      const data = getExportData();
      exportToExcel(data);
    } catch (error) {
      console.error('Export to Excel failed:', error);
      alert('Failed to export to Excel. Please try again.');
    }
  };

  if (!simulationResult) {
    const hasNoResults = synchronizedResults.size === 0;

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg">
          {!hasNoResults ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Calculating results...</p>
              <p className="mt-2 text-sm text-gray-500">
                Processing {synchronizedResults.size} sub-function{synchronizedResults.size !== 1 ? 's' : ''}...
              </p>
            </>
          ) : (
            <>
              <div className="text-amber-600 mb-4">
                <Info className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Results Available</h3>
              <p className="text-gray-600 mb-6">
                Please go back to Step 5 (Review) and click "Calculate Results" to generate the simulation.
              </p>
              <button
                onClick={previousStep}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Go Back to Review
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MVO Results: {simulationResult.simulationName}
          </h1>
          <p className="text-gray-600">
            Planning Type: {planningTypeLabel} • Size of Operation: {sizeOfOperationLabel}
          </p>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-300 rounded-xl px-6 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6 text-teal-700" />
              <div>
                <div className="font-bold text-gray-900 mb-1">MVO Recommendation</div>
                <div className="text-sm text-gray-700">
                  {simulationResult.totalFte.toFixed(1)} FTE • ~{simulationResult.avgDurationDays} days Avg, {simulationResult.p90DurationDays} days P90 • {simulationResult.successRatePct.toFixed(1)}% success • RM {Math.round(simulationResult.avgMonthlyCostRm).toLocaleString()}/month
                </div>
              </div>
            </div>
            <Tooltip content="This is the Minimum Viable Organisation (MVO) recommendation calculated through Monte Carlo simulation. It represents the optimal balance between headcount, delivery time, cost, and risk based on your inputs." />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleExportWord}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <FileText className="w-4 h-4" />
            Export Word
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
          <button
            onClick={() => alert('Send via Email - Coming soon')}
            disabled={isSendingEmail}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:bg-gray-400"
          >
            <Mail className="w-4 h-4" />
            {isSendingEmail ? 'Sending...' : 'Send Report via Email'}
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Statistics</h2>
        <KPICards keyStats={simulationResult.keyStats} />

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <SubFunctionAccordion subFunctions={simulationResult.subFunctions} />
            <HeadcountComparisonTable
              subFunctions={simulationResult.subFunctions}
              combinedComparisonRows={simulationResult.combinedComparisonRows}
            />
          </div>

          <div className="lg:col-span-1">
            <SystemRoleCompositionPanel composition={simulationResult.systemRoleComposition} />

            <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">AI Summary for HR Decision-Making</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-0.5">•</span>
                  <div>
                    <strong>Staffing:</strong> The MVO analysis recommends {simulationResult.keyStats.mvoHeadcount} FTE, {Math.abs(simulationResult.keyStats.mvoHeadcount - simulationResult.keyStats.baselineHeadcount)} {simulationResult.keyStats.mvoHeadcount > simulationResult.keyStats.baselineHeadcount ? 'more' : 'fewer'} than the baseline.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-0.5">•</span>
                  <div>
                    <strong>Risk:</strong> The recommended configuration carries {simulationResult.keyStats.mvoFailureRiskPct < 10 ? 'low' : simulationResult.keyStats.mvoFailureRiskPct < 25 ? 'medium' : 'high'} risk ({simulationResult.keyStats.mvoFailureRiskPct.toFixed(1)}% failure rate).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold mt-0.5">•</span>
                  <div>
                    <strong>Next Steps:</strong> Review the system-suggested role composition and adjust based on internal salary structures. Consider the recommended strategies for each sub-function.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-700" />
            Understanding the Results
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong className="text-gray-900">Baseline vs MVO:</strong> Baseline reflects traditional Excel-style headcount calculation. MVO (Minimum Viable Operations) is the optimized headcount that balances cost, time, and risk based on Monte Carlo simulation.
            </div>
            <div>
              <strong className="text-gray-900">Reading the Comparison Table:</strong> Each row shows a different team size. The green highlighted row is the MVO recommendation that best balances delivery time, cost, and success rate.
            </div>
            <div>
              <strong className="text-gray-900">P-values (P50, P75, P90):</strong> These percentiles show delivery time confidence. P90 means 90% of scenarios finish on or before this duration. Higher percentiles account for delays and risk factors.
            </div>
            <div>
              <strong className="text-gray-900">Risk Categories:</strong> Low risk (&lt;10%) indicates high confidence. Medium risk (10-25%) suggests monitoring needed. High risk (&gt;25%) indicates potential delivery challenges.
            </div>
            <div>
              <strong className="text-gray-900">System-Suggested Roles:</strong> The role composition uses JLG salary bands and is a starting point. Adjust based on specific requirements, internal structures, and market conditions.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <p className="text-sm text-gray-600 text-center mb-4">
            Click <strong>Save & Complete Simulation</strong> to finalise this run and store it in <strong>My Simulations</strong> for future reference or duplication.
          </p>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={previousStep}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>

            <button
              onClick={handleNewSimulation}
              className="px-6 py-3 border-2 border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors font-medium"
            >
              New Simulation
            </button>

            <button
              onClick={handleSaveSimulation}
              disabled={isSaving || isSaved}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save & Complete Simulation'}
            </button>
          </div>
        </div>

        {showSaveSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Simulation saved successfully!
          </div>
        )}
      </div>
    </div>
  );
}
