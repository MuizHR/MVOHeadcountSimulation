import React from 'react';
import { Mail, Download, Plus, Users, DollarSign, Briefcase, TrendingUp, FileDown, FileText, Presentation } from 'lucide-react';
import jsPDF from 'jspdf';

interface RoleData {
  role: string;
  quantity: number;
  monthlyCost: number;
  complexity: 'Low' | 'Medium' | 'High';
  automationPotential: 'Low' | 'Medium' | 'High';
}

interface SimulationReportProps {
  planningType: string;
  mainFunction: string;
  sizeOfOperation: string;
  onNewSimulation: () => void;
}

const baseRolesByFunction: Record<string, RoleData[]> = {
  'property_management': [
    { role: 'Site Supervisor', quantity: 2, monthlyCost: 9000, complexity: 'Medium', automationPotential: 'Low' },
    { role: 'Technician', quantity: 6, monthlyCost: 18000, complexity: 'High', automationPotential: 'Low' },
    { role: 'Cleaner', quantity: 6, monthlyCost: 12000, complexity: 'Low', automationPotential: 'Medium' },
    { role: 'Admin Support', quantity: 2, monthlyCost: 5000, complexity: 'Medium', automationPotential: 'High' },
    { role: 'Security Personnel', quantity: 4, monthlyCost: 8000, complexity: 'Low', automationPotential: 'Medium' },
  ],
  'security_services': [
    { role: 'Security Supervisor', quantity: 2, monthlyCost: 8000, complexity: 'Medium', automationPotential: 'Low' },
    { role: 'Security Guard', quantity: 12, monthlyCost: 24000, complexity: 'Low', automationPotential: 'Medium' },
    { role: 'CCTV Operator', quantity: 2, monthlyCost: 6000, complexity: 'Medium', automationPotential: 'High' },
    { role: 'Admin Support', quantity: 1, monthlyCost: 3000, complexity: 'Medium', automationPotential: 'High' },
  ],
  'human_resources': [
    { role: 'HR Manager', quantity: 1, monthlyCost: 8000, complexity: 'High', automationPotential: 'Low' },
    { role: 'HR Executive', quantity: 3, monthlyCost: 12000, complexity: 'Medium', automationPotential: 'Medium' },
    { role: 'Payroll Specialist', quantity: 2, monthlyCost: 7000, complexity: 'High', automationPotential: 'High' },
    { role: 'Recruitment Officer', quantity: 2, monthlyCost: 6000, complexity: 'Medium', automationPotential: 'Medium' },
    { role: 'Admin Support', quantity: 2, monthlyCost: 5000, complexity: 'Low', automationPotential: 'High' },
  ],
  'finance_accounting': [
    { role: 'Finance Manager', quantity: 1, monthlyCost: 10000, complexity: 'High', automationPotential: 'Low' },
    { role: 'Accountant', quantity: 3, monthlyCost: 15000, complexity: 'High', automationPotential: 'Medium' },
    { role: 'Accounts Payable Clerk', quantity: 2, monthlyCost: 6000, complexity: 'Medium', automationPotential: 'High' },
    { role: 'Accounts Receivable Clerk', quantity: 2, monthlyCost: 6000, complexity: 'Medium', automationPotential: 'High' },
    { role: 'Admin Support', quantity: 1, monthlyCost: 3000, complexity: 'Low', automationPotential: 'High' },
  ],
  'operations': [
    { role: 'Operations Manager', quantity: 1, monthlyCost: 9000, complexity: 'High', automationPotential: 'Low' },
    { role: 'Operations Coordinator', quantity: 3, monthlyCost: 12000, complexity: 'Medium', automationPotential: 'Medium' },
    { role: 'Quality Control Officer', quantity: 2, monthlyCost: 7000, complexity: 'High', automationPotential: 'Medium' },
    { role: 'Logistics Officer', quantity: 2, monthlyCost: 6000, complexity: 'Medium', automationPotential: 'Medium' },
    { role: 'Admin Support', quantity: 2, monthlyCost: 5000, complexity: 'Low', automationPotential: 'High' },
  ],
};

const sizeMultipliers: Record<string, number> = {
  'small': 0.6,
  'medium': 1.0,
  'large': 1.5,
};

