import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardNavigationProps {
  onBack?: () => void;
  onNext?: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  nextButtonClass?: string;
}

export function WizardNavigation({
  onBack,
  onNext,
  canGoBack,
  canGoNext,
  nextLabel = 'Continue',
  backLabel = 'Back',
  isNextDisabled = false,
  nextButtonClass,
}: WizardNavigationProps) {
  return (
    <div className="flex justify-center gap-4 mt-8 pb-8">
      {canGoBack && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          {backLabel}
        </button>
      )}

      {canGoNext && onNext && (
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={
            nextButtonClass ||
            `
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
            ${
              isNextDisabled
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700'
            }
          `
          }
        >
          {nextLabel}
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
