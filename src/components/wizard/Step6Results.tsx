import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp, Check } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { SubFunction } from '../../types/subfunction';
import { WizardNavigation } from './WizardNavigation';

export function Step6Results() {
  const { state, previousStep, reset } = useWizard();
  const { simulationInputs, subFunctions } = state;

  const [expandedSubFunction, setExpandedSubFunction] = useState<string | null>(null);

  const totalCurrent = subFunctions.reduce(
    (sum, sf) => sum + (sf.currentHeadcount || 0),
    0
  );
  const totalRecommendedMin = subFunctions.reduce(
    (sum, sf) => sum + (sf.recommendedFTE?.min || 0),
    0
  );
  const totalRecommendedMax = subFunctions.reduce(
    (sum, sf) => sum + (sf.recommendedFTE?.max || 0),
    0
  );
  const totalRecommended = subFunctions.reduce(
    (sum, sf) => sum + (sf.recommendedFTE?.recommended || 0),
    0
  );

  const getStatusIcon = (sf: SubFunction) => {
    if (!sf.currentHeadcount || !sf.recommendedFTE) return null;

    const current = sf.currentHeadcount;
    const { min, max } = sf.recommendedFTE;

    if (current >= min && current <= max) {
      return <Check className="w-5 h-5 text-green-600" />;
    } else if (current > max) {
      return <TrendingUp className="w-5 h-5 text-amber-600" />;
    } else {
      return <TrendingDown className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusText = (sf: SubFunction) => {
    if (!sf.currentHeadcount || !sf.recommendedFTE) return 'N/A';

    const current = sf.currentHeadcount;
    const { min, max } = sf.recommendedFTE;

    if (current >= min && current <= max) {
      return 'Within Range';
    } else if (current > max) {
      return 'Above Range';
    } else {
      return 'Below Range';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Results: {simulationInputs.simulationName}
        </h2>
        <p className="text-gray-600 mb-8">
          FTE recommendations based on your inputs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {totalCurrent > 0 && (
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Current State</div>
              <div className="text-3xl font-bold text-gray-900">{totalCurrent} FTE</div>
            </div>
          )}
          <div className="p-6 bg-teal-50 rounded-lg border border-teal-200">
            <div className="text-sm text-teal-700 mb-1">Recommended</div>
            <div className="text-3xl font-bold text-teal-900">
              {totalRecommendedMin}-{totalRecommendedMax} FTE
            </div>
            <div className="text-sm text-teal-700 mt-1">
              Target: {totalRecommended} FTE
            </div>
          </div>
          {totalCurrent > 0 && (
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Potential Impact</div>
              <div className="text-3xl font-bold text-blue-900">
                {totalCurrent > totalRecommended ? '-' : '+'}
                {Math.abs(totalCurrent - totalRecommended)} FTE
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sub-Function Breakdown
          </h3>
          <div className="space-y-3">
            {subFunctions.map(sf => (
              <div key={sf.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium text-gray-900">{sf.name}</span>
                    {sf.currentHeadcount && (
                      <span className="text-sm text-gray-600">
                        Current: {sf.currentHeadcount} FTE
                      </span>
                    )}
                    {sf.recommendedFTE && (
                      <span className="text-sm text-teal-700 font-medium">
                        Recommended: {sf.recommendedFTE.min}-{sf.recommendedFTE.max} FTE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sf)}
                    <span className="text-sm text-gray-600">{getStatusText(sf)}</span>
                    <button
                      onClick={() =>
                        setExpandedSubFunction(expandedSubFunction === sf.id ? null : sf.id)
                      }
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expandedSubFunction === sf.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {expandedSubFunction === sf.id && sf.recommendedFTE && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Calculation Rationale
                    </h4>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded">
                      {sf.recommendedFTE.rationale}
                    </pre>

                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold text-gray-900 mb-2">Input Summary</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Complexity:</span>{' '}
                          <span className="font-medium capitalize">{sf.complexity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Service Level:</span>{' '}
                          <span className="font-medium capitalize">{sf.serviceLevel}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Structure:</span>{' '}
                          <span className="font-medium capitalize">
                            {sf.operatingModel.structure}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Automation:</span>{' '}
                          <span className="font-medium capitalize">
                            {sf.operatingModel.automationLevel.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <WizardNavigation
        onBack={previousStep}
        canGoBack={true}
        canGoNext={false}
      />

      <div className="flex justify-center mt-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          New Simulation
        </button>
      </div>
    </div>
  );
}
