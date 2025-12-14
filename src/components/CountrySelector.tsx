import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Plus, Globe } from 'lucide-react';
import type { Country, Region } from '../config/countries';
import { COUNTRIES, REGIONS, GLOBAL_MULTI_REGION_OPTION } from '../config/countries';
import { customLocationService } from '../services/customLocationService';

interface CountrySelectorProps {
  country: string | null;
  region: string;
  onChange: (country: string | null, region: string, countryCode?: string) => void;
  userId?: string;
  required?: boolean;
  error?: string;
}

export function CountrySelector({
  country,
  region,
  onChange,
  userId,
  required = false,
  error,
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allCountries, setAllCountries] = useState<Country[]>(COUNTRIES);
  const [customRegion, setCustomRegion] = useState<Region>('Custom');
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      customLocationService.getUserCountriesAsOptions(userId, COUNTRIES).then(setAllCountries);
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

  const groupedCountries = React.useMemo(() => {
    const groups: Record<string, Country[]> = {};

    REGIONS.forEach(reg => {
      if (reg === 'Global / Multi-region' || reg === 'Custom') {
        groups[reg] = [];
      } else {
        groups[reg] = allCountries.filter(c => c.region === reg);
      }
    });

    return groups;
  }, [allCountries]);

  const filteredGroups = React.useMemo(() => {
    if (!searchTerm) {
      const filtered = { ...groupedCountries };
      filtered['Global / Multi-region'] = [GLOBAL_MULTI_REGION_OPTION];
      return filtered;
    }

    const filtered: Record<string, Country[]> = {};
    const lowerSearch = searchTerm.toLowerCase();

    Object.entries(groupedCountries).forEach(([reg, countries]) => {
      if (reg === 'Global / Multi-region') {
        if ('global'.includes(lowerSearch) || 'multi-region'.includes(lowerSearch)) {
          filtered[reg] = [GLOBAL_MULTI_REGION_OPTION];
        }
      } else {
        const matches = countries.filter(c => c.name.toLowerCase().includes(lowerSearch));
        if (matches.length > 0) {
          filtered[reg] = matches;
        }
      }
    });

    return filtered;
  }, [groupedCountries, searchTerm]);

  const hasExactMatch =
    allCountries.some(c => c.name.toLowerCase() === searchTerm.toLowerCase()) ||
    (searchTerm.toLowerCase() === 'global / multi-region');

  const showCustomOption = searchTerm && !hasExactMatch;

  const handleSelect = (selectedCountry: Country) => {
    if (selectedCountry.name === 'Global / Multi-region') {
      onChange(null, 'Global / Multi-region', undefined);
    } else {
      onChange(selectedCountry.name, selectedCountry.region, selectedCountry.code || undefined);
    }
    setIsOpen(false);
    setSearchTerm('');
    setShowRegionSelector(false);
  };

  const handleAddCustom = async () => {
    if (!searchTerm.trim()) return;

    const finalRegion = customRegion;
    onChange(searchTerm.trim(), finalRegion, undefined);

    if (userId) {
      await customLocationService.saveCustomLocation(userId, searchTerm.trim(), finalRegion);
      const updated = await customLocationService.getUserCountriesAsOptions(userId, COUNTRIES);
      setAllCountries(updated);
    }

    setIsOpen(false);
    setSearchTerm('');
    setShowRegionSelector(false);
    setCustomRegion('Custom');
  };

  const displayValue = country || (region === 'Global / Multi-region' ? 'Global / Multi-region' : 'Select Country / Location...');
  const totalCountries = Object.values(filteredGroups).flat().length;

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
        <span className={country || region === 'Global / Multi-region' ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue}
        </span>
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
                placeholder="Search country or location..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {showCustomOption && (
              <div className="border-b border-gray-200 bg-teal-50">
                <button
                  onClick={() => setShowRegionSelector(!showRegionSelector)}
                  className="w-full px-4 py-3 text-left hover:bg-teal-100 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-teal-600" />
                  <span className="text-teal-700 font-medium">
                    Add "{searchTerm}" as Custom country
                  </span>
                </button>

                {showRegionSelector && (
                  <div className="px-4 pb-3 space-y-2">
                    <label className="block text-sm text-gray-700 font-medium">
                      Assign Region (optional):
                    </label>
                    <select
                      value={customRegion}
                      onChange={e => setCustomRegion(e.target.value as Region)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-teal-500"
                    >
                      {REGIONS.map(reg => (
                        <option key={reg} value={reg}>
                          {reg}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddCustom}
                      className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium"
                    >
                      Add Country
                    </button>
                  </div>
                )}
              </div>
            )}

            {totalCountries === 0 && !showCustomOption && (
              <div className="px-4 py-8 text-center text-gray-500">
                No countries found matching "{searchTerm}"
              </div>
            )}

            {Object.entries(filteredGroups).map(([reg, countries]) => {
              if (countries.length === 0) return null;

              return (
                <div key={reg} className="border-b border-gray-100 last:border-0">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                    {reg === 'Global / Multi-region' && <Globe className="w-3 h-3" />}
                    {reg}
                  </div>
                  <div>
                    {countries.map(cnt => (
                      <button
                        key={cnt.name}
                        onClick={() => handleSelect(cnt)}
                        className={`
                          w-full px-4 py-2 text-left hover:bg-teal-50 transition-colors
                          ${(country === cnt.name || (cnt.name === 'Global / Multi-region' && region === 'Global / Multi-region')) ? 'bg-teal-100 text-teal-900 font-medium' : 'text-gray-700'}
                        `}
                      >
                        {cnt.name}
                        {cnt.code && <span className="ml-2 text-xs text-gray-400">({cnt.code})</span>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {region && region !== 'Custom' && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Region:</span> {region}
        </div>
      )}
    </div>
  );
}
