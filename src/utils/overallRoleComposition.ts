import { StaffType } from '../types/staffType';

export interface OverallRolePattern {
  roleTitle: string;
  roleId: string;
  units: number;
  fteShare?: number;
  monthlyCost?: number;
}

export interface OverallRoleComposition {
  totalFte: number;
  personsRounded: number;
  pattern: OverallRolePattern[];
  totalMonthlyCost?: number;
  narrative: string;
}

export function generateOverallRoleComposition(
  totalFte: number,
  staffTypes: StaffType[]
): OverallRoleComposition {
  const personsRounded = Math.round(totalFte);
  const pattern: OverallRolePattern[] = [];

  const findRole = (title: string): StaffType | undefined => {
    // First try to find exact match
    let role = staffTypes.find(st => st.title === title);

    // If not found, try to find by job grade with Permanent employment type
    if (!role) {
      role = staffTypes.find(st => st.title === `${title} (Permanent)`);
    }

    // If still not found, try to find by job grade (any employment type)
    if (!role) {
      role = staffTypes.find(st => st.title.startsWith(title + ' ('));
    }

    return role;
  };

  if (totalFte <= 2.0) {
    const managerRole = findRole('Manager');
    const executiveRole = findRole('Executive');

    if (managerRole && executiveRole) {
      pattern.push({
        roleTitle: 'Manager',
        roleId: managerRole.id,
        units: 1,
      });

      const execUnits = Math.max(0, personsRounded - 1);
      if (execUnits > 0) {
        pattern.push({
          roleTitle: 'Executive',
          roleId: executiveRole.id,
          units: execUnits,
        });
      }
    }
  } else if (totalFte <= 4.0) {
    const managerRole = findRole('Manager');
    const executiveRole = findRole('Executive');

    if (managerRole && executiveRole) {
      pattern.push({
        roleTitle: 'Manager',
        roleId: managerRole.id,
        units: 1,
      });

      const execUnits = Math.max(0, personsRounded - 1);
      if (execUnits > 0) {
        pattern.push({
          roleTitle: 'Executive',
          roleId: executiveRole.id,
          units: execUnits,
        });
      }
    }
  } else if (totalFte <= 7.0) {
    const seniorManagerRole = findRole('Senior Manager');
    const managerRole = findRole('Manager');
    const executiveRole = findRole('Executive');

    if (seniorManagerRole && managerRole && executiveRole) {
      pattern.push({
        roleTitle: 'Senior Manager',
        roleId: seniorManagerRole.id,
        units: 1,
      });

      pattern.push({
        roleTitle: 'Manager',
        roleId: managerRole.id,
        units: 1,
      });

      const execUnits = Math.max(0, personsRounded - 2);
      if (execUnits > 0) {
        pattern.push({
          roleTitle: 'Executive',
          roleId: executiveRole.id,
          units: execUnits,
        });
      }
    }
  } else {
    const seniorManagerRole = findRole('Senior Manager');
    const managerRole = findRole('Manager');
    const executiveRole = findRole('Executive');
    const officerRole = findRole('Officer');

    if (seniorManagerRole && managerRole && executiveRole) {
      pattern.push({
        roleTitle: 'Senior Manager',
        roleId: seniorManagerRole.id,
        units: 1,
      });

      pattern.push({
        roleTitle: 'Manager',
        roleId: managerRole.id,
        units: 2,
      });

      const remainingUnits = Math.max(0, personsRounded - 3);

      if (remainingUnits > 0) {
        const execUnits = Math.ceil(remainingUnits * 0.6);
        const nonExecUnits = remainingUnits - execUnits;

        if (execUnits > 0) {
          pattern.push({
            roleTitle: 'Executive',
            roleId: executiveRole.id,
            units: execUnits,
          });
        }

        if (officerRole && nonExecUnits > 0) {
          pattern.push({
            roleTitle: 'Officer',
            roleId: officerRole.id,
            units: nonExecUnits,
          });
        }
      }
    }
  }

  if (pattern.length === 0) {
    const executiveRole = findRole('Executive');
    if (executiveRole) {
      pattern.push({
        roleTitle: 'Executive',
        roleId: executiveRole.id,
        units: personsRounded,
      });
    }
  }

  const totalUnits = pattern.reduce((sum, p) => sum + p.units, 0);
  const ftePerUnit = totalUnits > 0 ? totalFte / totalUnits : 0;

  const enrichedPattern = pattern.map(p => {
    const role = findRole(p.roleTitle);
    if (!role) {
      return {
        ...p,
        fteShare: 0,
        monthlyCost: 0,
      };
    }

    const fteShare = p.units * ftePerUnit;
    const costPerFte = role.mid_salary * role.cost_multiplier;
    const monthlyCost = fteShare * costPerFte;

    return {
      ...p,
      fteShare,
      monthlyCost,
    };
  });

  const totalMonthlyCost = enrichedPattern.reduce((sum, p) => sum + (p.monthlyCost || 0), 0);

  const patternDescription = pattern
    .map(p => `${p.units} ${p.roleTitle}${p.units > 1 ? 's' : ''}`)
    .join(' + ');

  const narrative = `Suggested mix: ${patternDescription}`;

  return {
    totalFte,
    personsRounded,
    pattern: enrichedPattern,
    totalMonthlyCost,
    narrative,
  };
}
