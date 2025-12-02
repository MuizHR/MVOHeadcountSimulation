export type WorkerType = "permanent" | "gig" | "none";
export type RecommendedStrategy = "hire_permanent" | "hybrid_perm_gig" | "outsource" | "automate";

export function getWorkerType(strategy: RecommendedStrategy): WorkerType {
  if (strategy === "hire_permanent") return "permanent";
  if (strategy === "hybrid_perm_gig") return "gig";
  if (strategy === "outsource") return "none";
  if (strategy === "automate") return "none";
  return "permanent";
}

export function getWorkerTypeLabel(workerType: WorkerType): string {
  switch (workerType) {
    case "permanent":
      return "Permanent / Fixed Term Contract";
    case "gig":
      return "GIG / Short Term Contract";
    case "none":
      return "No Cost (Outsourced/Automated)";
    default:
      return "Unknown";
  }
}

export function getStrategyDescription(strategy: RecommendedStrategy): string {
  switch (strategy) {
    case "hire_permanent":
      return "All permanent employees with full employer costs (EPF, SOCSO, EIS, HRD Corp, GPA/GTL, Medical, GHS)";
    case "hybrid_perm_gig":
      return "Mix of permanent core team with GIG/contract staff for flexibility (reduced employer costs)";
    case "outsource":
      return "External vendor/service provider (no direct headcount costs)";
    case "automate":
      return "Process automation with reduced headcount requirements (technology investment)";
    default:
      return "";
  }
}
