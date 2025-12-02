import { RangeValue, WorkloadDrivers } from '../types/subfunction';

export type WorkType =
  | 'payroll'
  | 'recruitment'
  | 'customer_service'
  | 'operations'
  | 'maintenance'
  | 'admin'
  | 'security'
  | 'finance'
  | 'other';

export type ComplexityLevel = 'very_simple' | 'normal' | 'complex' | 'highly_complex';
export type VolumeRange = 'under_200' | '200_500' | '500_1000' | '1000_2500' | 'over_2500' | 'under_100' | '100_300' | '300_800' | '800_1500' | 'over_1500';
export type ProductivityRate = 'under_5' | '5_10' | '10_20' | 'over_20';
export type ProductivityChange = 'slightly' | 'twenty_percent' | 'fifty_percent' | 'double';
export type AbsenteeRate = '0' | '1' | '2' | '3_or_more';
export type RampUpTime = 'under_1_month' | '1_2_months' | '3_6_months' | 'over_6_months';
export type TeamStability = 'very_stable' | 'normal' | 'high_turnover';
export type StaffType = 'general_worker' | 'clerical' | 'executive' | 'manager' | 'contract' | 'gig';
export type OvertimeFrequency = 'none' | 'occasional' | 'frequent';
export type Deadline = '1_week' | '2_weeks' | '1_month' | '3_months' | 'ongoing';
export type ImpactLevel = 'low' | 'medium' | 'high';
export type Priority = 'lowest_cost' | 'balanced' | 'fastest';

interface WorkTypeBenchmark {
  workload: RangeValue;
  productivity: RangeValue;
  salary: RangeValue;
  complexity: ComplexityLevel;
}

export const WORK_TYPE_BENCHMARKS: Record<WorkType, WorkTypeBenchmark> = {
  payroll: {
    workload: { min: 500, typical: 1000, max: 2000 },
    productivity: { min: 15, typical: 25, max: 40 },
    salary: { min: 3000, typical: 4500, max: 6000 },
    complexity: 'normal',
  },
  recruitment: {
    workload: { min: 200, typical: 500, max: 1000 },
    productivity: { min: 5, typical: 10, max: 15 },
    salary: { min: 3500, typical: 5000, max: 7000 },
    complexity: 'complex',
  },
  customer_service: {
    workload: { min: 800, typical: 1500, max: 3000 },
    productivity: { min: 20, typical: 40, max: 60 },
    salary: { min: 2500, typical: 3500, max: 5000 },
    complexity: 'normal',
  },
  operations: {
    workload: { min: 300, typical: 800, max: 1500 },
    productivity: { min: 10, typical: 20, max: 35 },
    salary: { min: 3000, typical: 4000, max: 5500 },
    complexity: 'normal',
  },
  maintenance: {
    workload: { min: 200, typical: 500, max: 1000 },
    productivity: { min: 5, typical: 10, max: 20 },
    salary: { min: 2800, typical: 3800, max: 5000 },
    complexity: 'complex',
  },
  admin: {
    workload: { min: 500, typical: 1000, max: 2000 },
    productivity: { min: 15, typical: 25, max: 40 },
    salary: { min: 2500, typical: 3500, max: 5000 },
    complexity: 'very_simple',
  },
  security: {
    workload: { min: 300, typical: 600, max: 1200 },
    productivity: { min: 10, typical: 15, max: 25 },
    salary: { min: 2200, typical: 3000, max: 4000 },
    complexity: 'normal',
  },
  finance: {
    workload: { min: 400, typical: 1000, max: 2000 },
    productivity: { min: 10, typical: 20, max: 35 },
    salary: { min: 3500, typical: 5500, max: 8000 },
    complexity: 'complex',
  },
  other: {
    workload: { min: 500, typical: 1000, max: 2000 },
    productivity: { min: 10, typical: 20, max: 30 },
    salary: { min: 3000, typical: 4500, max: 6500 },
    complexity: 'normal',
  },
};

