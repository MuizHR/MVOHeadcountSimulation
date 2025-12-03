import jsPDF from 'jspdf';

export async function generatePDF(simulation: any): Promise<void> {
  try {
    const pdf = new jsPDF();
    let yPos = 20;
    const lineHeight = 7;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to check if we need a new page
    const checkPageBreak = (additionalHeight: number = 10) => {
      if (yPos + additionalHeight > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        yPos = 20;
      }
    };

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Simulation Report', margin, yPos);
    yPos += lineHeight * 2;

    // Simulation Name
    pdf.setFontSize(16);
    pdf.text(simulation.simulation_name, margin, yPos);
    yPos += lineHeight * 1.5;

    // Metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Created: ${new Date(simulation.created_at).toLocaleString()}`, margin, yPos);
    yPos += lineHeight;
    pdf.text(`Last Updated: ${new Date(simulation.updated_at).toLocaleString()}`, margin, yPos);
    yPos += lineHeight * 2;

    // Planning Context
    if (simulation.inputs?.planningContext) {
      checkPageBreak(40);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Planning Context', margin, yPos);
      yPos += lineHeight * 1.5;

      const pc = simulation.inputs.planningContext;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const contextInfo = [
        ['Function Name:', pc.functionName || 'N/A'],
        ['Planning Horizon:', pc.planningHorizon || 'N/A'],
        ['Headcount Target:', pc.headcountTarget?.toString() || 'N/A'],
        ['Geographic Scope:', pc.geographicScope || 'N/A']
      ];

      contextInfo.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 50, yPos);
        yPos += lineHeight;
      });
      yPos += lineHeight;
    }

    // Sub-functions
    if (simulation.inputs?.subFunctions && simulation.inputs.subFunctions.length > 0) {
      checkPageBreak(60);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sub-Functions', margin, yPos);
      yPos += lineHeight * 1.5;

      pdf.setFontSize(10);
      simulation.inputs.subFunctions.forEach((sf: any, index: number) => {
        checkPageBreak(30);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${sf.name || 'N/A'}`, margin, yPos);
        yPos += lineHeight;

        pdf.setFont('helvetica', 'normal');
        pdf.text(`Workload Driver: ${sf.workloadDriver || 'N/A'}`, margin + 5, yPos);
        yPos += lineHeight;
        pdf.text(`Current Volume: ${sf.currentVolume?.toString() || 'N/A'}`, margin + 5, yPos);
        yPos += lineHeight;
        pdf.text(`Target Volume: ${sf.targetVolume?.toString() || 'N/A'}`, margin + 5, yPos);
        yPos += lineHeight * 1.5;
      });
    }

    // Selected Scenario
    if (simulation.scenarios && simulation.selected_scenario_type) {
      const scenario = simulation.scenarios[simulation.selected_scenario_type];
      if (scenario) {
        checkPageBreak(50);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Selected Scenario: ${simulation.selected_scenario_type}`, margin, yPos);
        yPos += lineHeight * 1.5;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Total FTE: ${scenario.totalFte?.toFixed(2) || 'N/A'}`, margin, yPos);
        yPos += lineHeight;
        pdf.text(`Total Cost: $${scenario.totalCost?.toLocaleString() || 'N/A'}`, margin, yPos);
        yPos += lineHeight * 2;

        // Role Breakdown
        if (scenario.roleBreakdown && scenario.roleBreakdown.length > 0) {
          checkPageBreak(40);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Role Breakdown', margin, yPos);
          yPos += lineHeight * 1.5;

          pdf.setFont('helvetica', 'normal');
          scenario.roleBreakdown.forEach((role: any) => {
            checkPageBreak(20);
            pdf.text(`${role.role || 'N/A'}`, margin, yPos);
            pdf.text(`FTE: ${role.fte?.toFixed(2) || 'N/A'}`, margin + 80, yPos);
            pdf.text(`Cost: $${role.cost?.toLocaleString() || 'N/A'}`, margin + 130, yPos);
            yPos += lineHeight;
          });
        }
      }
    }

    // Save
    const fileName = `${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
