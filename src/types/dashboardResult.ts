export type RoleCompositionRow = {
  roleLabel: string;
  levelLabel: string;
  units: number;
  fteShare: number;
  monthlyCostRm: number;
};

export type SystemRoleComposition = {
  patternLabel: string;
  totalFte: number;
  rows: RoleCompositionRow[];
  totalMonthlyCostRm: number;
  rationale: string;
};

export type KeyStats = {
  baselineHeadcount: number;
  mvoHeadcount: number;
  baselineMonthlyCostRm: number;
  mvoMonthlyCostRm: number;
  monthlySavingsRm: number;
  annualSavingsRm: number;
  avgDurationDays: number;
  p50DurationDays: number;
  p75DurationDays: number;
  p90DurationDays: number;
  baselineFailureRiskPct: number;
  mvoFailureRiskPct: number;
};

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type RecommendedStrategy =
  | 'hire_permanent'
  | 'hybrid_perm_gig'
  | 'outsource'
  | 'automate';

export type ComparisonRow = {
  headcount: number;
  isBaseline: boolean;
  isMvo: boolean;
  avgDurationDays: number;
  p90DurationDays: number;
  avgCostRm: number;
  successRatePct: number;
  riskPct: number;
  riskBucket: RiskLevel;
};

export type SubFunctionResult = {
  id: string;
  name: string;
  workTypeLabel: string;
  baselineHeadcount: number;
  mvoHeadcount: number;
  riskLevel: RiskLevel;
  baselineFailureRiskPct: number;
  mvoFailureRiskPct: number;
  minHeadcountSafeguardApplied: boolean;
  recommendedStrategy: RecommendedStrategy;
  recommendedStrategyStats: {
    avgDurationDays: number;
    p90DurationDays: number;
    avgMonthlyCostRm: number;
    successRatePct: number;
  };
  comparisonRows: ComparisonRow[];
  aiSummaryMarkdown: string;
};

export type SimulationResult = {
  simulationId: string;
  simulationName: string;
  planningType: 'new_project' | 'new_function' | 'new_business_unit' | 'restructuring';
  sizeOfOperation: 'small' | 'medium' | 'large' | 'custom';
  totalFte: number;
  avgDurationDays: number;
  p90DurationDays: number;
  avgMonthlyCostRm: number;
  successRatePct: number;
  subFunctions: SubFunctionResult[];
  systemRoleComposition: SystemRoleComposition;
  keyStats: KeyStats;
};
