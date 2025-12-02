import React from 'react';
import { Check } from 'lucide-react';
import { WizardStep, WIZARD_STEPS, getStepIndex } from '../../types/wizard';

interface ProgressIndicatorProps {
  currentStep: WizardStep;
  onStepClick?: (step: WizardStep) => void;
}

export function ProgressIndicator({ currentStep, onStepClick }: ProgressIndicatorProps) {
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="bg-white border-b border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const isClickable = onStepClick && index <= currentIndex;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <button
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold
                      transition-all duration-200
                      ${isActive ? 'bg-teal-600 text-white ring-4 ring-teal-100 scale-110' : ''}
                      ${isCompleted ? 'bg-teal-600 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-600' : ''}
                      ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                    `}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                  </button>
                  <div className="mt-2 text-center">
                    <div
                      className={`
                        text-sm font-medium
                        ${isActive ? 'text-teal-600' : ''}
                        ${isCompleted ? 'text-gray-700' : ''}
                        ${!isActive && !isCompleted ? 'text-gray-500' : ''}
                      `}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {step.description}
                    </div>
                  </div>
                </div>

                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`
                      flex-shrink-0 h-0.5 w-full max-w-[80px] mx-2 mt-[-30px]
                      transition-colors duration-200
                      ${index < currentIndex ? 'bg-teal-600' : 'bg-gray-300'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">
            Step {currentIndex + 1} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentIndex].title}
          </span>
        </div>
      </div>
    </div>
  );
}
