import { StaffType, RolePatternItem } from '../types/staffType';

export interface SuggestedComposition {
  pattern: RolePatternItem[];
  description: string;
  rationale: string;
}

export function suggestRoleComposition(
  totalFteRequired: number,
  dominantLevel: 'Senior Management' | 'Middle Management' | 'Executive' | 'Non-Executive',
  staffTypes: StaffType[]
): SuggestedComposition {
  const pattern: RolePatternItem[] = [];
  let description = '';
  let rationale = '';

  const findRoleByTitle = (title: string): StaffType | undefined => {
    const permanentMatch = staffTypes.find(st => st.title.includes(title) && st.employment_type === 'Permanent');
    if (permanentMatch) return permanentMatch;

    return staffTypes.find(st => st.title.includes(title));
  };

  const findRolesByLevel = (level: string): StaffType[] => {
    return staffTypes.filter(st => st.level === level).sort((a, b) => a.sort_order - b.sort_order);
  };

  if (totalFteRequired <= 1.0) {
    const executionRole = getExecutionRole(dominantLevel, staffTypes);
    if (executionRole) {
      pattern.push({
        staffTypeId: executionRole.id,
        pattern: 1,
      });
      description = `1 ${executionRole.title}`;
      rationale = `For workloads requiring ≤ 1.0 FTE, a single ${executionRole.level} role is sufficient to handle the work independently.`;
    }
  } else if (totalFteRequired <= 3.0) {
    const leadRole = getLeadRole(dominantLevel, staffTypes);
    const executionRole = getExecutionRole(dominantLevel, staffTypes);

    if (leadRole && executionRole) {
      pattern.push({
        staffTypeId: leadRole.id,
        pattern: 1,
      });

      const executorCount = Math.round(totalFteRequired) - 1;
      if (executorCount > 0) {
        pattern.push({
          staffTypeId: executionRole.id,
          pattern: executorCount,
        });
        description = `1 ${leadRole.title} + ${executorCount} ${executionRole.title}${executorCount > 1 ? 's' : ''}`;
      } else {
        description = `1 ${leadRole.title}`;
      }

      rationale = `For 1–3 FTE, suggest one lead (${leadRole.title}) to coordinate and ${executorCount} executor(s) to handle operational work.`;
    }
  } else if (totalFteRequired <= 8.0) {
    const managerRole = findRoleByTitle('Manager') || findRoleByTitle('Senior Manager');
    const executionRole = getExecutionRole(dominantLevel, staffTypes);

    if (managerRole && executionRole) {
      pattern.push({
        staffTypeId: managerRole.id,
        pattern: 1,
      });

      const executorCount = Math.round(totalFteRequired) - 1;
      if (executorCount > 0) {
        pattern.push({
          staffTypeId: executionRole.id,
          pattern: executorCount,
        });
      }

      description = `1 ${managerRole.title} + ${executorCount} ${executionRole.title}${executorCount > 1 ? 's' : ''}`;
      rationale = `For 3–8 FTE, maintain a manageable span-of-control with 1 Manager overseeing ${executorCount} executor(s). Recommended ratio: 1 manager per 4–7 executors.`;
    }
  } else {
    const seniorManagerRole = findRoleByTitle('Senior Manager');
    const managerRole = findRoleByTitle('Manager');
    const executiveRole = findRoleByTitle('Executive');
    const nonExecRole = findRoleByTitle('Office Assistant / General Worker');

    if (seniorManagerRole && managerRole) {
      const numManagers = Math.max(1, Math.floor(totalFteRequired / 6));
      const numExecutors = Math.round(totalFteRequired - 1 - numManagers);

      pattern.push({
        staffTypeId: seniorManagerRole.id,
        pattern: 1,
      });

      if (numManagers > 0) {
        pattern.push({
          staffTypeId: managerRole.id,
          pattern: numManagers,
        });
      }

      if (executiveRole && numExecutors > 0) {
        const execCount = Math.floor(numExecutors * 0.6);
        const nonExecCount = numExecutors - execCount;

        if (execCount > 0) {
          pattern.push({
            staffTypeId: executiveRole.id,
            pattern: execCount,
          });
        }

        if (nonExecRole && nonExecCount > 0) {
          pattern.push({
            staffTypeId: nonExecRole.id,
            pattern: nonExecCount,
          });
        }
      }

      description = `1 Senior Manager + ${numManagers} Manager${numManagers > 1 ? 's' : ''} + ${numExecutors} Executor${numExecutors > 1 ? 's' : ''}`;
      rationale = `For larger teams (> 8 FTE), implement a multi-tier structure: 1 Senior Manager provides strategic oversight, ${numManagers} Manager(s) handle day-to-day supervision (span-of-control: ~1:5), and ${numExecutors} executor(s) perform operational work.`;
    }
  }

  if (pattern.length === 0) {
    const defaultRole = staffTypes.find(st => st.title === 'Executive') || staffTypes[0];
    if (defaultRole) {
      pattern.push({
        staffTypeId: defaultRole.id,
        pattern: Math.round(totalFteRequired),
      });
      description = `${Math.round(totalFteRequired)} ${defaultRole.title}${Math.round(totalFteRequired) > 1 ? 's' : ''}`;
      rationale = 'Default allocation based on total FTE required.';
    }
  }

  return {
    pattern,
    description,
    rationale,
  };
}

function getExecutionRole(level: string, staffTypes: StaffType[]): StaffType | undefined {
  const findRole = (titlePart: string) => {
    const permanentMatch = staffTypes.find(st => st.title.includes(titlePart) && st.employment_type === 'Permanent');
    if (permanentMatch) return permanentMatch;
    return staffTypes.find(st => st.title.includes(titlePart));
  };

  switch (level) {
    case 'Senior Management':
      return findRole('General Manager');
    case 'Middle Management':
      return findRole('Manager');
    case 'Executive':
      return findRole('Executive');
    case 'Non-Executive':
      return findRole('Clerk / Technician');
    default:
      return findRole('Executive');
  }
}

function getLeadRole(level: string, staffTypes: StaffType[]): StaffType | undefined {
  const findRole = (titlePart: string) => {
    const permanentMatch = staffTypes.find(st => st.title.includes(titlePart) && st.employment_type === 'Permanent');
    if (permanentMatch) return permanentMatch;
    return staffTypes.find(st => st.title.includes(titlePart));
  };

  switch (level) {
    case 'Senior Management':
      return findRole('Senior General Manager');
    case 'Middle Management':
      return findRole('Senior Manager');
    case 'Executive':
      return findRole('Senior Executive');
    case 'Non-Executive':
      return findRole('Senior Clerical / Technician / Secretary');
    default:
      return findRole('Senior Manager');
  }
}
