import React from 'react';
import { ScenarioResult } from '../types/scenario';
import { Users, Clock, DollarSign, Star, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface ScenarioCardProps {
  scenario: ScenarioResult;
  onSelect: () => void;
  isSelected: boolean;
}

export function ScenarioCard({ scenario, onSelect, isSelected }: ScenarioCardProps) {
  const getRiskColor = (risk: string) => {
    if (risk === 'low') return 'text-green-600 bg-green-50 border-green-200';
    if (risk === 'medium') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSustainabilityColor = (level: string) => {
    if (level === 'high') return 'text-green-600 bg-green-50 border-green-200';
    if (level === 'medium') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getLeannessColor = (level: string) => {
    if (level === 'very_lean') return 'text-teal-600 bg-teal-50 border-teal-200';
    if (level === 'lean') return 'text-cyan-600 bg-cyan-50 border-cyan-200';
    if (level === 'balanced') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatLabel = (value: string): string => {
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-teal-500 shadow-lg' : ''
      } ${scenario.isRecommended ? 'border-2 border-teal-400' : 'border border-gray-200'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{scenario.name}</h3>
            {scenario.isRecommended && (
              <Star className="w-5 h-5 text-teal-600 fill-teal-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-start gap-2">
          <Users className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-2xl font-bold text-gray-900">{scenario.headcount}</p>
            <p className="text-xs text-gray-500">People</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-2xl font-bold text-gray-900">{scenario.duration}</p>
            <p className="text-xs text-gray-500">Months</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <DollarSign className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(scenario.costPerMonth.total)}</p>
            <p className="text-xs text-gray-500">per month</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-xs text-gray-600">
          <span className="font-medium">Cost breakdown:</span> {formatCurrency(scenario.costPerMonth.permanent)} Permanent / {formatCurrency(scenario.costPerMonth.contract)} Contract / {formatCurrency(scenario.costPerMonth.gig)} Gig
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${getRiskColor(scenario.riskLevel)}`}>
          {scenario.riskLevel === 'low' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {formatLabel(scenario.riskLevel)} Risk
        </div>

        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${getSustainabilityColor(scenario.sustainability)}`}>
          <TrendingUp className="w-3 h-3" />
          {formatLabel(scenario.sustainability)} Sustainability
        </div>

        <div className={`px-2 py-1 rounded-md border text-xs font-medium ${getLeannessColor(scenario.leanness)}`}>
          {formatLabel(scenario.leanness)}
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-teal-600 font-medium">Selected for detailed analysis</p>
        </div>
      )}
    </div>
  );
}
