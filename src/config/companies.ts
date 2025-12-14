export type BusinessPillar =
  | 'Holding Company'
  | 'Integrated Community Solutions'
  | 'Outsource Service'
  | 'Property Development'
  | 'Property Investment'
  | 'Custom';

export interface Company {
  name: string;
  pillar: BusinessPillar;
}

export const BUSINESS_PILLARS: BusinessPillar[] = [
  'Holding Company',
  'Integrated Community Solutions',
  'Outsource Service',
  'Property Development',
  'Property Investment',
  'Custom',
];

export const COMPANY_MASTER_LIST: Company[] = [
  { name: 'JLG Investment Holdings Sdn Bhd', pillar: 'Holding Company' },

  { name: 'Damansara Assets Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'Hatchlabs Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'JLG Centrix Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'JLG Duraclean Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'JLG Healthserv Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'JLG Integra Berhad', pillar: 'Integrated Community Solutions' },
  { name: 'JLG Metro Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'JLG Neo Eats Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'JLG Property Management Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'JLG Securitas Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'JLG Zaquin Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'TMR LC Services Sdn Bhd', pillar: 'Integrated Community Solutions' },
  { name: 'Valtro Services Sdn Bhd', pillar: 'Integrated Community Solutions' },

  { name: 'Coaction Events Sdn Bhd', pillar: 'Outsource Service' },
  { name: 'JLG Corporate Edge Sdn Bhd', pillar: 'Outsource Service' },
  { name: 'JLG Services Sdn Bhd', pillar: 'Outsource Service' },

  { name: 'JLG Buildworks Sdn Bhd', pillar: 'Property Development' },
  { name: 'JLG Development Sdn Bhd', pillar: 'Property Development' },
  { name: 'JLG Projects Sdn Bhd', pillar: 'Property Development' },

  { name: 'JLG Capital Sdn Bhd', pillar: 'Property Investment' },
  { name: 'JLG REIT Managers Sdn Bhd', pillar: 'Property Investment' },
];

export function getCompanyByName(name: string): Company | undefined {
  return COMPANY_MASTER_LIST.find(c => c.name === name);
}

export function getCompaniesByPillar(pillar: BusinessPillar): Company[] {
  return COMPANY_MASTER_LIST.filter(c => c.pillar === pillar);
}

export function inferPillarFromCompanyName(companyName: string): BusinessPillar {
  const company = getCompanyByName(companyName);
  return company?.pillar || 'Custom';
}

export function groupCompaniesByPillar(): Record<BusinessPillar, Company[]> {
  const groups: Record<string, Company[]> = {};

  BUSINESS_PILLARS.forEach(pillar => {
    groups[pillar] = [];
  });

  COMPANY_MASTER_LIST.forEach(company => {
    groups[company.pillar].push(company);
  });

  return groups as Record<BusinessPillar, Company[]>;
}
