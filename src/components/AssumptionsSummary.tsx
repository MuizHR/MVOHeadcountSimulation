import React from 'react';
import { SimulationInputs } from '../types/simulation';
import { FileText } from 'lucide-react';

interface AssumptionsSummaryProps {
  inputs: SimulationInputs;
}

export function AssumptionsSummary({ inputs }: AssumptionsSummaryProps) {
  const formatLabel = (value: string): string => {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(amount);
  };

  const summaryItems = [
    { label: 'Simulation Name', value: inputs.simulationName },
    { label: 'Planning Type', value: formatLabel(inputs.planningType) },
    { label: 'Function Type', value: formatLabel(inputs.functionType) },
    { label: 'Nature of Work', value: formatLabel(inputs.natureOfWork) },
    { label: 'Project Length', value: `${inputs.projectLength} months` },
    { label: 'Total Project Value', value: formatCurrency(inputs.totalProjectValue) },
    { label: 'Workload Level', value: formatLabel(inputs.workloadLevel) },
    { label: 'Complexity Level', value: formatLabel(inputs.complexityLevel) },
    { label: 'Service Level', value: formatLabel(inputs.serviceLevel) },
    { label: 'Compliance Intensity', value: formatLabel(inputs.complianceIntensity) },
    { label: 'Automation Potential', value: `${inputs.automationPotential}%` },
    { label: 'Outsourcing Level', value: `${inputs.outsourcingLevel}%` },
    { label: 'Expected Growth', value: formatLabel(inputs.expectedGrowth) },
    { label: 'Digital Maturity', value: formatLabel(inputs.digitalMaturity) },
    {
      label: 'Workforce Mix',
      value: `${inputs.workforceMix.permanent}% Permanent / ${inputs.workforceMix.contract}% Contract / ${inputs.workforceMix.gig}% Gig`,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold text-gray-800">Current Assumptions</h3>
      </div>

      <div className="space-y-3">
        {summaryItems.map((item, index) => (
          <div key={index} className="flex justify-between items-start border-b border-gray-100 pb-2">
            <span className="text-sm font-medium text-gray-600 w-1/2">{item.label}</span>
            <span className="text-sm text-gray-800 w-1/2 text-right">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-teal-50 rounded-lg">
        <p className="text-xs text-gray-600 leading-relaxed">
          These assumptions will be used to calculate headcount, duration, and cost estimates across six different scenarios.
          Review carefully before running the simulation.
        </p>
      </div>
    </div>
  );
}
