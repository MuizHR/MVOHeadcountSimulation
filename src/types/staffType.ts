export interface StaffType {
  id: string;
  title: string;
  level: 'Senior Management' | 'Middle Management' | 'Executive' | 'Non-Executive';
  min_salary: number;
  mid_salary: number;
  max_salary: number;
  cost_multiplier: number;
  planning_group: string;
  sort_order: number;
  employment_type?: 'Permanent' | 'GIG';
  employer_cost?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StaffMixItem {
  staffTypeId: string;
  percentage: number;
  fteShare?: number;
  monthlyCost?: number;
}

export interface StaffMix {
  items: StaffMixItem[];
  totalPercentage: number;
  totalFte: number;
  totalMonthlyCost: number;
}

export interface RolePatternItem {
  staffTypeId: string;
  pattern: number;
  fteShare?: number;
  monthlyCost?: number;
}

export interface RolePattern {
  items: RolePatternItem[];
  totalUnits: number;
  totalFte: number;
  totalMonthlyCost: number;
}

export interface StaffConfiguration {
  mode: 'simple' | 'advanced';
  simpleRoleId?: string;
  advancedPattern?: RolePatternItem[];
}

export interface RoleFTEBreakdown {
  roleTitle: string;
  roleId: string;
  fteShare: number;
  monthlyCost: number;
}

export interface SuggestedRoleComposition {
  pattern: Array<{
    roleTitle: string;
    roleId: string;
    units: number;
  }>;
  fteBreakdown: RoleFTEBreakdown[];
  totalFteRequired: number;
  suggestedTotalMonthlyCost: number;
  narrative: string;
  workCategory: string;
}

export function calculateStaffMixMetrics(
  items: StaffMixItem[],
  totalFteRequired: number,
  staffTypes: StaffType[]
): StaffMix {
  const totalPercentage = items.reduce((sum, item) => sum + item.percentage, 0);

  const enrichedItems = items.map(item => {
    const staffType = staffTypes.find(st => st.id === item.staffTypeId);
    if (!staffType) return { ...item, fteShare: 0, monthlyCost: 0 };

    const fteShare = (totalFteRequired * item.percentage) / 100;
    const costPerFte = getEmployerCostPerFte(staffType);
    const monthlyCost = fteShare * costPerFte;

    return {
      ...item,
      fteShare,
      monthlyCost,
    };
  });

  const totalFte = enrichedItems.reduce((sum, item) => sum + (item.fteShare || 0), 0);
  const totalMonthlyCost = enrichedItems.reduce((sum, item) => sum + (item.monthlyCost || 0), 0);

  return {
    items: enrichedItems,
    totalPercentage,
    totalFte,
    totalMonthlyCost,
  };
}

export function getEmployerCostPerFte(staffType: StaffType): number {
  if (staffType.employer_cost != null) {
    return staffType.employer_cost;
  }
  return staffType.mid_salary * staffType.cost_multiplier;
}

export function groupStaffTypesByPlanningGroup(staffTypes: StaffType[]): Map<string, StaffType[]> {
  const grouped = new Map<string, StaffType[]>();

  staffTypes.forEach(st => {
    const existing = grouped.get(st.planning_group) || [];
    grouped.set(st.planning_group, [...existing, st]);
  });

  return grouped;
}

export function calculateRolePatternMetrics(
  items: RolePatternItem[],
  totalFteRequired: number,
  staffTypes: StaffType[]
): RolePattern {
  const totalUnits = items.reduce((sum, item) => sum + item.pattern, 0);

  if (totalUnits === 0) {
    return {
      items: [],
      totalUnits: 0,
      totalFte: 0,
      totalMonthlyCost: 0,
    };
  }

  const ftePerUnit = totalFteRequired / totalUnits;

  const enrichedItems = items.map(item => {
    const staffType = staffTypes.find(st => st.id === item.staffTypeId);
    if (!staffType) return { ...item, fteShare: 0, monthlyCost: 0 };

    const fteShare = item.pattern * ftePerUnit;
    const costPerFte = getEmployerCostPerFte(staffType);
    const monthlyCost = fteShare * costPerFte;

    return {
      ...item,
      fteShare,
      monthlyCost,
    };
  });

  const totalFte = enrichedItems.reduce((sum, item) => sum + (item.fteShare || 0), 0);
  const totalMonthlyCost = enrichedItems.reduce((sum, item) => sum + (item.monthlyCost || 0), 0);

  return {
    items: enrichedItems,
    totalUnits,
    totalFte,
    totalMonthlyCost,
  };
}

export function calculateSimpleRoleCost(
  staffTypeId: string,
  totalFteRequired: number,
  staffTypes: StaffType[]
): number {
  const staffType = staffTypes.find(st => st.id === staffTypeId);
  if (!staffType) return 0;

  const costPerFte = getEmployerCostPerFte(staffType);
  return totalFteRequired * costPerFte;
}
