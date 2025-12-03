import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { useMOVA } from '../../contexts/MOVAContext';

export const MOVAWhatsNew: React.FC = () => {
  const { state, toggleWhatsNew } = useMOVA();

  if (!state.showWhatsNew) {
    return (
      <button
        onClick={toggleWhatsNew}
        className="p-2 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="What's new"
      >
        <Sparkles className="w-5 h-5 text-white" />
      </button>
    );
  }

  const panelClasses = state.isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const textClasses = state.isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClasses = state.isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg border shadow-xl z-50">
      <div className={`${panelClasses} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h3 className={`font-semibold ${textClasses}`}>What's New</h3>
          </div>
          <button
            onClick={toggleWhatsNew}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${subTextClasses}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${state.isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                Version 27
              </span>
            </div>
            <ul className={`text-sm space-y-2 ${subTextClasses}`}>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Added Quick Actions toolbar for common tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Added FAQ section with helpful tooltips</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Added Getting Started guide</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Added visual onboarding tutorial</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Improved Speech-to-Text with auto-send</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Enhanced persona selection with help bubble</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Added Dashboard Preview for simulation results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 flex-shrink-0">✓</span>
                <span>Improved analytics tracking for better insights</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={toggleWhatsNew}
          className="w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-md transition-shadow"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
