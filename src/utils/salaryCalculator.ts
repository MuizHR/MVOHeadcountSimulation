import { calculateMonthlyCost } from './calculateCost';
import { getRoleBandKey } from './roleMap';

export interface SalaryBand {
  id: string;
  employment_type: 'Permanent' | 'GIG';
  job_grade: string;
  level: string;
  salary_min: number;
  salary_max: number;
  fixed_allowance: number;
  statutory_rate: number;
  insurance_rate: number;
  medical_amount: number;
  ghs_rate: number;
}

export function calculateMidpoint(band: SalaryBand): number {
  return (band.salary_min + band.salary_max) / 2;
}

export function calculateEmployerCost(band: SalaryBand, midpoint?: number): number {
  const roleBandKey = getRoleBandKey(band.job_grade);
  const workerType = band.employment_type.toLowerCase() as "permanent" | "gig";

  const costFromEngine = calculateMonthlyCost(roleBandKey, workerType);
  if (costFromEngine > 0) {
    return costFromEngine;
  }

  const salary = midpoint ?? calculateMidpoint(band);
  const allowance = band.fixed_allowance;

  const statutory = (salary + allowance) * band.statutory_rate;
  const insurance = salary * band.insurance_rate;
  const medical = band.medical_amount;
  const ghs = salary * band.ghs_rate;

  return salary + allowance + statutory + insurance + medical + ghs;
}

export function calculateEmployerCostBreakdown(band: SalaryBand, midpoint?: number) {
  const salary = midpoint ?? calculateMidpoint(band);
  const allowance = band.fixed_allowance;

  const statutory = (salary + allowance) * band.statutory_rate;
  const insurance = salary * band.insurance_rate;
  const medical = band.medical_amount;
  const ghs = salary * band.ghs_rate;
  const total = salary + allowance + statutory + insurance + medical + ghs;

  return {
    salary,
    allowance,
    statutory,
    insurance,
    medical,
    ghs,
    total,
  };
}
