export type Region =
  | 'Asia Pacific'
  | 'Europe'
  | 'Middle East'
  | 'North America'
  | 'South America'
  | 'Africa'
  | 'Global / Multi-region'
  | 'Custom';

export interface Country {
  name: string;
  code: string;
  region: Region;
}

export const REGIONS: Region[] = [
  'Asia Pacific',
  'Europe',
  'Middle East',
  'North America',
  'South America',
  'Africa',
  'Global / Multi-region',
  'Custom',
];

export const COUNTRIES: Country[] = [
  { name: 'Afghanistan', code: 'AF', region: 'Asia Pacific' },
  { name: 'Australia', code: 'AU', region: 'Asia Pacific' },
  { name: 'Bangladesh', code: 'BD', region: 'Asia Pacific' },
  { name: 'Bhutan', code: 'BT', region: 'Asia Pacific' },
  { name: 'Brunei', code: 'BN', region: 'Asia Pacific' },
  { name: 'Cambodia', code: 'KH', region: 'Asia Pacific' },
  { name: 'China', code: 'CN', region: 'Asia Pacific' },
  { name: 'Fiji', code: 'FJ', region: 'Asia Pacific' },
  { name: 'Hong Kong', code: 'HK', region: 'Asia Pacific' },
  { name: 'India', code: 'IN', region: 'Asia Pacific' },
  { name: 'Indonesia', code: 'ID', region: 'Asia Pacific' },
  { name: 'Japan', code: 'JP', region: 'Asia Pacific' },
  { name: 'Kazakhstan', code: 'KZ', region: 'Asia Pacific' },
  { name: 'Kyrgyzstan', code: 'KG', region: 'Asia Pacific' },
  { name: 'Laos', code: 'LA', region: 'Asia Pacific' },
  { name: 'Macau', code: 'MO', region: 'Asia Pacific' },
  { name: 'Malaysia', code: 'MY', region: 'Asia Pacific' },
  { name: 'Maldives', code: 'MV', region: 'Asia Pacific' },
  { name: 'Mongolia', code: 'MN', region: 'Asia Pacific' },
  { name: 'Myanmar', code: 'MM', region: 'Asia Pacific' },
  { name: 'Nepal', code: 'NP', region: 'Asia Pacific' },
  { name: 'New Zealand', code: 'NZ', region: 'Asia Pacific' },
  { name: 'North Korea', code: 'KP', region: 'Asia Pacific' },
  { name: 'Pakistan', code: 'PK', region: 'Asia Pacific' },
  { name: 'Papua New Guinea', code: 'PG', region: 'Asia Pacific' },
  { name: 'Philippines', code: 'PH', region: 'Asia Pacific' },
  { name: 'Singapore', code: 'SG', region: 'Asia Pacific' },
  { name: 'South Korea', code: 'KR', region: 'Asia Pacific' },
  { name: 'Sri Lanka', code: 'LK', region: 'Asia Pacific' },
  { name: 'Taiwan', code: 'TW', region: 'Asia Pacific' },
  { name: 'Tajikistan', code: 'TJ', region: 'Asia Pacific' },
  { name: 'Thailand', code: 'TH', region: 'Asia Pacific' },
  { name: 'Timor-Leste', code: 'TL', region: 'Asia Pacific' },
  { name: 'Turkmenistan', code: 'TM', region: 'Asia Pacific' },
  { name: 'Uzbekistan', code: 'UZ', region: 'Asia Pacific' },
  { name: 'Vietnam', code: 'VN', region: 'Asia Pacific' },

  { name: 'Albania', code: 'AL', region: 'Europe' },
  { name: 'Andorra', code: 'AD', region: 'Europe' },
  { name: 'Armenia', code: 'AM', region: 'Europe' },
  { name: 'Austria', code: 'AT', region: 'Europe' },
  { name: 'Azerbaijan', code: 'AZ', region: 'Europe' },
  { name: 'Belarus', code: 'BY', region: 'Europe' },
  { name: 'Belgium', code: 'BE', region: 'Europe' },
  { name: 'Bosnia and Herzegovina', code: 'BA', region: 'Europe' },
  { name: 'Bulgaria', code: 'BG', region: 'Europe' },
  { name: 'Croatia', code: 'HR', region: 'Europe' },
  { name: 'Cyprus', code: 'CY', region: 'Europe' },
  { name: 'Czech Republic', code: 'CZ', region: 'Europe' },
  { name: 'Denmark', code: 'DK', region: 'Europe' },
  { name: 'Estonia', code: 'EE', region: 'Europe' },
  { name: 'Finland', code: 'FI', region: 'Europe' },
  { name: 'France', code: 'FR', region: 'Europe' },
  { name: 'Georgia', code: 'GE', region: 'Europe' },
  { name: 'Germany', code: 'DE', region: 'Europe' },
  { name: 'Greece', code: 'GR', region: 'Europe' },
  { name: 'Hungary', code: 'HU', region: 'Europe' },
  { name: 'Iceland', code: 'IS', region: 'Europe' },
  { name: 'Ireland', code: 'IE', region: 'Europe' },
  { name: 'Italy', code: 'IT', region: 'Europe' },
  { name: 'Kosovo', code: 'XK', region: 'Europe' },
  { name: 'Latvia', code: 'LV', region: 'Europe' },
  { name: 'Liechtenstein', code: 'LI', region: 'Europe' },
  { name: 'Lithuania', code: 'LT', region: 'Europe' },
  { name: 'Luxembourg', code: 'LU', region: 'Europe' },
  { name: 'Malta', code: 'MT', region: 'Europe' },
  { name: 'Moldova', code: 'MD', region: 'Europe' },
  { name: 'Monaco', code: 'MC', region: 'Europe' },
  { name: 'Montenegro', code: 'ME', region: 'Europe' },
  { name: 'Netherlands', code: 'NL', region: 'Europe' },
  { name: 'North Macedonia', code: 'MK', region: 'Europe' },
  { name: 'Norway', code: 'NO', region: 'Europe' },
  { name: 'Poland', code: 'PL', region: 'Europe' },
  { name: 'Portugal', code: 'PT', region: 'Europe' },
  { name: 'Romania', code: 'RO', region: 'Europe' },
  { name: 'Russia', code: 'RU', region: 'Europe' },
  { name: 'San Marino', code: 'SM', region: 'Europe' },
  { name: 'Serbia', code: 'RS', region: 'Europe' },
  { name: 'Slovakia', code: 'SK', region: 'Europe' },
  { name: 'Slovenia', code: 'SI', region: 'Europe' },
  { name: 'Spain', code: 'ES', region: 'Europe' },
  { name: 'Sweden', code: 'SE', region: 'Europe' },
  { name: 'Switzerland', code: 'CH', region: 'Europe' },
  { name: 'Ukraine', code: 'UA', region: 'Europe' },
  { name: 'United Kingdom', code: 'GB', region: 'Europe' },
  { name: 'Vatican City', code: 'VA', region: 'Europe' },

  { name: 'Bahrain', code: 'BH', region: 'Middle East' },
  { name: 'Egypt', code: 'EG', region: 'Middle East' },
  { name: 'Iran', code: 'IR', region: 'Middle East' },
  { name: 'Iraq', code: 'IQ', region: 'Middle East' },
  { name: 'Israel', code: 'IL', region: 'Middle East' },
  { name: 'Jordan', code: 'JO', region: 'Middle East' },
  { name: 'Kuwait', code: 'KW', region: 'Middle East' },
  { name: 'Lebanon', code: 'LB', region: 'Middle East' },
  { name: 'Oman', code: 'OM', region: 'Middle East' },
  { name: 'Palestine', code: 'PS', region: 'Middle East' },
  { name: 'Qatar', code: 'QA', region: 'Middle East' },
  { name: 'Saudi Arabia', code: 'SA', region: 'Middle East' },
  { name: 'Syria', code: 'SY', region: 'Middle East' },
  { name: 'Turkey', code: 'TR', region: 'Middle East' },
  { name: 'United Arab Emirates', code: 'AE', region: 'Middle East' },
  { name: 'Yemen', code: 'YE', region: 'Middle East' },

  { name: 'Antigua and Barbuda', code: 'AG', region: 'North America' },
  { name: 'Bahamas', code: 'BS', region: 'North America' },
  { name: 'Barbados', code: 'BB', region: 'North America' },
  { name: 'Belize', code: 'BZ', region: 'North America' },
  { name: 'Canada', code: 'CA', region: 'North America' },
  { name: 'Costa Rica', code: 'CR', region: 'North America' },
  { name: 'Cuba', code: 'CU', region: 'North America' },
  { name: 'Dominica', code: 'DM', region: 'North America' },
  { name: 'Dominican Republic', code: 'DO', region: 'North America' },
  { name: 'El Salvador', code: 'SV', region: 'North America' },
  { name: 'Grenada', code: 'GD', region: 'North America' },
  { name: 'Guatemala', code: 'GT', region: 'North America' },
  { name: 'Haiti', code: 'HT', region: 'North America' },
  { name: 'Honduras', code: 'HN', region: 'North America' },
  { name: 'Jamaica', code: 'JM', region: 'North America' },
  { name: 'Mexico', code: 'MX', region: 'North America' },
  { name: 'Nicaragua', code: 'NI', region: 'North America' },
  { name: 'Panama', code: 'PA', region: 'North America' },
  { name: 'Saint Kitts and Nevis', code: 'KN', region: 'North America' },
  { name: 'Saint Lucia', code: 'LC', region: 'North America' },
  { name: 'Saint Vincent and the Grenadines', code: 'VC', region: 'North America' },
  { name: 'Trinidad and Tobago', code: 'TT', region: 'North America' },
  { name: 'United States', code: 'US', region: 'North America' },

  { name: 'Argentina', code: 'AR', region: 'South America' },
  { name: 'Bolivia', code: 'BO', region: 'South America' },
  { name: 'Brazil', code: 'BR', region: 'South America' },
  { name: 'Chile', code: 'CL', region: 'South America' },
  { name: 'Colombia', code: 'CO', region: 'South America' },
  { name: 'Ecuador', code: 'EC', region: 'South America' },
  { name: 'Guyana', code: 'GY', region: 'South America' },
  { name: 'Paraguay', code: 'PY', region: 'South America' },
  { name: 'Peru', code: 'PE', region: 'South America' },
  { name: 'Suriname', code: 'SR', region: 'South America' },
  { name: 'Uruguay', code: 'UY', region: 'South America' },
  { name: 'Venezuela', code: 'VE', region: 'South America' },

  { name: 'Algeria', code: 'DZ', region: 'Africa' },
  { name: 'Angola', code: 'AO', region: 'Africa' },
  { name: 'Benin', code: 'BJ', region: 'Africa' },
  { name: 'Botswana', code: 'BW', region: 'Africa' },
  { name: 'Burkina Faso', code: 'BF', region: 'Africa' },
  { name: 'Burundi', code: 'BI', region: 'Africa' },
  { name: 'Cameroon', code: 'CM', region: 'Africa' },
  { name: 'Cape Verde', code: 'CV', region: 'Africa' },
  { name: 'Central African Republic', code: 'CF', region: 'Africa' },
  { name: 'Chad', code: 'TD', region: 'Africa' },
  { name: 'Comoros', code: 'KM', region: 'Africa' },
  { name: 'Congo', code: 'CG', region: 'Africa' },
  { name: 'Democratic Republic of the Congo', code: 'CD', region: 'Africa' },
  { name: 'Djibouti', code: 'DJ', region: 'Africa' },
  { name: 'Equatorial Guinea', code: 'GQ', region: 'Africa' },
  { name: 'Eritrea', code: 'ER', region: 'Africa' },
  { name: 'Eswatini', code: 'SZ', region: 'Africa' },
  { name: 'Ethiopia', code: 'ET', region: 'Africa' },
  { name: 'Gabon', code: 'GA', region: 'Africa' },
  { name: 'Gambia', code: 'GM', region: 'Africa' },
  { name: 'Ghana', code: 'GH', region: 'Africa' },
  { name: 'Guinea', code: 'GN', region: 'Africa' },
  { name: 'Guinea-Bissau', code: 'GW', region: 'Africa' },
  { name: 'Ivory Coast', code: 'CI', region: 'Africa' },
  { name: 'Kenya', code: 'KE', region: 'Africa' },
  { name: 'Lesotho', code: 'LS', region: 'Africa' },
  { name: 'Liberia', code: 'LR', region: 'Africa' },
  { name: 'Libya', code: 'LY', region: 'Africa' },
  { name: 'Madagascar', code: 'MG', region: 'Africa' },
  { name: 'Malawi', code: 'MW', region: 'Africa' },
  { name: 'Mali', code: 'ML', region: 'Africa' },
  { name: 'Mauritania', code: 'MR', region: 'Africa' },
  { name: 'Mauritius', code: 'MU', region: 'Africa' },
  { name: 'Morocco', code: 'MA', region: 'Africa' },
  { name: 'Mozambique', code: 'MZ', region: 'Africa' },
  { name: 'Namibia', code: 'NA', region: 'Africa' },
  { name: 'Niger', code: 'NE', region: 'Africa' },
  { name: 'Nigeria', code: 'NG', region: 'Africa' },
  { name: 'Rwanda', code: 'RW', region: 'Africa' },
  { name: 'Sao Tome and Principe', code: 'ST', region: 'Africa' },
  { name: 'Senegal', code: 'SN', region: 'Africa' },
  { name: 'Seychelles', code: 'SC', region: 'Africa' },
  { name: 'Sierra Leone', code: 'SL', region: 'Africa' },
  { name: 'Somalia', code: 'SO', region: 'Africa' },
  { name: 'South Africa', code: 'ZA', region: 'Africa' },
  { name: 'South Sudan', code: 'SS', region: 'Africa' },
  { name: 'Sudan', code: 'SD', region: 'Africa' },
  { name: 'Tanzania', code: 'TZ', region: 'Africa' },
  { name: 'Togo', code: 'TG', region: 'Africa' },
  { name: 'Tunisia', code: 'TN', region: 'Africa' },
  { name: 'Uganda', code: 'UG', region: 'Africa' },
  { name: 'Zambia', code: 'ZM', region: 'Africa' },
  { name: 'Zimbabwe', code: 'ZW', region: 'Africa' },
];

export function getCountryByName(name: string): Country | undefined {
  return COUNTRIES.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCountriesByRegion(region: Region): Country[] {
  return COUNTRIES.filter(c => c.region === region);
}

export function inferRegionFromCountry(countryName: string): Region {
  const country = getCountryByName(countryName);
  return country?.region || 'Custom';
}

export function groupCountriesByRegion(): Record<Region, Country[]> {
  const groups: Record<string, Country[]> = {};

  REGIONS.forEach(region => {
    if (region === 'Global / Multi-region' || region === 'Custom') {
      groups[region] = [];
    } else {
      groups[region] = COUNTRIES.filter(c => c.region === region);
    }
  });

  return groups as Record<Region, Country[]>;
}

export const GLOBAL_MULTI_REGION_OPTION: Country = {
  name: 'Global / Multi-region',
  code: '',
  region: 'Global / Multi-region',
};
