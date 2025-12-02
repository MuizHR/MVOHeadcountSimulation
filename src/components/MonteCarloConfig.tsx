import React from 'react';
import { Settings, Info } from 'lucide-react';
import { MonteCarloInputs, MonteCarloVariable, DistributionType } from '../types/monteCarlo';

interface MonteCarloConfigProps {
  inputs: MonteCarloInputs;
  onChange: (inputs: MonteCarloInputs) => void;
}

export function MonteCarloConfig({ inputs, onChange }: MonteCarloConfigProps) {
  const updateIterations = (iterations: number) => {
    onChange({ ...inputs, iterations });
  };

  const updateConfidenceLevel = (confidenceLevel: number) => {
    onChange({ ...inputs, confidenceLevel });
  };

  const updateVariable = (key: string, variable: MonteCarloVariable) => {
    onChange({
      ...inputs,
      variables: {
        ...inputs.variables,
        [key]: variable,
      },
    });
  };

  const renderVariableConfig = (key: string, variable: MonteCarloVariable | undefined) => {
    if (!variable) return null;

    return (
      <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={variable.enabled}
              onChange={e =>
                updateVariable(key, { ...variable, enabled: e.target.checked })
              }
              className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
            />
            <span className="font-medium text-gray-900">{variable.name}</span>
          </label>
          <span className="text-sm text-gray-500">
            Base: {variable.baseValue.toFixed(2)}
          </span>
        </div>

        {variable.enabled && (
          <div className="space-y-3 pl-6">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                <input
                  type="number"
                  step="0.01"
                  value={variable.range.min}
                  onChange={e =>
                    updateVariable(key, {
                      ...variable,
                      range: { ...variable.range, min: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Most Likely</label>
                <input
                  type="number"
                  step="0.01"
                  value={variable.range.mostLikely || variable.baseValue}
                  onChange={e =>
                    updateVariable(key, {
                      ...variable,
                      range: { ...variable.range, mostLikely: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                <input
                  type="number"
                  step="0.01"
                  value={variable.range.max}
                  onChange={e =>
                    updateVariable(key, {
                      ...variable,
                      range: { ...variable.range, max: parseFloat(e.target.value) },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Distribution Type</label>
              <select
                value={variable.range.distribution}
                onChange={e =>
                  updateVariable(key, {
                    ...variable,
                    range: { ...variable.range, distribution: e.target.value as DistributionType },
                  })
                }
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
              >
                <option value="triangular">Triangular (most realistic)</option>
                <option value="normal">Normal (bell curve)</option>
                <option value="uniform">Uniform (equal probability)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Monte Carlo Configuration
        </h3>
      </div>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">About Monte Carlo Simulation</p>
              <p className="text-blue-800">
                This simulation runs thousands of scenarios with varying parameters to provide
                a probabilistic range of outcomes, helping you understand uncertainty and risk
                in your headcount planning.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Iterations
            </label>
            <select
              value={inputs.iterations}
              onChange={e => updateIterations(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="1000">1,000 (Fast)</option>
              <option value="5000">5,000 (Balanced)</option>
              <option value="10000">10,000 (Recommended)</option>
              <option value="50000">50,000 (High Precision)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              More iterations = more accurate but slower
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confidence Level
            </label>
            <select
              value={inputs.confidenceLevel}
              onChange={e => updateConfidenceLevel(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="80">80%</option>
              <option value="90">90% (Recommended)</option>
              <option value="95">95%</option>
              <option value="99">99%</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Confidence interval for result range
            </p>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Variable Uncertainty Ranges
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Enable variables to simulate uncertainty. Adjust min/max to reflect realistic
            variations in your environment.
          </p>
          <div className="space-y-3">
            {Object.entries(inputs.variables).map(([key, variable]) =>
              renderVariableConfig(key, variable)
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-900">
              <p className="font-medium mb-1">Recommendation</p>
              <p className="text-yellow-800">
                Start with default settings (10,000 iterations, 90% confidence, triangular
                distributions). Adjust ranges based on your historical data and risk tolerance.
                Wider ranges = more conservative estimates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
