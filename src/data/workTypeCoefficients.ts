import { WorkTypeCoefficients } from '../types/workType';

export const WORK_TYPE_CATALOG: Record<string, WorkTypeCoefficients> = {
  administrative_compliance: {
    id: 'administrative_compliance',
    name: 'Administrative / Compliance / Documentation',
    productivityRate: 1.20,
    complexityFactor: 0.60,
    varianceLevel: 0.15,
    minHeadcountRule: 1,
    minHeadcountBase: 1,
    riskMultiplier: 0.8,
  },
  analysis_reporting: {
    id: 'analysis_reporting',
    name: 'Analysis / Reporting / Planning',
    productivityRate: 1.00,
    complexityFactor: 0.90,
    varianceLevel: 0.25,
    minHeadcountRule: 1,
    minHeadcountBase: 1,
    riskMultiplier: 1.0,
  },
  business_development: {
    id: 'business_development',
    name: 'Business Development / Partnerships',
    productivityRate: 0.90,
    complexityFactor: 1.10,
    varianceLevel: 0.30,
    minHeadcountRule: 1,
    minHeadcountBase: 1,
    riskMultiplier: 1.1,
  },
  call_centre: {
    id: 'call_centre',
    name: 'Call Centre / Contact Centre Work',
    productivityRate: 0.85,
    complexityFactor: 0.85,
    varianceLevel: 0.35,
    minHeadcountRule: 2,
    minHeadcountBase: 3,
    riskMultiplier: 1.2,
  },
  cleaning_hygiene: {
    id: 'cleaning_hygiene',
    name: 'Cleaning / Hygiene / Sanitation Work',
    productivityRate: 0.75,
    complexityFactor: 0.80,
    varianceLevel: 0.30,
    minHeadcountRule: 2,
    minHeadcountBase: 3,
    riskMultiplier: 1.1,
  },
  creative_branding: {
    id: 'creative_branding',
    name: 'Creative / Branding / Communications Work',
    productivityRate: 0.80,
    complexityFactor: 1.10,
    varianceLevel: 0.35,
    minHeadcountRule: 1,
    minHeadcountBase: 1,
    riskMultiplier: 1.1,
  },
  customer_tenant_support: {
    id: 'customer_tenant_support',
    name: 'Customer / Tenant / Community Support',
    productivityRate: 0.85,
    complexityFactor: 0.80,
    varianceLevel: 0.30,
    minHeadcountRule: 1,
    minHeadcountBase: 2,
    riskMultiplier: 1.1,
  },
  event_activation: {
    id: 'event_activation',
    name: 'Event / Activation / On-ground Execution',
    productivityRate: 0.70,
    complexityFactor: 1.20,
    varianceLevel: 0.45,
    minHeadcountRule: 2,
    minHeadcountBase: 2,
    riskMultiplier: 1.3,
  },
  finance_accounting: {
    id: 'finance_accounting',
    name: 'Finance / Accounting / Treasury Work',
    productivityRate: 1.00,
    complexityFactor: 1.00,
    varianceLevel: 0.20,
    minHeadcountRule: 1,
    minHeadcountBase: 2,
    riskMultiplier: 1.0,
  },
  food_beverage: {
    id: 'food_beverage',
    name: 'Food & Beverage Operations',
    productivityRate: 0.65,
    complexityFactor: 0.85,
    varianceLevel: 0.40,
    minHeadcountRule: 2,
    minHeadcountBase: 3,
    riskMultiplier: 1.2,
  },
  governance_risk: {
    id: 'governance_risk',
    name: 'Governance / Risk / Compliance Work',
    productivityRate: 0.90,
    complexityFactor: 1.10,
    varianceLevel: 0.30,
    minHeadcountRule: 1,
    minHeadcountBase: 2,
    riskMultiplier: 1.2,
  },
  hospitality_front_desk: {
    id: 'hospitality_front_desk',
    name: 'Hospitality / Front Desk / Guest Services',
    productivityRate: 0.80,
    complexityFactor: 0.90,
    varianceLevel: 0.30,
    minHeadcountRule: 2,
    minHeadcountBase: 2,
    riskMultiplier: 1.1,
  },
  hr_people_ops: {
    id: 'hr_people_ops',
    name: 'HR / People Operations',
    productivityRate: 1.00,
    complexityFactor: 0.80,
    varianceLevel: 0.20,
    minHeadcountRule: 1,
    minHeadcountBase: 2,
    riskMultiplier: 1.0,
  },
  it_digital_systems: {
    id: 'it_digital_systems',
    name: 'IT / Digital / Systems Work',
    productivityRate: 0.70,
    complexityFactor: 1.20,
    varianceLevel: 0.40,
    minHeadcountRule: 1,
    minHeadcountBase: 2,
    riskMultiplier: 1.3,
  },
  landscaping_groundkeeping: {
    id: 'landscaping_groundkeeping',
    name: 'Landscaping / Groundkeeping Work',
    productivityRate: 0.75,
    complexityFactor: 0.95,
    varianceLevel: 0.35,
    minHeadcountRule: 2,
    minHeadcountBase: 3,
    riskMultiplier: 1.2,
  },
  legal_secretarial: {
    id: 'legal_secretarial',
    name: 'Legal / Company Secretarial Work',
    productivityRate: 0.90,
    complexityFactor: 1.20,
    varianceLevel: 0.25,
    minHeadcountRule: 1,
    minHeadcountBase: 2,
    riskMultiplier: 1.2,
  },
  logistics_warehouse: {
    id: 'logistics_warehouse',
    name: 'Logistics / Warehouse / Inventory Handling',
    productivityRate: 0.70,
    complexityFactor: 1.10,
    varianceLevel: 0.45,
    minHeadcountRule: 2,
    minHeadcountBase: 2,
    riskMultiplier: 1.3,
  },
  maintenance_engineering: {
    id: 'maintenance_engineering',
    name: 'Maintenance / Technical / Engineering',
    productivityRate: 0.55,
    complexityFactor: 1.40,
    varianceLevel: 0.45,
    minHeadcountRule: 1,
    minHeadcountBase: 3,
    riskMultiplier: 1.4,
  },
  marketing_campaigns: {
    id: 'marketing_campaigns',
    name: 'Marketing / Campaign Management',
    productivityRate: 0.80,
    complexityFactor: 1.00,
    varianceLevel: 0.30,
    minHeadcountRule: 1,
    minHeadcountBase: 1,
    riskMultiplier: 1.1,
  },
  operational_onsite: {
    id: 'operational_onsite',
    name: 'Operational / On-Site Work',
    productivityRate: 0.75,
    complexityFactor: 1.00,
    varianceLevel: 0.35,
    minHeadcountRule: 2,
    minHeadcountBase: 3,
    riskMultiplier: 1.2,
  },
  procurement_vendor: {
    id: 'procurement_vendor',
    name: 'Procurement / Contract / Vendor Management',
    productivityRate: 0.95,
    complexityFactor: 0.85,
    varianceLevel: 0.25,
    minHeadcountRule: 1,
    minHeadcountBase: 2,
    riskMultiplier: 1.0,
  },
  project_development: {
    id: 'project_development',
    name: 'Project / Development / Delivery Work',
    productivityRate: 0.65,
    complexityFactor: 1.50,
    varianceLevel: 0.50,
    minHeadcountRule: 2,
    minHeadcountBase: 1,
    riskMultiplier: 1.3,
  },
  retail_store_ops: {
    id: 'retail_store_ops',
    name: 'Retail / Outlet / Store Operations',
    productivityRate: 0.85,
    complexityFactor: 0.75,
    varianceLevel: 0.40,
    minHeadcountRule: 2,
    minHeadcountBase: 3,
    riskMultiplier: 1.2,
  },
  sales_leasing: {
    id: 'sales_leasing',
    name: 'Sales / Leasing / Revenue Work',
    productivityRate: 0.85,
    complexityFactor: 0.90,
    varianceLevel: 0.20,
    minHeadcountRule: 1,
    minHeadcountBase: 1,
    riskMultiplier: 1.1,
  },
  security_safety: {
    id: 'security_safety',
    name: 'Security / Safety / Emergency Response',
    productivityRate: 0.50,
    complexityFactor: 1.20,
    varianceLevel: 0.55,
    minHeadcountRule: 3,
    minHeadcountBase: 3,
    riskMultiplier: 1.5,
  },
  transportation_fleet: {
    id: 'transportation_fleet',
    name: 'Transportation / Fleet / Dispatch Operations',
    productivityRate: 0.75,
    complexityFactor: 0.90,
    varianceLevel: 0.40,
    minHeadcountRule: 2,
    minHeadcountBase: 3,
    riskMultiplier: 1.2,
  },
};

export function getWorkTypeCoefficients(workTypeId: string): WorkTypeCoefficients | undefined {
  return WORK_TYPE_CATALOG[workTypeId];
}

export function getAllWorkTypes(): WorkTypeCoefficients[] {
  return Object.values(WORK_TYPE_CATALOG).sort((a, b) => a.name.localeCompare(b.name));
}

export function getMinHeadcount(
  workTypeId: string,
  sizeOfOperation: 'Small' | 'Medium' | 'Large' | string
): number {
  const preset = WORK_TYPE_CATALOG[workTypeId];
  if (!preset) return 1;

  const base = preset.minHeadcountBase ?? 1;

  let multiplier = 1;

  switch (sizeOfOperation) {
    case 'Medium':
      multiplier = 1.5;
      break;
    case 'Large':
      multiplier = 2;
      break;
    default:
      multiplier = 1;
  }

  const adjusted = Math.ceil(base * multiplier);

  return Math.max(base, adjusted);
}
