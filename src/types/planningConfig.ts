export type PlanningTypeKey = "NEW_PROJECT" | "NEW_FUNCTION" | "NEW_BUSINESS_UNIT" | "RESTRUCTURING";
export type SizeOfOperationKey = "SMALL_LEAN" | "MEDIUM_STANDARD" | "LARGE_EXTENDED";
export type CostViewMode = "project" | "annual" | "standard" | "delta";

export type PlanningTypeConfig = {
  label: string;
  description: string;
  horizonMonths: number;
  varianceMultiplier: number;
  minHeadcountMode: "lean" | "governed" | "reduction";
  overheadFactor?: number;
  maxReductionPercent?: number;
  tooltip: string;
  costView: CostViewMode;
};

export type SizeOfOperationConfig = {
  label: string;
  description: string;
  workloadScale: number;
  productivityScale: number;
  minHeadcountBase: number;
  tooltip: string;
};

export const planningTypeConfig: Record<PlanningTypeKey, PlanningTypeConfig> = {
  NEW_PROJECT: {
    label: "New Project",
    description: "Setting up a new project with temporary or dedicated resources.",
    horizonMonths: 3,
    varianceMultiplier: 1.2,
    minHeadcountMode: "lean",
    costView: "project",
    tooltip:
      "New Project simulations assume a short-term, higher-uncertainty environment. The model allows a leaner minimum team as long as the success rate stays within your risk tolerance.",
  },
  NEW_FUNCTION: {
    label: "New Function",
    description: "Creating a new permanent function or department from scratch.",
    horizonMonths: 12,
    varianceMultiplier: 1.0,
    minHeadcountMode: "governed",
    costView: "annual",
    tooltip:
      "New Function simulations are tuned for steady-state operations. The model enforces stronger governance rules on minimum headcount and structure for long-term sustainability.",
  },
  NEW_BUSINESS_UNIT: {
    label: "New Business Unit",
    description: "Launching a new business unit with multiple functions and teams.",
    horizonMonths: 24,
    varianceMultiplier: 1.3,
    minHeadcountMode: "governed",
    overheadFactor: 1.1,
    costView: "standard",
    tooltip:
      "New Business Unit simulations include additional leadership and coordination overhead on top of function-level requirements, and assume higher uncertainty during ramp-up.",
  },
  RESTRUCTURING: {
    label: "Restructuring",
    description: "Reorganizing an existing function to improve efficiency or reduce costs.",
    horizonMonths: 12,
    varianceMultiplier: 1.1,
    minHeadcountMode: "reduction",
    maxReductionPercent: 0.30,
    costView: "delta",
    tooltip:
      "Restructuring simulations start from your current headcount and explore safe reductions. The model caps reductions (e.g. around 30%) and prioritises service continuity and risk control.",
  },
};

export const sizeOfOperationConfig: Record<SizeOfOperationKey, SizeOfOperationConfig> = {
  SMALL_LEAN: {
    label: "Small / Lean (minimum team)",
    description: "For pilot projects, small sites, low workload or tight budget situations.",
    workloadScale: 0.7,
    productivityScale: 1.0,
    minHeadcountBase: 1,
    tooltip:
      "Small / Lean assumes lower workload and a minimum-sized team. The simulator will try to keep the headcount as lean as possible while still meeting your success threshold.",
  },
  MEDIUM_STANDARD: {
    label: "Medium / Standard (normal operations)",
    description: "For regular daily operations with a balanced workload.",
    workloadScale: 1.0,
    productivityScale: 1.0,
    minHeadcountBase: 2,
    tooltip:
      "Medium / Standard is tuned for typical daily operations. Workload and productivity stay close to your inputs, and the suggested headcount balances cost and service stability.",
  },
  LARGE_EXTENDED: {
    label: "Large / Extended (full scale / growth)",
    description: "For big projects, multiple locations, high demand or rapid expansion.",
    workloadScale: 1.4,
    productivityScale: 0.9,
    minHeadcountBase: 3,
    tooltip:
      "Large / Extended assumes higher overall volume and coordination complexity. The simulator expects more variability and may recommend a larger core team for resilience.",
  },
};

export function mapPlanningTypeToKey(label: string): PlanningTypeKey {
  const mapping: Record<string, PlanningTypeKey> = {
    "New Project": "NEW_PROJECT",
    "New Function": "NEW_FUNCTION",
    "New Business Unit": "NEW_BUSINESS_UNIT",
    "Restructuring": "RESTRUCTURING",
  };
  return mapping[label] || "NEW_FUNCTION";
}

export function mapSizeOfOperationToKey(label: string): SizeOfOperationKey {
  const mapping: Record<string, SizeOfOperationKey> = {
    "Small / Lean (minimum team)": "SMALL_LEAN",
    "Medium / Standard (normal operations)": "MEDIUM_STANDARD",
    "Large / Extended (full scale / growth)": "LARGE_EXTENDED",
  };
  return mapping[label] || "MEDIUM_STANDARD";
}
