import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Mail, FileDown, FileText, FileSpreadsheet, HelpCircle, Shield, Info, Check } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { useAuth } from '../../contexts/AuthContext';
import { WizardNavigation } from './WizardNavigation';
import { MVOResults } from '../MVOResults';
import { RoleCompositionDisplay } from '../RoleCompositionDisplay';
import jsPDF from 'jspdf';
import { serializeReportData } from '../../utils/reportSerializer';
import { sendReportToPowerAutomate } from '../../utils/powerAutomateService';
import { getWorkTypeCoefficients } from '../../data/workTypeCoefficients';
import { fetchAllStaffTypes } from '../../services/staffTypeService';
import { generateOverallRoleComposition, OverallRoleComposition } from '../../utils/overallRoleComposition';
import { MvoReportLayout } from '../MvoReportLayout';
import { renderToStaticMarkup } from 'react-dom/server';
import { planningTypeConfig, sizeOfOperationConfig } from '../../types/planningConfig';
import { buildFinancialSummary, formatCurrency } from '../../utils/financialSummary';
import { simulationHistoryService } from '../../services/simulationHistoryService';

function formatHeadcount(value: number): string {
  return value === 1 ? '1 person' : `${value} persons`;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700"
        type="button"
      >
        {children}
        <HelpCircle className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute z-50 w-80 p-4 bg-gray-900 text-white text-sm rounded-lg shadow-lg -top-2 left-full ml-2">
          <div className="whitespace-pre-line">{content}</div>
        </div>
      )}
    </div>
  );
}

