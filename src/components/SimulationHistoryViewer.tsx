import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Briefcase, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { KPICards } from './dashboard/KPICards';
import { SystemRoleCompositionPanel } from './dashboard/SystemRoleCompositionPanel';
import { SubFunctionAccordion } from './dashboard/SubFunctionAccordion';
import { HeadcountComparisonTable } from './dashboard/HeadcountComparisonTable';
import { planningTypeConfig, sizeOfOperationConfig } from '../types/planningConfig';
import { simulationHistoryService } from '../services/simulationHistoryService';

interface SimulationHistoryViewerProps {
  simulationId: string;
  onBack: () => void;
}

function ReadOnlyBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-md">
      <Info className="w-4 h-4 text-amber-700" />
      <span className="text-sm font-medium text-amber-900">Read-Only View</span>
    </div>
  );
}

interface QuestionCardProps {
  title: string;
  number: number;
  help?: string;
  children: React.ReactNode;
}

function QuestionCard({ title, number, help, children }: QuestionCardProps) {
  return (
    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          {help && (
            <div className="flex items-start gap-2 mt-2">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{help}</p>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

interface OptionDisplayProps {
  selected: boolean;
  children: React.ReactNode;
}

function OptionDisplay({ selected, children }: OptionDisplayProps) {
  return (
    <div
      className={`
        w-full p-4 rounded-lg border-2 text-left font-medium cursor-not-allowed
        ${
          selected
            ? 'border-teal-600 bg-teal-50 text-teal-900'
            : 'border-gray-300 bg-gray-100 text-gray-500'
        }
      `}
    >
      {children}
    </div>
  );
}

export function SimulationHistoryViewer({ simulationId, onBack }: SimulationHistoryViewerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSubFunctions, setExpandedSubFunctions] = useState<Record<number, boolean>>({});
  const [simulation, setSimulation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSimulation();
  }, [simulationId]);

  const loadSimulation = async () => {
    try {
      const data = await simulationHistoryService.getSimulationById(simulationId);
      setSimulation(data);
    } catch (error) {
      console.error('Error loading simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (!simulation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Simulation not found</p>
          <button onClick={onBack} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const inputPayload = simulation.input_payload || {};
  const resultPayload = simulation.result_payload || {};
  const simulationInputs = inputPayload.simulationInputs || {};
  const subFunctions = inputPayload.subFunctions || [];
  const simulationResult = resultPayload.simulationResult || null;

  const tabs = [
    { id: 0, label: 'Context', sublabel: 'Planning scope and objectives' },
    { id: 1, label: 'Setup', sublabel: 'Functions and sub-functions' },
    { id: 2, label: 'Workload', sublabel: 'Volume and complexity' },
    { id: 3, label: 'Model', sublabel: 'Structure and delivery' },
    { id: 4, label: 'Review', sublabel: 'Validate and calculate' },
    { id: 5, label: 'Results', sublabel: 'FTE recommendations' },
  ];

  const planningTypeLabel = simulationInputs.planningTypeKey
    ? planningTypeConfig[simulationInputs.planningTypeKey]?.label
    : 'Not specified';

  const sizeOfOperationLabel = simulationInputs.sizeOfOperationKey
    ? sizeOfOperationConfig[simulationInputs.sizeOfOperationKey]?.label
    : 'Not specified';

  const businessArea = simulation.business_area || 'Not specified';

  const toggleSubFunction = (index: number) => {
    setExpandedSubFunctions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{simulation.simulation_name}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-teal-50">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(simulation.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{businessArea}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-shrink-0 px-6 py-4 text-left border-b-2 transition-colors min-w-[140px]
                  ${
                    activeTab === tab.id
                      ? 'border-teal-600 bg-white'
                      : 'border-transparent hover:bg-gray-100'
                  }
                `}
              >
                <div
                  className={`
                    text-sm font-semibold
                    ${activeTab === tab.id ? 'text-teal-700' : 'text-gray-600'}
                  `}
                >
                  {tab.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{tab.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 0 && (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">Planning Context</h2>
                  <ReadOnlyBadge />
                </div>

                <div className="space-y-6">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Simulation Name
                    </label>
                    <div className="text-lg font-medium text-gray-900">
                      {simulation.simulation_name}
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What type of planning are you doing?
                    </label>
                    <div className="text-lg font-medium text-gray-900">{planningTypeLabel}</div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Size of operation
                    </label>
                    <div className="text-lg font-medium text-gray-900">{sizeOfOperationLabel}</div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business Area / Function
                    </label>
                    <div className="text-lg font-medium text-gray-900">{businessArea}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">Function Setup</h2>
                  <ReadOnlyBadge />
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {businessArea}
                  </h3>
                  <p className="text-gray-600">
                    {subFunctions.length} sub-function{subFunctions.length !== 1 ? 's' : ''} configured
                  </p>
                </div>

                <div className="space-y-4">
                  {subFunctions.map((sf: any, index: number) => (
                    <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Sub-Function {index + 1}
                          </div>
                          <div className="text-xl font-bold text-gray-900">{sf.name}</div>
                        </div>
                        <div className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                          {sf.status === 'fully_configured' ? 'Configured' : 'Partial'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Workload & Risk Inputs</h2>
                    <p className="text-gray-600 mt-1">15 questions across 5 categories</p>
                  </div>
                  <ReadOnlyBadge />
                </div>

                {subFunctions && Array.isArray(subFunctions) && subFunctions.length > 0 ? (
                  <div className="space-y-8">
                    {subFunctions.map((sf: any, sfIndex: number) => {
                      const hrAnswers = sf.hrAnswers || {};
                      const isExpanded = expandedSubFunctions[sfIndex];

                      return (
                        <div key={sfIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
                          <button
                            onClick={() => toggleSubFunction(sfIndex)}
                            className="w-full bg-teal-600 text-white px-6 py-4 flex items-center justify-between hover:bg-teal-700 transition-colors"
                          >
                            <div className="text-left">
                              <div className="text-sm opacity-90">
                                Sub-Function {sfIndex + 1} of {subFunctions.length}
                              </div>
                              <div className="text-xl font-bold mt-1">{sf.name}</div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-6 h-6" />
                            ) : (
                              <ChevronDown className="w-6 h-6" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="p-6 space-y-6">
                              <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">About the Work</h3>
                                <p className="text-gray-600">Answer in simple terms - no formulas needed</p>
                              </div>

                              <QuestionCard
                                title="What type of work is this mainly about?"
                                number={1}
                                help="Selected work type determines productivity, complexity, and risk coefficients"
                              >
                                <div className="text-lg font-medium text-teal-700">
                                  {sf.workTypeId || 'Not specified'}
                                </div>
                              </QuestionCard>

                              <QuestionCard title="How complex is this work?" number={2}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <OptionDisplay selected={hrAnswers.complexity === 'very_simple'}>
                                    Very simple (repetitive / routine)
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.complexity === 'normal'}>
                                    Normal (some judgement required)
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.complexity === 'complex'}>
                                    Complex (requires experience)
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.complexity === 'highly_complex'}>
                                    Highly complex / sensitive / critical
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <QuestionCard
                                title="In a normal month, roughly how many work items does your team complete?"
                                number={3}
                              >
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  <OptionDisplay selected={hrAnswers.volume === 'under_200'}>
                                    Less than 200
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.volume === '200_500'}>
                                    200 – 500
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.volume === '500_1000'}>
                                    500 – 1,000
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.volume === '1000_2500'}>
                                    1,000 – 2,500
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.volume === 'over_2500'}>
                                    More than 2,500
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <div className="border-t-4 border-gray-200 my-8"></div>

                              <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">About Daily Productivity</h3>
                              </div>

                              <QuestionCard
                                title="On a normal working day, roughly how many tasks can ONE staff complete?"
                                number={4}
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <OptionDisplay selected={hrAnswers.productivityRate === 'under_5'}>
                                    Less than 5
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.productivityRate === '5_10'}>
                                    5 – 10
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.productivityRate === '10_20'}>
                                    10 – 20
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.productivityRate === 'over_20'}>
                                    More than 20
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <QuestionCard
                                title="When things go very well (no system issues, good internet, no leave), how does productivity change?"
                                number={5}
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <OptionDisplay selected={hrAnswers.productivityGoodCase === 'slightly'}>
                                    Slightly higher
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.productivityGoodCase === 'twenty_percent'}>
                                    20% higher
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.productivityGoodCase === 'fifty_percent'}>
                                    Around 50% higher
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.productivityGoodCase === 'double'}>
                                    Almost double
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <QuestionCard
                                title="When things go badly (system down, short staff, urgent requests), how does it drop?"
                                number={6}
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <OptionDisplay selected={hrAnswers.productivityBadCase === 'slightly'}>
                                    Slightly
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.productivityBadCase === 'twenty_percent'}>
                                    Moderate
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.productivityBadCase === 'fifty_percent'}>
                                    A lot
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.productivityBadCase === 'double'}>
                                    Very badly
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <div className="border-t-4 border-gray-200 my-8"></div>

                              <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Staff & Risk Factors</h3>
                              </div>

                              <QuestionCard
                                title="Out of 10 staff, how many are usually absent on a normal day?"
                                number={7}
                              >
                                <div className="grid grid-cols-4 gap-3">
                                  <OptionDisplay selected={hrAnswers.absenteeRate === '0'}>
                                    0
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.absenteeRate === '1'}>
                                    1
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.absenteeRate === '2'}>
                                    2
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.absenteeRate === '3_or_more'}>
                                    3 or more
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <QuestionCard
                                title="When a new staff joins, how long do they take to reach full performance?"
                                number={8}
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <OptionDisplay selected={hrAnswers.rampUpTime === 'under_1_month'}>
                                    Less than 1 month
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.rampUpTime === '1_2_months'}>
                                    1 – 2 months
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.rampUpTime === '3_6_months'}>
                                    3 – 6 months
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.rampUpTime === 'over_6_months'}>
                                    More than 6 months
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <QuestionCard title="How stable is the team normally?" number={9}>
                                <div className="grid grid-cols-3 gap-3">
                                  <OptionDisplay selected={hrAnswers.teamStability === 'very_stable'}>
                                    Very stable (rarely resign)
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.teamStability === 'normal'}>
                                    Normal (occasional resignation)
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.teamStability === 'high_turnover'}>
                                    High turnover
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <div className="border-t-4 border-gray-200 my-8"></div>

                              <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Staff Type & Cost</h3>
                                <p className="text-gray-600">Configure the roles that will perform this work</p>
                              </div>

                              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                  Configured Roles (Question 10)
                                </h4>
                                {sf.staffConfiguration?.advancedPattern && sf.staffConfiguration.advancedPattern.length > 0 ? (
                                  <div className="space-y-2">
                                    {sf.staffConfiguration.advancedPattern.map((role: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                        <div className="text-sm font-medium text-gray-900">{role.label}</div>
                                        <div className="text-sm text-gray-600">Pattern: {role.pattern}</div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No role pattern configured</p>
                                )}
                              </div>

                              <QuestionCard title="Do staff usually need overtime to cope?" number={11}>
                                <div className="grid grid-cols-3 gap-3">
                                  <OptionDisplay selected={hrAnswers.overtimeFrequency === 'none'}>
                                    No overtime
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.overtimeFrequency === 'occasional'}>
                                    Occasionally
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.overtimeFrequency === 'frequent'}>
                                    Almost every month
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <div className="border-t-4 border-gray-200 my-8"></div>

                              <div className="text-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Targets & Priorities</h3>
                              </div>

                              <QuestionCard title="When must this work be completed by?" number={13}>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  <OptionDisplay selected={hrAnswers.deadline === '1_week'}>
                                    1 week
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.deadline === '2_weeks'}>
                                    2 weeks
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.deadline === '1_month'}>
                                    1 month
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.deadline === '3_months'}>
                                    3 months
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.deadline === 'ongoing'}>
                                    Ongoing (monthly operation)
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <QuestionCard
                                title="If the work is delayed, how serious is the impact?"
                                number={14}
                              >
                                <div className="grid grid-cols-3 gap-3">
                                  <OptionDisplay selected={hrAnswers.impactLevel === 'low'}>
                                    Low impact
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.impactLevel === 'medium'}>
                                    Medium impact
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.impactLevel === 'high'}>
                                    High impact / critical
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>

                              <QuestionCard
                                title="What matters more for you in this decision?"
                                number={15}
                                help="This helps us understand your risk appetite"
                              >
                                <div className="grid grid-cols-3 gap-3">
                                  <OptionDisplay selected={hrAnswers.priority === 'lowest_cost'}>
                                    Lowest cost
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.priority === 'balanced'}>
                                    Balanced cost & speed
                                  </OptionDisplay>
                                  <OptionDisplay selected={hrAnswers.priority === 'fastest'}>
                                    Fastest completion (even if cost is higher)
                                  </OptionDisplay>
                                </div>
                              </QuestionCard>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No sub-functions configured
                  </div>
                )}
              </div>
            )}

            {activeTab === 3 && (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">Operating Model</h2>
                  <ReadOnlyBadge />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    This section shows operating model configuration, delivery approach, and resource allocation strategies.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-gray-900">Review & Calculate</h2>
                  <ReadOnlyBadge />
                </div>

                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Simulation Summary</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Planning Type:</span>
                        <span className="font-medium">{planningTypeLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size of Operation:</span>
                        <span className="font-medium">{sizeOfOperationLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sub-Functions:</span>
                        <span className="font-medium">{subFunctions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total FTE:</span>
                        <span className="font-medium">{simulation.total_fte?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Cost:</span>
                        <span className="font-medium">RM {Math.round(simulation.total_monthly_cost || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 5 && simulationResult && (
              <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    MVO Results: {simulation.simulation_name}
                  </h1>
                  <p className="text-gray-600">
                    Planning Type: {planningTypeLabel} • Size of Operation: {sizeOfOperationLabel}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-300 rounded-xl px-6 py-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Info className="w-6 h-6 text-teal-700" />
                      <div>
                        <div className="font-bold text-gray-900 mb-1">MVO Recommendation</div>
                        <div className="text-sm text-gray-700">
                          {simulationResult.totalFte.toFixed(1)} FTE • ~{simulationResult.avgDurationDays} days Avg, {simulationResult.p90DurationDays} days P90 • {simulationResult.successRatePct.toFixed(1)}% success • RM {Math.round(simulationResult.avgMonthlyCostRm).toLocaleString()}/month
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-4">Key Statistics</h2>
                <KPICards keyStats={simulationResult.keyStats} />

                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <SubFunctionAccordion subFunctions={simulationResult.subFunctions} />
                    <HeadcountComparisonTable
                      subFunctions={simulationResult.subFunctions}
                      combinedComparisonRows={simulationResult.combinedComparisonRows}
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <SystemRoleCompositionPanel composition={simulationResult.systemRoleComposition} />

                    <div className="mt-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">AI Summary for HR Decision-Making</h3>
                      <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold mt-0.5">•</span>
                          <div>
                            <strong>Staffing:</strong> The MVO analysis recommends {simulationResult.keyStats.mvoHeadcount} FTE, {Math.abs(simulationResult.keyStats.mvoHeadcount - simulationResult.keyStats.baselineHeadcount)} {simulationResult.keyStats.mvoHeadcount > simulationResult.keyStats.baselineHeadcount ? 'more' : 'fewer'} than the baseline.
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold mt-0.5">•</span>
                          <div>
                            <strong>Risk:</strong> The recommended configuration carries {simulationResult.keyStats.mvoFailureRiskPct < 10 ? 'low' : simulationResult.keyStats.mvoFailureRiskPct < 25 ? 'medium' : 'high'} risk ({simulationResult.keyStats.mvoFailureRiskPct.toFixed(1)}% failure rate).
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-600 font-bold mt-0.5">•</span>
                          <div>
                            <strong>Next Steps:</strong> Review the system-suggested role composition and adjust based on internal salary structures. Consider the recommended strategies for each sub-function.
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-700" />
                    Understanding the Results
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <strong className="text-gray-900">Baseline vs MVO:</strong> Baseline reflects traditional Excel-style headcount calculation. MVO (Minimum Viable Operations) is the optimized headcount that balances cost, time, and risk based on Monte Carlo simulation.
                    </div>
                    <div>
                      <strong className="text-gray-900">Reading the Comparison Table:</strong> Each row shows a different team size. The green highlighted row is the MVO recommendation that best balances delivery time, cost, and success rate.
                    </div>
                    <div>
                      <strong className="text-gray-900">P-values (P50, P75, P90):</strong> These percentiles show delivery time confidence. P90 means 90% of scenarios finish on or before this duration. Higher percentiles account for delays and risk factors.
                    </div>
                    <div>
                      <strong className="text-gray-900">Risk Categories:</strong> Low risk (&lt;10%) indicates high confidence. Medium risk (10-25%) suggests monitoring needed. High risk (&gt;25%) indicates potential delivery challenges.
                    </div>
                    <div>
                      <strong className="text-gray-900">System-Suggested Roles:</strong> The role composition uses JLG salary bands and is a starting point. Adjust based on specific requirements, internal structures, and market conditions.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 5 && !simulationResult && (
              <div className="max-w-3xl mx-auto text-center py-12">
                <div className="text-amber-600 mb-4">
                  <Info className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Results Not Available</h3>
                <p className="text-gray-600">
                  The detailed simulation results are not available for this saved simulation.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
