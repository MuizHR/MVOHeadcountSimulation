import { RecommendedStrategy } from '../types/monteCarlo';

export function getWorkerTypeFromStrategy(strategy: RecommendedStrategy): "permanent" | "gig" | "none" {
  switch (strategy) {
    case "hire_permanent":
      return "permanent";
    case "hybrid_perm_gig":
      return "permanent";
    case "outsource":
      return "gig";
    case "automate":
      return "none";
    default:
      return "permanent";
  }
}

export function shouldCalculateCost(strategy: RecommendedStrategy): boolean {
  return strategy !== "automate";
}

export function getStrategyDescription(strategy: RecommendedStrategy): string {
  switch (strategy) {
    case "hire_permanent":
      return "All permanent employees with full employer costs";
    case "hybrid_perm_gig":
      return "Mix of permanent core team with GIG/contract staff for flexibility";
    case "outsource":
      return "External vendor/GIG workers with minimal employer costs";
    case "automate":
      return "Process automation with reduced headcount requirements";
    default:
      return "";
  }
}
