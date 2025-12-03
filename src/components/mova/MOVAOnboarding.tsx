import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useMOVA } from '../../contexts/MOVAContext';

export const MOVAOnboarding: React.FC = () => {
  const { state, completeOnboarding } = useMOVA();
  const [currentStep, setCurrentStep] = useState(0);

  if (state.hasCompletedOnboarding || !state.isOpen) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const overlayClasses = state.isDarkMode
    ? 'bg-gray-900 bg-opacity-95'
    : 'bg-white bg-opacity-95';

  return (
    <div className={`absolute inset-0 ${overlayClasses} z-50 flex items-center justify-center p-6 rounded-2xl`}>
      <div className="max-w-md w-full">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentStep === 0 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className={`text-2xl font-bold mb-3 ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome to MOVA
            </h2>
            <p className={`text-sm mb-6 ${state.isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              MOVA helps with MVO, FTE, cost, automation, and team design. Your AI-powered workforce planning assistant.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleSkip}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${state.isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="text-center">
            <div className="text-5xl mb-4">✨</div>
            <h2 className={`text-2xl font-bold mb-3 ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Key Features
            </h2>
            <ul className={`text-sm text-left space-y-2 mb-6 ${state.isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-center gap-2">
                <span className="text-lg">🎭</span>
                <span>Switch between 3 personas: Expert, Advisor, Analyst</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">🎤</span>
                <span>Use voice input for hands-free interaction</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">🌙</span>
                <span>Toggle dark mode for comfortable viewing</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">❓</span>
                <span>Explore FAQs for quick answers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span>Use Quick Actions for common tasks</span>
              </li>
            </ul>
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            >
              Next
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className={`text-2xl font-bold mb-3 ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Start Planning
            </h2>
            <p className={`text-sm mb-6 ${state.isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Get started by:
            </p>
            <ul className={`text-sm text-left space-y-2 mb-6 ${state.isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span>Clicking an FAQ question</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">📚</span>
                <span>Following the Getting Started guide</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span>Running a Quick Action like "Run FTE Simulation"</span>
              </li>
            </ul>
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            >
              Start Now
            </button>
          </div>
        )}

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step === currentStep
                  ? 'bg-blue-500'
                  : state.isDarkMode
                  ? 'bg-gray-700'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
