export interface WorkTypeCoefficients {
  id: string;
  name: string;
  productivityRate: number;
  complexityFactor: number;
  varianceLevel: number;
  minHeadcountRule: number;
  minHeadcountBase: number;
  riskMultiplier: number;
}

export interface HeadcountScenario {
  headcount: number;
  scaledDuration: number;
  failureRisk: number;
  monthlyCost: number;
  meetsThreshold: boolean;
}

export interface MonteCarloResults {
  iterations: number;
  p50Duration: number;
  p75Duration: number;
  p90Duration: number;
  avgDuration: number;
  failureRiskBaseline: number;
  rawResults: number[];
  headcountScenarios: HeadcountScenario[];
}

export interface WorkloadSummary {
  subFunctionName: string;
  workType: string;
  volume: number;
  targetDeadline?: number;
  baselineHeadcount: number;
  baselineDuration: number;
  mvoHeadcount: number;
  mvoConfidenceLevel: number;
  p50Duration: number;
  p75Duration: number;
  p90Duration: number;
  failureRisk: number;
  riskNotes: string;
  baselineMonthlyCost: number;
  mvoMonthlyCost: number;
  costDifference: number;
  costPercentIncrease: number;
  headcountScenarios: HeadcountScenario[];
}

export type WorkCategory =
  | 'strategic'
  | 'technical'
  | 'operational'
  | 'support'
  | 'service';

export interface WorkCategoryDefinition {
  category: WorkCategory;
  name: string;
  description: string;
  examples: string[];
  leaderRoles: string[];
  executionRoles: string[];
  supportRoles?: string[];
}

export const WORK_CATEGORIES: Record<WorkCategory, WorkCategoryDefinition> = {
  strategic: {
    category: 'strategic',
    name: 'Strategic / Management',
    description: 'High-level planning, governance, and strategic decision-making',
    examples: ['business planning', 'governance', 'strategy', 'portfolio management'],
    leaderRoles: ['Senior Manager', 'Manager'],
    executionRoles: ['Executive'],
  },
  technical: {
    category: 'technical',
    name: 'Technical / Engineering',
    description: 'Technical expertise, engineering, and specialized knowledge work',
    examples: ['maintenance', 'M&E', 'engineering design', 'IT technical'],
    leaderRoles: ['Manager', 'Senior Manager'],
    executionRoles: ['Executive', 'Senior Executive'],
    supportRoles: ['Clerk / Technician'],
  },
  operational: {
    category: 'operational',
    name: 'Operational / Field',
    description: 'Day-to-day operations, site work, and field activities',
    examples: ['site/township ops', 'security', 'cleaning', 'car park', 'general operations'],
    leaderRoles: ['Manager', 'Senior Executive'],
    executionRoles: ['Clerk / Technician', 'Office Assistant / General Worker'],
  },
  support: {
    category: 'support',
    name: 'Support / Admin / Back-office',
    description: 'Administrative, HR, finance, and support functions',
    examples: ['HR ops', 'payroll processing', 'finance processing', 'admin'],
    leaderRoles: ['Manager', 'Senior Executive'],
    executionRoles: ['Executive'],
    supportRoles: ['Clerk / Technician'],
  },
  service: {
    category: 'service',
    name: 'Service / Customer-facing',
    description: 'Customer service, tenant relations, and front-line service delivery',
    examples: ['customer service', 'tenant relations', 'helpdesk', 'front office'],
    leaderRoles: ['Manager', 'Senior Executive'],
    executionRoles: ['Executive'],
    supportRoles: ['Clerk / Technician'],
  },
};

export function categorizeWorkByName(workName: string): WorkCategory {
  const lowercaseName = workName.toLowerCase();

  if (
    lowercaseName.includes('strategy') ||
    lowercaseName.includes('planning') ||
    lowercaseName.includes('governance') ||
    lowercaseName.includes('portfolio') ||
    lowercaseName.includes('management')
  ) {
    return 'strategic';
  }

  if (
    lowercaseName.includes('technical') ||
    lowercaseName.includes('engineering') ||
    lowercaseName.includes('maintenance') ||
    lowercaseName.includes('m&e') ||
    lowercaseName.includes('it ')
  ) {
    return 'technical';
  }

  if (
    lowercaseName.includes('operational') ||
    lowercaseName.includes('site') ||
    lowercaseName.includes('township') ||
    lowercaseName.includes('field') ||
    lowercaseName.includes('security') ||
    lowercaseName.includes('cleaning') ||
    lowercaseName.includes('facility')
  ) {
    return 'operational';
  }

  if (
    lowercaseName.includes('customer') ||
    lowercaseName.includes('service') ||
    lowercaseName.includes('tenant') ||
    lowercaseName.includes('helpdesk') ||
    lowercaseName.includes('front office')
  ) {
    return 'service';
  }

  if (
    lowercaseName.includes('admin') ||
    lowercaseName.includes('hr') ||
    lowercaseName.includes('payroll') ||
    lowercaseName.includes('finance') ||
    lowercaseName.includes('support') ||
    lowercaseName.includes('back office')
  ) {
    return 'support';
  }

  return 'support';
}