export function mapVolumeToWorkload(volume: VolumeRange): RangeValue {
  switch (volume) {
    case 'under_200':
      return { min: 80, typical: 120, max: 200 };
    case '200_500':
      return { min: 200, typical: 350, max: 500 };
    case '500_1000':
      return { min: 500, typical: 750, max: 1000 };
    case '1000_2500':
      return { min: 1000, typical: 1800, max: 2500 };
    case 'over_2500':
      return { min: 2500, typical: 3000, max: 4000 };
    case 'under_100':
      return { min: 50, typical: 80, max: 100 };
    case '100_300':
      return { min: 100, typical: 200, max: 300 };
    case '300_800':
      return { min: 300, typical: 550, max: 800 };
    case '800_1500':
      return { min: 800, typical: 1150, max: 1500 };
    case 'over_1500':
      return { min: 1500, typical: 2500, max: 4000 };
  }
}

export function mapProductivityRateToValue(rate: ProductivityRate): RangeValue {
  switch (rate) {
    case 'under_5':
      return { min: 2, typical: 3, max: 5 };
    case '5_10':
      return { min: 5, typical: 7, max: 10 };
    case '10_20':
      return { min: 10, typical: 15, max: 20 };
    case 'over_20':
      return { min: 20, typical: 30, max: 50 };
  }
}

export function applyProductivityModifiers(
  baseProductivity: RangeValue,
  goodCase: ProductivityChange,
  badCase: ProductivityChange
): RangeValue {
  let maxMultiplier = 1.0;
  switch (goodCase) {
    case 'slightly':
      maxMultiplier = 1.1;
      break;
    case 'twenty_percent':
      maxMultiplier = 1.2;
      break;
    case 'fifty_percent':
      maxMultiplier = 1.5;
      break;
    case 'double':
      maxMultiplier = 2.0;
      break;
  }

  let minMultiplier = 1.0;
  switch (badCase) {
    case 'slightly':
      minMultiplier = 0.9;
      break;
    case 'twenty_percent':
      minMultiplier = 0.8;
      break;
    case 'fifty_percent':
      minMultiplier = 0.5;
      break;
    case 'double':
      minMultiplier = 0.4;
      break;
  }

  return {
    min: Math.round(baseProductivity.typical * minMultiplier),
    typical: baseProductivity.typical,
    max: Math.round(baseProductivity.typical * maxMultiplier),
  };
}

export function mapAbsenteeismRate(rate: AbsenteeRate): RangeValue {
  switch (rate) {
    case '0':
      return { min: 0, typical: 1, max: 2 };
    case '1':
      return { min: 2, typical: 5, max: 8 };
    case '2':
      return { min: 5, typical: 10, max: 15 };
    case '3_or_more':
      return { min: 10, typical: 15, max: 25 };
  }
}

export function mapRampUpTime(time: RampUpTime): RangeValue {
  switch (time) {
    case 'under_1_month':
      return { min: 5, typical: 10, max: 15 };
    case '1_2_months':
      return { min: 10, typical: 20, max: 30 };
    case '3_6_months':
      return { min: 20, typical: 35, max: 50 };
    case 'over_6_months':
      return { min: 30, typical: 50, max: 70 };
  }
}

export function mapTeamStability(stability: TeamStability): RangeValue {
  switch (stability) {
    case 'very_stable':
      return { min: 2, typical: 5, max: 10 };
    case 'normal':
      return { min: 5, typical: 10, max: 20 };
    case 'high_turnover':
      return { min: 15, typical: 25, max: 40 };
  }
}

