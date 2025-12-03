import jsPDF from 'jspdf';

export async function generatePDF(simulation: any): Promise<void> {
  try {
    const pdf = new jsPDF();
    let yPos = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    const checkPageBreak = (additionalHeight: number = 20) => {
      if (yPos + additionalHeight > pageHeight - 20) {
        pdf.addPage();
        yPos = 20;
      }
    };

    const scenario = simulation.scenarios?.[simulation.selected_scenario_type];
    const pc = simulation.inputs?.planningContext;

    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text(`MVO Results: ${simulation.simulation_name}`, margin, yPos);
    yPos += 10;

    if (scenario) {
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(margin, yPos, contentWidth, 14, 2, 2, 'F');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const recommendedText = `Recommended: ${scenario.totalFte?.toFixed(0) || 'N/A'} FTE ~ ${scenario.totalCost ? `RM ${(scenario.totalCost / 1000).toFixed(0)}k/month` : 'N/A'}`;
      pdf.text(recommendedText, margin + 5, yPos + 9);
      yPos += 22;
    }

    checkPageBreak(80);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Combined Summary - All Sub-Functions', margin, yPos);
    yPos += 10;

    const boxHeight = 45;
    const boxWidth = (contentWidth - 10) / 2;

    pdf.setFillColor(235, 245, 255);
    pdf.setDrawColor(100, 180, 255);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, yPos, boxWidth, boxHeight, 3, 3, 'FD');

    pdf.setFillColor(235, 255, 245);
    pdf.setDrawColor(100, 220, 180);
    pdf.roundedRect(margin + boxWidth + 10, yPos, boxWidth, boxHeight, 3, 3, 'FD');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 120, 200);
    pdf.text('Baseline Headcount (Excel-style)', margin + 5, yPos + 8);

    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 80, 180);
    const baselineFte = pc?.headcountTarget || scenario?.totalFte || 0;
    pdf.text(`${baselineFte.toFixed(0)} person`, margin + 5, yPos + 22);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 120, 200);
    const baselineDesc = 'Calculated using a simple workload+capacity formula with minimal risk buffer.';
    const splitBaseline = pdf.splitTextToSize(baselineDesc, boxWidth - 10);
    pdf.text(splitBaseline, margin + 5, yPos + 30);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 180, 140);
    pdf.text('MVO Recommended Headcount', margin + boxWidth + 15, yPos + 8);

    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 140, 100);
    const mvoFte = scenario?.totalFte || 0;
    pdf.text(`${mvoFte.toFixed(0)} person`, margin + boxWidth + 15, yPos + 22);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 180, 140);
    const mvoDesc = 'Minimum viable headcount for very high confidence (≥ 95%), after applying risk, variability and governance safeguards.';
    const splitMvo = pdf.splitTextToSize(mvoDesc, boxWidth - 10);
    pdf.text(splitMvo, margin + boxWidth + 15, yPos + 30);

    yPos += boxHeight + 15;

    checkPageBreak(60);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Sub-Function Breakdown', margin, yPos);
    yPos += 10;

    if (simulation.inputs?.subFunctions && simulation.inputs.subFunctions.length > 0) {
      simulation.inputs.subFunctions.forEach((sf: any, index: number) => {
        checkPageBreak(30);

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(sf.name || `Sub-Function ${index + 1}`, margin, yPos);
        yPos += 8;

        const sfFte = scenario?.totalFte ? (scenario.totalFte / simulation.inputs.subFunctions.length) : 0;

        pdf.setFillColor(230, 240, 255);
        pdf.roundedRect(margin, yPos, 60, 10, 2, 2, 'F');
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 100, 200);
        pdf.text(`Baseline: ${sfFte.toFixed(1)} person`, margin + 3, yPos + 7);

        pdf.setFillColor(220, 250, 235);
        pdf.roundedRect(margin + 65, yPos, 60, 10, 2, 2, 'F');
        pdf.setTextColor(40, 150, 100);
        pdf.text(`MVO: ${sfFte.toFixed(1)} person`, margin + 68, yPos + 7);

        pdf.setFillColor(220, 245, 220);
        pdf.roundedRect(margin + 130, yPos, 35, 10, 2, 2, 'F');
        pdf.setTextColor(80, 150, 80);
        pdf.setFontSize(8);
        pdf.text('LOW RISK', margin + 135, yPos + 7);

        yPos += 18;
      });
    }

    checkPageBreak(80);
    pdf.setFillColor(240, 245, 250);
    pdf.roundedRect(margin, yPos, contentWidth, 60, 3, 3, 'F');

    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 80, 150);
    pdf.text('Understanding the Results', margin + 5, yPos + 10);
    yPos += 18;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);

    const explanations = [
      {
        label: 'Baseline Headcount (Excel-style)',
        text: 'is the traditional calculation with NO risk buffer. It assumes perfect conditions with no absences, turnover, or productivity variance.'
      },
      {
        label: 'MVO Recommended Headcount',
        text: 'is the MINIMUM headcount that achieves very high confidence (≥ 95%). This accounts for real-world variability, risk factors and governance safeguards through Monte Carlo simulation.'
      },
      {
        label: 'P90 Duration',
        text: 'means 90% of simulation runs finished on or before this duration. It\'s safer than the average because it includes bad days and variability.'
      }
    ];

    explanations.forEach((item) => {
      checkPageBreak(15);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`• ${item.label}`, margin + 5, yPos);
      pdf.setFont('helvetica', 'normal');
      const wrappedText = pdf.splitTextToSize(item.text, contentWidth - 15);
      pdf.text(wrappedText, margin + 8, yPos + 4);
      yPos += 4 + (wrappedText.length * 4);
    });

    yPos += 10;

    if (scenario?.roleBreakdown && scenario.roleBreakdown.length > 0) {
      checkPageBreak(60);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Role Breakdown', margin, yPos);
      yPos += 10;

      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, contentWidth, 10, 'F');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Role', margin + 3, yPos + 7);
      pdf.text('FTE', margin + 100, yPos + 7);
      pdf.text('Cost', margin + 140, yPos + 7);
      yPos += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      scenario.roleBreakdown.forEach((role: any, idx: number) => {
        checkPageBreak(10);

        if (idx % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPos - 5, contentWidth, 8, 'F');
        }

        pdf.setTextColor(0, 0, 0);
        pdf.text(role.role || 'N/A', margin + 3, yPos);
        pdf.text(role.fte?.toFixed(2) || '0.00', margin + 100, yPos);
        pdf.text(`RM ${(role.cost / 1000).toFixed(0)}k`, margin + 140, yPos);
        yPos += 8;
      });
    }

    const fileName = `MVO_Results_${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
