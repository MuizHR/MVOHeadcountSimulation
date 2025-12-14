import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { SimulationResult } from '../types/dashboardResult';

export interface ExportData {
  simulationName: string;
  companyName?: string;
  businessPillar?: string;
  entity?: string;
  region?: string;
  planningType: string;
  scopeDriverType?: string;
  scopeDriverValue?: number;
  operationSize: string;
  autoSizeEnabled?: boolean;
  contextObjectives?: string;
  sizeOfOperation: string;
  totalFte: number;
  avgDurationDays: number;
  p90DurationDays: number;
  successRatePct: number;
  avgMonthlyCostRm: number;
}

export async function exportToWord(data: ExportData): Promise<void> {
  try {
    const getScopeDriverLabel = (): string => {
      if (!data.scopeDriverType || !data.scopeDriverValue) return 'Not specified';
      let label = '';
      switch (data.scopeDriverType) {
        case 'employees_supported': label = 'Employees Supported'; break;
        case 'sites_locations': label = '# Sites/Locations'; break;
        case 'projects_portfolios': label = '# Projects/Portfolios'; break;
      }
      return `${label}: ${data.scopeDriverValue}`;
    };

    const contextSection: Paragraph[] = [
      new Paragraph({
        text: 'Simulation Context',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Simulation Name: ', bold: true }),
          new TextRun(data.simulationName)
        ],
        spacing: { after: 100 }
      })
    ];

    if (data.companyName) {
      contextSection.push(new Paragraph({
        children: [
          new TextRun({ text: 'Company / Entity: ', bold: true }),
          new TextRun(data.companyName)
        ],
        spacing: { after: 100 }
      }));
    }

    if (data.businessPillar) {
      contextSection.push(new Paragraph({
        children: [
          new TextRun({ text: 'Business Pillar: ', bold: true }),
          new TextRun(data.businessPillar)
        ],
        spacing: { after: 100 }
      }));
    }

    if (data.region) {
      contextSection.push(new Paragraph({
        children: [
          new TextRun({ text: 'Location / Region: ', bold: true }),
          new TextRun(data.region)
        ],
        spacing: { after: 100 }
      }));
    }

    contextSection.push(new Paragraph({
      children: [
        new TextRun({ text: 'Planning Type: ', bold: true }),
        new TextRun(data.planningType)
      ],
      spacing: { after: 100 }
    }));

    if (data.scopeDriverType && data.scopeDriverValue) {
      contextSection.push(new Paragraph({
        children: [
          new TextRun({ text: 'Scope Driver: ', bold: true }),
          new TextRun(getScopeDriverLabel())
        ],
        spacing: { after: 100 }
      }));
    }

    contextSection.push(new Paragraph({
      children: [
        new TextRun({ text: 'Operation Size: ', bold: true }),
        new TextRun(data.sizeOfOperation + (data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : ''))
      ],
      spacing: { after: 100 }
    }));

    if (data.contextObjectives) {
      contextSection.push(new Paragraph({
        children: [
          new TextRun({ text: 'Context & Objectives: ', bold: true }),
          new TextRun(data.contextObjectives)
        ],
        spacing: { after: 300 }
      }));
    } else {
      contextSection.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: 'MVO Results Report',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          ...contextSection,
          new Paragraph({
            text: 'MVO Recommendation',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Metric', bold: true })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Value', bold: true })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('FTE')] }),
                  new TableCell({ children: [new Paragraph(data.totalFte.toFixed(1))] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Average Duration (days)')] }),
                  new TableCell({ children: [new Paragraph(data.avgDurationDays.toString())] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('P90 Duration (days)')] }),
                  new TableCell({ children: [new Paragraph(data.p90DurationDays.toString())] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Success Rate')] }),
                  new TableCell({ children: [new Paragraph(`${data.successRatePct.toFixed(1)}%`)] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Monthly Cost (RM)')] }),
                  new TableCell({ children: [new Paragraph(`RM ${Math.round(data.avgMonthlyCostRm).toLocaleString()}`)] })
                ]
              })
            ]
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.simulationName}_MVO_Report.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw new Error('Failed to export to Word');
  }
}

