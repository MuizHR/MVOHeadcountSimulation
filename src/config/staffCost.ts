import { salaryBands, SALARY_BANDS, SalaryBandDefinition } from '../utils/salaryBands';

export type EmploymentTypeKey = keyof typeof SALARY_BANDS;
export type RoleKey = keyof typeof salaryBands;

export interface RoleOption {
  bandKey: RoleKey;
  employmentType: EmploymentTypeKey;
  label: string;
  level: 'Senior Management' | 'Middle Management' | 'Executive' | 'Non-Executive';
}

export const ROLE_LEVEL_MAP: Record<RoleKey, 'Senior Management' | 'Middle Management' | 'Executive' | 'Non-Executive'> = {
  senior_chief_officer: 'Senior Management',
  chief_officer: 'Senior Management',
  general_manager: 'Middle Management',
  deputy_general_manager: 'Middle Management',
  senior_manager: 'Middle Management',
  manager: 'Middle Management',
  deputy_manager: 'Middle Management',
  senior_executive: 'Executive',
  executive: 'Executive',
  executive_b: 'Executive',
  senior_clerical: 'Non-Executive',
  clerk: 'Non-Executive',
  office_assistant: 'Non-Executive',
  general_worker: 'Non-Executive'
};

export const ROLE_OPTIONS: RoleOption[] = (() => {
  const humanLabels: Record<RoleKey, string> = {
    senior_chief_officer: 'Senior Chief Officer',
    chief_officer: 'Chief Officer',
    general_manager: 'General Manager',
    deputy_general_manager: 'Deputy General Manager',
    senior_manager: 'Senior Manager',
    manager: 'Manager',
    deputy_manager: 'Deputy Manager',
    senior_executive: 'Senior Executive',
    executive: 'Executive',
    executive_b: 'Executive-B',
    senior_clerical: 'Senior Clerical / Technician / Secretary',
    clerk: 'Clerk / Technician',
    office_assistant: 'Office Assistant',
    general_worker: 'General Worker'
  };

  const result: RoleOption[] = [];

  (['permanent', 'gig'] as EmploymentTypeKey[]).forEach(type => {
    Object.keys(SALARY_BANDS[type]).forEach(key => {
      const bandKey = key as RoleKey;
      result.push({
        bandKey,
        employmentType: type,
        label: `${humanLabels[bandKey]} (${type === 'permanent' ? 'Permanent' : 'GIG'})`,
        level: ROLE_LEVEL_MAP[bandKey]
      });
    });
  });

  return result;
})();

/**
 * Compute the monthly employer cost for 1 FTE of a role, based on the
 * salary band definition + SALARY_BANDS (min/max/allowance).
 */
export function computeMonthlyCost(
  employmentType: EmploymentTypeKey,
  bandKey: RoleKey
): number {
  const baseInfo = SALARY_BANDS[employmentType][bandKey];
  const def: SalaryBandDefinition = salaryBands[bandKey];

  const midpointSalary = (def.salaryRange[0] + def.salaryRange[1]) / 2;
  const salaryPlusAllowance = midpointSalary + baseInfo.allowance;

  const statutory = salaryPlusAllowance * def.statRate;
  const gpa = midpointSalary * def.gpaRate;
  const ghs = midpointSalary * def.ghsRate;

  const total =
    salaryPlusAllowance +
    statutory +
    gpa +
    def.medical +
    ghs;

  return Math.round(total);
}

/**
 * Get a unique identifier for a role option
 */
export function getRoleOptionId(employmentType: EmploymentTypeKey, bandKey: RoleKey): string {
  return `${employmentType}_${bandKey}`;
}

/**
 * Parse a role option ID back into its components
 */
export function parseRoleOptionId(id: string): { employmentType: EmploymentTypeKey; bandKey: RoleKey } | null {
  const parts = id.split('_');
  if (parts.length < 2) return null;

  const employmentType = parts[0] as EmploymentTypeKey;
  const bandKey = parts.slice(1).join('_') as RoleKey;

  if (!(employmentType in SALARY_BANDS) || !(bandKey in salaryBands)) {
    return null;
  }

  return { employmentType, bandKey };
}

/**
 * Find a role option by ID
 */
export function findRoleOption(id: string): RoleOption | undefined {
  const parsed = parseRoleOptionId(id);
  if (!parsed) return undefined;

  return ROLE_OPTIONS.find(
    opt => opt.employmentType === parsed.employmentType && opt.bandKey === parsed.bandKey
  );
}

export interface SalaryBandSummary {
  min: number;
  max: number;
  allowance: number;
  midpoint: number;
  monthlyCost: number;
  statRate: number;
  gpaRate: number;
  ghsRate: number;
  medical: number;
}

/**
 * Get comprehensive salary band summary for display
 */
export function getSalaryBandSummary(
  employmentType: EmploymentTypeKey,
  bandKey: RoleKey
): SalaryBandSummary {
  const band = salaryBands[bandKey];
  const bandGroup = SALARY_BANDS[employmentType][bandKey];

  const midpoint = (band.salaryRange[0] + band.salaryRange[1]) / 2;
  const monthlyCost = computeMonthlyCost(employmentType, bandKey);

  return {
    min: bandGroup.min,
    max: bandGroup.max,
    allowance: bandGroup.allowance,
    midpoint,
    monthlyCost,
    statRate: band.statRate,
    gpaRate: band.gpaRate,
    ghsRate: band.ghsRate,
    medical: band.medical
  };
}

/**
 * Format money value for display
 */
export const formatMoney = (value: number) =>
  `RM ${value.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
