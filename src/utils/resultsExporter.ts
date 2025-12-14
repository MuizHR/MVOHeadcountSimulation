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
  country?: string;
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

    if (data.country) {
      contextSection.push(new Paragraph({
        children: [
          new TextRun({ text: 'Country: ', bold: true }),
          new TextRun(data.country)
        ],
        spacing: { after: 100 }
      }));
    }

    if (data.region) {
      contextSection.push(new Paragraph({
        children: [
          new TextRun({ text: 'Region: ', bold: true }),
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

    contextSection.push(new Paragraph({
      children: [
        new TextRun({ text: 'Operation Size: ', bold: true }),
        new TextRun(data.sizeOfOperation + (data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : ''))
      ],
      spacing: { after: 100 }
    }));

    contextSection.push(new Paragraph({
      text: 'Scope Size (What are you supporting?)',
      bold: true,
      spacing: { before: 200, after: 100 }
    }));

    contextSection.push(new Paragraph({
      children: [
        new TextRun({ text: '  • Employees Supported: ', bold: false }),
        new TextRun(data.scopeDriverType === 'employees_supported' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-')
      ],
      spacing: { after: 50 }
    }));

    contextSection.push(new Paragraph({
      children: [
        new TextRun({ text: '  • Work Locations Supported: ', bold: false }),
        new TextRun(data.scopeDriverType === 'sites_locations' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-')
      ],
      spacing: { after: 50 }
    }));

    contextSection.push(new Paragraph({
      children: [
        new TextRun({ text: '  • Active Workstreams: ', bold: false }),
        new TextRun(data.scopeDriverType === 'projects_portfolios' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-')
      ],
      spacing: { after: 100 }
    }));

    if (data.scopeDriverType && data.scopeDriverValue) {
      contextSection.push(new Paragraph({
        children: [
          new TextRun({ text: 'Primary Scope Driver: ', bold: true }),
          new TextRun(getScopeDriverLabel())
        ],
        spacing: { after: 100 }
      }));
    }

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

    if (data.country) {
      doc.text(`Country: ${data.country}`, 20, yPos);
      yPos += 10;
    }

    if (data.region) {
      doc.text(`Region: ${data.region}`, 20, yPos);
      yPos += 10;
    }

    doc.text(`Planning Type: ${data.planningType}`, 20, yPos);
    yPos += 10;

    doc.text(`Operation Size: ${data.sizeOfOperation}${data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : ''}`, 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Scope Size (What are you supporting?)', 20, yPos);
    yPos += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);

    const employeesValue = data.scopeDriverType === 'employees_supported' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-';
    doc.text(`  • Employees Supported: ${employeesValue}`, 20, yPos);
    yPos += 6;

    const locationsValue = data.scopeDriverType === 'sites_locations' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-';
    doc.text(`  • Work Locations Supported: ${locationsValue}`, 20, yPos);
    yPos += 6;

    const workstreamsValue = data.scopeDriverType === 'projects_portfolios' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-';
    doc.text(`  • Active Workstreams: ${workstreamsValue}`, 20, yPos);
    yPos += 8;

    if (data.scopeDriverType && data.scopeDriverValue) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Primary Scope Driver: ${getScopeDriverLabel()}`, 20, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 10;
    }

    doc.setFontSize(12);

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

    if (data.country) {
      detailsData.push(['Country', data.country]);
    }

    if (data.region) {
      detailsData.push(['Region', data.region]);
    }

    detailsData.push(['Planning Type', data.planningType]);

    detailsData.push(['Operation Size', data.sizeOfOperation + (data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : '')]);

    detailsData.push([]);
    detailsData.push(['Scope Size (What are you supporting?)']);
    detailsData.push([
      'Employees Supported',
      data.scopeDriverType === 'employees_supported' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-'
    ]);
    detailsData.push([
      'Work Locations Supported',
      data.scopeDriverType === 'sites_locations' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-'
    ]);
    detailsData.push([
      'Active Workstreams',
      data.scopeDriverType === 'projects_portfolios' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-'
    ]);

    if (data.scopeDriverType && data.scopeDriverValue) {
      detailsData.push(['Primary Scope Driver', getScopeDriverLabel()]);
    }

    if (data.contextObjectives) {
      detailsData.push([]);
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
