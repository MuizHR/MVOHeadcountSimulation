import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx';
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

const TEAL_COLOR = '0E7490';
const LIGHT_TEAL = 'CCFBF1';
const BLUE_COLOR = '2563EB';
const LIGHT_BLUE = 'DBEAFE';
const PURPLE_COLOR = '7C3AED';
const LIGHT_PURPLE = 'EDE9FE';
const GRAY_100 = 'F3F4F6';
const GRAY_200 = 'E5E7EB';

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
      return `${label}: ${data.scopeDriverValue.toLocaleString()}`;
    };

    const children: Paragraph[] = [];

    children.push(new Paragraph({
      text: 'MVO RESULTS REPORT',
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
          text: data.simulationName,
          size: 32,
          bold: true,
          color: TEAL_COLOR
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    children.push(new Paragraph({
      text: 'Planning Context Summary',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        color: LIGHT_TEAL,
        fill: LIGHT_TEAL
      }
    }));

    const contextTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        ...(data.companyName || data.entity ? [new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Entity / Company', bold: true })],
              shading: { fill: GRAY_100 },
              width: { size: 30, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph(`${data.companyName || data.entity || '-'}${data.businessPillar ? ` (${data.businessPillar})` : ''}`)],
              width: { size: 70, type: WidthType.PERCENTAGE }
            })
          ]
        })] : []),
        ...(data.region || data.country ? [new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Location / Region', bold: true })],
              shading: { fill: GRAY_100 },
              width: { size: 30, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph(`${data.region || '-'}${data.country && data.region !== 'Global / Multi-region' ? ` • ${data.country}` : ''}`)],
              width: { size: 70, type: WidthType.PERCENTAGE }
            })
          ]
        })] : []),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Planning Type', bold: true })],
              shading: { fill: GRAY_100 },
              width: { size: 30, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph(data.planningType)],
              width: { size: 70, type: WidthType.PERCENTAGE }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Size of Operation', bold: true })],
              shading: { fill: GRAY_100 },
              width: { size: 30, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph(data.sizeOfOperation + (data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : ''))],
              width: { size: 70, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ]
    });

    children.push(contextTable);

    children.push(new Paragraph({
      text: 'Scope Size',
      bold: true,
      spacing: { before: 200, after: 100 }
    }));

    const scopeTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Metric', bold: true })],
              shading: { fill: TEAL_COLOR },
              width: { size: 50, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Value', bold: true })],
              shading: { fill: TEAL_COLOR },
              width: { size: 50, type: WidthType.PERCENTAGE }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Employees Supported')] }),
            new TableCell({ children: [new Paragraph(data.scopeDriverType === 'employees_supported' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-')] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Work Locations Supported')], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph(data.scopeDriverType === 'sites_locations' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-')], shading: { fill: GRAY_100 } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Active Workstreams')] }),
            new TableCell({ children: [new Paragraph(data.scopeDriverType === 'projects_portfolios' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-')] })
          ]
        })
      ]
    });

    children.push(scopeTable);

    if (data.scopeDriverType && data.scopeDriverValue) {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: 'Primary Scope Driver: ', bold: true }),
          new TextRun({ text: getScopeDriverLabel(), color: TEAL_COLOR, bold: true })
        ],
        spacing: { before: 100, after: 200 }
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
      spacing: { before: 300, after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        color: LIGHT_TEAL,
        fill: LIGHT_TEAL
      }
    }));

    const mvoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Metric', bold: true })],
              shading: { fill: TEAL_COLOR }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'Value', bold: true })],
              shading: { fill: TEAL_COLOR }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Total FTE')] }),
            new TableCell({ children: [new Paragraph({ text: data.totalFte.toFixed(1), bold: true })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Average Duration (days)')], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph({ text: data.avgDurationDays.toString(), bold: true })], shading: { fill: GRAY_100 } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('P90 Duration (days)')] }),
            new TableCell({ children: [new Paragraph({ text: data.p90DurationDays.toString(), bold: true })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Success Rate')], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph({ text: `${data.successRatePct.toFixed(1)}%`, bold: true })], shading: { fill: GRAY_100 } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Monthly Cost (RM)')] }),
            new TableCell({ children: [new Paragraph({ text: `RM ${Math.round(data.avgMonthlyCostRm).toLocaleString()}`, bold: true })] })
          ]
        })
      ]
    });

    children.push(mvoTable);

    children.push(new Paragraph({
      text: 'Key Statistics',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        color: LIGHT_BLUE,
        fill: LIGHT_BLUE
      }
    }));

    const keyStatsTable = new Table({
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
              children: [new Paragraph({ text: 'Baseline', bold: true })],
              shading: { fill: BLUE_COLOR },
              width: { size: 30, type: WidthType.PERCENTAGE }
            }),
            new TableCell({
              children: [new Paragraph({ text: 'MVO', bold: true })],
              shading: { fill: BLUE_COLOR },
              width: { size: 30, type: WidthType.PERCENTAGE }
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Headcount (FTE)')] }),
            new TableCell({ children: [new Paragraph(data.simulationResult.keyStats.baselineHeadcount.toFixed(1))] }),
            new TableCell({ children: [new Paragraph({ text: data.simulationResult.keyStats.mvoHeadcount.toFixed(1), bold: true })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Monthly Cost (RM)')], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph(`RM ${Math.round(data.simulationResult.keyStats.baselineMonthlyCostRm).toLocaleString()}`)], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph({ text: `RM ${Math.round(data.simulationResult.keyStats.mvoMonthlyCostRm).toLocaleString()}`, bold: true })], shading: { fill: GRAY_100 } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Failure Risk')] }),
            new TableCell({ children: [new Paragraph(`${data.simulationResult.keyStats.baselineFailureRiskPct.toFixed(1)}%`)] }),
            new TableCell({ children: [new Paragraph({ text: `${data.simulationResult.keyStats.mvoFailureRiskPct.toFixed(1)}%`, bold: true })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Monthly Savings')], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph('-')], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph({ text: `RM ${Math.round(data.simulationResult.keyStats.monthlySavingsRm).toLocaleString()}`, bold: true })], shading: { fill: GRAY_100 } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Annual Savings')] }),
            new TableCell({ children: [new Paragraph('-')] }),
            new TableCell({ children: [new Paragraph({ text: `RM ${Math.round(data.simulationResult.keyStats.annualSavingsRm).toLocaleString()}`, bold: true })] })
          ]
        })
      ]
    });

    children.push(keyStatsTable);

    children.push(new Paragraph({
      text: 'Duration Metrics',
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 300, after: 100 }
    }));

    const durationTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'Metric', bold: true })], shading: { fill: TEAL_COLOR } }),
            new TableCell({ children: [new Paragraph({ text: 'Days', bold: true })], shading: { fill: TEAL_COLOR } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('Average Duration')] }),
            new TableCell({ children: [new Paragraph({ text: data.simulationResult.keyStats.avgDurationDays.toString(), bold: true })] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('P50 Duration (Median)')], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph(data.simulationResult.keyStats.p50DurationDays.toString())], shading: { fill: GRAY_100 } })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('P75 Duration')] }),
            new TableCell({ children: [new Paragraph(data.simulationResult.keyStats.p75DurationDays.toString())] })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph('P90 Duration')], shading: { fill: GRAY_100 } }),
            new TableCell({ children: [new Paragraph({ text: data.simulationResult.keyStats.p90DurationDays.toString(), bold: true })], shading: { fill: GRAY_100 } })
          ]
        })
      ]
    });

    children.push(durationTable);

    children.push(new Paragraph({
      text: 'Sub-Function Details',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        color: LIGHT_PURPLE,
        fill: LIGHT_PURPLE
      }
    }));

    data.simulationResult.subFunctions.forEach((subFunction, index) => {
      children.push(new Paragraph({
        text: `${index + 1}. ${subFunction.name}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 }
      }));

      const sfTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Work Type', bold: true })], shading: { fill: GRAY_200 } }),
              new TableCell({ children: [new Paragraph(subFunction.workTypeLabel)] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Baseline Headcount', bold: true })], shading: { fill: GRAY_100 } }),
              new TableCell({ children: [new Paragraph(subFunction.baselineHeadcount.toFixed(1))], shading: { fill: GRAY_100 } })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'MVO Headcount', bold: true })], shading: { fill: LIGHT_TEAL } }),
              new TableCell({ children: [new Paragraph({ text: subFunction.mvoHeadcount.toFixed(1), bold: true })], shading: { fill: LIGHT_TEAL } })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Risk Level', bold: true })], shading: { fill: GRAY_100 } }),
              new TableCell({ children: [new Paragraph(subFunction.riskLevel)], shading: { fill: GRAY_100 } })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Recommended Strategy', bold: true })], shading: { fill: GRAY_200 } }),
              new TableCell({ children: [new Paragraph(subFunction.recommendedStrategy.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))] })
            ]
          })
        ]
      });

      children.push(sfTable);

      children.push(new Paragraph({
        text: 'Comparison Table',
        bold: true,
        spacing: { before: 150, after: 50 }
      }));

      const comparisonRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: 'HC', bold: true })], shading: { fill: PURPLE_COLOR } }),
            new TableCell({ children: [new Paragraph({ text: 'Avg', bold: true })], shading: { fill: PURPLE_COLOR } }),
            new TableCell({ children: [new Paragraph({ text: 'P90', bold: true })], shading: { fill: PURPLE_COLOR } }),
            new TableCell({ children: [new Paragraph({ text: 'Success', bold: true })], shading: { fill: PURPLE_COLOR } }),
            new TableCell({ children: [new Paragraph({ text: 'Risk', bold: true })], shading: { fill: PURPLE_COLOR } }),
            new TableCell({ children: [new Paragraph({ text: 'Type', bold: true })], shading: { fill: PURPLE_COLOR } })
          ]
        }),
        ...subFunction.comparisonRows.slice(0, 10).map(row => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(row.headcount.toFixed(1))], shading: row.isMvo ? { fill: LIGHT_TEAL } : undefined }),
            new TableCell({ children: [new Paragraph(row.avgDurationDays.toString())], shading: row.isMvo ? { fill: LIGHT_TEAL } : undefined }),
            new TableCell({ children: [new Paragraph(row.p90DurationDays.toString())], shading: row.isMvo ? { fill: LIGHT_TEAL } : undefined }),
            new TableCell({ children: [new Paragraph(`${row.successRatePct.toFixed(1)}%`)], shading: row.isMvo ? { fill: LIGHT_TEAL } : undefined }),
            new TableCell({ children: [new Paragraph(`${row.riskPct.toFixed(1)}%`)], shading: row.isMvo ? { fill: LIGHT_TEAL } : undefined }),
            new TableCell({ children: [new Paragraph({ text: row.isMvo ? 'MVO' : row.isBaseline ? 'Baseline' : '-', bold: row.isMvo || row.isBaseline })], shading: row.isMvo ? { fill: LIGHT_TEAL } : row.isBaseline ? { fill: GRAY_100 } : undefined })
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
      spacing: { before: 400, after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        color: LIGHT_TEAL,
        fill: LIGHT_TEAL
      }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Pattern: ', bold: true }),
        new TextRun({ text: data.simulationResult.systemRoleComposition.patternLabel, color: TEAL_COLOR, bold: true })
      ],
      spacing: { after: 100 }
    }));

    const roleRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: 'Role', bold: true })], shading: { fill: TEAL_COLOR } }),
          new TableCell({ children: [new Paragraph({ text: 'Level', bold: true })], shading: { fill: TEAL_COLOR } }),
          new TableCell({ children: [new Paragraph({ text: 'Units', bold: true })], shading: { fill: TEAL_COLOR } }),
          new TableCell({ children: [new Paragraph({ text: 'FTE Share', bold: true })], shading: { fill: TEAL_COLOR } }),
          new TableCell({ children: [new Paragraph({ text: 'Monthly Cost (RM)', bold: true })], shading: { fill: TEAL_COLOR } })
        ]
      }),
      ...data.simulationResult.systemRoleComposition.rows.map((row, idx) => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(row.roleLabel)], shading: idx % 2 === 0 ? { fill: GRAY_100 } : undefined }),
          new TableCell({ children: [new Paragraph(row.levelLabel)], shading: idx % 2 === 0 ? { fill: GRAY_100 } : undefined }),
          new TableCell({ children: [new Paragraph(row.units.toFixed(1))], shading: idx % 2 === 0 ? { fill: GRAY_100 } : undefined }),
          new TableCell({ children: [new Paragraph(row.fteShare.toFixed(2))], shading: idx % 2 === 0 ? { fill: GRAY_100 } : undefined }),
          new TableCell({ children: [new Paragraph(`RM ${Math.round(row.monthlyCostRm).toLocaleString()}`)], shading: idx % 2 === 0 ? { fill: GRAY_100 } : undefined })
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
        new TextRun({ text: `RM ${Math.round(data.simulationResult.systemRoleComposition.totalMonthlyCostRm).toLocaleString()}`, bold: true, size: 28, color: TEAL_COLOR })
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
      spacing: { before: 400, after: 200 },
      shading: {
        type: ShadingType.CLEAR,
        color: LIGHT_PURPLE,
        fill: LIGHT_PURPLE
      }
    }));

    const mvoHeadcount = data.simulationResult.keyStats.mvoHeadcount;
    const baselineHeadcount = data.simulationResult.keyStats.baselineHeadcount;
    const mvoFailureRiskPct = data.simulationResult.keyStats.mvoFailureRiskPct;

    children.push(new Paragraph({
      children: [
        new TextRun({ text: '• Staffing: ', bold: true }),
        new TextRun(`The MVO analysis recommends ${mvoHeadcount.toFixed(1)} FTE, ${Math.abs(mvoHeadcount - baselineHeadcount).toFixed(1)} ${mvoHeadcount > baselineHeadcount ? 'more' : 'fewer'} than the baseline.`)
      ],
      spacing: { after: 100 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: '• Risk: ', bold: true }),
        new TextRun(`The recommended configuration carries ${mvoFailureRiskPct < 10 ? 'low' : mvoFailureRiskPct < 25 ? 'medium' : 'high'} risk (${mvoFailureRiskPct.toFixed(1)}% failure rate).`)
      ],
      spacing: { after: 100 }
    }));

    children.push(new Paragraph({
      children: [
        new TextRun({ text: '• Next Steps: ', bold: true }),
        new TextRun('Review the system-suggested role composition and adjust based on internal salary structures. Consider the recommended strategies for each sub-function.')
      ],
      spacing: { after: 200 }
    }));

    children.push(new Paragraph({
      text: '',
      spacing: { before: 300 },
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
      return `${label}: ${data.scopeDriverValue.toLocaleString()}`;
    };

    const doc = new jsPDF();
    let yPos = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const tealColor: [number, number, number] = [14, 116, 144];
    const lightTeal: [number, number, number] = [204, 251, 241];
    const blueColor: [number, number, number] = [37, 99, 235];
    const lightBlue: [number, number, number] = [219, 234, 254];

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
    doc.text('MVO RESULTS REPORT', 105, 10, { align: 'center' });

    yPos = 25;
    doc.setFontSize(18);
    doc.setTextColor(...tealColor);
    doc.text(data.simulationName, 105, yPos, { align: 'center' });
    yPos += 15;

    doc.setFillColor(...lightTeal);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Planning Context Summary', 20, yPos);
    yPos += 12;

    const contextData: any[][] = [];
    if (data.companyName || data.entity) {
      contextData.push(['Entity / Company', `${data.companyName || data.entity || '-'}${data.businessPillar ? ` (${data.businessPillar})` : ''}`]);
    }
    if (data.region || data.country) {
      contextData.push(['Location / Region', `${data.region || '-'}${data.country && data.region !== 'Global / Multi-region' ? ` • ${data.country}` : ''}`]);
    }
    contextData.push(
      ['Planning Type', data.planningType],
      ['Size of Operation', data.sizeOfOperation + (data.autoSizeEnabled && data.scopeDriverType ? ' (Auto-suggested)' : '')]
    );

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

    yPos = (doc as any).lastAutoTable.finalY + 10;
    checkPageBreak();

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Scope Size', 20, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Employees Supported', data.scopeDriverType === 'employees_supported' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-'],
        ['Work Locations Supported', data.scopeDriverType === 'sites_locations' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-'],
        ['Active Workstreams', data.scopeDriverType === 'projects_portfolios' && data.scopeDriverValue ? data.scopeDriverValue.toLocaleString() : '-']
      ],
      theme: 'grid',
      headStyles: { fillColor: tealColor, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 90, fontStyle: 'bold' }
      },
      margin: { left: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 5;

    if (data.scopeDriverType && data.scopeDriverValue) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...tealColor);
      doc.text(`Primary Scope Driver: ${getScopeDriverLabel()}`, 20, yPos);
      yPos += 8;
    }

    yPos += 5;
    checkPageBreak();

    doc.setFillColor(...lightTeal);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('MVO Recommendation', 20, yPos);
    yPos += 12;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total FTE', data.totalFte.toFixed(1)],
        ['Average Duration (days)', data.avgDurationDays.toString()],
        ['P90 Duration (days)', data.p90DurationDays.toString()],
        ['Success Rate', `${data.successRatePct.toFixed(1)}%`],
        ['Monthly Cost (RM)', `RM ${Math.round(data.avgMonthlyCostRm).toLocaleString()}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: tealColor, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 90 },
        1: { cellWidth: 90, fontStyle: 'bold', textColor: tealColor }
      },
      margin: { left: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
    checkPageBreak();

    doc.setFillColor(...lightBlue);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Key Statistics', 20, yPos);
    yPos += 12;

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
      theme: 'striped',
      headStyles: { fillColor: blueColor, textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 60 },
        2: { cellWidth: 60, fontStyle: 'bold', textColor: blueColor }
      },
      margin: { left: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    data.simulationResult.subFunctions.forEach((subFunction, index) => {
      checkPageBreak();

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(...tealColor);
      doc.text(`${index + 1}. ${subFunction.name}`, 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Work Type: ${subFunction.workTypeLabel} | Baseline: ${subFunction.baselineHeadcount.toFixed(1)} FTE | MVO: ${subFunction.mvoHeadcount.toFixed(1)} FTE`, 20, yPos);
      yPos += 6;

      autoTable(doc, {
        startY: yPos,
        head: [['HC', 'Avg Days', 'P90 Days', 'Success %', 'Risk %', 'Type']],
        body: subFunction.comparisonRows.slice(0, 6).map(row => [
          row.headcount.toFixed(1),
          row.avgDurationDays.toString(),
          row.p90DurationDays.toString(),
          `${row.successRatePct.toFixed(1)}%`,
          `${row.riskPct.toFixed(1)}%`,
          row.isMvo ? 'MVO' : row.isBaseline ? 'Baseline' : '-'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [124, 58, 237], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const rowData = subFunction.comparisonRows[data.row.index];
            if (rowData?.isMvo) {
              (data.cell as any).styles.fillColor = [204, 251, 241];
              (data.cell as any).styles.fontStyle = 'bold';
            }
          }
        },
        margin: { left: 20 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 8;
    });

    checkPageBreak();

    doc.setFillColor(...lightTeal);
    doc.rect(15, yPos - 5, 180, 8, 'F');
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('System Role Composition', 20, yPos);
    yPos += 12;

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
      theme: 'striped',
      headStyles: { fillColor: tealColor, textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      margin: { left: 20 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 5;

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...tealColor);
    doc.text(`Total: RM ${Math.round(data.simulationResult.systemRoleComposition.totalMonthlyCostRm).toLocaleString()}/month`, 20, yPos);

    doc.setFillColor(...tealColor);
    doc.rect(0, pageHeight - 15, 210, 15, 'F');
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(255, 255, 255);
    doc.text('Generated by MVO Planning Tool', 105, pageHeight - 8, { align: 'center' });

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
      return `${label}: ${data.scopeDriverValue.toLocaleString()}`;
    };

    const workbook = XLSX.utils.book_new();

    const summaryData: any[][] = [
      ['MVO RESULTS REPORT'],
      [data.simulationName],
      [],
      ['PLANNING CONTEXT SUMMARY'],
      []
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
    summaryData.push(['SCOPE SIZE']);
    summaryData.push(['Employees Supported', data.scopeDriverType === 'employees_supported' && data.scopeDriverValue ? data.scopeDriverValue : '-']);
    summaryData.push(['Work Locations Supported', data.scopeDriverType === 'sites_locations' && data.scopeDriverValue ? data.scopeDriverValue : '-']);
    summaryData.push(['Active Workstreams', data.scopeDriverType === 'projects_portfolios' && data.scopeDriverValue ? data.scopeDriverValue : '-']);

    if (data.scopeDriverType && data.scopeDriverValue) {
      summaryData.push(['Primary Scope Driver', getScopeDriverLabel()]);
    }

    if (data.contextObjectives) {
      summaryData.push([]);
      summaryData.push(['Context & Objectives', data.contextObjectives]);
    }

    summaryData.push(
      [],
      ['MVO RECOMMENDATION'],
      ['Metric', 'Value'],
      ['Total FTE', data.totalFte.toFixed(1)],
      ['Average Duration (days)', data.avgDurationDays],
      ['P90 Duration (days)', data.p90DurationDays],
      ['Success Rate', `${data.successRatePct.toFixed(1)}%`],
      ['Monthly Cost (RM)', Math.round(data.avgMonthlyCostRm)]
    );

    summaryData.push(
      [],
      ['KEY STATISTICS'],
      ['Metric', 'Baseline', 'MVO'],
      ['Headcount (FTE)', data.simulationResult.keyStats.baselineHeadcount.toFixed(1), data.simulationResult.keyStats.mvoHeadcount.toFixed(1)],
      ['Monthly Cost (RM)', Math.round(data.simulationResult.keyStats.baselineMonthlyCostRm), Math.round(data.simulationResult.keyStats.mvoMonthlyCostRm)],
      ['Failure Risk (%)', data.simulationResult.keyStats.baselineFailureRiskPct.toFixed(1), data.simulationResult.keyStats.mvoFailureRiskPct.toFixed(1)],
      ['Monthly Savings (RM)', '-', Math.round(data.simulationResult.keyStats.monthlySavingsRm)],
      ['Annual Savings (RM)', '-', Math.round(data.simulationResult.keyStats.annualSavingsRm)]
    );

    summaryData.push(
      [],
      ['DURATION METRICS'],
      ['Metric', 'Days'],
      ['Average Duration', data.simulationResult.keyStats.avgDurationDays],
      ['P50 Duration (Median)', data.simulationResult.keyStats.p50DurationDays],
      ['P75 Duration', data.simulationResult.keyStats.p75DurationDays],
      ['P90 Duration', data.simulationResult.keyStats.p90DurationDays]
    );

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 35 }, { wch: 50 }, { wch: 25 }];

    summarySheet['A1'].s = { font: { bold: true, sz: 16, color: { rgb: '0E7490' } }, alignment: { horizontal: 'center' } };
    summarySheet['A2'].s = { font: { bold: true, sz: 14, color: { rgb: '0E7490' } }, alignment: { horizontal: 'center' } };
    summarySheet['A4'].s = { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: 'CCFBF1' } } };

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    data.simulationResult.subFunctions.forEach((subFunction, index) => {
      const sfData: any[][] = [
        [`SUB-FUNCTION: ${subFunction.name.toUpperCase()}`],
        [],
        ['Work Type', subFunction.workTypeLabel],
        ['Baseline Headcount', subFunction.baselineHeadcount.toFixed(1)],
        ['MVO Headcount', subFunction.mvoHeadcount.toFixed(1)],
        ['Risk Level', subFunction.riskLevel],
        ['Recommended Strategy', subFunction.recommendedStrategy.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')],
        [],
        ['COMPARISON ANALYSIS'],
        ['Headcount', 'Avg Days', 'P90 Days', 'Success %', 'Risk %', 'Type'],
        ...subFunction.comparisonRows.map(row => [
          row.headcount.toFixed(1),
          row.avgDurationDays,
          row.p90DurationDays,
          row.successRatePct.toFixed(1),
          row.riskPct.toFixed(1),
          row.isMvo ? 'MVO' : row.isBaseline ? 'Baseline' : '-'
        ])
      ];

      const sfSheet = XLSX.utils.aoa_to_sheet(sfData);
      sfSheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(workbook, sfSheet, `${index + 1} ${subFunction.name.substring(0, 25)}`);
    });

    const roleData: any[][] = [
      ['SYSTEM ROLE COMPOSITION'],
      [],
      ['Pattern', data.simulationResult.systemRoleComposition.patternLabel],
      ['Total FTE', data.simulationResult.systemRoleComposition.totalFte.toFixed(1)],
      ['Total Monthly Cost (RM)', Math.round(data.simulationResult.systemRoleComposition.totalMonthlyCostRm)],
      [],
      ['ROLE BREAKDOWN'],
      ['Role', 'Level', 'Units', 'FTE Share', 'Monthly Cost (RM)'],
      ...data.simulationResult.systemRoleComposition.rows.map(row => [
        row.roleLabel,
        row.levelLabel,
        row.units.toFixed(1),
        row.fteShare.toFixed(2),
        Math.round(row.monthlyCostRm)
      ])
    ];

    if (data.simulationResult.systemRoleComposition.rationale) {
      roleData.push([]);
      roleData.push(['Rationale', data.simulationResult.systemRoleComposition.rationale]);
    }

    const roleSheet = XLSX.utils.aoa_to_sheet(roleData);
    roleSheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, roleSheet, 'Role Composition');

    XLSX.writeFile(workbook, `${data.simulationName}_MVO_Report.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
}
