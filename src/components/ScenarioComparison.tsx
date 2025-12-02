import React from 'react';
import { ScenarioResult } from '../types/scenario';
import { ScenarioCard } from './ScenarioCard';

interface ScenarioComparisonProps {
  scenarios: ScenarioResult[];
  selectedScenario: ScenarioResult | null;
  onSelectScenario: (scenario: ScenarioResult) => void;
}

export function ScenarioComparison({ scenarios, selectedScenario, onSelectScenario }: ScenarioComparisonProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Scenario Analysis</h2>
        <p className="text-sm text-gray-600 mb-4">
          Compare six workforce planning scenarios based on your inputs. Click any scenario for detailed insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.type}
            scenario={scenario}
            onSelect={() => onSelectScenario(scenario)}
            isSelected={selectedScenario?.type === scenario.type}
          />
        ))}
      </div>
    </div>
  );
}