export function mapStaffTypeToSalary(staffType: StaffType): RangeValue {
  switch (staffType) {
    case 'general_worker':
      return { min: 1800, typical: 2500, max: 3500 };
    case 'clerical':
      return { min: 2500, typical: 3500, max: 5000 };
    case 'executive':
      return { min: 3500, typical: 5000, max: 7000 };
    case 'manager':
      return { min: 6000, typical: 9000, max: 13000 };
    case 'contract':
      return { min: 3000, typical: 4500, max: 6500 };
    case 'gig':
      return { min: 2000, typical: 3000, max: 4500 };
  }
}

export function mapOvertimeFrequency(frequency: OvertimeFrequency): RangeValue {
  switch (frequency) {
    case 'none':
      return { min: 0, typical: 0, max: 5 };
    case 'occasional':
      return { min: 5, typical: 10, max: 20 };
    case 'frequent':
      return { min: 15, typical: 30, max: 50 };
  }
}

export function mapDeadlineToDays(deadline: Deadline): number {
  switch (deadline) {
    case '1_week':
      return 7;
    case '2_weeks':
      return 14;
    case '1_month':
      return 30;
    case '3_months':
      return 90;
    case 'ongoing':
      return 90;
  }
}

export function mapImpactToRisk(impact: ImpactLevel): number {
  switch (impact) {
    case 'low':
      return 20;
    case 'medium':
      return 15;
    case 'high':
      return 10;
  }
}

export function mapPriorityToRisk(priority: Priority): number {
  switch (priority) {
    case 'lowest_cost':
      return 20;
    case 'balanced':
      return 15;
    case 'fastest':
      return 10;
  }
}

export interface HRQuestionAnswers {
  workType: WorkType;
  customWorkType?: string;
  complexity: ComplexityLevel;
  volume: VolumeRange;
  productivityRate: ProductivityRate;
  productivityGoodCase: ProductivityChange;
  productivityBadCase: ProductivityChange;
  absenteeRate: AbsenteeRate;
  rampUpTime: RampUpTime;
  teamStability: TeamStability;
  staffType: StaffType;
  overtimeFrequency: OvertimeFrequency;
  deadline: Deadline;
  impactLevel: ImpactLevel;
  priority: Priority;
  outsourceCost?: 'cheap' | 'moderate' | 'expensive' | 'never';
}

export function convertHRAnswersToWorkloadDrivers(
  answers: HRQuestionAnswers
): Partial<WorkloadDrivers> {
  const benchmark = WORK_TYPE_BENCHMARKS[answers.workType];

  const workload = mapVolumeToWorkload(answers.volume);
  const baseProductivity = mapProductivityRateToValue(answers.productivityRate);
  const productivity = applyProductivityModifiers(
    baseProductivity,
    answers.productivityGoodCase,
    answers.productivityBadCase
  );

  const absenteeism = mapAbsenteeismRate(answers.absenteeRate);
  const learningCurve = mapRampUpTime(answers.rampUpTime);
  const turnover = mapTeamStability(answers.teamStability);
  const salary = mapStaffTypeToSalary(answers.staffType);
  const overtime = mapOvertimeFrequency(answers.overtimeFrequency);
  const targetDays = mapDeadlineToDays(answers.deadline);
  const riskThreshold = Math.min(
    mapImpactToRisk(answers.impactLevel),
    mapPriorityToRisk(answers.priority)
  );

  return {
    totalWorkUnits: workload,
    taskComplexity: answers.complexity === 'very_simple' ? 'low' :
                    answers.complexity === 'normal' ? 'medium' :
                    answers.complexity === 'complex' ? 'high' : 'very_high',
    productivityUnitsPerPersonPerDay: productivity,
    peopleRiskFactors: {
      absenteeismRate: absenteeism,
      turnoverRisk: turnover,
      learningCurveImpact: learningCurve,
    },
    costVariables: {
      monthlySalaryPermanent: salary,
      avgOvertimeHoursPerMonth: overtime,
      overtimeRate: 1.5,
      trainingCostPerHire: 2000,
    },
    constraints: {
      targetCompletionDays: targetDays,
      allowedFailureRisk: riskThreshold,
    },
  };
}
