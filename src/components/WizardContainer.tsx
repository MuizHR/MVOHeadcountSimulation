import React, { useEffect, useState } from 'react';
import { useWizard } from '../contexts/WizardContext';
import { ProgressIndicator } from './wizard/ProgressIndicator';
import { Step1PlanningContext } from './wizard/Step1PlanningContext';
import { Step2FunctionSetup } from './wizard/Step2FunctionSetup';
import { Step3HRQuestions } from './wizard/Step3HRQuestions';
import { Step4OperatingModel } from './wizard/Step4OperatingModel';
import { Step5Review } from './wizard/Step5Review';
import { Step6ResultsSynchronized } from './wizard/Step6ResultsSynchronized';
import { simulationHistoryService } from '../services/simulationHistoryService';
import { SimulationHistory } from '../types/simulationHistory';
import { Info } from 'lucide-react';

interface WizardContainerProps {
  duplicateSimulationId?: string;
}

export function WizardContainer({ duplicateSimulationId }: WizardContainerProps) {
  const { state, goToStep, loadFromSimulation, reset, setDuplicateSimulationId } = useWizard();
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<SimulationHistory | null>(null);

  useEffect(() => {
    const loadDuplicateSimulation = async () => {
      if (!duplicateSimulationId) return;

      setLoadingSimulation(true);
      try {
        const simulation = await simulationHistoryService.getSimulationById(duplicateSimulationId);
        if (simulation && simulation.input_payload) {
          loadFromSimulation(simulation.input_payload);
          setDuplicateInfo(simulation);
          setDuplicateSimulationId(duplicateSimulationId);
        }
      } catch (error) {
        console.error('Error loading duplicate simulation:', error);
        alert('Failed to load simulation data. Starting with a fresh simulation.');
      } finally {
        setLoadingSimulation(false);
      }
    };

    reset();
    loadDuplicateSimulation();
  }, [duplicateSimulationId]);

  const renderStep = () => {
    switch (state.currentStep) {
      case 'planning_context':
        return <Step1PlanningContext />;
      case 'function_setup':
        return <Step2FunctionSetup />;
      case 'workload_drivers':
        return <Step3HRQuestions />;
      case 'operating_model':
        return <Step4OperatingModel />;
      case 'review':
        return <Step5Review />;
      case 'results':
        return <Step6ResultsSynchronized />;
      default:
        return <Step1PlanningContext />;
    }
  };

  if (loadingSimulation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading simulation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {duplicateInfo && duplicateInfo.parent_simulation_id && (
        <div className="bg-blue-50 border-b border-blue-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900">
                  <strong>Duplicated Scenario:</strong> This simulation was duplicated from{' '}
                  <strong>{duplicateInfo.parent_simulation_name || 'an existing simulation'}</strong>.
                  {duplicateInfo.scenario_label && (
                    <span> (Scenario: <strong>{duplicateInfo.scenario_label}</strong>)</span>
                  )}
                </p>
                {duplicateInfo.duplication_note && (
                  <p className="text-xs text-blue-800 mt-1">
                    Note: {duplicateInfo.duplication_note}
                  </p>
                )}
                <p className="text-xs text-blue-700 mt-1">
                  You can adjust any settings and run the simulation. When you save, it will update this duplicated record.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProgressIndicator currentStep={state.currentStep} onStepClick={goToStep} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderStep()}
      </main>

      <footer className="mt-12 pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600 text-center">
              This simulator provides indicative estimates using both deterministic (Baseline Calculator)
              and probabilistic (Monte Carlo Simulation) approaches based on standardized assumptions and the
              Headcount Planning Framework & MVO Simulation Principles. Final decisions should also
              consider real operational data, management judgement and latest business conditions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
