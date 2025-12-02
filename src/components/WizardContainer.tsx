import React from 'react';
import { useWizard } from '../contexts/WizardContext';
import { ProgressIndicator } from './wizard/ProgressIndicator';
import { Step1PlanningContext } from './wizard/Step1PlanningContext';
import { Step2FunctionSetup } from './wizard/Step2FunctionSetup';
import { Step3HRQuestions } from './wizard/Step3HRQuestions';
import { Step4OperatingModel } from './wizard/Step4OperatingModel';
import { Step5Review } from './wizard/Step5Review';
import { Step6ResultsSynchronized } from './wizard/Step6ResultsSynchronized';

export function WizardContainer() {
  const { state, goToStep } = useWizard();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
