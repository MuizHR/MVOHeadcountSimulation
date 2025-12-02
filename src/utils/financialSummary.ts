import { PlanningTypeConfig } from '../types/planningConfig';

export type SimulationResult = {
  baselineFte?: number;
  mvoFte: number;
  currentFte?: number;
  baselineMonthlyCost?: number;
  mvoMonthlyCost: number;
  currentMonthlyCost?: number;
  projectDurationMonths?: number;
};

export type FinancialSummary = {
  sectionTitle: string;
  mvoMonthlyCost: number;
  baselineMonthlyCost?: number;
  currentMonthlyCost?: number;
  projectDurationMonths?: number;
  mvoProjectCost?: number;
  baselineProjectCost?: number;
  mvoAnnualCost?: number;
  baselineAnnualCost?: number;
  monthlySavings?: number;
  monthlySavingsPercent?: number;
  annualSavings?: number;
};

export function buildFinancialSummary(
  result: SimulationResult,
  cfg: PlanningTypeConfig
): FinancialSummary {
  const summary: FinancialSummary = {
    sectionTitle: "",
    mvoMonthlyCost: result.mvoMonthlyCost,
    baselineMonthlyCost: result.baselineMonthlyCost,
    currentMonthlyCost: result.currentMonthlyCost,
  };

  switch (cfg.costView) {
    case "project": {
      const months = result.projectDurationMonths ?? cfg.horizonMonths ?? 3;
      summary.sectionTitle = "Project Cost (Estimated)";
      summary.projectDurationMonths = months;
      summary.mvoProjectCost = result.mvoMonthlyCost * months;
      if (result.baselineMonthlyCost != null) {
        summary.baselineProjectCost = result.baselineMonthlyCost * months;
      }
      break;
    }
    case "annual": {
      summary.sectionTitle = "Annual Cost (Steady-State)";
      summary.mvoAnnualCost = result.mvoMonthlyCost * 12;
      if (result.baselineMonthlyCost != null) {
        summary.baselineAnnualCost = result.baselineMonthlyCost * 12;
      }
      break;
    }
    case "standard": {
      summary.sectionTitle = "Cost Overview";
      summary.mvoAnnualCost = result.mvoMonthlyCost * 12;
      if (result.baselineMonthlyCost != null) {
        summary.baselineAnnualCost = result.baselineMonthlyCost * 12;
      }
      break;
    }
    case "delta": {
      summary.sectionTitle = "Cost Savings vs Current Structure";
      if (result.currentMonthlyCost != null) {
        summary.monthlySavings =
          result.currentMonthlyCost - result.mvoMonthlyCost;
        if (result.currentMonthlyCost > 0) {
          summary.monthlySavingsPercent =
            (summary.monthlySavings / result.currentMonthlyCost) * 100;
        }
        summary.annualSavings = summary.monthlySavings * 12;
      }
      break;
    }
  }

  return summary;
}

export function formatCurrency(amount: number): string {
  return `RM ${Math.round(amount).toLocaleString()}`;
}
