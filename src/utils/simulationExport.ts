import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { SimulationHistory } from '../types/simulationHistory';
import { normalizeSimulationData, getLocationDisplay, getCompanyDisplay, formatNumber } from './simulationNormalization';

const TEAL_COLOR = '0E7490';
const LIGHT_TEAL = 'CCFBF1';
const BLUE_COLOR = '2563EB';
const LIGHT_BLUE = 'DBEAFE';
const PURPLE_COLOR = '7C3AED';
const LIGHT_PURPLE = 'EDE9FE';
const GRAY_100 = 'F3F4F6';
const GRAY_200 = 'E5E7EB';

export async function exportSimulationToWord(simulation: SimulationHistory): Promise<void> {
  try {
    const normalized = normalizeSimulationData(simulation);
    const results = simulation.result_payload;
    const inputs = simulation.input_payload;

    const children: Paragraph[] = [];

    children.push(new Paragraph({
      text: 'MVO SIMULATION REPORT',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200, before: 200 },
      border: {
        bottom: {
          color: TEAL_COLOR,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 20
        }
      }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({
          text: normalized.simulationName,
          size: 32,
          bold: true,
          color: TEAL_COLOR
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({
          text: `Created: ${new Date(normalized.created_at).toLocaleDateString()}`,
          italics: true
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    children.push(new Paragraph({
      text: 'Simulation Context',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        color: LIGHT_TEAL,
        fill: LIGHT_TEAL
      }
    }));

    const contextRows: TableRow[] = [];

    contextRows.push(new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Company', bold: true })],
          shading: { fill: GRAY_100 },
          width: { size: 30, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph(normalized.companyName)],
          width: { size: 70, type: WidthType.PERCENTAGE }
        })
      ]
    }));

    contextRows.push(new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: 'Location', bold: true })],
          shading: { fill: GRAY_100 },
          width: { size: 30, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph(getLocationDisplay(normalized.country, normalized.region))],
          width: { size: 70, type: WidthType.PERCENTAGE }
        })
      ]
    }));

    if (normalized.businessArea) {
      contextRows.push(new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Business Area', bold: true })],
            shading: { fill: GRAY_100 },
            width: { size: 30, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph(normalized.businessArea)],
            width: { size: 70, type: WidthType.PERCENTAGE }
          })
        ]
      }));
    }

    if (normalized.planningTypeLabel) {
      contextRows.push(new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Planning Type', bold: true })],
            shading: { fill: GRAY_100 },
            width: { size: 30, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph(normalized.planningTypeLabel)],
            width: { size: 70, type: WidthType.PERCENTAGE }
          })
        ]
      }));
    }

    if (normalized.sizeOfOperationLabel) {
      contextRows.push(new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Size of Operation', bold: true })],
            shading: { fill: GRAY_100 },
            width: { size: 30, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph(normalized.sizeOfOperationLabel)],
            width: { size: 70, type: WidthType.PERCENTAGE }
          })
        ]
      }));
    }

    if (normalized.scopeDriverLabel && normalized.scopeDriverValue) {
      contextRows.push(new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Scope', bold: true })],
            shading: { fill: GRAY_100 },
            width: { size: 30, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph(`${normalized.scopeDriverLabel}: ${formatNumber(normalized.scopeDriverValue)}`)],
            width: { size: 70, type: WidthType.PERCENTAGE }
          })
        ]
      }));
    }

    const contextTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: contextRows
    });

    children.push(contextTable);

    children.push(new Paragraph({
      text: 'Summary Results',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        color: LIGHT_BLUE,
        fill: LIGHT_BLUE
      }
    }));

    const summaryTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Metric', bold: true })],
              shading: { fill: BLUE_COLOR },
              width: { size: 40, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Value', bold: true })],
              shading: { fill: BLUE_COLOR },
              width: { size: 60, type: WidthType.PERCENTAGE }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Total FTE')] }),
            new TableCell({ children: [new Paragraph({ text: (normalized.totalFte || 'N/A').toString(), bold: true, color: BLUE_COLOR })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Monthly Cost')], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph({ text: `RM ${(normalized.totalMonthlyCost || 0).toLocaleString()}`, bold: true, color: BLUE_COLOR })], shading: { fill: GRAY_100 } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Workload Score')] }),
            new TableCell({ children: [new Paragraph({ text: (normalized.workloadScore || 'N/A').toString(), bold: true, color: BLUE_COLOR })] })
          ]
        })
      ]
    });

    children.push(summaryTable);

    if (results && results.subFunctions && Array.isArray(results.subFunctions) && results.subFunctions.length > 0) {
      children.push(new Paragraph({
        text: 'Sub-Function Breakdown',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        shading: {
          type: ShadingType.CLEAR,
          color: LIGHT_PURPLE,
          fill: LIGHT_PURPLE
        }
      }));

      results.subFunctions.forEach((sf: any, index: number) => {
        children.push(new Paragraph({
          text: `${index + 1}. ${sf.name || 'Unknown Sub-Function'}`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }));

        const sfRows: TableRow[] = [];

        if (sf.recommendedFTE) {
          sfRows.push(new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: 'Recommended FTE Range', bold: true })],
                shading: { fill: GRAY_100 }
              }),
              new TableCell({
                children: [new Paragraph(`${sf.recommendedFTE.min} - ${sf.recommendedFTE.max}`)]
              })
            ]
          }));

          sfRows.push(new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: 'Target FTE', bold: true })],
                shading: { fill: LIGHT_TEAL }
              }),
              new TableCell({
                children: [new Paragraph({ text: sf.recommendedFTE.recommended.toString(), bold: true })],
                shading: { fill: LIGHT_TEAL }
              })
            ]
          }));
        }

        if (sf.currentHeadcount !== undefined && sf.currentHeadcount !== null) {
          sfRows.push(new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: 'Current Headcount', bold: true })],
                shading: { fill: GRAY_100 }
              }),
              new TableCell({
                children: [new Paragraph(sf.currentHeadcount.toString())]
              })
            ]
          }));
        }

        if (sfRows.length > 0) {
          const sfTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: sfRows
          });

          children.push(sfTable);
        }
      });
    }

    children.push(new Paragraph({
      text: '',
      spacing: { before: 400 },
      border: {
        top: {
          color: TEAL_COLOR,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6
        }
      }
    }));

    children.push(new Paragraph({
      text: 'Generated by MVO Planning Tool',
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 }
    }));

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_Report.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    throw new Error('Failed to export to Word');
  }
}

