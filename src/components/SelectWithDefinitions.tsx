import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  definition: string;
}

interface SelectWithDefinitionsProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  label: string;
}

export function SelectWithDefinitions({ value, options, onChange, label }: SelectWithDefinitionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-left flex items-center justify-between"
      >
        <span className="text-gray-900">{selectedOption?.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
            {options.map((option) => (
              <div
                key={option.value}
                onMouseEnter={() => setHoveredOption(option.value)}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer transition-colors ${
                  value === option.value
                    ? 'bg-teal-50 border-l-4 border-teal-600'
                    : hoveredOption === option.value
                    ? 'bg-gray-50'
                    : 'bg-white'
                }`}
              >
                <div className="px-3 py-2">
                  <p className={`font-medium ${value === option.value ? 'text-teal-900' : 'text-gray-900'}`}>
                    {option.label}
                  </p>
                  {(hoveredOption === option.value || value === option.value) && (
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      {option.definition}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedOption && (
        <p className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-2">
          <span className="font-medium">Current: </span>{selectedOption.definition}
        </p>
      )}
    </div>
  );
}
