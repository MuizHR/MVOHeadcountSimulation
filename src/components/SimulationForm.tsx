import React from 'react';
import { SimulationInputs, WorkforceMix, getFieldVisibility } from '../types/simulation';
import { ValidationErrors } from '../utils/validation';
import { Info } from 'lucide-react';
import { SelectWithDefinitions } from './SelectWithDefinitions';

interface SimulationFormProps {
  inputs: SimulationInputs;
  onChange: (inputs: SimulationInputs) => void;
  errors: ValidationErrors;
}

const WORKLOAD_OPTIONS = [
  { value: 'low', label: 'Low', definition: 'Minimal work volume. Occasional tasks that can be handled by a small team with time to spare. Example: Monthly reporting for a stable department.' },
  { value: 'medium', label: 'Medium', definition: 'Moderate work volume. Regular daily tasks that keep a team consistently busy. Example: Standard customer service operations with predictable flow.' },
  { value: 'high', label: 'High', definition: 'Heavy work volume. Continuous workload requiring dedicated resources with little downtime. Example: High-transaction processing or peak season operations.' },
  { value: 'very_high', label: 'Very High', definition: 'Extreme work volume. Overwhelming demand requiring maximum staffing and potential overtime. Example: Major system migration or crisis response operations.' },
];

const COMPLEXITY_OPTIONS = [
  { value: 'low', label: 'Low', definition: 'Simple, routine tasks. Minimal training required, clear procedures, low error risk. Example: Data entry, basic filing, simple customer inquiries.' },
  { value: 'medium', label: 'Medium', definition: 'Moderate complexity. Requires some training and judgment, occasional problem-solving needed. Example: Processing transactions with multiple steps, basic troubleshooting.' },
  { value: 'high', label: 'High', definition: 'Complex tasks requiring specialized knowledge. Significant training needed, frequent decision-making. Example: Financial analysis, technical support, regulatory compliance work.' },
  { value: 'very_high', label: 'Very High', definition: 'Highly specialized expert-level work. Extensive experience required, critical decisions with major impact. Example: Strategic planning, cybersecurity, M&A due diligence.' },
];

const SERVICE_LEVEL_OPTIONS = [
  { value: 'basic', label: 'Basic', definition: 'Non-critical service. Extended response times acceptable, minimal business impact if delayed. Example: Internal requests, routine administrative tasks.' },
  { value: 'normal', label: 'Normal', definition: 'Standard service level. Timely response expected but some flexibility allowed. Example: Regular customer support, standard HR services.' },
  { value: 'high', label: 'High', definition: 'Important service requiring quick response. Business impact if not handled promptly. Example: Priority client accounts, key operational support.' },
  { value: 'critical', label: 'Critical', definition: 'Mission-critical operations. Zero tolerance for failure or delay, immediate response required. Example: Emergency services, financial settlements, life-safety systems.' },
];

const COMPLIANCE_OPTIONS = [
  { value: 'low', label: 'Low', definition: 'Minimal regulatory requirements. Basic internal policies and standard business practices. Example: General office administration, internal communications.' },
  { value: 'medium', label: 'Medium', definition: 'Moderate compliance needs. Industry standards and regular audits required. Example: HR records management, vendor contracts, quality control.' },
  { value: 'high', label: 'High', definition: 'Heavily regulated environment. Strict regulatory oversight, detailed documentation, severe penalties for non-compliance. Example: Banking operations, healthcare records, pharmaceuticals, legal services.' },
];

const GROWTH_OPTIONS = [
  { value: 'stable', label: 'Stable', definition: 'No significant growth expected. Workload remains consistent, minimal scaling needed. Suitable for mature, steady-state operations.' },
  { value: 'moderate', label: 'Moderate', definition: '10-25% growth expected. Gradual expansion, manageable increases in workload. Example: Business-as-usual growth with some new initiatives.' },
  { value: 'high', label: 'High', definition: '25-50% growth expected. Significant expansion requiring proactive workforce planning. Example: New market entry, major product launch.' },
  { value: 'aggressive', label: 'Aggressive', definition: '50%+ growth expected. Rapid scaling required to meet surging demand. Example: High-growth startup phase, major organizational transformation.' },
];

const DIGITAL_MATURITY_OPTIONS = [
  { value: 'low', label: 'Low', definition: 'Manual, paper-based processes. Limited technology adoption, minimal digital tools. Requires significant manual effort and high headcount.' },
  { value: 'medium', label: 'Medium', definition: 'Mix of digital and manual processes. Some automation in place, standard software tools used. Opportunities for further digitalization exist.' },
  { value: 'high', label: 'High', definition: 'Highly digitalized operations. Advanced automation, integrated systems, data-driven decision making. Efficient processes with lower manual effort required.' },
];

