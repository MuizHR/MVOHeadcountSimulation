import React, { useState, useEffect } from 'react';
import { Info, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import {
  HRQuestionAnswers,
  convertHRAnswersToWorkloadDrivers,
  WORK_TYPE_BENCHMARKS,
  WorkType,
  ComplexityLevel,
  VolumeRange,
  ProductivityRate,
  ProductivityChange,
  AbsenteeRate,
  RampUpTime,
  TeamStability,
  StaffType as HRStaffType,
  OvertimeFrequency,
  Deadline,
  ImpactLevel,
  Priority,
} from '../../utils/hrQuestionMapper';
import { getAllWorkTypes, getWorkTypeCoefficients } from '../../data/workTypeCoefficients';
import { StaffType, StaffConfiguration } from '../../types/staffType';
import { fetchAllStaffTypes, getUniquePlanningGroups } from '../../services/staffTypeService';
import { StaffConfigEditor } from '../StaffConfigEditor';

interface QuestionCardProps {
  title: string;
  number: number;
  help?: string;
  children: React.ReactNode;
}

function QuestionCard({ title, number, help, children }: QuestionCardProps) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-teal-300 transition-colors">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
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

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function OptionButton({ selected, onClick, children }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-4 rounded-lg border-2 text-left transition-all font-medium
        ${
          selected
            ? 'border-teal-600 bg-teal-50 text-teal-900'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
        }
      `}
    >
      {children}
    </button>
  );
}

export function Step3HRQuestions() {
  const {
    state,
    updateSubFunction,
    setCurrentSubFunctionIndex,
    previousStep,
    nextStep,
  } = useWizard();
  const { subFunctions, currentSubFunctionIndex } = state;

  const currentSubFunction = subFunctions[currentSubFunctionIndex];

  const getDefaultAnswers = (): HRQuestionAnswers => ({
    workType: 'admin',
    complexity: 'normal',
    volume: '500_1000',
    productivityRate: '10_20',
    productivityGoodCase: 'twenty_percent',
    productivityBadCase: 'twenty_percent',
    absenteeRate: '1',
    rampUpTime: '1_2_months',
    teamStability: 'normal',
    staffType: 'clerical',
    overtimeFrequency: 'occasional',
    deadline: '3_months',
    impactLevel: 'medium',
    priority: 'balanced',
  });

  const [answers, setAnswers] = useState<HRQuestionAnswers>(
    currentSubFunction.hrAnswers || getDefaultAnswers()
  );

  const [selectedWorkTypeId, setSelectedWorkTypeId] = useState<string>(
    currentSubFunction.workTypeId || ''
  );

  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);

  const getExamplePreview = () => {
    const volumeMap: Record<string, number> = {
      'under_200': 120,
      '200_500': 350,
      '500_1000': 750,
      '1000_2500': 1800,
      'over_2500': 3000,
      'under_100': 60,
      '100_300': 200,
      '300_800': 550,
      '800_1500': 1200,
      'over_1500': 2000,
    };

    const tasksMap: Record<string, number> = {
      'under_5': 4,
      '5_10': 8,
      '10_20': 15,
      'over_20': 25,
    };

    const approxMonthlyVolume = volumeMap[answers.volume] || 0;
    const approxTasksPerDay = tasksMap[answers.productivityRate] || 0;

    if (!approxMonthlyVolume || !approxTasksPerDay) {
      return null;
    }

    const workingDaysPerMonth = 22;
    const approxFTE = approxMonthlyVolume / (approxTasksPerDay * workingDaysPerMonth);

    let friendlyFTEBand = '';
    if (approxFTE < 0.75) {
      friendlyFTEBand = '~1 FTE (very light load)';
    } else if (approxFTE <= 1.25) {
      friendlyFTEBand = '~1 FTE';
    } else if (approxFTE <= 2.5) {
      friendlyFTEBand = '~1–2 FTE';
    } else if (approxFTE <= 4) {
      friendlyFTEBand = '~2–4 FTE';
    } else {
      friendlyFTEBand = '3+ FTE';
    }

    const tasksRangeText = answers.productivityRate === 'under_5' ? 'around 4' :
                            answers.productivityRate === '5_10' ? 'around 8' :
                            answers.productivityRate === '10_20' ? 'around 10–15' :
                            'around 20+';

    return {
      approxMonthlyVolume,
      approxTasksPerDay,
      tasksRangeText,
      friendlyFTEBand,
    };
  };

  const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
  const [planningGroups, setPlanningGroups] = useState<string[]>([]);
  const [selectedPlanningGroup, setSelectedPlanningGroup] = useState<string>('');

  const [staffConfiguration, setStaffConfiguration] = useState<StaffConfiguration>(
    currentSubFunction.staffConfiguration || {
      mode: 'simple',
      simpleRoleId: undefined,
      advancedPattern: [],
    }
  );

  const [showHelper, setShowHelper] = useState(false);

  useEffect(() => {
    loadStaffTypes();
  }, []);

  useEffect(() => {
    if (currentSubFunction.hrAnswers) {
      setAnswers(currentSubFunction.hrAnswers);
    } else {
      setAnswers(getDefaultAnswers());
    }
    setSelectedWorkTypeId(currentSubFunction.workTypeId || '');
    setStaffConfiguration(currentSubFunction.staffConfiguration || { roles: [] });
    setSelectedPlanningGroup(currentSubFunction.selectedPlanningGroup || (planningGroups.length > 0 ? planningGroups[0] : ''));
  }, [currentSubFunction.id]);

  const loadStaffTypes = async () => {
    try {
      const types = await fetchAllStaffTypes();
      setStaffTypes(types);
      const groups = getUniquePlanningGroups(types);
      setPlanningGroups(groups);
      if (groups.length > 0 && !selectedPlanningGroup) {
        setSelectedPlanningGroup(groups[0]);
      }
    } catch (error) {
      console.error('Error loading staff types:', error);
    }
  };
  const [helperAnswers, setHelperAnswers] = useState({
    currentTeamSize: 5,
    workloadStatus: 'okay' as 'struggling' | 'okay' | 'spare_time',
    workloadTrend: 'stable' as 'increasing' | 'stable' | 'decreasing',
  });

  if (!currentSubFunction) {
    return null;
  }

  const updateAnswer = <K extends keyof HRQuestionAnswers>(
    key: K,
    value: HRQuestionAnswers[K]
  ) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);

    if (key === 'workType') {
      const benchmark = WORK_TYPE_BENCHMARKS[value as WorkType];
      setAnswers(prev => ({
        ...prev,
        complexity: benchmark.complexity,
      }));
    }
  };

  const applyHelperEstimates = () => {
    const { currentTeamSize, workloadStatus, workloadTrend } = helperAnswers;

    let estimatedVolume: VolumeRange = '500_1000';
    if (currentTeamSize <= 2) estimatedVolume = 'under_200';
    else if (currentTeamSize <= 5) estimatedVolume = '200_500';
    else if (currentTeamSize <= 10) estimatedVolume = '500_1000';
    else if (currentTeamSize <= 20) estimatedVolume = '1000_2500';
    else estimatedVolume = 'over_2500';

    let complexity: ComplexityLevel = 'normal';
    if (workloadStatus === 'struggling') complexity = 'complex';
    if (workloadStatus === 'spare_time') complexity = 'very_simple';

    let priority: Priority = 'balanced';
    if (workloadTrend === 'increasing' && workloadStatus === 'struggling') {
      priority = 'fastest';
    } else if (workloadTrend === 'decreasing') {
      priority = 'lowest_cost';
    }

    setAnswers(prev => ({
      ...prev,
      volume: estimatedVolume,
      complexity,
      priority,
    }));

    setShowHelper(false);
  };

  const handleNext = () => {
    const workloadDrivers = convertHRAnswersToWorkloadDrivers(answers);
    const coefficients = selectedWorkTypeId ? getWorkTypeCoefficients(selectedWorkTypeId) : undefined;

    updateSubFunction(currentSubFunction.id, {
      hrAnswers: answers,
      workloadDrivers: {
        ...currentSubFunction.workloadDrivers,
        ...workloadDrivers,
      },
      workTypeId: selectedWorkTypeId || undefined,
      workTypeCoefficients: coefficients ? {
        productivityRate: coefficients.productivityRate,
        complexityFactor: coefficients.complexityFactor,
        varianceLevel: coefficients.varianceLevel,
        minHeadcountRule: coefficients.minHeadcountRule,
        riskMultiplier: coefficients.riskMultiplier,
      } : undefined,
      selectedPlanningGroup: selectedPlanningGroup || undefined,
      staffConfiguration,
      status: 'fully_configured',
    });

    if (currentSubFunctionIndex < subFunctions.length - 1) {
      setCurrentSubFunctionIndex(currentSubFunctionIndex + 1);
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (currentSubFunctionIndex > 0) {
      setCurrentSubFunctionIndex(currentSubFunctionIndex - 1);
    } else {
      previousStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-teal-700 mb-1">
              Sub-Function {currentSubFunctionIndex + 1} of {subFunctions.length}
            </div>
            <div className="text-2xl font-bold text-teal-900">{currentSubFunction.name}</div>
          </div>
          <button
            onClick={() => setShowHelper(!showHelper)}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 font-medium"
          >
            <HelpCircle className="w-5 h-5" />
            Help Me Estimate
          </button>
        </div>
      </div>

      {showHelper && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Quick Estimation Helper</h3>
          <p className="text-sm text-blue-800 mb-4">
            Answer these 3 simple questions and we'll suggest default values for you
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                1. How many people are doing this work now?
              </label>
              <input
                type="number"
                value={helperAnswers.currentTeamSize}
                onChange={e =>
                  setHelperAnswers(prev => ({
                    ...prev,
                    currentTeamSize: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                2. Are they struggling, okay, or have spare time?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['struggling', 'okay', 'spare_time'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() =>
                      setHelperAnswers(prev => ({ ...prev, workloadStatus: status }))
                    }
                    className={`
                      p-3 rounded-lg border-2 font-medium capitalize
                      ${
                        helperAnswers.workloadStatus === status
                          ? 'border-blue-600 bg-blue-100 text-blue-900'
                          : 'border-blue-300 bg-white text-blue-700'
                      }
                    `}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                3. Is workload increasing, stable, or decreasing?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['increasing', 'stable', 'decreasing'] as const).map(trend => (
                  <button
                    key={trend}
                    onClick={() =>
                      setHelperAnswers(prev => ({ ...prev, workloadTrend: trend }))
                    }
                    className={`
                      p-3 rounded-lg border-2 font-medium capitalize
                      ${
                        helperAnswers.workloadTrend === trend
                          ? 'border-blue-600 bg-blue-100 text-blue-900'
                          : 'border-blue-300 bg-white text-blue-700'
                      }
                    `}
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={applyHelperEstimates}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Apply Suggested Values
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">About the Work</h2>
          <p className="text-gray-600">Answer in simple terms - no formulas needed</p>
        </div>

        <QuestionCard
          title="What type of work is this mainly about?"
          number={1}
          help="Select the Malaysia-relevant work type. This will auto-load specific coefficients for productivity, complexity, variance, and risk calculations."
        >
          <select
            value={selectedWorkTypeId}
            onChange={(e) => {
              setSelectedWorkTypeId(e.target.value);
            }}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-lg mb-4"
          >
            <option value="">-- Select a Work Type --</option>
            {getAllWorkTypes().map((wt) => (
              <option key={wt.id} value={wt.id}>
                {wt.name}
              </option>
            ))}
          </select>

          {selectedWorkTypeId && getWorkTypeCoefficients(selectedWorkTypeId) && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-semibold text-teal-900 mb-3">
                Auto-Loaded Coefficients
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-teal-700">Productivity Rate:</span>
                  <span className="ml-2 font-medium text-teal-900">
                    {getWorkTypeCoefficients(selectedWorkTypeId)!.productivityRate.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-teal-700">Complexity Factor:</span>
                  <span className="ml-2 font-medium text-teal-900">
                    {getWorkTypeCoefficients(selectedWorkTypeId)!.complexityFactor.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-teal-700">Variance Level:</span>
                  <span className="ml-2 font-medium text-teal-900">
                    {getWorkTypeCoefficients(selectedWorkTypeId)!.varianceLevel.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-teal-700">Min Headcount:</span>
                  <span className="ml-2 font-medium text-teal-900">
                    {getWorkTypeCoefficients(selectedWorkTypeId)!.minHeadcountRule}
                  </span>
                </div>
                <div>
                  <span className="text-teal-700">Risk Multiplier:</span>
                  <span className="ml-2 font-medium text-teal-900">
                    {getWorkTypeCoefficients(selectedWorkTypeId)!.riskMultiplier.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </QuestionCard>

        <QuestionCard
          title="How complex is this work?"
          number={2}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <OptionButton
              selected={answers.complexity === 'very_simple'}
              onClick={() => updateAnswer('complexity', 'very_simple')}
            >
              Very simple (repetitive / routine)
            </OptionButton>
            <OptionButton
              selected={answers.complexity === 'normal'}
              onClick={() => updateAnswer('complexity', 'normal')}
            >
              Normal (some judgement required)
            </OptionButton>
            <OptionButton
              selected={answers.complexity === 'complex'}
              onClick={() => updateAnswer('complexity', 'complex')}
            >
              Complex (requires experience)
            </OptionButton>
            <OptionButton
              selected={answers.complexity === 'highly_complex'}
              onClick={() => updateAnswer('complexity', 'highly_complex')}
            >
              Highly complex / sensitive / critical
            </OptionButton>
          </div>
        </QuestionCard>

        <QuestionCard
          title="In a normal month, roughly how many work items does your team complete?"
          number={3}
          help="Count each case / ticket / work order / document / person handled as 1 work item – whatever you normally track in your monthly reports (e.g. number of complaints closed, payrolls processed, work orders completed, invoices processed, tenancies managed). Don't count every email or small step."
        >
          <div className="mb-3">
            <button
              onClick={() => setShowVolumeTooltip(!showVolumeTooltip)}
              className="inline-flex items-center gap-2 text-sm text-teal-700 hover:text-teal-800 font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              What is a work item?
            </button>
            {showVolumeTooltip && (
              <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                <p className="font-semibold mb-2">What is a work item?</p>
                <p className="mb-2">A work item is one unit of work that your system or KPI would count as 1.</p>
                <p className="font-medium mb-1">Examples:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Payroll – 1 employee's monthly payroll processed</li>
                  <li>ICS – 1 complaint / service request closed or work order completed</li>
                  <li>Security – 1 incident handled or patrol round logged</li>
                  <li>Leasing – 1 tenancy / SPA / VP handover handled</li>
                </ul>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <OptionButton
              selected={answers.volume === 'under_200'}
              onClick={() => updateAnswer('volume', 'under_200')}
            >
              Less than 200
            </OptionButton>
            <OptionButton
              selected={answers.volume === '200_500'}
              onClick={() => updateAnswer('volume', '200_500')}
            >
              200 – 500
            </OptionButton>
            <OptionButton
              selected={answers.volume === '500_1000'}
              onClick={() => updateAnswer('volume', '500_1000')}
            >
              500 – 1,000
            </OptionButton>
            <OptionButton
              selected={answers.volume === '1000_2500'}
              onClick={() => updateAnswer('volume', '1000_2500')}
            >
              1,000 – 2,500
            </OptionButton>
            <OptionButton
              selected={answers.volume === 'over_2500'}
              onClick={() => updateAnswer('volume', 'over_2500')}
            >
              More than 2,500
            </OptionButton>
          </div>
        </QuestionCard>

        <div className="border-t-4 border-gray-200 my-8"></div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">About Daily Productivity</h2>
        </div>

        <QuestionCard
          title="On a normal working day, roughly how many tasks can ONE staff complete?"
          number={4}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <OptionButton
              selected={answers.productivityRate === 'under_5'}
              onClick={() => updateAnswer('productivityRate', 'under_5')}
            >
              Less than 5
            </OptionButton>
            <OptionButton
              selected={answers.productivityRate === '5_10'}
              onClick={() => updateAnswer('productivityRate', '5_10')}
            >
              5 – 10
            </OptionButton>
            <OptionButton
              selected={answers.productivityRate === '10_20'}
              onClick={() => updateAnswer('productivityRate', '10_20')}
            >
              10 – 20
            </OptionButton>
            <OptionButton
              selected={answers.productivityRate === 'over_20'}
              onClick={() => updateAnswer('productivityRate', 'over_20')}
            >
              More than 20
            </OptionButton>
          </div>
        </QuestionCard>

        {(() => {
          const preview = getExamplePreview();
          return (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-5 my-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Example Preview (for context – not a final answer)
              </h4>
              {preview ? (
                <div className="text-sm text-gray-800 space-y-2">
                  <p>
                    Based on your selections, we assume <strong>about {preview.approxMonthlyVolume.toLocaleString()} work items/month</strong> and{' '}
                    <strong>{preview.tasksRangeText} tasks per person per day</strong> (22 working days).
                  </p>
                  <p>
                    That typically translates to <strong className="text-teal-700">{preview.friendlyFTEBand}</strong> to cope with the workload{' '}
                    <span className="font-medium">before</span> we apply risk, absenteeism and governance safeguards in the simulator.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">
                  Select a monthly volume and daily task range to see an example preview.
                </p>
              )}
            </div>
          );
        })()}

        <QuestionCard
          title="When things go very well (no system issues, good internet, no leave), how does productivity change?"
          number={5}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <OptionButton
              selected={answers.productivityGoodCase === 'slightly'}
              onClick={() => updateAnswer('productivityGoodCase', 'slightly')}
            >
              Slightly higher
            </OptionButton>
            <OptionButton
              selected={answers.productivityGoodCase === 'twenty_percent'}
              onClick={() => updateAnswer('productivityGoodCase', 'twenty_percent')}
            >
              20% higher
            </OptionButton>
            <OptionButton
              selected={answers.productivityGoodCase === 'fifty_percent'}
              onClick={() => updateAnswer('productivityGoodCase', 'fifty_percent')}
            >
              Around 50% higher
            </OptionButton>
            <OptionButton
              selected={answers.productivityGoodCase === 'double'}
              onClick={() => updateAnswer('productivityGoodCase', 'double')}
            >
              Almost double
            </OptionButton>
          </div>
        </QuestionCard>

        <QuestionCard
          title="When things go badly (system down, short staff, urgent requests), how does it drop?"
          number={6}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['slightly', 'twenty_percent', 'fifty_percent', 'double'] as ProductivityChange[]).map(
              level => (
                <OptionButton
                  key={level}
                  selected={answers.productivityBadCase === level}
                  onClick={() => updateAnswer('productivityBadCase', level)}
                >
                  {level === 'slightly' && 'Slightly'}
                  {level === 'twenty_percent' && 'Moderate'}
                  {level === 'fifty_percent' && 'A lot'}
                  {level === 'double' && 'Very badly'}
                </OptionButton>
              )
            )}
          </div>
        </QuestionCard>

        <div className="border-t-4 border-gray-200 my-8"></div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff & Risk Factors</h2>
        </div>

        <QuestionCard
          title="Out of 10 staff, how many are usually absent on a normal day?"
          number={7}
        >
          <div className="grid grid-cols-4 gap-3">
            {(['0', '1', '2', '3_or_more'] as AbsenteeRate[]).map(rate => (
              <OptionButton
                key={rate}
                selected={answers.absenteeRate === rate}
                onClick={() => updateAnswer('absenteeRate', rate)}
              >
                {rate === '3_or_more' ? '3 or more' : rate}
              </OptionButton>
            ))}
          </div>
        </QuestionCard>

        <QuestionCard
          title="When a new staff joins, how long do they take to reach full performance?"
          number={8}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <OptionButton
              selected={answers.rampUpTime === 'under_1_month'}
              onClick={() => updateAnswer('rampUpTime', 'under_1_month')}
            >
              Less than 1 month
            </OptionButton>
            <OptionButton
              selected={answers.rampUpTime === '1_2_months'}
              onClick={() => updateAnswer('rampUpTime', '1_2_months')}
            >
              1 – 2 months
            </OptionButton>
            <OptionButton
              selected={answers.rampUpTime === '3_6_months'}
              onClick={() => updateAnswer('rampUpTime', '3_6_months')}
            >
              3 – 6 months
            </OptionButton>
            <OptionButton
              selected={answers.rampUpTime === 'over_6_months'}
              onClick={() => updateAnswer('rampUpTime', 'over_6_months')}
            >
              More than 6 months
            </OptionButton>
          </div>
        </QuestionCard>

        <QuestionCard
          title="How stable is the team normally?"
          number={9}
        >
          <div className="grid grid-cols-3 gap-3">
            <OptionButton
              selected={answers.teamStability === 'very_stable'}
              onClick={() => updateAnswer('teamStability', 'very_stable')}
            >
              Very stable (rarely resign)
            </OptionButton>
            <OptionButton
              selected={answers.teamStability === 'normal'}
              onClick={() => updateAnswer('teamStability', 'normal')}
            >
              Normal (occasional resignation)
            </OptionButton>
            <OptionButton
              selected={answers.teamStability === 'high_turnover'}
              onClick={() => updateAnswer('teamStability', 'high_turnover')}
            >
              High turnover
            </OptionButton>
          </div>
        </QuestionCard>

        <div className="border-t-4 border-gray-200 my-8"></div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Type & Cost</h2>
          <p className="text-gray-600">Configure the roles that will perform this work</p>
        </div>

        <StaffConfigEditor
          totalFteRequired={2.5}
          configuration={staffConfiguration}
          onChange={setStaffConfiguration}
        />

        <QuestionCard
          title="Do staff usually need overtime to cope?"
          number={11}
        >
          <div className="grid grid-cols-3 gap-3">
            <OptionButton
              selected={answers.overtimeFrequency === 'none'}
              onClick={() => updateAnswer('overtimeFrequency', 'none')}
            >
              No overtime
            </OptionButton>
            <OptionButton
              selected={answers.overtimeFrequency === 'occasional'}
              onClick={() => updateAnswer('overtimeFrequency', 'occasional')}
            >
              Occasionally
            </OptionButton>
            <OptionButton
              selected={answers.overtimeFrequency === 'frequent'}
              onClick={() => updateAnswer('overtimeFrequency', 'frequent')}
            >
              Almost every month
            </OptionButton>
          </div>
        </QuestionCard>

        <div className="border-t-4 border-gray-200 my-8"></div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Targets & Priorities</h2>
        </div>

        <QuestionCard
          title="When must this work be completed by?"
          number={13}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <OptionButton
              selected={answers.deadline === '1_week'}
              onClick={() => updateAnswer('deadline', '1_week')}
            >
              1 week
            </OptionButton>
            <OptionButton
              selected={answers.deadline === '2_weeks'}
              onClick={() => updateAnswer('deadline', '2_weeks')}
            >
              2 weeks
            </OptionButton>
            <OptionButton
              selected={answers.deadline === '1_month'}
              onClick={() => updateAnswer('deadline', '1_month')}
            >
              1 month
            </OptionButton>
            <OptionButton
              selected={answers.deadline === '3_months'}
              onClick={() => updateAnswer('deadline', '3_months')}
            >
              3 months
            </OptionButton>
            <OptionButton
              selected={answers.deadline === 'ongoing'}
              onClick={() => updateAnswer('deadline', 'ongoing')}
            >
              Ongoing (monthly operation)
            </OptionButton>
          </div>
        </QuestionCard>

        <QuestionCard
          title="If the work is delayed, how serious is the impact?"
          number={14}
        >
          <div className="grid grid-cols-3 gap-3">
            <OptionButton
              selected={answers.impactLevel === 'low'}
              onClick={() => updateAnswer('impactLevel', 'low')}
            >
              Low impact
            </OptionButton>
            <OptionButton
              selected={answers.impactLevel === 'medium'}
              onClick={() => updateAnswer('impactLevel', 'medium')}
            >
              Medium impact
            </OptionButton>
            <OptionButton
              selected={answers.impactLevel === 'high'}
              onClick={() => updateAnswer('impactLevel', 'high')}
            >
              High impact / critical
            </OptionButton>
          </div>
        </QuestionCard>

        <QuestionCard
          title="What matters more for you in this decision?"
          number={15}
          help="This helps us understand your risk appetite"
        >
          <div className="grid grid-cols-3 gap-3">
            <OptionButton
              selected={answers.priority === 'lowest_cost'}
              onClick={() => updateAnswer('priority', 'lowest_cost')}
            >
              Lowest cost
            </OptionButton>
            <OptionButton
              selected={answers.priority === 'balanced'}
              onClick={() => updateAnswer('priority', 'balanced')}
            >
              Balanced cost & speed
            </OptionButton>
            <OptionButton
              selected={answers.priority === 'fastest'}
              onClick={() => updateAnswer('priority', 'fastest')}
            >
              Fastest completion (even if cost is higher)
            </OptionButton>
          </div>
        </QuestionCard>
      </div>

      <div className="flex justify-center gap-4 mt-8 pb-8">
        <button
          onClick={handlePrevious}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          {currentSubFunctionIndex === 0 ? 'Back to Setup' : 'Previous Sub-Function'}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold text-lg"
        >
          {currentSubFunctionIndex === subFunctions.length - 1
            ? 'Continue to Review'
            : 'Next Sub-Function'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
