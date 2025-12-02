import { supabase } from '../lib/supabase';
import { StaffType } from '../types/staffType';
import { SalaryBand, calculateMidpoint, calculateEmployerCost } from '../utils/salaryCalculator';
import { calculateMonthlyCost } from '../utils/calculateCost';
import { getRoleBandKey } from '../utils/roleMap';

function convertSalaryBandToStaffType(band: SalaryBand, sortOrder: number): StaffType {
  const midpoint = calculateMidpoint(band);

  const roleBandKey = getRoleBandKey(band.job_grade);
  const workerType = band.employment_type.toLowerCase() as "permanent" | "gig";
  let employerCost = calculateMonthlyCost(roleBandKey, workerType);

  if (employerCost === 0) {
    employerCost = calculateEmployerCost(band, midpoint);
  }

  return {
    id: band.id,
    title: `${band.job_grade} (${band.employment_type})`,
    level: band.level as 'Senior Management' | 'Middle Management' | 'Executive' | 'Non-Executive',
    min_salary: band.salary_min,
    mid_salary: midpoint,
    max_salary: band.salary_max,
    cost_multiplier: employerCost / midpoint,
    planning_group: band.level,
    sort_order: sortOrder,
    employment_type: band.employment_type,
    employer_cost: employerCost,
  };
}

export async function fetchAllStaffTypes(): Promise<StaffType[]> {
  const { data, error } = await supabase
    .from('salary_bands')
    .select('*')
    .order('employment_type', { ascending: true })
    .order('salary_min', { ascending: false });

  if (error) {
    console.error('Error fetching salary bands:', error);
    throw new Error('Failed to fetch salary bands from database');
  }

  if (!data) return [];

  const normalizedData = data.map(band => ({
    ...band,
    salary_min: Number(band.salary_min),
    salary_max: Number(band.salary_max),
    fixed_allowance: Number(band.fixed_allowance),
    statutory_rate: Number(band.statutory_rate),
    insurance_rate: Number(band.insurance_rate),
    medical_amount: Number(band.medical_amount),
    ghs_rate: Number(band.ghs_rate),
  }));

  return normalizedData.map((band, index) => convertSalaryBandToStaffType(band, index + 1));
}

export async function fetchStaffTypeById(id: string): Promise<StaffType | null> {
  const { data, error } = await supabase
    .from('salary_bands')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching salary band:', error);
    return null;
  }

  if (!data) return null;

  return convertSalaryBandToStaffType(data, 0);
}

export async function fetchStaffTypesByLevel(level: string): Promise<StaffType[]> {
  const { data, error } = await supabase
    .from('salary_bands')
    .select('*')
    .eq('level', level)
    .order('employment_type', { ascending: true })
    .order('salary_min', { ascending: false });

  if (error) {
    console.error('Error fetching salary bands by level:', error);
    return [];
  }

  if (!data) return [];

  return data.map((band, index) => convertSalaryBandToStaffType(band, index + 1));
}

export async function fetchStaffTypesByPlanningGroup(planningGroup: string): Promise<StaffType[]> {
  const { data, error } = await supabase
    .from('salary_bands')
    .select('*')
    .eq('level', planningGroup)
    .order('employment_type', { ascending: true })
    .order('salary_min', { ascending: false });

  if (error) {
    console.error('Error fetching salary bands by planning group:', error);
    return [];
  }

  if (!data) return [];

  return data.map((band, index) => convertSalaryBandToStaffType(band, index + 1));
}

export function getUniquePlanningGroups(staffTypes: StaffType[]): string[] {
  const groups = new Set<string>();
  staffTypes.forEach(st => groups.add(st.planning_group));
  return Array.from(groups);
}

export function getStaffTypesForPlanningGroup(
  staffTypes: StaffType[],
  planningGroup: string
): StaffType[] {
  return staffTypes.filter(st => st.planning_group === planningGroup);
}

export function calculateWeightedCostForMix(
  staffTypes: StaffType[],
  staffTypeIds: string[],
  percentages: number[]
): number {
  if (staffTypeIds.length !== percentages.length) {
    throw new Error('Staff type IDs and percentages arrays must have same length');
  }

  let totalCost = 0;

  staffTypeIds.forEach((id, index) => {
    const staffType = staffTypes.find(st => st.id === id);
    if (staffType) {
      const weight = percentages[index] / 100;
      const costPerFte = staffType.employer_cost ?? (staffType.mid_salary * staffType.cost_multiplier);
      totalCost += costPerFte * weight;
    }
  });

  return totalCost;
}
