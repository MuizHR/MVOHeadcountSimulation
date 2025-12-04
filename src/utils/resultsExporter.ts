import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { SimulationResult } from '../types/dashboardResult';

export interface ExportData {
  simulationName: string;
  planningType: string;
  sizeOfOperation: string;
  totalFte: number;
  avgDurationDays: number;
  p90DurationDays: number;
  successRatePct: number;
  avgMonthlyCostRm: number;
}

export async function exportToWord(data: ExportData): Promise<void> {
  try {
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
          new Paragraph({
            text: 'Simulation Details',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Project/Simulation Name: ', bold: true }),
              new TextRun(data.simulationName)
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Planning Type: ', bold: true }),
              new TextRun(data.planningType)
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Size of Operation: ', bold: true }),
              new TextRun(data.sizeOfOperation)
            ],
            spacing: { after: 300 }
          }),
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
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('MVO Results Report', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.text('Simulation Details', 20, 40);

    doc.setFontSize(12);
    doc.text(`Project/Simulation Name: ${data.simulationName}`, 20, 55);
    doc.text(`Planning Type: ${data.planningType}`, 20, 65);
    doc.text(`Size of Operation: ${data.sizeOfOperation}`, 20, 75);

    doc.setFontSize(16);
    doc.text('MVO Recommendation', 20, 95);

    doc.setFontSize(12);
    const yStart = 110;
    const lineHeight = 10;

    doc.text(`FTE: ${data.totalFte.toFixed(1)}`, 30, yStart);
    doc.text(`Average Duration: ${data.avgDurationDays} days`, 30, yStart + lineHeight);
    doc.text(`P90 Duration: ${data.p90DurationDays} days`, 30, yStart + lineHeight * 2);
    doc.text(`Success Rate: ${data.successRatePct.toFixed(1)}%`, 30, yStart + lineHeight * 3);
    doc.text(`Monthly Cost: RM ${Math.round(data.avgMonthlyCostRm).toLocaleString()}`, 30, yStart + lineHeight * 4);

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
    const workbook = XLSX.utils.book_new();

    const detailsData = [
      ['MVO Results Report'],
      [],
      ['Simulation Details'],
      ['Project/Simulation Name', data.simulationName],
      ['Planning Type', data.planningType],
      ['Size of Operation', data.sizeOfOperation],
      [],
      ['MVO Recommendation'],
      ['Metric', 'Value'],
      ['FTE', data.totalFte.toFixed(1)],
      ['Average Duration (days)', data.avgDurationDays],
      ['P90 Duration (days)', data.p90DurationDays],
      ['Success Rate', `${data.successRatePct.toFixed(1)}%`],
      ['Monthly Cost (RM)', `RM ${Math.round(data.avgMonthlyCostRm).toLocaleString()}`]
    ];

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
