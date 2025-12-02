import { salaryBands, SALARY_BANDS } from "./salaryBands";

export function calculateMonthlyCost(roleKey: string, workerType: "permanent" | "gig" | "none" = "permanent"): number {
  if (workerType === "none") return 0;

  const band = salaryBands[roleKey];
  if (!band) return 0;

  const min = band.salaryRange[0];
  const max = band.salaryRange[1];
  const salaryMid = (min + max) / 2;

  if (workerType === "gig") {
    return Math.round(salaryMid);
  }

  const allowance = band.fixedAllowance;
  const employerStatutory = (salaryMid + allowance) * band.statRate;
  const gpaGtl = salaryMid * band.gpaRate;
  const ghs = salaryMid * band.ghsRate;

  return Math.round(
    salaryMid + allowance + employerStatutory + gpaGtl + band.medical + ghs
  );
}

export function calculateAnnualCost(roleKey: string, workerType: "permanent" | "gig" | "none" = "permanent"): number {
  return calculateMonthlyCost(roleKey, workerType) * 12;
}

export function calculateCostBreakdown(roleKey: string, workerType: "permanent" | "gig" | "none" = "permanent") {
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

  const band = salaryBands[roleKey];
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

  const min = band.salaryRange[0];
  const max = band.salaryRange[1];
  const midpoint = (min + max) / 2;
  const allowance = band.fixedAllowance;

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

  const statutory = (midpoint + allowance) * band.statRate;
  const gpa_gtl = midpoint * band.gpaRate;
  const ghs = midpoint * band.ghsRate;
  const total = midpoint + allowance + statutory + gpa_gtl + band.medical + ghs;

  return {
    midpoint: Math.round(midpoint),
    allowance: Math.round(allowance),
    statutory: Math.round(statutory),
    gpa_gtl: Math.round(gpa_gtl),
    medical: Math.round(band.medical),
    ghs: Math.round(ghs),
    total: Math.round(total)
  };
}

export function calculateMonthlyCostLegacy(role: string, workerType: "permanent" | "gig" | "none" = "permanent"): number {
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
