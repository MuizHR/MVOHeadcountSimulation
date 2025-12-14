import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import type { Company, BusinessPillar } from '../config/companies';
import { COMPANY_MASTER_LIST, BUSINESS_PILLARS, groupCompaniesByPillar } from '../config/companies';
import { customCompanyService } from '../services/customCompanyService';

interface CompanySelectorProps {
  value: string;
  businessPillar: string;
  onChange: (companyName: string, businessPillar: string) => void;
  userId?: string;
  required?: boolean;
  error?: string;
}

export function CompanySelector({
  value,
  businessPillar,
  onChange,
  userId,
  required = false,
  error,
}: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allCompanies, setAllCompanies] = useState<Company[]>(COMPANY_MASTER_LIST);
  const [customPillar, setCustomPillar] = useState<BusinessPillar>('Custom');
  const [showPillarSelector, setShowPillarSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      customCompanyService.getUserCompaniesAsOptions(userId, COMPANY_MASTER_LIST).then(setAllCompanies);
    }
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupedCompanies = React.useMemo(() => {
    const groups: Record<string, Company[]> = {};

    BUSINESS_PILLARS.forEach(pillar => {
      groups[pillar] = allCompanies.filter(c => c.pillar === pillar);
    });

    return groups;
  }, [allCompanies]);

  const filteredGroups = React.useMemo(() => {
    if (!searchTerm) return groupedCompanies;

    const filtered: Record<string, Company[]> = {};
    const lowerSearch = searchTerm.toLowerCase();

    Object.entries(groupedCompanies).forEach(([pillar, companies]) => {
      const matches = companies.filter(c => c.name.toLowerCase().includes(lowerSearch));
      if (matches.length > 0) {
        filtered[pillar] = matches;
      }
    });

    return filtered;
  }, [groupedCompanies, searchTerm]);

  const hasExactMatch = allCompanies.some(c => c.name.toLowerCase() === searchTerm.toLowerCase());
  const showCustomOption = searchTerm && !hasExactMatch;

  const handleSelect = (company: Company) => {
    onChange(company.name, company.pillar);
    setIsOpen(false);
    setSearchTerm('');
    setShowPillarSelector(false);
  };

  const handleAddCustom = async () => {
    if (!searchTerm.trim()) return;

    const finalPillar = customPillar;
    onChange(searchTerm.trim(), finalPillar);

    if (userId) {
      await customCompanyService.saveCustomCompany(userId, searchTerm.trim(), finalPillar);
      const updated = await customCompanyService.getUserCompaniesAsOptions(userId, COMPANY_MASTER_LIST);
      setAllCompanies(updated);
    }

    setIsOpen(false);
    setSearchTerm('');
    setShowPillarSelector(false);
    setCustomPillar('Custom');
  };

  const displayValue = value || 'Select Company / Entity...';
  const totalCompanies = Object.values(filteredGroups).flat().length;

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 border rounded-lg cursor-pointer transition-colors
          flex items-center justify-between
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:border-teal-500'}
          ${isOpen ? 'border-teal-500 ring-2 ring-teal-100' : ''}
        `}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{displayValue}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search company name..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {showCustomOption && (
              <div className="border-b border-gray-200 bg-teal-50">
                <button
                  onClick={() => setShowPillarSelector(!showPillarSelector)}
                  className="w-full px-4 py-3 text-left hover:bg-teal-100 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span className="text-teal-700 font-medium">
                    Add "{searchTerm}" as Custom company
                  </span>
                </button>

                {showPillarSelector && (
                  <div className="px-4 pb-3 space-y-2">
                    <label className="block text-sm text-gray-700 font-medium">
                      Assign Business Pillar (optional):
                    </label>
                    <select
                      value={customPillar}
                      onChange={e => setCustomPillar(e.target.value as BusinessPillar)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500"
                    >
                      {BUSINESS_PILLARS.map(pillar => (
                        <option key={pillar} value={pillar}>
                          {pillar}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddCustom}
                      className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium"
                    >
                      Add Company
                    </button>
                  </div>
                )}
              </div>
            )}

            {totalCompanies === 0 && !showCustomOption && (
              <div className="px-4 py-8 text-center text-gray-500">
                No companies found matching "{searchTerm}"
              </div>
            )}

            {Object.entries(filteredGroups).map(([pillar, companies]) => {
              if (companies.length === 0) return null;

              return (
                <div key={pillar} className="border-b border-gray-100 last:border-0">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {pillar}
                  </div>
                  <div>
                    {companies.map(company => (
                      <button
                        key={company.name}
                        onClick={() => handleSelect(company)}
                        className={`
                          w-full px-4 py-2 text-left hover:bg-teal-50 transition-colors
                          ${value === company.name ? 'bg-teal-100 text-teal-900 font-medium' : 'text-gray-700'}
                        `}
                      >
                        {company.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {value && businessPillar && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Business Pillar:</span> {businessPillar}
        </div>
      )}
    </div>
  );
}
