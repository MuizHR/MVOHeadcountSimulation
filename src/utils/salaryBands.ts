export interface SalaryBandDefinition {
  salaryRange: [number, number];
  fixedAllowance: number;
  statRate: number;
  gpaRate: number;
  medical: number;
  ghsRate: number;
}

export const salaryBands: Record<string, SalaryBandDefinition> = {
  senior_chief_officer: {
    salaryRange: [34900, 66130],
    fixedAllowance: 7000,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  chief_officer: {
    salaryRange: [28500, 55240],
    fixedAllowance: 6000,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  general_manager: {
    salaryRange: [18600, 44780],
    fixedAllowance: 4800,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  deputy_general_manager: {
    salaryRange: [14500, 34890],
    fixedAllowance: 3700,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  senior_manager: {
    salaryRange: [11000, 26380],
    fixedAllowance: 600,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  manager: {
    salaryRange: [7500, 16304],
    fixedAllowance: 500,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  deputy_manager: {
    salaryRange: [6600, 14050],
    fixedAllowance: 450,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  senior_executive: {
    salaryRange: [3650, 9827],
    fixedAllowance: 300,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  executive: {
    salaryRange: [2780, 7765],
    fixedAllowance: 300,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  executive_b: {
    salaryRange: [2000, 6174],
    fixedAllowance: 300,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  senior_clerical: {
    salaryRange: [1700, 4100],
    fixedAllowance: 300,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  clerk: {
    salaryRange: [1700, 3030],
    fixedAllowance: 300,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  office_assistant: {
    salaryRange: [1700, 2760],
    fixedAllowance: 300,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  },
  general_worker: {
    salaryRange: [1700, 2760],
    fixedAllowance: 300,
    statRate: 0.20,
    gpaRate: 0.04,
    medical: 600,
    ghsRate: 0.10
  }
};

export const SALARY_BANDS = {
  permanent: {
    senior_chief_officer: { min: 34900, max: 66130, allowance: 7000 },
    chief_officer: { min: 28500, max: 55240, allowance: 6000 },
    general_manager: { min: 18600, max: 44780, allowance: 4800 },
    deputy_general_manager: { min: 14500, max: 34890, allowance: 3700 },
    senior_manager: { min: 11000, max: 26380, allowance: 600 },
    manager: { min: 7500, max: 16304, allowance: 500 },
    deputy_manager: { min: 6600, max: 14050, allowance: 450 },
    senior_executive: { min: 3650, max: 9827, allowance: 300 },
    executive: { min: 2780, max: 7765, allowance: 300 },
    executive_b: { min: 2000, max: 6174, allowance: 300 },
    senior_clerical: { min: 1700, max: 4100, allowance: 300 },
    clerk: { min: 1700, max: 3030, allowance: 300 },
    office_assistant: { min: 1700, max: 2760, allowance: 300 },
    general_worker: { min: 1700, max: 2760, allowance: 300 }
  },

  gig: {
    senior_chief_officer: { min: 34900, max: 66130, allowance: 0 },
    chief_officer: { min: 28500, max: 55240, allowance: 0 },
    general_manager: { min: 18600, max: 44780, allowance: 0 },
    deputy_general_manager: { min: 14500, max: 34890, allowance: 0 },
    senior_manager: { min: 11000, max: 26380, allowance: 0 },
    manager: { min: 7500, max: 16304, allowance: 0 },
    deputy_manager: { min: 6600, max: 14050, allowance: 0 },
    senior_executive: { min: 3650, max: 9827, allowance: 0 },
    executive: { min: 2780, max: 7765, allowance: 0 },
    executive_b: { min: 2000, max: 6174, allowance: 0 },
    senior_clerical: { min: 1700, max: 4100, allowance: 0 },
    clerk: { min: 1700, max: 3030, allowance: 0 },
    office_assistant: { min: 1700, max: 2760, allowance: 0 },
    general_worker: { min: 1700, max: 2760, allowance: 0 }
  }
};
