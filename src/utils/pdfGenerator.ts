import jsPDF from 'jspdf';

export async function generatePDF(simulation: any): Promise<void> {
  try {
    const pdf = new jsPDF();
    let yPos = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);

    const checkPageBreak = (additionalHeight: number = 20) => {
      if (yPos + additionalHeight > pageHeight - 25) {
        pdf.addPage();
        yPos = 40;
      }
    };

    const scenario = simulation.scenarios?.[simulation.selected_scenario_type];
    const pc = simulation.inputs?.planningContext;

    pdf.setFontSize(26);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 20, 20);
    pdf.text(`MVO Results: ${simulation.simulation_name}`, margin, yPos);
    yPos += 20;

    if (scenario) {
      pdf.setFillColor(248, 249, 250);
      pdf.roundedRect(margin, yPos, contentWidth, 18, 3, 3, 'F');
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(70, 70, 70);
      const recommendedText = `Recommended: ${scenario.totalFte?.toFixed(0) || 'N/A'} FTE ~ RM ${scenario.totalCost ? (scenario.totalCost / 1000).toFixed(0) : 'N/A'}k/month`;
      pdf.text(recommendedText, margin + 8, yPos + 12);
      yPos += 30;
    }

    checkPageBreak(90);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 20, 20);
    pdf.text('Combined Summary - All Sub-Functions', margin, yPos);
    yPos += 15;

    const boxHeight = 55;
    const boxWidth = (contentWidth - 15) / 2;
    const boxY = yPos;

    pdf.setFillColor(235, 245, 255);
    pdf.setDrawColor(90, 160, 230);
    pdf.setLineWidth(1.5);
    pdf.roundedRect(margin, boxY, boxWidth, boxHeight, 4, 4, 'FD');

    pdf.setFillColor(235, 255, 245);
    pdf.setDrawColor(80, 200, 150);
    pdf.roundedRect(margin + boxWidth + 15, boxY, boxWidth, boxHeight, 4, 4, 'FD');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 110, 180);
    pdf.text('Baseline Headcount (Excel-style)', margin + 8, boxY + 10);

    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(40, 90, 180);
    const baselineFte = pc?.headcountTarget || scenario?.totalFte || 0;
    pdf.text(`${baselineFte.toFixed(0)} person`, margin + 8, boxY + 28);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(70, 120, 190);
    const baselineDesc = 'Calculated using a simple workload+capacity formula with minimal risk buffer.';
    const splitBaseline = pdf.splitTextToSize(baselineDesc, boxWidth - 16);
    pdf.text(splitBaseline, margin + 8, boxY + 38);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 170, 130);
    pdf.text('MVO Recommended Headcount', margin + boxWidth + 23, boxY + 10);

    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 150, 100);
    const mvoFte = scenario?.totalFte || 0;
    pdf.text(`${mvoFte.toFixed(0)} person`, margin + boxWidth + 23, boxY + 28);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(70, 170, 130);
    const mvoDesc = 'Minimum viable headcount for very high confidence (≥ 95%), after applying risk, variability and governance safeguards.';
    const splitMvo = pdf.splitTextToSize(mvoDesc, boxWidth - 16);
    pdf.text(splitMvo, margin + boxWidth + 23, boxY + 38);

    yPos += boxHeight + 25;

    checkPageBreak(70);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(20, 20, 20);
    pdf.text('Sub-Function Breakdown', margin, yPos);
    yPos += 15;

    if (simulation.inputs?.subFunctions && simulation.inputs.subFunctions.length > 0) {
      simulation.inputs.subFunctions.forEach((sf: any, index: number) => {
        checkPageBreak(35);

        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 30, 30);
        pdf.text(sf.name || `Sub-Function ${index + 1}`, margin, yPos);
        yPos += 10;

        const sfFte = scenario?.totalFte ? (scenario.totalFte / simulation.inputs.subFunctions.length) : 0;

        pdf.setFillColor(235, 245, 255);
        pdf.setDrawColor(150, 190, 230);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(margin, yPos, 70, 12, 2, 2, 'FD');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 100, 200);
        pdf.text(`Baseline: ${sfFte.toFixed(0)} person`, margin + 5, yPos + 8);

        pdf.setFillColor(235, 255, 245);
        pdf.setDrawColor(130, 210, 170);
        pdf.roundedRect(margin + 75, yPos, 70, 12, 2, 2, 'FD');
        pdf.setTextColor(40, 150, 100);
        pdf.text(`MVO: ${sfFte.toFixed(0)} person`, margin + 80, yPos + 8);

        pdf.setFillColor(220, 250, 230);
        pdf.setDrawColor(100, 190, 130);
        pdf.roundedRect(margin + 150, yPos, 35, 12, 2, 2, 'FD');
        pdf.setTextColor(60, 140, 90);
        pdf.setFontSize(9);
        pdf.text('LOW RISK', margin + 157, yPos + 8);

        yPos += 20;
      });
    }

    yPos += 5;
    checkPageBreak(90);

    const explanationBoxHeight = 75;
    pdf.setFillColor(245, 248, 252);
    pdf.setDrawColor(200, 215, 235);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, yPos, contentWidth, explanationBoxHeight, 4, 4, 'FD');

    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 70, 130);
    pdf.text('Understanding the Results', margin + 8, yPos + 12);

    yPos += 22;
    pdf.setFontSize(9);
    pdf.setTextColor(40, 40, 40);

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
      pdf.setFont('helvetica', 'bold');
      pdf.text(`•  ${item.label}`, margin + 8, yPos);
      pdf.setFont('helvetica', 'normal');
      const wrappedText = pdf.splitTextToSize(item.text, contentWidth - 25);
      pdf.text(wrappedText, margin + 12, yPos + 4);
      yPos += 5 + (wrappedText.length * 4.5);
    });

    yPos = yPos - explanations.length * 1 + explanationBoxHeight - 70 + 25;

    if (scenario?.roleBreakdown && scenario.roleBreakdown.length > 0) {
      checkPageBreak(80);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(20, 20, 20);
      pdf.text('Role Breakdown', margin, yPos);
      yPos += 12;

      pdf.setFillColor(245, 247, 250);
      pdf.rect(margin, yPos, contentWidth, 12, 'F');
      pdf.setDrawColor(220, 225, 230);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPos + 12, margin + contentWidth, yPos + 12);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Role', margin + 5, yPos + 8);
      pdf.text('FTE', margin + 110, yPos + 8);
      pdf.text('Cost', margin + 145, yPos + 8);
      yPos += 12;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      scenario.roleBreakdown.forEach((role: any, idx: number) => {
        checkPageBreak(12);

        if (idx % 2 === 1) {
          pdf.setFillColor(252, 253, 254);
          pdf.rect(margin, yPos - 6, contentWidth, 10, 'F');
        }

        pdf.setDrawColor(235, 238, 242);
        pdf.setLineWidth(0.2);
        pdf.line(margin, yPos + 4, margin + contentWidth, yPos + 4);

        pdf.setTextColor(40, 40, 40);
        const roleName = role.role || 'N/A';
        const truncatedRole = roleName.length > 35 ? roleName.substring(0, 32) + '...' : roleName;
        pdf.text(truncatedRole, margin + 5, yPos);
        pdf.text(role.fte?.toFixed(1) || '0.0', margin + 110, yPos);
        pdf.text(`RM ${(role.cost / 1000).toFixed(0)}k`, margin + 145, yPos);
        yPos += 10;
      });
    }

    const fileName = `MVO_Results_${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