const RESTRUCTURING_GOAL_OPTIONS = [
  { value: 'cost_reduction', label: 'Cost Reduction', definition: 'Primary focus on reducing operational costs and workforce expenses while maintaining service levels.' },
  { value: 'efficiency_improvement', label: 'Efficiency Improvement', definition: 'Focus on streamlining processes, eliminating redundancies, and improving productivity with same or less headcount.' },
  { value: 'capability_building', label: 'Capability Building', definition: 'Restructuring to build new capabilities, upskill workforce, or shift to higher-value work.' },
  { value: 'digital_transformation', label: 'Digital Transformation', definition: 'Major shift to digital operations, automation, and new ways of working requiring workforce reconfiguration.' },
];

export function SimulationForm({ inputs, onChange, errors }: SimulationFormProps) {
  const updateField = <K extends keyof SimulationInputs>(field: K, value: SimulationInputs[K]) => {
    onChange({ ...inputs, [field]: value });
  };

  const updateWorkforceMix = (field: keyof WorkforceMix, value: number) => {
    onChange({
      ...inputs,
      workforceMix: { ...inputs.workforceMix, [field]: value },
    });
  };

  const fieldVisibility = getFieldVisibility(inputs.planningType);

  const getPlanningTypeDescription = (type: string) => {
    switch (type) {
      case 'new_project':
        return 'Setting up a time-bound project with defined scope, duration, and deliverables.';
      case 'new_function':
        return 'Establishing a new ongoing operational function within the organization.';
      case 'new_business_unit':
        return 'Creating a new business unit with multiple functions and long-term strategic goals.';
      case 'restructuring':
        return 'Reorganizing an existing function or unit to improve efficiency, reduce costs, or build new capabilities.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Simulation Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={inputs.simulationName}
          onChange={(e) => updateField('simulationName', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            errors.simulationName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Q1 2024 Security Expansion"
        />
        <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          Give your simulation a descriptive name for easy reference later
        </p>
        {errors.simulationName && (
          <p className="mt-1 text-sm text-red-500">{errors.simulationName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Planning Type</label>
        <select
          value={inputs.planningType}
          onChange={(e) => updateField('planningType', e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="new_project">New Project</option>
          <option value="new_function">New Function</option>
          <option value="new_business_unit">New Business Unit</option>
          <option value="restructuring">Restructuring</option>
        </select>
        <p className="mt-2 text-xs text-gray-600 bg-teal-50 border border-teal-200 rounded-md p-2">
          {getPlanningTypeDescription(inputs.planningType)}
        </p>
      </div>

      {fieldVisibility.functionType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Function Type</label>
          <select
            value={inputs.functionType}
            onChange={(e) => updateField('functionType', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="property_management">Property Management</option>
            <option value="security_services">Security Services</option>
            <option value="hr">Human Resources</option>
            <option value="finance">Finance</option>
            <option value="it">IT</option>
            <option value="operations">Operations</option>
            <option value="customer_service">Customer Service</option>
            <option value="other">Other</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Choose the business function this simulation relates to
          </p>
        </div>
      )}

      {fieldVisibility.natureOfWork && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nature of Work</label>
          <select
            value={inputs.natureOfWork}
            onChange={(e) => updateField('natureOfWork', e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="frontline">Frontline</option>
            <option value="back_office">Back Office</option>
            <option value="twenty_four_seven">24/7 Operations</option>
            <option value="project_based">Project-Based</option>
            <option value="mixed">Mixed</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Frontline: Customer-facing roles | 24/7: Round-the-clock coverage required
          </p>
        </div>
      )}

      {fieldVisibility.existingHeadcount && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Headcount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={inputs.existingHeadcount || ''}
            onChange={(e) => updateField('existingHeadcount', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., 25"
          />
          <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Number of people currently in this function/unit before restructuring
          </p>
        </div>
      )}

      {fieldVisibility.currentMonthlyCost && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Monthly Cost (RM) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={inputs.currentMonthlyCost || ''}
            onChange={(e) => updateField('currentMonthlyCost', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., 200000"
          />
          <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Total monthly workforce cost before restructuring. Example: 200000 for RM 200k/month
          </p>
        </div>
      )}

      {fieldVisibility.restructuringGoal && (
        <SelectWithDefinitions
          label="Restructuring Goal"
          value={inputs.restructuringGoal || 'efficiency_improvement'}
          options={RESTRUCTURING_GOAL_OPTIONS}
          onChange={(value) => updateField('restructuringGoal', value as any)}
        />
      )}

      {fieldVisibility.targetSavings && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Cost Savings (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="5"
            value={inputs.targetSavings || 0}
            onChange={(e) => updateField('targetSavings', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., 20"
          />
          <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Target percentage reduction in monthly costs (optional, for cost reduction goals)
          </p>
        </div>
      )}

      {fieldVisibility.projectLength && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Length (months)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={inputs.projectLength}
            onChange={(e) => updateField('projectLength', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Expected duration of the project (1-60 months). Example: 12 for a one-year project
          </p>
        </div>
      )}

      {fieldVisibility.totalProjectValue && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Project Value (RM)</label>
          <input
            type="number"
            min="0"
            step="10000"
            value={inputs.totalProjectValue}
            onChange={(e) => updateField('totalProjectValue', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g., 1000000"
          />
          <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Total budget or contract value in Malaysian Ringgit. Example: 1000000 for RM 1 million
          </p>
        </div>
      )}

      {fieldVisibility.workloadLevel && (
        <SelectWithDefinitions
          label="Workload Level"
          value={inputs.workloadLevel}
          options={WORKLOAD_OPTIONS}
          onChange={(value) => updateField('workloadLevel', value as any)}
        />
      )}

      {fieldVisibility.complexityLevel && (
        <SelectWithDefinitions
          label="Complexity Level"
          value={inputs.complexityLevel}
          options={COMPLEXITY_OPTIONS}
          onChange={(value) => updateField('complexityLevel', value as any)}
        />
      )}

      {fieldVisibility.serviceLevel && (
        <SelectWithDefinitions
          label="Service Level / Criticality"
          value={inputs.serviceLevel}
          options={SERVICE_LEVEL_OPTIONS}
          onChange={(value) => updateField('serviceLevel', value as any)}
        />
      )}

      {fieldVisibility.complianceIntensity && (
        <SelectWithDefinitions
          label="Compliance Intensity"
          value={inputs.complianceIntensity}
          options={COMPLIANCE_OPTIONS}
          onChange={(value) => updateField('complianceIntensity', value as any)}
        />
      )}

      {fieldVisibility.automationPotential && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Automation Potential: {inputs.automationPotential}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={inputs.automationPotential}
            onChange={(e) => updateField('automationPotential', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            How much of the work can be automated? 0%: Fully manual | 100%: Fully automated
          </p>
        </div>
      )}

      {fieldVisibility.outsourcingLevel && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outsourcing Level: {inputs.outsourcingLevel}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={inputs.outsourcingLevel}
            onChange={(e) => updateField('outsourcingLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Percentage of work to be outsourced. 0%: All in-house | 100%: Fully outsourced
          </p>
        </div>
      )}

      {fieldVisibility.expectedGrowth && (
        <SelectWithDefinitions
          label="Expected Growth"
          value={inputs.expectedGrowth}
          options={GROWTH_OPTIONS}
          onChange={(value) => updateField('expectedGrowth', value as any)}
        />
      )}

      {fieldVisibility.digitalMaturity && (
        <SelectWithDefinitions
          label="Digital Maturity"
          value={inputs.digitalMaturity}
          options={DIGITAL_MATURITY_OPTIONS}
          onChange={(value) => updateField('digitalMaturity', value as any)}
        />
      )}

      {fieldVisibility.workforceMix && (
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Workforce Mix <span className="text-red-500">*</span>
          </label>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Permanent</span>
                <span>{inputs.workforceMix.permanent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={inputs.workforceMix.permanent}
                onChange={(e) => updateWorkforceMix('permanent', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Contract</span>
                <span>{inputs.workforceMix.contract}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={inputs.workforceMix.contract}
                onChange={(e) => updateWorkforceMix('contract', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Gig Workers</span>
                <span>{inputs.workforceMix.gig}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={inputs.workforceMix.gig}
                onChange={(e) => updateWorkforceMix('gig', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-500 flex items-start gap-1">
            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
            Adjust the mix to total 100%. Example: 70% permanent, 20% contract, 10% gig workers
          </p>

          {errors.workforceMix && (
            <p className="mt-2 text-sm text-red-500">{errors.workforceMix}</p>
          )}
        </div>
      )}
    </div>
  );
}