export async function exportSimulationToExcel(simulation: SimulationHistory): Promise<void> {
  try {
    const normalized = normalizeSimulationData(simulation);
    const results = simulation.result_payload;
    const workbook = XLSX.utils.book_new();

    const summaryData: any[][] = [
      ['MVO SIMULATION REPORT'],
      [normalized.simulationName],
      [`Created: ${new Date(normalized.created_at).toLocaleDateString()}`],
      [],
      ['SIMULATION CONTEXT'],
      []
    ];

    summaryData.push(['Company', normalized.companyName]);
    summaryData.push(['Location', getLocationDisplay(normalized.country, normalized.region)]);

    if (normalized.businessArea) {
      summaryData.push(['Business Area', normalized.businessArea]);
    }

    if (normalized.planningTypeLabel) {
      summaryData.push(['Planning Type', normalized.planningTypeLabel]);
    }

    if (normalized.sizeOfOperationLabel) {
      summaryData.push(['Size of Operation', normalized.sizeOfOperationLabel]);
    }

    if (normalized.scopeDriverLabel && normalized.scopeDriverValue) {
      summaryData.push(['Scope', `${normalized.scopeDriverLabel}: ${formatNumber(normalized.scopeDriverValue)}`]);
    }

    summaryData.push([]);
    summaryData.push(['SUMMARY RESULTS']);
    summaryData.push(['Metric', 'Value']);
    summaryData.push(['Total FTE', normalized.totalFte || 'N/A']);
    summaryData.push(['Monthly Cost (RM)', normalized.totalMonthlyCost || 0]);
    summaryData.push(['Workload Score', normalized.workloadScore || 'N/A']);

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 50 }];

    summarySheet['A1'].s = { font: { bold: true, sz: 16, color: { rgb: TEAL_COLOR } }, alignment: { horizontal: 'center' } };
    summarySheet['A2'].s = { font: { bold: true, sz: 14, color: { rgb: TEAL_COLOR } }, alignment: { horizontal: 'center' } };
    summarySheet['A5'].s = { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: LIGHT_TEAL } } };

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    if (results && results.subFunctions && Array.isArray(results.subFunctions) && results.subFunctions.length > 0) {
      const sfData: any[][] = [
        ['SUB-FUNCTION BREAKDOWN'],
        [],
        ['Name', 'Min FTE', 'Max FTE', 'Target FTE', 'Current Headcount']
      ];

      results.subFunctions.forEach((sf: any) => {
        const minFTE = sf.recommendedFTE?.min || 'N/A';
        const maxFTE = sf.recommendedFTE?.max || 'N/A';
        const targetFTE = sf.recommendedFTE?.recommended || 'N/A';
        const current = sf.currentHeadcount !== undefined && sf.currentHeadcount !== null ? sf.currentHeadcount : 'N/A';

        sfData.push([sf.name || 'Unknown', minFTE, maxFTE, targetFTE, current]);
      });

      const sfSheet = XLSX.utils.aoa_to_sheet(sfData);
      sfSheet['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }];

      sfSheet['A1'].s = { font: { bold: true, sz: 14 }, fill: { fgColor: { rgb: LIGHT_PURPLE } } };

      XLSX.utils.book_append_sheet(workbook, sfSheet, 'Sub-Functions');
    }

    XLSX.writeFile(workbook, `${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_Report.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
}

export async function exportSimulationToPDF(simulation: SimulationHistory): Promise<void> {
  try {
    const normalized = normalizeSimulationData(simulation);
    const doc = new jsPDF();
    const results = simulation.result_payload;

    let yPos = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const tealColor: [number, number, number] = [14, 116, 144];
    const lightTeal: [number, number, number] = [204, 251, 241];
    const blueColor: [number, number, number] = [37, 99, 235];
    const lightBlue: [number, number, number] = [219, 234, 254];
    const purpleColor: [number, number, number] = [124, 58, 237];

    const checkPageBreak = () => {
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
      }
    };

    doc.setFillColor(...tealColor);
    doc.rect(0, 0, 210, 15, 'F');

    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('MVO SIMULATION REPORT', 105, 10, { align: 'center' });

    yPos = 25;
    doc.setFontSize(18);
    doc.setTextColor(...tealColor);
    doc.text(normalized.simulationName, 105, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(0, 0, 0);
    doc.text(`Created: ${new Date(normalized.created_at).toLocaleDateString()}`, 105, yPos, { align: 'center' });
    yPos += 15;

    doc.setFillColor(...lightTeal);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Simulation Context', 20, yPos);
    yPos += 12;

    const contextData: any[][] = [
      ['Company', normalized.companyName],
      ['Location', getLocationDisplay(normalized.country, normalized.region)]
    ];

    if (normalized.businessArea) {
      contextData.push(['Business Area', normalized.businessArea]);
    }

    if (normalized.planningTypeLabel) {
      contextData.push(['Planning Type', normalized.planningTypeLabel]);
    }

    if (normalized.sizeOfOperationLabel) {
      contextData.push(['Size of Operation', normalized.sizeOfOperationLabel]);
    }

    if (normalized.scopeDriverLabel && normalized.scopeDriverValue) {
      contextData.push(['Scope', `${normalized.scopeDriverLabel}: ${formatNumber(normalized.scopeDriverValue)}`]);
    }

    autoTable(doc, {
      startY: yPos,
      body: contextData,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', fillColor: [243, 244, 246] },
        1: { cellWidth: 120 }
      },
      margin: { left: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
    checkPageBreak();

    doc.setFillColor(...lightBlue);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Results', 20, yPos);
    yPos += 12;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total FTE', (normalized.totalFte || 'N/A').toString()],
        ['Monthly Cost (RM)', `RM ${(normalized.totalMonthlyCost || 0).toLocaleString()}`],
        ['Workload Score', (normalized.workloadScore || 'N/A').toString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: blueColor, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 90, fontStyle: 'bold', textColor: blueColor }
      },
      margin: { left: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (results && results.subFunctions && Array.isArray(results.subFunctions) && results.subFunctions.length > 0) {
      checkPageBreak();

      doc.setFillColor(...lightTeal);
      doc.rect(15, yPos - 5, 180, 8, 'F');
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Sub-Function Breakdown', 20, yPos);
      yPos += 12;

      results.subFunctions.forEach((sf: any, index: number) => {
        checkPageBreak();

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...tealColor);
        doc.text(`${index + 1}. ${sf.name || 'Unknown Sub-Function'}`, 20, yPos);
        yPos += 8;

        const sfData: any[][] = [];

        if (sf.recommendedFTE) {
          sfData.push(['Recommended FTE Range', `${sf.recommendedFTE.min} - ${sf.recommendedFTE.max}`]);
          sfData.push(['Target FTE', sf.recommendedFTE.recommended.toString()]);
        }

        if (sf.currentHeadcount !== undefined && sf.currentHeadcount !== null) {
          sfData.push(['Current Headcount', sf.currentHeadcount.toString()]);
        }

        if (sfData.length > 0) {
          autoTable(doc, {
            startY: yPos,
            body: sfData,
            theme: 'striped',
            styles: { fontSize: 9 },
            columnStyles: {
              0: { cellWidth: 70, fontStyle: 'bold', fillColor: [243, 244, 246] },
              1: { cellWidth: 110 }
            },
            margin: { left: 20 }
          });

          yPos = (doc as any).lastAutoTable.finalY + 10;
        }
      });
    }

    doc.setFillColor(...tealColor);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('Generated by MVO Planning Tool', 105, pageHeight - 8, { align: 'center' });

    doc.save(`${simulation.simulation_name.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF');
  }
}