export function exportToPDF(data: ExportData): void {
  try {
    const getScopeDriverLabel = (): string => {
      if (!data.scopeDriverType || !data.scopeDriverValue) return 'Not specified';
      let label = '';
      switch (data.scopeDriverType) {
        case 'employees_supported': label = 'Employees Supported'; break;
        case 'sites_locations': label = '# Sites/Locations'; break;
        case 'projects_portfolios': label = '# Projects/Portfolios'; break;
      }
      return `${label}: ${data.scopeDriverValue}`;
    };

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('MVO Results Report', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text('Simulation Context', 20, 40);

    doc.setFontSize(12);
    let yPos = 55;
    doc.text(`Simulation Name: ${data.simulationName}`, 20, yPos);
    yPos += 10;

    if (data.companyName) {
      doc.text(`Company / Entity: ${data.companyName}`, 20, yPos);
      yPos += 10;
    }

    if (data.businessPillar) {
      doc.text(`Business Pillar: ${data.businessPillar}`, 20, yPos);
      yPos += 10;
    }

    if (data.region) {
      doc.text(`Location / Region: ${data.region}`, 20, yPos);
      yPos += 10;
    }

    doc.text(`Planning Type: ${data.planningType}`, 20, yPos);
    yPos += 10;

    if (data.scopeDriverType && data.scopeDriverValue) {
      doc.text(`Scope Driver: ${getScopeDriverLabel()}`, 20, yPos);
      yPos += 10;
    }

    doc.text(`Operation Size: ${data.sizeOfOperation}${data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : ''}`, 20, yPos);
    yPos += 10;

    if (data.contextObjectives) {
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(`Context & Objectives: ${data.contextObjectives}`, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6 + 5;
    }

    yPos += 5;

    doc.setFontSize(16);
    doc.text('MVO Recommendation', 20, yPos);
    yPos += 15;

    doc.setFontSize(12);
    const lineHeight = 10;

    doc.text(`FTE: ${data.totalFte.toFixed(1)}`, 30, yPos);
    doc.text(`Average Duration: ${data.avgDurationDays} days`, 30, yPos + lineHeight);
    doc.text(`P90 Duration: ${data.p90DurationDays} days`, 30, yPos + lineHeight * 2);
    doc.text(`Success Rate: ${data.successRatePct.toFixed(1)}%`, 30, yPos + lineHeight * 3);
    doc.text(`Monthly Cost: RM ${Math.round(data.avgMonthlyCostRm).toLocaleString()}`, 30, yPos + lineHeight * 4);

    doc.setFontSize(8);
    doc.text('Generated by MVO Planning Tool', 105, 280, { align: 'center' });

    doc.save(`${data.simulationName}_MVO_Report.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
}

export function exportToExcel(data: ExportData): void {
  try {
    const getScopeDriverLabel = (): string => {
      if (!data.scopeDriverType || !data.scopeDriverValue) return 'Not specified';
      let label = '';
      switch (data.scopeDriverType) {
        case 'employees_supported': label = 'Employees Supported'; break;
        case 'sites_locations': label = '# Sites/Locations'; break;
        case 'projects_portfolios': label = '# Projects/Portfolios'; break;
      }
      return `${label}: ${data.scopeDriverValue}`;
    };

    const workbook = XLSX.utils.book_new();

    const detailsData: any[][] = [
      ['MVO Results Report'],
      [],
      ['Simulation Context'],
      ['Simulation Name', data.simulationName]
    ];

    if (data.companyName) {
      detailsData.push(['Company / Entity', data.companyName]);
    }

    if (data.businessPillar) {
      detailsData.push(['Business Pillar', data.businessPillar]);
    }

    if (data.region) {
      detailsData.push(['Location / Region', data.region]);
    }

    detailsData.push(['Planning Type', data.planningType]);

    if (data.scopeDriverType && data.scopeDriverValue) {
      detailsData.push(['Scope Driver', getScopeDriverLabel()]);
    }

    detailsData.push(['Operation Size', data.sizeOfOperation + (data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : '')]);

    if (data.contextObjectives) {
      detailsData.push(['Context & Objectives', data.contextObjectives]);
    }

    detailsData.push(
      [],
      ['MVO Recommendation'],
      ['Metric', 'Value'],
      ['FTE', data.totalFte.toFixed(1)],
      ['Average Duration (days)', data.avgDurationDays],
      ['P90 Duration (days)', data.p90DurationDays],
      ['Success Rate', `${data.successRatePct.toFixed(1)}%`],
      ['Monthly Cost (RM)', `RM ${Math.round(data.avgMonthlyCostRm).toLocaleString()}`]
    );

    const worksheet = XLSX.utils.aoa_to_sheet(detailsData);

    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 30 }
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'MVO Results');

    XLSX.writeFile(workbook, `${data.simulationName}_MVO_Report.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
}
