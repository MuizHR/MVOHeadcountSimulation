import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { useWizard } from '../../contexts/WizardContext';
import { WizardNavigation } from './WizardNavigation';
import { identifyMVO } from '../../utils/mvoEngine';
import { fetchAllStaffTypes } from '../../services/staffTypeService';
import { categorizeWorkByName } from '../../types/workType';
import { generateWorkTypeAwareRoleComposition } from '../../utils/workTypeRoleComposition';

export function Step5Review() {
  const {
    state,
    previousStep,
    nextStep,
    setCalculated,
    setSynchronizedResults,
    updateSubFunctions,
  } = useWizard();
  const { simulationInputs, subFunctions } = state;

  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    const resultsMap = new Map();
    for (const sf of subFunctions) {
      const mvoResult = identifyMVO(sf, simulationInputs.operationSize, simulationInputs);
      resultsMap.set(sf.id, { mvo: mvoResult });
    }

    setSynchronizedResults(resultsMap as any);
    setCalculated(true);

    try {
      const staffTypes = await fetchAllStaffTypes();

      const updatedSubFunctions = subFunctions.map(sf => {
        const result = resultsMap.get(sf.id);
        if (!result) return sf;

        const mvoResult = (result as any).mvo;
        const totalFteRequired = mvoResult?.recommendedHeadcount || 0;
        const workCategory = categorizeWorkByName(sf.name);

        const suggestedComposition = generateWorkTypeAwareRoleComposition(
          totalFteRequired,
          workCategory,
          sf.name,
          staffTypes
        );

        return {
          ...sf,
          suggestedRoleComposition: suggestedComposition,
          workCategory,
        };
      });

      updateSubFunctions(updatedSubFunctions);
    } catch (error) {
      console.error('Error generating role compositions:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsCalculating(false);
    nextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Calculate</h2>
        <p className="text-gray-600 mb-8">
          Review your inputs and run the calculation
        </p>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Planning Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Simulation Name:</span>
                <span className="font-medium text-gray-900">{simulationInputs.simulationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Planning Type:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {simulationInputs.planningType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Function:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {simulationInputs.functionType.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Operation Size:</span>
                <span className="font-medium text-teal-700 capitalize">
                  {simulationInputs.operationSize === 'small_lean' && 'Small / Lean (minimum team)'}
                  {simulationInputs.operationSize === 'medium_standard' && 'Medium / Standard (normal operations)'}
                  {simulationInputs.operationSize === 'large_extended' && 'Large / Extended (full scale)'}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sub-Functions Overview ({subFunctions.length})
            </h3>
            <div className="space-y-3">
              {subFunctions.map((sf, index) => (
                <div key={sf.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{index + 1}.</span>
                    <span className="font-medium text-gray-900">{sf.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {sf.status === 'fully_configured' && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                    <span className="text-sm text-gray-600 capitalize">
                      {sf.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-teal-900 mb-2">
                  Ready to Calculate MVO
                </h4>
                <p className="text-sm text-teal-800 mb-4">
                  The system will:
                </p>
                <ul className="text-sm text-teal-800 mb-4 space-y-1 list-disc list-inside">
                  <li>
                    <strong>Calculate Baseline Headcount:</strong> Using standard formula (Total Workload ÷ Productivity × Days)
                  </li>
                  <li>
                    <strong>Run Monte Carlo Simulation:</strong> Test headcounts from Baseline-2 to Baseline+5 with 5,000 iterations each
                  </li>
                  <li>
                    <strong>Identify MVO:</strong> Auto-select minimum headcount meeting your risk threshold
                  </li>
                  <li>
                    <strong>Generate AI Explanation:</strong> Professional rationale for management approval
                  </li>
                </ul>
                <p className="text-sm text-teal-800 mb-4">
                  Results will show Baseline (no-risk) vs Recommended MVO (Monte Carlo) with full
                  risk analysis, cost projections, and strategic recommendations.
                </p>
                <button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className={`
                    px-6 py-3 rounded-lg font-semibold transition-all
                    ${
                      isCalculating
                        ? 'bg-gray-400 text-white cursor-wait'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }
                  `}
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⚙️</span>
                      Running MVO Simulation...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ⚡ Calculate MVO with Monte Carlo
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WizardNavigation
        onBack={() => {
          setCalculated(false);
          previousStep();
        }}
        canGoBack={true}
        canGoNext={false}
      />
    </div>
  );
}
