import { StaffType, SuggestedRoleComposition, RoleFTEBreakdown } from '../types/staffType';
import { WorkCategory, WORK_CATEGORIES } from '../types/workType';

interface RoleAllocation {
  roleTitle: string;
  units: number;
}

export function generateWorkTypeAwareRoleComposition(
  totalFteRequired: number,
  workCategory: WorkCategory,
  subFunctionName: string,
  staffTypes: StaffType[]
): SuggestedRoleComposition {
  const category = WORK_CATEGORIES[workCategory];
  const allocation = allocateRolesByWorkType(totalFteRequired, workCategory, staffTypes);

  const totalUnits = allocation.reduce((sum, item) => sum + item.units, 0);
  const ftePerUnit = totalFteRequired / totalUnits;

  const pattern = allocation.map(item => {
    const role = findRoleByTitle(item.roleTitle, staffTypes);
    return {
      roleTitle: item.roleTitle,
      roleId: role?.id || '',
      units: item.units,
    };
  });

  const fteBreakdown: RoleFTEBreakdown[] = allocation.map(item => {
    const role = findRoleByTitle(item.roleTitle, staffTypes);
    if (!role) {
      return {
        roleTitle: item.roleTitle,
        roleId: '',
        fteShare: 0,
        monthlyCost: 0,
      };
    }

    const fteShare = item.units * ftePerUnit;
    const costPerFte = role.mid_salary * role.cost_multiplier;
    const monthlyCost = fteShare * costPerFte;

    return {
      roleTitle: item.roleTitle,
      roleId: role.id,
      fteShare,
      monthlyCost,
    };
  });

  const suggestedTotalMonthlyCost = fteBreakdown.reduce((sum, item) => sum + item.monthlyCost, 0);

  const patternDescription = allocation
    .map(item => `${item.units} ${item.roleTitle}${item.units > 1 ? 's' : ''}`)
    .join(' + ');

  const narrative = `System-suggested mix: ${patternDescription}, aligned to total FTE ≈ ${totalFteRequired.toFixed(1)} and JLG salary bands for ${category.name} work.`;

  return {
    pattern,
    fteBreakdown,
    totalFteRequired,
    suggestedTotalMonthlyCost,
    narrative,
    workCategory: category.name,
  };
}

function allocateRolesByWorkType(
  totalFteRequired: number,
  workCategory: WorkCategory,
  staffTypes: StaffType[]
): RoleAllocation[] {
  const category = WORK_CATEGORIES[workCategory];
  const allocation: RoleAllocation[] = [];

  if (totalFteRequired <= 1.5) {
    const executionRole = findBestExecutionRole(category, staffTypes);
    allocation.push({ roleTitle: executionRole, units: 1 });
    return allocation;
  }

  if (totalFteRequired <= 4.0) {
    const leaderRole = findBestLeaderRole(category, staffTypes);
    const executionRole = findBestExecutionRole(category, staffTypes);

    allocation.push({ roleTitle: leaderRole, units: 1 });
    const remainingUnits = Math.round(totalFteRequired) - 1;
    if (remainingUnits > 0) {
      allocation.push({ roleTitle: executionRole, units: remainingUnits });
    }
    return allocation;
  }

  if (totalFteRequired <= 8.0) {
    const seniorLeaderRole = findSeniorLeaderRole(category, staffTypes);
    const leaderRole = findBestLeaderRole(category, staffTypes);
    const executionRole = findBestExecutionRole(category, staffTypes);
    const supportRole = category.supportRoles?.[0];

    allocation.push({ roleTitle: seniorLeaderRole, units: 1 });
    allocation.push({ roleTitle: leaderRole, units: 1 });

    const remainingFte = totalFteRequired - 2;

    if (workCategory === 'operational' || workCategory === 'service') {
      const execUnits = Math.max(1, Math.floor(remainingFte * 0.4));
      const supportUnits = Math.max(1, Math.ceil(remainingFte * 0.6));

      if (execUnits > 0) {
        allocation.push({ roleTitle: executionRole, units: execUnits });
      }
      if (supportRole && supportUnits > 0) {
        allocation.push({ roleTitle: supportRole, units: supportUnits });
      }
    } else {
      const execUnits = Math.round(remainingFte);
      if (execUnits > 0) {
        allocation.push({ roleTitle: executionRole, units: execUnits });
      }
    }

    return allocation;
  }

  const seniorLeaderRole = 'Senior Manager';
  const leaderRole = findBestLeaderRole(category, staffTypes);
  const executionRole = findBestExecutionRole(category, staffTypes);
  const supportRole = category.supportRoles?.[0];

  const leaderFteRatio = Math.min(0.25, Math.max(0.15, 1 / Math.sqrt(totalFteRequired)));
  const numLeaders = Math.max(2, Math.floor(totalFteRequired * leaderFteRatio));

  allocation.push({ roleTitle: seniorLeaderRole, units: 1 });
  allocation.push({ roleTitle: leaderRole, units: numLeaders - 1 });

  const remainingFte = totalFteRequired - numLeaders;

  if (workCategory === 'operational') {
    const supportUnits = Math.ceil(remainingFte * 0.75);
    const execUnits = Math.floor(remainingFte * 0.25);

    if (execUnits > 0) {
      allocation.push({ roleTitle: executionRole, units: execUnits });
    }
    if (supportRole && supportUnits > 0) {
      allocation.push({ roleTitle: supportRole, units: supportUnits });
    }
  } else if (workCategory === 'service' || workCategory === 'support') {
    const execUnits = Math.ceil(remainingFte * 0.6);
    const supportUnits = supportRole ? Math.floor(remainingFte * 0.4) : 0;

    if (execUnits > 0) {
      allocation.push({ roleTitle: executionRole, units: execUnits });
    }
    if (supportRole && supportUnits > 0) {
      allocation.push({ roleTitle: supportRole, units: supportUnits });
    }
  } else {
    const execUnits = Math.round(remainingFte);
    if (execUnits > 0) {
      allocation.push({ roleTitle: executionRole, units: execUnits });
    }
  }

  return allocation;
}

function findSeniorLeaderRole(category: WorkCategoryDefinition, staffTypes: StaffType[]): string {
  if (category.leaderRoles.includes('Senior Manager')) {
    return 'Senior Manager';
  }
  return category.leaderRoles[0] || 'Manager';
}

function findBestLeaderRole(category: WorkCategoryDefinition, staffTypes: StaffType[]): string {
  if (category.leaderRoles.includes('Manager')) {
    return 'Manager';
  }
  if (category.leaderRoles.includes('Senior Executive')) {
    return 'Senior Executive';
  }
  return category.leaderRoles[0] || 'Manager';
}

function findBestExecutionRole(category: WorkCategoryDefinition, staffTypes: StaffType[]): string {
  if (category.category === 'operational') {
    return 'Clerk / Technician';
  }
  if (category.category === 'strategic' || category.category === 'technical') {
    return 'Executive';
  }
  return category.executionRoles[0] || 'Executive';
}

function findRoleByTitle(title: string, staffTypes: StaffType[]): StaffType | undefined {
  return staffTypes.find(st => st.title === title);
}

interface WorkCategoryDefinition {
  category: WorkCategory;
  name: string;
  leaderRoles: string[];
  executionRoles: string[];
  supportRoles?: string[];
}
