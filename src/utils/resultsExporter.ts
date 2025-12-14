import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  simulationResult: SimulationResult;
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

    const children: Paragraph[] = [];

    children.push(new Paragraph({
      text: 'MVO Results Report',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    children.push(new Paragraph({
      text: 'Planning Context Summary',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Simulation Name: ', bold: true }),
        new TextRun(data.simulationName)
      ],
      spacing: { after: 100 }
    }));

    if (data.companyName || data.entity) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Entity / Company: ', bold: true }),
          new TextRun(data.companyName || data.entity || '-'),
          ...(data.businessPillar ? [new TextRun({ text: ` (${data.businessPillar})`, italics: true })] : [])
        ],
        spacing: { after: 100 }
      }));
    }

    if (data.region || data.country) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Location / Region: ', bold: true }),
          new TextRun(data.region || '-'),
          ...(data.country && data.region !== 'Global / Multi-region' ? [new TextRun({ text: ` • ${data.country}` })] : [])
        ],
        spacing: { after: 100 }
      }));
    }

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Planning Type: ', bold: true }),
        new TextRun(data.planningType)
      ],
      spacing: { after: 100 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Size of Operation: ', bold: true }),
        new TextRun(data.sizeOfOperation + (data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : ''))
      ],
      spacing: { after: 100 }
    }));

    children.push(new Paragraph({
      text: 'Scope Size (What are you supporting?)',
      bold: true,
      spacing: { before: 200, after: 100 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: '  • Employees Supported: ', bold: false }),
        new TextRun(data.scopeDriverType === 'employees_supported' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-')
      ],
      spacing: { after: 50 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: '  • Work Locations Supported: ', bold: false }),
        new TextRun(data.scopeDriverType === 'sites_locations' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-')
      ],
      spacing: { after: 50 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: '  • Active Workstreams: ', bold: false }),
        new TextRun(data.scopeDriverType === 'projects_portfolios' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-')
      ],
      spacing: { after: 100 }
    }));

    if (data.scopeDriverType && data.scopeDriverValue) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Primary Scope Driver: ', bold: true }),
          new TextRun(getScopeDriverLabel())
        ],
        spacing: { after: 100 }
      }));
    }

    if (data.contextObjectives) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Context & Objectives: ', bold: true }),
          new TextRun(data.contextObjectives)
        ],
        spacing: { after: 300 }
      }));
    }

    children.push(new Paragraph({
      text: 'MVO Recommendation',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    }));

    const mvoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Metric', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: 'Value', bold: true })] })
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
    });

    children.push(mvoTable);

    children.push(new Paragraph({
      text: 'Key Statistics',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    }));

    const keyStatsTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Metric', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: 'Baseline', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: 'MVO', bold: true })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Headcount (FTE)')] }),
            new TableCell({ children: [new Paragraph(data.simulationResult.keyStats.baselineHeadcount.toFixed(1))] }),
            new TableCell({ children: [new Paragraph(data.simulationResult.keyStats.mvoHeadcount.toFixed(1))] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Monthly Cost (RM)')] }),
            new TableCell({ children: [new Paragraph(`RM ${Math.round(data.simulationResult.keyStats.baselineMonthlyCostRm).toLocaleString()}`)] }),
            new TableCell({ children: [new Paragraph(`RM ${Math.round(data.simulationResult.keyStats.mvoMonthlyCostRm).toLocaleString()}`)] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Failure Risk')] }),
            new TableCell({ children: [new Paragraph(`${data.simulationResult.keyStats.baselineFailureRiskPct.toFixed(1)}%`)] }),
            new TableCell({ children: [new Paragraph(`${data.simulationResult.keyStats.mvoFailureRiskPct.toFixed(1)}%`)] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Monthly Savings')] }),
            new TableCell({ children: [new Paragraph('-')] }),
            new TableCell({ children: [new Paragraph(`RM ${Math.round(data.simulationResult.keyStats.monthlySavingsRm).toLocaleString()}`)] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Annual Savings')] }),
            new TableCell({ children: [new Paragraph('-')] }),
            new TableCell({ children: [new Paragraph(`RM ${Math.round(data.simulationResult.keyStats.annualSavingsRm).toLocaleString()}`)] })
          ]
        })
      ]
    });

    children.push(keyStatsTable);

    children.push(new Paragraph({
      text: 'Duration Metrics',
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 300, after: 200 }
    }));

    const durationTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Average Duration (days)')] }),
            new TableCell({ children: [new Paragraph(data.simulationResult.keyStats.avgDurationDays.toString())] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('P50 Duration (days)')] }),
            new TableCell({ children: [new Paragraph(data.simulationResult.keyStats.p50DurationDays.toString())] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('P75 Duration (days)')] }),
            new TableCell({ children: [new Paragraph(data.simulationResult.keyStats.p75DurationDays.toString())] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('P90 Duration (days)')] }),
            new TableCell({ children: [new Paragraph(data.simulationResult.keyStats.p90DurationDays.toString())] })
          ]
        })
      ]
    });

    children.push(durationTable);

    children.push(new Paragraph({
      text: 'Sub-Function Details',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    }));

    data.simulationResult.subFunctions.forEach((subFunction, index) => {
      children.push(new Paragraph({
        text: `${index + 1}. ${subFunction.name}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 }
      }));

      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Work Type: ', bold: true }),
          new TextRun(subFunction.workTypeLabel)
        ],
        spacing: { after: 50 }
      }));

      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Baseline Headcount: ', bold: true }),
          new TextRun(subFunction.baselineHeadcount.toFixed(1))
        ],
        spacing: { after: 50 }
      }));

      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'MVO Headcount: ', bold: true }),
          new TextRun(subFunction.mvoHeadcount.toFixed(1))
        ],
        spacing: { after: 50 }
      }));

      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Risk Level: ', bold: true }),
          new TextRun(subFunction.riskLevel)
        ],
        spacing: { after: 50 }
      }));

      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Recommended Strategy: ', bold: true }),
          new TextRun(subFunction.recommendedStrategy.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
        ],
        spacing: { after: 100 }
      }));

      const comparisonRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Headcount', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: 'Avg Days', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: 'P90 Days', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: 'Success %', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: 'Risk %', bold: true })] }),
            new TableCell({ children: [new Paragraph({ text: 'Type', bold: true })] })
          ]
        }),
        ...subFunction.comparisonRows.map(row => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(row.headcount.toFixed(1))] }),
            new TableCell({ children: [new Paragraph(row.avgDurationDays.toString())] }),
            new TableCell({ children: [new Paragraph(row.p90DurationDays.toString())] }),
            new TableCell({ children: [new Paragraph(`${row.successRatePct.toFixed(1)}%`)] }),
            new TableCell({ children: [new Paragraph(`${row.riskPct.toFixed(1)}%`)] }),
            new TableCell({ children: [new Paragraph(row.isMvo ? 'MVO' : row.isBaseline ? 'Baseline' : '-')] })
          ]
        }))
      ];

      const comparisonTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: comparisonRows
      });

      children.push(comparisonTable);

      if (subFunction.aiSummaryMarkdown) {
        children.push(new Paragraph({
          text: 'AI Summary',
          bold: true,
          spacing: { before: 150, after: 50 }
        }));

        children.push(new Paragraph({
          text: subFunction.aiSummaryMarkdown,
          spacing: { after: 200 }
        }));
      }
    });

    children.push(new Paragraph({
      text: 'System Role Composition',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Pattern: ', bold: true }),
        new TextRun(data.simulationResult.systemRoleComposition.patternLabel)
      ],
      spacing: { after: 100 }
    }));

    const roleRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Role', bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: 'Level', bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: 'Units', bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: 'FTE Share', bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: 'Monthly Cost (RM)', bold: true })] })
        ]
      }),
      ...data.simulationResult.systemRoleComposition.rows.map(row => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(row.roleLabel)] }),
          new TableCell({ children: [new Paragraph(row.levelLabel)] }),
          new TableCell({ children: [new Paragraph(row.units.toFixed(1))] }),
          new TableCell({ children: [new Paragraph(row.fteShare.toFixed(2))] }),
          new TableCell({ children: [new Paragraph(`RM ${Math.round(row.monthlyCostRm).toLocaleString()}`)] })
        ]
      }))
    ];

    const roleTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: roleRows
    });

    children.push(roleTable);

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Total Monthly Cost: ', bold: true }),
        new TextRun(`RM ${Math.round(data.simulationResult.systemRoleComposition.totalMonthlyCostRm).toLocaleString()}`)
      ],
      spacing: { before: 100, after: 100 }
    }));

    if (data.simulationResult.systemRoleComposition.rationale) {
      children.push(new Paragraph({
        text: 'Rationale',
        bold: true,
        spacing: { before: 100, after: 50 }
      }));

      children.push(new Paragraph({
        text: data.simulationResult.systemRoleComposition.rationale,
        spacing: { after: 200 }
      }));
    }

    children.push(new Paragraph({
      text: 'AI Summary for HR Decision-Making',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 }
    }));

    const mvoHeadcount = data.simulationResult.keyStats.mvoHeadcount;
    const baselineHeadcount = data.simulationResult.keyStats.baselineHeadcount;
    const mvoFailureRiskPct = data.simulationResult.keyStats.mvoFailureRiskPct;

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Staffing: ', bold: true }),
        new TextRun(`The MVO analysis recommends ${mvoHeadcount.toFixed(1)} FTE, ${Math.abs(mvoHeadcount - baselineHeadcount).toFixed(1)} ${mvoHeadcount > baselineHeadcount ? 'more' : 'fewer'} than the baseline.`)
      ],
      spacing: { after: 100 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Risk: ', bold: true }),
        new TextRun(`The recommended configuration carries ${mvoFailureRiskPct < 10 ? 'low' : mvoFailureRiskPct < 25 ? 'medium' : 'high'} risk (${mvoFailureRiskPct.toFixed(1)}% failure rate).`)
      ],
      spacing: { after: 100 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Next Steps: ', bold: true }),
        new TextRun('Review the system-suggested role composition and adjust based on internal salary structures. Consider the recommended strategies for each sub-function.')
      ],
      spacing: { after: 200 }
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
    let yPos = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    const checkPageBreak = () => {
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
      }
    };

    doc.setFontSize(20);
    doc.text('MVO Results Report', 105, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(16);
    doc.text('Planning Context Summary', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.text(`Simulation Name: ${data.simulationName}`, 20, yPos);
    yPos += lineHeight;

    if (data.companyName || data.entity) {
      doc.text(`Entity / Company: ${data.companyName || data.entity || '-'}${data.businessPillar ? ` (${data.businessPillar})` : ''}`, 20, yPos);
      yPos += lineHeight;
    }

    if (data.region) {
      doc.text(`Location / Region: ${data.region}${data.country && data.region !== 'Global / Multi-region' ? ` • ${data.country}` : ''}`, 20, yPos);
      yPos += lineHeight;
    }

    doc.text(`Planning Type: ${data.planningType}`, 20, yPos);
    yPos += lineHeight;

    doc.text(`Size of Operation: ${data.sizeOfOperation}${data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : ''}`, 20, yPos);
    yPos += lineHeight + 3;

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Scope Size (What are you supporting?)', 20, yPos);
    yPos += 6;
    doc.setFont(undefined, 'normal');

    const employeesValue = data.scopeDriverType === 'employees_supported' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-';
    doc.text(`  • Employees Supported: ${employeesValue}`, 20, yPos);
    yPos += 5;

    const locationsValue = data.scopeDriverType === 'sites_locations' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-';
    doc.text(`  • Work Locations Supported: ${locationsValue}`, 20, yPos);
    yPos += 5;

    const workstreamsValue = data.scopeDriverType === 'projects_portfolios' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-';
    doc.text(`  • Active Workstreams: ${workstreamsValue}`, 20, yPos);
    yPos += 5;

    if (data.scopeDriverType && data.scopeDriverValue) {
      doc.setFont(undefined, 'bold');
      doc.text(`Primary Scope Driver: ${getScopeDriverLabel()}`, 20, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 7;
    }

    if (data.contextObjectives) {
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(`Context & Objectives: ${data.contextObjectives}`, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 5 + 5;
    }

    yPos += 5;
    checkPageBreak();

    doc.setFontSize(16);
    doc.text('MVO Recommendation', 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['FTE', data.totalFte.toFixed(1)],
        ['Average Duration (days)', data.avgDurationDays.toString()],
        ['P90 Duration (days)', data.p90DurationDays.toString()],
        ['Success Rate', `${data.successRatePct.toFixed(1)}%`],
        ['Monthly Cost (RM)', `RM ${Math.round(data.avgMonthlyCostRm).toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [14, 116, 144] },
      margin: { left: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
    checkPageBreak();

    doc.setFontSize(16);
    doc.text('Key Statistics', 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Baseline', 'MVO']],
      body: [
        ['Headcount (FTE)', data.simulationResult.keyStats.baselineHeadcount.toFixed(1), data.simulationResult.keyStats.mvoHeadcount.toFixed(1)],
        ['Monthly Cost (RM)', `RM ${Math.round(data.simulationResult.keyStats.baselineMonthlyCostRm).toLocaleString()}`, `RM ${Math.round(data.simulationResult.keyStats.mvoMonthlyCostRm).toLocaleString()}`],
        ['Failure Risk', `${data.simulationResult.keyStats.baselineFailureRiskPct.toFixed(1)}%`, `${data.simulationResult.keyStats.mvoFailureRiskPct.toFixed(1)}%`],
        ['Monthly Savings', '-', `RM ${Math.round(data.simulationResult.keyStats.monthlySavingsRm).toLocaleString()}`],
        ['Annual Savings', '-', `RM ${Math.round(data.simulationResult.keyStats.annualSavingsRm).toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [14, 116, 144] },
      margin: { left: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    data.simulationResult.subFunctions.forEach((subFunction, index) => {
      checkPageBreak();

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${subFunction.name}`, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Work Type: ${subFunction.workTypeLabel} | Baseline: ${subFunction.baselineHeadcount.toFixed(1)} FTE | MVO: ${subFunction.mvoHeadcount.toFixed(1)} FTE`, 20, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['Headcount', 'Avg Days', 'P90 Days', 'Success %', 'Risk %', 'Type']],
        body: subFunction.comparisonRows.slice(0, 5).map(row => [
          row.headcount.toFixed(1),
          row.avgDurationDays.toString(),
          row.p90DurationDays.toString(),
          `${row.successRatePct.toFixed(1)}%`,
          `${row.riskPct.toFixed(1)}%`,
          row.isMvo ? 'MVO' : row.isBaseline ? 'Baseline' : '-'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [14, 116, 144], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 20 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;
    });

    checkPageBreak();

    doc.setFontSize(16);
    doc.text('System Role Composition', 20, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Role', 'Level', 'Units', 'FTE Share', 'Monthly Cost (RM)']],
      body: data.simulationResult.systemRoleComposition.rows.map(row => [
        row.roleLabel,
        row.levelLabel,
        row.units.toFixed(1),
        row.fteShare.toFixed(2),
        `RM ${Math.round(row.monthlyCostRm).toLocaleString()}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [14, 116, 144], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 5;

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`Total: RM ${Math.round(data.simulationResult.systemRoleComposition.totalMonthlyCostRm).toLocaleString()}/month`, 20, yPos);

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Generated by MVO Planning Tool', 105, pageHeight - 10, { align: 'center' });

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

    const summaryData: any[][] = [
      ['MVO Results Report'],
      [],
      ['Planning Context Summary'],
      ['Simulation Name', data.simulationName]
    ];

    if (data.companyName || data.entity) {
      summaryData.push(['Entity / Company', `${data.companyName || data.entity || '-'}${data.businessPillar ? ` (${data.businessPillar})` : ''}`]);
    }

    if (data.region) {
      summaryData.push(['Location / Region', `${data.region}${data.country && data.region !== 'Global / Multi-region' ? ` • ${data.country}` : ''}`]);
    }

    summaryData.push(['Planning Type', data.planningType]);
    summaryData.push(['Size of Operation', data.sizeOfOperation + (data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : '')]);
    summaryData.push([]);
    summaryData.push(['Scope Size']);
    summaryData.push(['Employees Supported', data.scopeDriverType === 'employees_supported' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-']);
    summaryData.push(['Work Locations Supported', data.scopeDriverType === 'sites_locations' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-']);
    summaryData.push(['Active Workstreams', data.scopeDriverType === 'projects_portfolios' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-']);

    if (data.scopeDriverType && data.scopeDriverValue) {
      summaryData.push(['Primary Scope Driver', getScopeDriverLabel()]);
    }

    if (data.contextObjectives) {
      summaryData.push([]);
      summaryData.push(['Context & Objectives', data.contextObjectives]);
    }

    summaryData.push(
      [],
      ['MVO Recommendation'],
      ['Metric', 'Value'],
      ['FTE', data.totalFte.toFixed(1)],
      ['Average Duration (days)', data.avgDurationDays],
      ['P90 Duration (days)', data.p90DurationDays],
      ['Success Rate', `${data.successRatePct.toFixed(1)}%`],
      ['Monthly Cost (RM)', `RM ${Math.round(data.avgMonthlyCostRm).toLocaleString()}`]
    );

    summaryData.push(
      [],
      ['Key Statistics'],
      ['Metric', 'Baseline', 'MVO'],
      ['Headcount (FTE)', data.simulationResult.keyStats.baselineHeadcount.toFixed(1), data.simulationResult.keyStats.mvoHeadcount.toFixed(1)],
      ['Monthly Cost (RM)', `RM ${Math.round(data.simulationResult.keyStats.baselineMonthlyCostRm).toLocaleString()}`, `RM ${Math.round(data.simulationResult.keyStats.mvoMonthlyCostRm).toLocaleString()}`],
      ['Failure Risk', `${data.simulationResult.keyStats.baselineFailureRiskPct.toFixed(1)}%`, `${data.simulationResult.keyStats.mvoFailureRiskPct.toFixed(1)}%`],
      ['Monthly Savings', '-', `RM ${Math.round(data.simulationResult.keyStats.monthlySavingsRm).toLocaleString()}`],
      ['Annual Savings', '-', `RM ${Math.round(data.simulationResult.keyStats.annualSavingsRm).toLocaleString()}`]
    );

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 40 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    data.simulationResult.subFunctions.forEach((subFunction, index) => {
      const sfData: any[][] = [
        [`Sub-Function: ${subFunction.name}`],
        [],
        ['Work Type', subFunction.workTypeLabel],
        ['Baseline Headcount', subFunction.baselineHeadcount.toFixed(1)],
        ['MVO Headcount', subFunction.mvoHeadcount.toFixed(1)],
        ['Risk Level', subFunction.riskLevel],
        ['Recommended Strategy', subFunction.recommendedStrategy.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')],
        [],
        ['Comparison Analysis'],
        ['Headcount', 'Avg Days', 'P90 Days', 'Success %', 'Risk %', 'Type'],
        ...subFunction.comparisonRows.map(row => [
          row.headcount.toFixed(1),
          row.avgDurationDays,
          row.p90DurationDays,
          `${row.successRatePct.toFixed(1)}%`,
          `${row.riskPct.toFixed(1)}%`,
          row.isMvo ? 'MVO' : row.isBaseline ? 'Baseline' : '-'
        ])
      ];

      const sfSheet = XLSX.utils.aoa_to_sheet(sfData);
      sfSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, sfSheet, `SF${index + 1} ${subFunction.name.substring(0, 20)}`);
    });

    const roleData: any[][] = [
      ['System Role Composition'],
      [],
      ['Pattern', data.simulationResult.systemRoleComposition.patternLabel],
      ['Total FTE', data.simulationResult.systemRoleComposition.totalFte.toFixed(1)],
      ['Total Monthly Cost (RM)', `RM ${Math.round(data.simulationResult.systemRoleComposition.totalMonthlyCostRm).toLocaleString()}`],
      [],
      ['Role Breakdown'],
      ['Role', 'Level', 'Units', 'FTE Share', 'Monthly Cost (RM)'],
      ...data.simulationResult.systemRoleComposition.rows.map(row => [
        row.roleLabel,
        row.levelLabel,
        row.units.toFixed(1),
        row.fteShare.toFixed(2),
        `RM ${Math.round(row.monthlyCostRm).toLocaleString()}`
      ])
    ];

    if (data.simulationResult.systemRoleComposition.rationale) {
      roleData.push([]);
      roleData.push(['Rationale', data.simulationResult.systemRoleComposition.rationale]);
    }

    const roleSheet = XLSX.utils.aoa_to_sheet(roleData);
    roleSheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, roleSheet, 'Role Composition');

    XLSX.writeFile(workbook, `${data.simulationName}_MVO_Report.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
}
