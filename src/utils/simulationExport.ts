import jsPDF from 'jspdf';
import { SimulationHistory } from '../types/simulationHistory';

export async function exportSimulationToWord(simulation: SimulationHistory): Promise<void> {
  const content = generateSimulationReport(simulation);

  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_Report.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportSimulationToExcel(simulation: SimulationHistory): Promise<void> {
  const csvContent = generateCSVReport(simulation);

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_Report.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportSimulationToPDF(simulation: SimulationHistory): Promise<void> {
  const doc = new jsPDF();
  const results = simulation.result_payload;
  const inputs = simulation.input_payload;

  let yPos = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 20;

  const checkPageBreak = () => {
    if (yPos > pageHeight - marginBottom) {
      doc.addPage();
      yPos = 20;
    }
  };

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MVO Simulation Report', 105, yPos, { align: 'center' });
  yPos += lineHeight * 2;

  doc.setFontSize(14);
  doc.text(simulation.simulation_name, 105, yPos, { align: 'center' });
  yPos += lineHeight * 1.5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Created: ${new Date(simulation.created_at).toLocaleDateString()}`, 105, yPos, { align: 'center' });
  yPos += lineHeight * 2;

  checkPageBreak();
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Simulation Context', 20, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (simulation.business_area) {
    doc.text(`Business Area: ${simulation.business_area}`, 20, yPos);
    yPos += lineHeight;
  }

  if (simulation.planning_type) {
    doc.text(`Planning Type: ${simulation.planning_type}`, 20, yPos);
    yPos += lineHeight;
  }

  if (simulation.size_of_operation) {
    doc.text(`Size of Operation: ${simulation.size_of_operation}`, 20, yPos);
    yPos += lineHeight;
  }

  yPos += lineHeight;

  checkPageBreak();
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Results', 20, yPos);
  yPos += lineHeight * 1.5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (results) {
    doc.text(`Total FTE: ${simulation.total_fte || 'N/A'}`, 20, yPos);
    yPos += lineHeight;

    doc.text(`Monthly Cost: MYR ${(simulation.total_monthly_cost || 0).toLocaleString()}`, 20, yPos);
    yPos += lineHeight;

    doc.text(`Workload Score: ${simulation.workload_score || 'N/A'}`, 20, yPos);
    yPos += lineHeight * 1.5;

    if (results.subFunctions && Array.isArray(results.subFunctions)) {
      checkPageBreak();
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Sub-Function Breakdown', 20, yPos);
      yPos += lineHeight * 1.5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      results.subFunctions.forEach((sf: any) => {
        checkPageBreak();
        doc.setFont('helvetica', 'bold');
        doc.text(sf.name || 'Unknown Sub-Function', 20, yPos);
        yPos += lineHeight;

        doc.setFont('helvetica', 'normal');
        if (sf.recommendedFTE) {
          doc.text(`  Recommended FTE: ${sf.recommendedFTE.min}-${sf.recommendedFTE.max} (Target: ${sf.recommendedFTE.recommended})`, 20, yPos);
          yPos += lineHeight;
        }

        if (sf.currentHeadcount) {
          doc.text(`  Current Headcount: ${sf.currentHeadcount}`, 20, yPos);
          yPos += lineHeight;
        }

        yPos += lineHeight * 0.5;
      });
    }
  }

  yPos += lineHeight;
  checkPageBreak();
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Report generated from JLG MVO & Headcount Simulator', 105, yPos, { align: 'center' });

  doc.save(`${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`);
}

function generateSimulationReport(simulation: SimulationHistory): string {
  const results = simulation.result_payload;
  const inputs = simulation.input_payload;

  let content = `MVO SIMULATION REPORT\n\n`;
  content += `Simulation Name: ${simulation.simulation_name}\n`;
  content += `Created: ${new Date(simulation.created_at).toLocaleDateString()}\n\n`;

  content += `CONTEXT\n`;
  content += `Business Area: ${simulation.business_area || 'N/A'}\n`;
  content += `Planning Type: ${simulation.planning_type || 'N/A'}\n`;
  content += `Size of Operation: ${simulation.size_of_operation || 'N/A'}\n\n`;

  content += `SUMMARY RESULTS\n`;
  content += `Total FTE: ${simulation.total_fte || 'N/A'}\n`;
  content += `Monthly Cost: MYR ${(simulation.total_monthly_cost || 0).toLocaleString()}\n`;
  content += `Workload Score: ${simulation.workload_score || 'N/A'}\n\n`;

  if (results && results.subFunctions && Array.isArray(results.subFunctions)) {
    content += `SUB-FUNCTION BREAKDOWN\n\n`;
    results.subFunctions.forEach((sf: any) => {
      content += `${sf.name || 'Unknown'}\n`;
      if (sf.recommendedFTE) {
        content += `  Recommended FTE: ${sf.recommendedFTE.min}-${sf.recommendedFTE.max} (Target: ${sf.recommendedFTE.recommended})\n`;
      }
      if (sf.currentHeadcount) {
        content += `  Current Headcount: ${sf.currentHeadcount}\n`;
      }
      content += `\n`;
    });
  }

  content += `\n---\nReport generated from JLG MVO & Headcount Simulator\n`;

  return content;
}

function generateCSVReport(simulation: SimulationHistory): string {
  const results = simulation.result_payload;

  let csv = 'MVO Simulation Report\n\n';
  csv += `Simulation Name,${simulation.simulation_name}\n`;
  csv += `Created,${new Date(simulation.created_at).toLocaleDateString()}\n\n`;

  csv += 'Context\n';
  csv += `Business Area,${simulation.business_area || 'N/A'}\n`;
  csv += `Planning Type,${simulation.planning_type || 'N/A'}\n`;
  csv += `Size of Operation,${simulation.size_of_operation || 'N/A'}\n\n`;

  csv += 'Summary\n';
  csv += `Total FTE,${simulation.total_fte || 'N/A'}\n`;
  csv += `Monthly Cost,${simulation.total_monthly_cost || 0}\n`;
  csv += `Workload Score,${simulation.workload_score || 'N/A'}\n\n`;

  if (results && results.subFunctions && Array.isArray(results.subFunctions)) {
    csv += 'Sub-Function Breakdown\n';
    csv += 'Name,Min FTE,Max FTE,Target FTE,Current Headcount\n';

    results.subFunctions.forEach((sf: any) => {
      const minFTE = sf.recommendedFTE?.min || 'N/A';
      const maxFTE = sf.recommendedFTE?.max || 'N/A';
      const targetFTE = sf.recommendedFTE?.recommended || 'N/A';
      const current = sf.currentHeadcount || 'N/A';

      csv += `${sf.name || 'Unknown'},${minFTE},${maxFTE},${targetFTE},${current}\n`;
    });
  }

  return csv;
}
