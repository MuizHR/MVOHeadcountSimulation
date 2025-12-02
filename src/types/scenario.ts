export type ScenarioType =
  | 'status_quo'
  | 'manpower_intensive'
  | 'ai_supported'
  | 'hybrid'
  | 'lean_mvo'
  | 'resilience_model';

export type RiskLevel = 'low' | 'medium' | 'high';

export type SustainabilityLevel = 'low' | 'medium' | 'high';

export type LeannessLevel = 'very_lean' | 'lean' | 'balanced' | 'heavy';

export interface CostBreakdown {
  permanent: number;
  contract: number;
  gig: number;
  total: number;
}

export interface ScenarioResult {
  type: ScenarioType;
  name: string;
  description: string;
  headcount: number;
  duration: number;
  costPerMonth: CostBreakdown;
  riskLevel: RiskLevel;
  sustainability: SustainabilityLevel;
  leanness: LeannessLevel;
  isRecommended?: boolean;
}
