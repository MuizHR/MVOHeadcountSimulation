export type DistributionType = 'normal' | 'uniform' | 'triangular';
export type RecommendedStrategy = 'hire_permanent' | 'hybrid_perm_gig' | 'outsource' | 'automate';

type StrategyConfig = {
  label: string;
  tooltip: string;
  explanation: string;
};

export const strategyConfig: Record<RecommendedStrategy, StrategyConfig> = {
  hire_permanent: {
    label: 'Hire Permanent Staff',
    tooltip:
      'Build or maintain a fully in-house team using permanent employees as the main delivery model.',
    explanation:
      'This option recommends staffing the work with permanent JLG employees. Best when the activity is core, sensitive or strategic (e.g. payroll, statutory compliance, critical operations). Prioritises control, knowledge retention and long-term capability, even if the cost is slightly higher than other options.',
  },

  hybrid_perm_gig: {
    label: 'Hybrid (Permanent + Contract)',
    tooltip:
      'Keep a core permanent team and add contract/project staff to handle peaks or temporary workload.',
    explanation:
      'A stable core of permanent staff owns governance, key processes and relationships. Fixed-term, contract or project staff are added for projects, backlogs or seasonal peaks. Suitable when workload is uneven or project-based and the business needs flexibility without fully outsourcing.',
  },

  outsource: {
    label: 'Outsource / Vendor',
    tooltip:
      'Use an external vendor to deliver most of the work, with a lean internal team for governance and oversight.',
    explanation:
      'Day-to-day operations, manpower and tools are provided by a service vendor under contract and SLA. JLG keeps a small internal team to own standards, approvals, data and vendor performance monitoring. Suitable when the work is standardised or transactional and a vendor can deliver at comparable quality with lower or more flexible OPEX.',
  },

  automate: {
    label: 'Automate / Optimize Process',
    tooltip:
      'Reduce manual effort by improving process, systems and automation so a smaller team can handle the workload safely.',
    explanation:
      'Focuses on simplifying workflows, removing low-value steps and using systems or automation to lift productivity. The same or lower headcount can manage more volume with fewer errors and better turnaround time. Best for high-volume, repetitive or rules-based tasks where technology can replace manual work.',
  },
};

export interface BaselineHeadcount {
  headcount: number;
  calculation: {
    totalWorkload: number;
    averageProductivity: number;
    availableWorkingDays: number;
    formula: string;
  };
  rationale: string;
}

export interface HeadcountTestResult {
  headcount: number;
  iterations: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p75Duration: number;
  p90Duration: number;
  avgCost: number;
  minCost: number;
  maxCost: number;
  deadlineMetProbability: number;
  failureRisk: number;
  withinBudgetProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  rejected: boolean;
  rejectionReason?: string;
  minHeadcountApplied?: boolean;
  minHeadcountValue?: number;
}

export interface MVOResult {
  recommendedHeadcount: number;
  baselineHeadcount: number;
  testResults: HeadcountTestResult[];
  selectedResult: HeadcountTestResult;
  strategy: RecommendedStrategy;
  explanation: string;
  suggestions: string[];
  comparison: {
    baselineRisk: number;
    mvoRisk: number;
    costDifference: number;
    timeDifference: number;
  };
}

export interface ProbabilityRange {
  min: number;
  max: number;
  mostLikely?: number;
  distribution: DistributionType;
}

export interface MonteCarloVariable {
  name: string;
  baseValue: number;
  range: ProbabilityRange;
  enabled: boolean;
}

export interface MonteCarloInputs {
  iterations: number;
  confidenceLevel: number;
  variables: {
    complexityFactor?: MonteCarloVariable;
    serviceFactor?: MonteCarloVariable;
    automationFactor?: MonteCarloVariable;
    utilizationRate?: MonteCarloVariable;
    workloadVolume?: MonteCarloVariable;
  };
}

export interface SimulationResult {
  iteration: number;
  fte: number;
  variables: Record<string, number>;
}

export interface MonteCarloOutput {
  results: SimulationResult[];
  statistics: {
    mean: number;
    median: number;
    mode: number;
    stdDev: number;
    min: number;
    max: number;
    p10: number;
    p25: number;
    p75: number;
    p90: number;
  };
  confidenceIntervals: {
    level: number;
    lower: number;
    upper: number;
  };
  distribution: {
    bins: number[];
    frequencies: number[];
  };
}

export interface BaselineResult {
  fte: number;
  workloadHours: number;
  adjustedHours: number;
  effectiveCapacity: number;
  factors: {
    complexity: number;
    service: number;
    automation: number;
    coverage: number;
    utilization: number;
  };
  rationale: string;
}

export interface SynchronizedResults {
  baseline: BaselineResult;
  monteCarlo: MonteCarloOutput;
  mvo: MVOResult;
  comparison: {
    baselineWithinRange: boolean;
    probabilityOfBaseline: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export const DEFAULT_MONTE_CARLO_INPUTS: MonteCarloInputs = {
  iterations: 10000,
  confidenceLevel: 90,
  variables: {
    complexityFactor: {
      name: 'Complexity Factor',
      baseValue: 1.0,
      range: {
        min: 0.8,
        max: 1.2,
        mostLikely: 1.0,
        distribution: 'triangular',
      },
      enabled: true,
    },
    serviceFactor: {
      name: 'Service Level Factor',
      baseValue: 1.0,
      range: {
        min: 0.9,
        max: 1.3,
        mostLikely: 1.0,
        distribution: 'triangular',
      },
      enabled: true,
    },
    automationFactor: {
      name: 'Automation Impact',
      baseValue: 0.3,
      range: {
        min: 0.2,
        max: 0.4,
        mostLikely: 0.3,
        distribution: 'triangular',
      },
      enabled: true,
    },
    utilizationRate: {
      name: 'Utilization Rate',
      baseValue: 0.85,
      range: {
        min: 0.75,
        max: 0.95,
        mostLikely: 0.85,
        distribution: 'triangular',
      },
      enabled: true,
    },
    workloadVolume: {
      name: 'Workload Volume Variance',
      baseValue: 1.0,
      range: {
        min: 0.85,
        max: 1.15,
        mostLikely: 1.0,
        distribution: 'triangular',
      },
      enabled: true,
    },
  },
};