export function Step6ResultsSynchronized() {
  const { state, previousStep, reset, synchronizedResults, duplicateSimulationId } = useWizard();
  const { simulationInputs, subFunctions } = state;
  const { user } = useAuth();

  const [expandedSubFunction, setExpandedSubFunction] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [baselineComposition, setBaselineComposition] = useState<OverallRoleComposition | null>(null);
  const [mvoComposition, setMvoComposition] = useState<OverallRoleComposition | null>(null);
  const [showFullExplanation, setShowFullExplanation] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  React.useEffect(() => {
    const calculateOverallCompositions = async () => {
      try {
        const staffTypes = await fetchAllStaffTypes();

        const baselineFte = Array.from(synchronizedResults.values()).reduce(
          (sum, result: any) => sum + (result.mvo?.baselineHeadcount || 0),
          0
        );

        const mvoFte = Array.from(synchronizedResults.values()).reduce(
          (sum, result: any) => sum + (result.mvo?.recommendedHeadcount || 0),
          0
        );

        const baselineComp = generateOverallRoleComposition(baselineFte, staffTypes);
        const mvoComp = generateOverallRoleComposition(mvoFte, staffTypes);

        setBaselineComposition(baselineComp);
        setMvoComposition(mvoComp);
      } catch (error) {
        console.error('Error calculating overall compositions:', error);
      }
    };

    if (synchronizedResults.size > 0) {
      calculateOverallCompositions();
    }
  }, [synchronizedResults]);

  const handleSendReportViaEmail = async () => {
    if (!user) {
      alert('You must be logged in to send reports');
      return;
    }

    const userEmail = user.email || '';

    setIsSendingEmail(true);

    try {
      const reportData = serializeReportData(
        simulationInputs,
        subFunctions,
        synchronizedResults,
        userEmail
      );

      const result = await sendReportToPowerAutomate(reportData);

      if (result.success) {
        alert(result.message || 'Report successfully sent and saved to SharePoint');
      } else {
        alert(result.error || 'Failed to send report. Please try again or contact admin');
      }
    } catch (error) {
      console.error('Error sending report:', error);
      alert('Failed to send report. Please try again or contact admin');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSaveSimulation = async () => {
    if (!user) {
      alert('You must be logged in to save simulations');
      return;
    }

    if (isSaved) {
      return;
    }

    setIsSaving(true);

    try {
      const totalFte = Array.from(synchronizedResults.values()).reduce(
        (sum, result: any) => sum + (result.mvo?.recommendedHeadcount || 0),
        0
      );

      const totalMonthlyCost = Array.from(synchronizedResults.values()).reduce(
        (sum, result: any) => sum + (result.mvo?.selectedResult?.avgCost || 0),
        0
      );

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
        baselineComposition,
        mvoComposition,
        totalBaseline,
        totalMVO,
        financialSummary
      };

      if (duplicateSimulationId) {
        await simulationHistoryService.updateSimulation(duplicateSimulationId, {
          simulation_name: simulationInputs.simulationName || 'Untitled Simulation',
          business_area: simulationInputs.businessArea || 'Not specified',
          planning_type: simulationInputs.planningTypeKey || 'new_function',
          size_of_operation: simulationInputs.sizeOfOperationKey || 'medium',
          workload_score: Math.round(workloadScore),
          total_fte: totalFte,
          total_monthly_cost: totalMonthlyCost,
          input_payload: inputPayload,
          result_payload: resultPayload
        });
      } else {
        await simulationHistoryService.saveSimulation({
          user_id: user.id,
          simulation_id: crypto.randomUUID(),
          simulation_name: simulationInputs.simulationName || 'Untitled Simulation',
          business_area: simulationInputs.businessArea || 'Not specified',
          planning_type: simulationInputs.planningTypeKey || 'new_function',
          size_of_operation: simulationInputs.sizeOfOperationKey || 'medium',
          workload_score: Math.round(workloadScore),
          total_fte: totalFte,
          total_monthly_cost: totalMonthlyCost,
          input_payload: inputPayload,
          result_payload: resultPayload
        });
      }

      setIsSaved(true);
      setShowSaveSuccess(true);

      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error saving simulation:', error);
      alert('We couldn\'t save this simulation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadWord = () => {
    const reportHtml = renderToStaticMarkup(
      <MvoReportLayout
        simulationInputs={simulationInputs}
        subFunctions={subFunctions}
        synchronizedResults={synchronizedResults}
        totalBaseline={totalBaseline}
        totalMVO={totalMVO}
        baselineComposition={baselineComposition}
        mvoComposition={mvoComposition}
        financialSummary={financialSummary}
        forPrint={true}
      />
    );

    const htmlContent = `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:w="urn:schemas-microsoft-com:office:word"
xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="ProgId" content="Word.Document">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #2c3e50; margin: 20px; }
    .max-w-7xl { max-width: 1200px; margin: 0 auto; }
    .bg-white { background: white; }
    .rounded-lg { border-radius: 8px; }
    .shadow-md { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .p-8 { padding: 32px; }
    .p-6 { padding: 24px; }
    .p-4 { padding: 16px; }
    .mb-6 { margin-bottom: 24px; }
    .mb-8 { margin-bottom: 32px; }
    .mb-4 { margin-bottom: 16px; }
    .mb-3 { margin-bottom: 12px; }
    .mb-2 { margin-bottom: 8px; }
    .mt-8 { margin-top: 32px; }
    .mt-3 { margin-top: 12px; }
    .mt-2 { margin-top: 8px; }
    .text-2xl { font-size: 24pt; }
    .text-lg { font-size: 14pt; }
    .text-sm { font-size: 10pt; }
    .text-xs { font-size: 9pt; }
    .text-4xl { font-size: 32pt; }
    .font-bold { font-weight: bold; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .text-gray-900 { color: #1a202c; }
    .text-gray-700 { color: #4a5568; }
    .text-gray-600 { color: #718096; }
    .text-blue-700 { color: #2c5282; }
    .text-blue-600 { color: #3182ce; }
    .text-blue-900 { color: #1a365d; }
    .text-blue-800 { color: #2c5282; }
    .text-teal-700 { color: #0d9488; }
    .text-teal-600 { color: #14b8a6; }
    .text-teal-900 { color: #134e4a; }
    .text-teal-800 { color: #0f766e; }
    .text-green-800 { color: #166534; }
    .text-yellow-800 { color: #854d0e; }
    .text-red-800 { color: #991b1b; }
    .bg-gray-50 { background: #f9fafb; }
    .bg-blue-50 { background: #eff6ff; }
    .bg-teal-50 { background: #f0fdfa; }
    .bg-blue-100 { background: #dbeafe; }
    .bg-teal-100 { background: #ccfbf1; }
    .bg-green-100 { background: #dcfce7; }
    .bg-yellow-100 { background: #fef3c7; }
    .bg-red-100 { background: #fee2e2; }
    .border { border: 1px solid; }
    .border-2 { border: 2px solid; }
    .border-gray-200 { border-color: #e5e7eb; }
    .border-gray-300 { border-color: #d1d5db; }
    .border-blue-200 { border-color: #bfdbfe; }
    .border-blue-300 { border-color: #93c5fd; }
    .border-teal-200 { border-color: #99f6e4; }
    .border-teal-300 { border-color: #5eead4; }
    .border-t { border-top: 1px solid; }
    .rounded-full { border-radius: 9999px; }
    .inline-block { display: inline-block; }
    .px-4 { padding-left: 16px; padding-right: 16px; }
    .py-2 { padding-top: 8px; padding-bottom: 8px; }
    .px-3 { padding-left: 12px; padding-right: 12px; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .pt-3 { padding-top: 12px; }
    .space-y-2 > * + * { margin-top: 8px; }
    .space-y-3 > * + * { margin-top: 12px; }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
    .gap-6 { gap: 24px; }
    .flex { display: flex; }
    .flex-wrap { flex-wrap: wrap; }
    .items-start { align-items: flex-start; }
    .items-center { align-items: center; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
    .bg-gradient-to-r { background: linear-gradient(to right, #eff6ff, #f0fdfa); }
    ul { list-style: none; padding: 0; margin: 0; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  ${reportHtml}
  <div style="margin-top: 32px; padding-top: 16px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 9pt; color: #6b7280;">
    Generated by JLG Group – Internal Workforce Planning Tool (Confidential) – ${new Date().toLocaleString()}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mvo-report-${simulationInputs.simulationName.replace(/\s+/g, '-')}.doc`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalBaseline = Array.from(synchronizedResults.values()).reduce(
    (sum, result: any) => sum + (result.mvo?.baselineHeadcount || 0),
    0
  );

  const totalMVO = Array.from(synchronizedResults.values()).reduce(
    (sum, result: any) => sum + (result.mvo?.recommendedHeadcount || 0),
    0
  );

  const baselineMonthlyCost = Array.from(synchronizedResults.values()).reduce(
    (sum, result: any) => {
      const mvo = result.mvo;
      if (!mvo) return sum;
      const baselineResult = mvo.testResults?.find((r: any) => r.headcount === mvo.baselineHeadcount);
      return sum + (baselineResult?.avgCost || 0);
    },
    0
  );

  const mvoMonthlyCost = Array.from(synchronizedResults.values()).reduce(
    (sum, result: any) => sum + (result.mvo?.selectedResult?.avgCost || 0),
    0
  );

  const currentMonthlyCost = simulationInputs.currentMonthlyCost || undefined;

  const financialSummary = simulationInputs.planningTypeKey
    ? buildFinancialSummary(
        {
          baselineFte: totalBaseline,
          mvoFte: totalMVO,
          currentFte: simulationInputs.existingHeadcount,
          baselineMonthlyCost,
          mvoMonthlyCost,
          currentMonthlyCost,
          projectDurationMonths: simulationInputs.projectLength,
        },
        planningTypeConfig[simulationInputs.planningTypeKey]
      )
    : null;


  const handleDownloadPDF = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '1200px';
    tempDiv.style.background = 'white';
    document.body.appendChild(tempDiv);

    const root = document.createElement('div');
    tempDiv.appendChild(root);

    const { createRoot } = await import('react-dom/client');
    const reactRoot = createRoot(root);
    
    await new Promise<void>((resolve) => {
      reactRoot.render(
        <MvoReportLayout
          simulationInputs={simulationInputs}
          subFunctions={subFunctions}
          synchronizedResults={synchronizedResults}
          totalBaseline={totalBaseline}
          totalMVO={totalMVO}
          baselineComposition={baselineComposition}
          mvoComposition={mvoComposition}
          financialSummary={financialSummary}
          forPrint={true}
        />
      );
      setTimeout(resolve, 500);
    });

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(root, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`mvo-report-${simulationInputs.simulationName.replace(/\s+/g, '-')}.pdf`);
    } finally {
      reactRoot.unmount();
      document.body.removeChild(tempDiv);
    }
  };

  const handleDownloadExcel = () => {
    const escapeCSV = (value: string | number | undefined): string => {
      if (value === undefined || value === null || value === '') return '-';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csvContent = '';
    csvContent += 'MVO Results Report\n';
    csvContent += `${simulationInputs.simulationName}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    const firstResult = Array.from(synchronizedResults.values())[0] as any;
    if (firstResult && firstResult.mvo) {
      const mvo = firstResult.mvo;
      const selectedResult = mvo.selectedResult;
      const recommendedFte = mvo.recommendedHeadcount;
      const avgDuration = Math.round(selectedResult.avgDuration);
      const p90Duration = Math.round(selectedResult.p90Duration);
      const successPercent = Math.round(selectedResult.deadlineMetProbability);
      const monthlyCost = Math.round(selectedResult.avgCost / 1000);

      csvContent += `Recommended: ${recommendedFte} FTE – ~${avgDuration} days Avg${','} ${p90Duration} days P90${','} ${successPercent}% success${','} ~RM ${monthlyCost}k/month\n\n`;
    }

    csvContent += 'Report Metadata\n';
    csvContent += `Simulation Name,${escapeCSV(simulationInputs.simulationName)}\n`;
    csvContent += `Planning Type,${escapeCSV(simulationInputs.planningType)}\n`;
    if (simulationInputs.mainFunction) csvContent += `Function,${escapeCSV(simulationInputs.mainFunction)}\n`;
    if (simulationInputs.planningHorizon) csvContent += `Horizon,${escapeCSV(simulationInputs.planningHorizon)}\n`;
    if (simulationInputs.sizeOfOperation) csvContent += `Size,${escapeCSV(simulationInputs.sizeOfOperation)}\n`;
    if (simulationInputs.currency) csvContent += `Currency,${escapeCSV(simulationInputs.currency)}\n`;
    csvContent += `Risk Tolerance,${escapeCSV(simulationInputs.riskTolerance || 'medium')}\n\n`;

    if (financialSummary) {
      csvContent += `${financialSummary.sectionTitle}\n`;
      if (financialSummary.projectDurationMonths != null) {
        csvContent += `Project Duration,${financialSummary.projectDurationMonths} months\n`;
      }
      if (financialSummary.mvoProjectCost != null) {
        csvContent += `MVO Project Cost,${formatCurrency(financialSummary.mvoProjectCost)}\n`;
        if (financialSummary.baselineProjectCost != null) {
          csvContent += `Baseline Project Cost,${formatCurrency(financialSummary.baselineProjectCost)}\n`;
        }
      }
      if (financialSummary.mvoAnnualCost != null) {
        csvContent += `MVO Monthly Cost,${formatCurrency(financialSummary.mvoMonthlyCost)}\n`;
        csvContent += `MVO Annual Cost,${formatCurrency(financialSummary.mvoAnnualCost)}\n`;
        if (financialSummary.baselineAnnualCost != null) {
          csvContent += `Baseline Monthly Cost,${formatCurrency(financialSummary.baselineMonthlyCost || 0)}\n`;
          csvContent += `Baseline Annual Cost,${formatCurrency(financialSummary.baselineAnnualCost)}\n`;
        }
      }
      if (financialSummary.monthlySavings != null) {
        csvContent += `Current Monthly Cost,${formatCurrency(financialSummary.currentMonthlyCost || 0)}\n`;
        csvContent += `Recommended MVO Monthly Cost,${formatCurrency(financialSummary.mvoMonthlyCost)}\n`;
        csvContent += `Estimated Monthly Savings,${formatCurrency(financialSummary.monthlySavings)}\n`;
        if (financialSummary.monthlySavingsPercent != null) {
          csvContent += `Monthly Savings Percent,${financialSummary.monthlySavingsPercent.toFixed(1)}%\n`;
        }
        if (financialSummary.annualSavings != null) {
          csvContent += `Estimated Annual Savings,${formatCurrency(financialSummary.annualSavings)}\n`;
        }
      }
      csvContent += '\n';
    }

    csvContent += 'Combined Summary - All Sub-Functions\n';
    csvContent += `,Headcount,Description\n`;
    csvContent += `📌 Baseline Headcount (Excel-style),${formatHeadcount(totalBaseline)},"Calculated using a simple workload÷capacity formula with minimal risk buffer (similar to traditional Excel calculations)."\n`;
    csvContent += `✅ MVO Recommended Headcount,${formatHeadcount(totalMVO)},"Minimum viable headcount for very high confidence (≥ 95%)${','} after applying risk${','} variability and governance safeguards."\n\n`;

    csvContent += `Sub-Function Breakdown (${subFunctions.length})\n`;
    csvContent += 'Sub-Function,Baseline,MVO,Risk Level\n';

    subFunctions.forEach((sf) => {
      const result = synchronizedResults.get(sf.id);
      if (result) {
        const mvoData = (result as any).mvo;
        const riskLevel = (mvoData?.selectedResult?.riskLevel || 'medium').toUpperCase();

        csvContent += `${escapeCSV(sf.name)},`;
        csvContent += `${formatHeadcount(mvoData?.baselineHeadcount || 0)},`;
        csvContent += `${formatHeadcount(mvoData?.recommendedHeadcount || 0)},`;
        csvContent += `${riskLevel} RISK\n`;
      }
    });

    csvContent += '\n\nDetailed Headcount Comparison Tables\n\n';

    subFunctions.forEach((sf, index) => {
      const result = synchronizedResults.get(sf.id);
      if (result) {
        const mvoData = (result as any).mvo;
        const testResults = mvoData?.testResults || [];

        csvContent += `${index + 1}. ${sf.name.toUpperCase()}\n`;
        csvContent += 'HC,Avg Dur (days),P90 Dur (days),Avg Cost (RM),Success %,Risk %,Status\n';

        testResults.forEach((tr: any) => {
          const isBaseline = tr.headcount === mvoData?.baselineHeadcount;
          const isMVO = tr.headcount === mvoData?.recommendedHeadcount;
          const status = tr.rejected ? 'Rejected' : isMVO ? 'MVO' : isBaseline ? 'Baseline' : 'Valid';

          csvContent += `${tr.headcount},`;
          csvContent += `${tr.avgDuration?.toFixed(0)},`;
          csvContent += `${tr.p90Duration?.toFixed(0)},`;
          csvContent += `${Math.round(tr.avgCost / 1000)}k,`;
          csvContent += `${tr.deadlineMetProbability?.toFixed(0)}%,`;
          csvContent += `${tr.failureRisk?.toFixed(1)}%,`;
          csvContent += `${status}\n`;
        });

        csvContent += '\n';
      }
    });

    csvContent += '\nUnderstanding the Results\n';
    csvContent += 'Concept,Explanation\n';
    csvContent += 'Baseline Headcount (Excel-style),"Traditional calculation with NO risk buffer. Assumes perfect conditions with no absences${','} turnover${','} or productivity variance."\n';
    csvContent += 'MVO Recommended Headcount,"MINIMUM headcount that achieves very high confidence (≥ 95%). Accounts for real-world variability${','} risk factors and governance safeguards through Monte Carlo simulation."\n';
    csvContent += 'How to read the comparison table,"The simulator tests different team sizes and shows their average & P90 duration${','} cost and risk. The MVO recommendation is the lowest headcount that meets your risk and deadline criteria. Other rows may still be feasible but with tighter utilisation or lower buffer."\n';
    csvContent += 'P90 Duration,"90% of simulation runs finished on or before this duration. It\'s safer than the average because it includes bad days and variability."\n';
    csvContent += '\nGenerated by JLG Group – Internal Workforce Planning Tool (Confidential) – ' + new Date().toLocaleString() + '\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mvo-report-${simulationInputs.simulationName.replace(/\s+/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            MVO Results: {simulationInputs.simulationName}
          </h2>
          {(() => {
            const firstResult = Array.from(synchronizedResults.values())[0] as any;
            if (firstResult && firstResult.mvo) {
              const mvo = firstResult.mvo;
              const selectedResult = mvo.selectedResult;
              const recommendedFte = mvo.recommendedHeadcount;
              const avgDuration = Math.round(selectedResult.avgDuration);
              const p90Duration = Math.round(selectedResult.p90Duration);
              const successPercent = Math.round(selectedResult.deadlineMetProbability);
              const monthlyCost = Math.round(selectedResult.avgCost / 1000);

              return (
                <p className="text-gray-700 text-sm bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 inline-block">
                  <strong>Recommended:</strong> {recommendedFte} FTE – ~{avgDuration} days Avg, {p90Duration} days P90, {successPercent}% success, ~RM {monthlyCost}k/month
                </p>
              );
            }
            return null;
          })()}
        </div>

        {simulationInputs.planningTypeKey && simulationInputs.sizeOfOperationKey && (
          <div className="mb-6 border border-blue-200 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Planning Assumptions
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="font-semibold text-gray-900">
                  Planning Type: {planningTypeConfig[simulationInputs.planningTypeKey].label}
                </div>
                <div className="text-gray-700 italic">
                  {planningTypeConfig[simulationInputs.planningTypeKey].description}
                </div>
                <div className="text-gray-600 mt-1 text-xs">
                  {(() => {
                    const ptConfig = planningTypeConfig[simulationInputs.planningTypeKey];
                    if (ptConfig.overheadFactor) {
                      return `Includes ${((ptConfig.overheadFactor - 1) * 100).toFixed(0)}% leadership/coordination overhead on top of function-level MVO.`;
                    } else if (ptConfig.minHeadcountMode === 'reduction' && ptConfig.maxReductionPercent) {
                      return `Starts from current FTE and explores safe reductions within a ${(ptConfig.maxReductionPercent * 100).toFixed(0)}% cap.`;
                    } else if (ptConfig.minHeadcountMode === 'governed') {
                      return 'Model tuned for steady-state operations with governance-based minimum headcount.';
                    } else if (ptConfig.minHeadcountMode === 'lean') {
                      return 'Model tuned for short-term, higher-uncertainty work with a lean minimum team.';
                    }
                    return '';
                  })()}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Size of Operation: {sizeOfOperationConfig[simulationInputs.sizeOfOperationKey].label}
                </div>
                <div className="text-gray-700 italic">
                  {sizeOfOperationConfig[simulationInputs.sizeOfOperationKey].description}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-end mb-6">
            <button
              onClick={handleSendReportViaEmail}
              disabled={isSendingEmail}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              {isSendingEmail ? 'Sending...' : 'Send Report via Email'}
            </button>
            <button
              onClick={handleDownloadWord}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Word
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <FileDown className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>

        {financialSummary && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {financialSummary.sectionTitle}
            </h3>
            <div className="space-y-3">
              {financialSummary.projectDurationMonths != null && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-gray-600 mb-2">Estimated Project Duration</div>
                  <div className="text-2xl font-bold text-gray-900">{financialSummary.projectDurationMonths} months</div>
                </div>
              )}

              {financialSummary.mvoProjectCost != null && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-teal-300">
                    <div className="text-sm text-teal-700 mb-1">MVO Project Cost</div>
                    <div className="text-2xl font-bold text-teal-900">{formatCurrency(financialSummary.mvoProjectCost)}</div>
                    <div className="text-xs text-gray-600 mt-1">{formatCurrency(financialSummary.mvoMonthlyCost)}/month × {financialSummary.projectDurationMonths} months</div>
                  </div>
                  {financialSummary.baselineProjectCost != null && (
                    <div className="bg-white rounded-lg p-4 border border-blue-300">
                      <div className="text-sm text-blue-700 mb-1">Baseline Project Cost</div>
                      <div className="text-2xl font-bold text-blue-900">{formatCurrency(financialSummary.baselineProjectCost)}</div>
                      <div className="text-xs text-gray-600 mt-1">{formatCurrency(financialSummary.baselineMonthlyCost || 0)}/month × {financialSummary.projectDurationMonths} months</div>
                    </div>
                  )}
                </div>
              )}

              {financialSummary.mvoAnnualCost != null && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-teal-300">
                    <div className="text-sm text-teal-700 mb-1">MVO Monthly Cost</div>
                    <div className="text-2xl font-bold text-teal-900">{formatCurrency(financialSummary.mvoMonthlyCost)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-teal-300">
                    <div className="text-sm text-teal-700 mb-1">MVO Annual Cost</div>
                    <div className="text-2xl font-bold text-teal-900">{formatCurrency(financialSummary.mvoAnnualCost)}</div>
                    <div className="text-xs text-gray-600 mt-1">{formatCurrency(financialSummary.mvoMonthlyCost)} × 12 months</div>
                  </div>
                </div>
              )}

              {financialSummary.baselineAnnualCost != null && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <div className="text-sm text-blue-700 mb-1">Baseline Monthly Cost</div>
                    <div className="text-2xl font-bold text-blue-900">{formatCurrency(financialSummary.baselineMonthlyCost || 0)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-300">
                    <div className="text-sm text-blue-700 mb-1">Baseline Annual Cost</div>
                    <div className="text-2xl font-bold text-blue-900">{formatCurrency(financialSummary.baselineAnnualCost)}</div>
                    <div className="text-xs text-gray-600 mt-1">{formatCurrency(financialSummary.baselineMonthlyCost || 0)} × 12 months</div>
                  </div>
                </div>
              )}

              {financialSummary.monthlySavings != null && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-300">
                      <div className="text-sm text-gray-600 mb-1">Current Monthly Cost</div>
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(financialSummary.currentMonthlyCost || 0)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-teal-300">
                      <div className="text-sm text-teal-700 mb-1">Recommended MVO Monthly Cost</div>
                      <div className="text-2xl font-bold text-teal-900">{formatCurrency(financialSummary.mvoMonthlyCost)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-green-400">
                      <div className="text-sm text-green-700 mb-1">Estimated Monthly Savings</div>
                      <div className="text-3xl font-bold text-green-900">{formatCurrency(financialSummary.monthlySavings)}</div>
                      {financialSummary.monthlySavingsPercent != null && (
                        <div className="text-sm text-green-700 mt-1">({financialSummary.monthlySavingsPercent.toFixed(1)}% reduction)</div>
                      )}
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-green-400">
                      <div className="text-sm text-green-700 mb-1">Estimated Annual Savings</div>
                      <div className="text-3xl font-bold text-green-900">{formatCurrency(financialSummary.annualSavings || 0)}</div>
                      <div className="text-xs text-gray-600 mt-1">{formatCurrency(financialSummary.monthlySavings)} × 12 months</div>
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
              <div className="text-xs text-blue-600 mt-2">Calculated using a simple workload÷capacity formula with minimal risk buffer (similar to traditional Excel calculations).</div>
              {baselineComposition && (
                <div className="text-xs text-gray-600 mt-3 pt-3 border-t border-blue-200">
                  <span className="font-medium text-gray-700">Suggested mix:</span>{' '}
                  {baselineComposition.pattern.map((p, idx) => (
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
                <Tooltip content="What does this mean?\n\nThis is the Minimum Viable Organisation (MVO) for this work – the leanest headcount needed to deliver the work safely and reliably.\n\nIt combines:\n• Your workload inputs (volume, complexity, productivity)\n• Variability (good days vs bad days)\n• Risk factors (absenteeism, turnover, system issues)\n• Governance safeguards (coverage, maker–checker, safety)\n\nThe number is rounded up to avoid under-estimation.">
                  <span className="sr-only">Info</span>
                </Tooltip>
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
                  {mvoComposition.pattern.map((p, idx) => (
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
          <div className="space-y-4">
            {subFunctions.map(sf => {
              const result = synchronizedResults.get(sf.id);
              if (!result) return null;

              const isExpanded = expandedSubFunction === sf.id;

              return (
                <div key={sf.id} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() =>
                      setExpandedSubFunction(isExpanded ? null : sf.id)
                    }
                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 text-lg">{sf.name}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      {sf.workTypeId && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-medium text-xs">
                          {getWorkTypeCoefficients(sf.workTypeId)?.name || 'Unknown Work Type'}
                        </span>
                      )}
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                        Baseline: {formatHeadcount((result as any).mvo?.baselineHeadcount || 0)}
                      </span>
                      <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full font-medium">
                        MVO: {formatHeadcount((result as any).mvo?.recommendedHeadcount || 0)}
                      </span>
                      <span
                        className={`
                          px-3 py-1 rounded-full font-medium text-xs
                          ${
                            (result as any).mvo?.selectedResult.riskLevel === 'low'
                              ? 'bg-green-100 text-green-800'
                              : (result as any).mvo?.selectedResult.riskLevel === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        `}
                      >
                        {((result as any).mvo?.selectedResult.riskLevel || 'medium').toUpperCase()} RISK
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-6 bg-white border-t-2 border-gray-200 space-y-6">
                      <MVOResults
                        mvoResult={(result as any).mvo}
                        subFunctionName={sf.name}
                        workTypeId={sf.workTypeId}
                        sizeOfOperation={simulationInputs.sizeOfOperation}
                      />

                      {sf.suggestedRoleComposition && (
                        <RoleCompositionDisplay
                          suggestedComposition={sf.suggestedRoleComposition}
                          userConfiguration={sf.staffConfiguration}
                          staffTypes={[]}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
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

      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="hidden md:flex items-center justify-between gap-3">
          <button
            onClick={previousStep}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back
          </button>

          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            New Simulation
          </button>

          <button
            onClick={handleSaveSimulation}
            disabled={isSaving || isSaved}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isSaved
                ? 'bg-green-600 text-white cursor-default'
                : isSaving
                ? 'bg-teal-400 text-white cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            <Check className="w-5 h-5" />
            {isSaved ? 'Saved to My Simulations' : isSaving ? 'Saving...' : 'Save & Complete Simulation'}
          </button>
        </div>

        <div className="flex md:hidden flex-col gap-3">
          <button
            onClick={handleSaveSimulation}
            disabled={isSaving || isSaved}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isSaved
                ? 'bg-green-600 text-white cursor-default'
                : isSaving
                ? 'bg-teal-400 text-white cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
          >
            <Check className="w-5 h-5" />
            {isSaved ? 'Saved to My Simulations' : isSaving ? 'Saving...' : 'Save & Complete Simulation'}
          </button>

          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            New Simulation
          </button>

          <button
            onClick={previousStep}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Back
          </button>
        </div>

        <p className="text-sm text-gray-600 text-center mt-4">
          Saved simulations will appear in My Simulations, and as an admin you can also see them under All Simulations.
        </p>
      </div>

      {showSaveSuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in">
          <Check className="w-5 h-5" />
          <div>
            <div className="font-semibold">Simulation saved to My Simulations</div>
            <div className="text-sm text-green-100">You can view, duplicate, and download reports from there.</div>
          </div>
        </div>
      )}

    </div>
  );
}