const formatLabel = (value: string): string => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export function SimulationReport({ planningType, mainFunction, sizeOfOperation, onNewSimulation }: SimulationReportProps) {
  const multiplier = sizeMultipliers[sizeOfOperation.toLowerCase()] || 1.0;

  const baseRoles = baseRolesByFunction[mainFunction] || baseRolesByFunction['operations'];

  const adjustedRoles: RoleData[] = baseRoles.map(role => ({
    ...role,
    quantity: Math.max(1, Math.round(role.quantity * multiplier)),
    monthlyCost: Math.round(role.monthlyCost * multiplier),
  }));

  const totalHeadcount = adjustedRoles.reduce((sum, role) => sum + role.quantity, 0);
  const totalMonthlyCost = adjustedRoles.reduce((sum, role) => sum + role.monthlyCost, 0);

  const scenarioId = `SIM-${Date.now().toString().slice(-8)}`;
  const currentDate = new Date().toLocaleDateString('en-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleEmailReport = () => {
    alert('Email report functionality will be implemented soon! Report will be sent to your registered email.');
  };

  const handleDownloadCSV = () => {
    const headers = ['Role / Activity', 'Quantity (Headcount)', 'Estimated Monthly Cost (RM)', 'Complexity', 'Automation Potential'];
    const rows = adjustedRoles.map(role => [
      role.role,
      role.quantity.toString(),
      role.monthlyCost.toString(),
      role.complexity,
      role.automationPotential,
    ]);
    rows.push(['TOTAL', totalHeadcount.toString(), totalMonthlyCost.toString(), '', '']);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-report-${scenarioId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadWord = () => {
    let docContent = `JLG Group MVO & Headcount Simulation Report\n\n`;
    docContent += `Planning Type: ${formatLabel(planningType)}\n`;
    docContent += `Function: ${formatLabel(mainFunction)}\n`;
    docContent += `Size of Operation: ${formatLabel(sizeOfOperation)}\n`;
    docContent += `\nRecommended MVO Headcount: ${totalHeadcount} pax\n`;
    docContent += `Estimated Monthly Workforce Cost: ${formatCurrency(totalMonthlyCost)}\n`;
    docContent += `\n\nHeadcount & Cost Breakdown\n\n`;

    adjustedRoles.forEach(role => {
      docContent += `${role.role}\n`;
      docContent += `  Quantity: ${role.quantity}\n`;
      docContent += `  Monthly Cost: ${formatCurrency(role.monthlyCost)}\n`;
      docContent += `  Complexity: ${role.complexity}\n`;
      docContent += `  Automation Potential: ${role.automationPotential}\n\n`;
    });

    docContent += `\nTOTAL: ${totalHeadcount} persons, ${formatCurrency(totalMonthlyCost)}\n`;

    const blob = new Blob([docContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-report-${scenarioId}.doc`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('JLG Group MVO & Headcount Simulation Report', 14, 20);

    doc.setFontSize(12);
    doc.text(`Planning Type: ${formatLabel(planningType)}`, 14, 35);
    doc.text(`Function: ${formatLabel(mainFunction)}`, 14, 42);
    doc.text(`Size of Operation: ${formatLabel(sizeOfOperation)}`, 14, 49);

    doc.setFontSize(14);
    doc.text(`Recommended MVO Headcount: ${totalHeadcount} pax`, 14, 63);
    doc.text(`Estimated Monthly Workforce Cost: ${formatCurrency(totalMonthlyCost)}`, 14, 70);

    doc.setFontSize(16);
    doc.text('Headcount & Cost Breakdown', 14, 85);

    doc.setFontSize(10);
    let yPos = 95;

    adjustedRoles.forEach((role, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(`${role.role}`, 14, yPos);
      doc.text(`Quantity: ${role.quantity}`, 14, yPos + 5);
      doc.text(`Monthly Cost: ${formatCurrency(role.monthlyCost)}`, 14, yPos + 10);
      doc.text(`Complexity: ${role.complexity}`, 14, yPos + 15);
      doc.text(`Automation Potential: ${role.automationPotential}`, 14, yPos + 20);

      yPos += 28;
    });

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.text(`TOTAL: ${totalHeadcount} persons, ${formatCurrency(totalMonthlyCost)}`, 14, yPos + 10);

    doc.setFontSize(8);
    doc.text(`Generated on: ${currentDate}`, 14, yPos + 25);
    doc.text(`Scenario ID: ${scenarioId}`, 14, yPos + 30);

    doc.save(`simulation-report-${scenarioId}.pdf`);
  };

  const handleDownloadPPT = () => {
    alert('PowerPoint export functionality requires a PPT library. Consider using PptxGenJS or a backend service for production.');
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAutomationColor = (potential: string) => {
    switch (potential) {
      case 'Low': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-blue-100 text-blue-700';
      case 'High': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">MVO & Headcount Simulation Report</h1>
              <p className="text-gray-600">Workforce planning analysis and recommendations</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleEmailReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
              >
                <FileDown className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={handleDownloadWord}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                Word
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <FileDown className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleDownloadPPT}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                <Presentation className="w-4 h-4" />
                PPT
              </button>
              <button
                onClick={onNewSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-sm border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600">Planning Type</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatLabel(planningType)}</p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 shadow-sm border border-teal-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600">Function</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatLabel(mainFunction)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 shadow-sm border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600">Size of Operation</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{formatLabel(sizeOfOperation)}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 shadow-sm border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600">Recommended MVO</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">{totalHeadcount} pax</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 shadow-sm border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600">Monthly Cost</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyCost)}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Headcount & Cost Breakdown</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role / Activity</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Quantity (Headcount)</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Estimated Monthly Cost (RM)</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Complexity</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Automation Potential</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adjustedRoles.map((role, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{role.role}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">{role.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">{formatCurrency(role.monthlyCost)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getComplexityColor(role.complexity)}`}>
                          {role.complexity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getAutomationColor(role.automationPotential)}`}>
                          {role.automationPotential}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-300">
                    <td className="px-6 py-4 text-sm text-gray-900">TOTAL</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">{totalHeadcount}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-900">{formatCurrency(totalMonthlyCost)}</td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Report Metadata</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-medium">Generated by:</p>
                <p className="text-gray-900">JLG Group User</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Department:</p>
                <p className="text-gray-900">{formatLabel(mainFunction)}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Generated on:</p>
                <p className="text-gray-900">{currentDate}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Scenario ID:</p>
                <p className="text-gray-900 font-mono">{scenarioId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-xs text-gray-500 italic">
            This simulator provides indicative estimates based on standardised assumptions and the Headcount Planning Framework & MVO Simulation Principles.
            Final decisions should also consider real operational data, management judgement and latest business conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
