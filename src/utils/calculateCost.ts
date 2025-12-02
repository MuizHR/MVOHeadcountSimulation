import { SALARY_BANDS } from "./salaryBands";

export function calculateMonthlyCost(role: string, workerType: "permanent" | "gig" | "none" = "permanent"): number {
  if (workerType === "none") return 0;

  const band = SALARY_BANDS[workerType][role as keyof typeof SALARY_BANDS.permanent];
  if (!band) return 0;

  const midpoint = (band.min + band.max) / 2;
  const allowance = band.allowance ?? 0;

  if (workerType === "gig") {
    return Math.round(midpoint);
  }

  const statutory = 0.20 * (midpoint + allowance);
  const gpa_gtl = 0.04 * midpoint;
  const medical = 600;
  const ghs = 0.10 * midpoint;

  const monthlyCost = midpoint + allowance + statutory + gpa_gtl + medical + ghs;

  return Math.round(monthlyCost);
}

export function calculateAnnualCost(role: string, workerType: "permanent" | "gig" = "permanent"): number {
  return calculateMonthlyCost(role, workerType) * 12;
}

export function calculateCostBreakdown(role: string, workerType: "permanent" | "gig" | "none" = "permanent") {
  if (workerType === "none") {
    return {
      midpoint: 0,
      allowance: 0,
      statutory: 0,
      gpa_gtl: 0,
      medical: 0,
      ghs: 0,
      total: 0
    };
  }

  const band = SALARY_BANDS[workerType][role as keyof typeof SALARY_BANDS.permanent];
  if (!band) {
    return {
      midpoint: 0,
      allowance: 0,
      statutory: 0,
      gpa_gtl: 0,
      medical: 0,
      ghs: 0,
      total: 0
    };
  }

  const midpoint = (band.min + band.max) / 2;
  const allowance = band.allowance ?? 0;

  if (workerType === "gig") {
    return {
      midpoint: Math.round(midpoint),
      allowance: 0,
      statutory: 0,
      gpa_gtl: 0,
      medical: 0,
      ghs: 0,
      total: Math.round(midpoint)
    };
  }

  const statutory = 0.20 * (midpoint + allowance);
  const gpa_gtl = 0.04 * midpoint;
  const medical = 600;
  const ghs = 0.10 * midpoint;
  const total = midpoint + allowance + statutory + gpa_gtl + medical + ghs;

  return {
    midpoint: Math.round(midpoint),
    allowance: Math.round(allowance),
    statutory: Math.round(statutory),
    gpa_gtl: Math.round(gpa_gtl),
    medical: Math.round(medical),
    ghs: Math.round(ghs),
    total: Math.round(total)
  };
}
