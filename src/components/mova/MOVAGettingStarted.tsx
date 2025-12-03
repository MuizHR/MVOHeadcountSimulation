import React, { useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { useMOVA } from '../../contexts/MOVAContext';

export const MOVAGettingStarted: React.FC = () => {
  const { state } = useMOVA();
  const [isOpen, setIsOpen] = useState(false);

  const panelClasses = state.isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const textClasses = state.isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClasses = state.isDarkMode ? 'text-gray-400' : 'text-gray-600';

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
          state.isDarkMode
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>Getting Started</span>
      </button>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 mx-4 rounded-lg border shadow-xl z-50 max-h-96 overflow-y-auto">
      <div className={`${panelClasses} p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className={`font-semibold ${textClasses}`}>Getting Started with MOVA</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${subTextClasses}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold`}>
              1
            </div>
            <div>
              <div className={`text-sm font-medium mb-1 ${textClasses}`}>
                Choose a function, project, or team
              </div>
              <div className={`text-xs ${subTextClasses}`}>
                Identify the specific area you want to simulate and plan for.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold`}>
              2
            </div>
            <div>
              <div className={`text-sm font-medium mb-1 ${textClasses}`}>
                Enter workload assumptions
              </div>
              <div className={`text-xs ${subTextClasses}`}>
                Input metrics like tickets, tasks, cases, or projects per period.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold`}>
              3
            </div>
            <div>
              <div className={`text-sm font-medium mb-1 ${textClasses}`}>
                Define productivity per role
              </div>
              <div className={`text-xs ${subTextClasses}`}>
                Specify how much work each role type can handle (throughput).
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold`}>
              4
            </div>
            <div>
              <div className={`text-sm font-medium mb-1 ${textClasses}`}>
                Set complexity or service levels
              </div>
              <div className={`text-xs ${subTextClasses}`}>
                Add factors like task complexity, quality targets, or SLA requirements.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold`}>
              5
            </div>
            <div>
              <div className={`text-sm font-medium mb-1 ${textClasses}`}>
                Calculate FTE and automation impact
              </div>
              <div className={`text-xs ${subTextClasses}`}>
                Let MOVA calculate required headcount and automation opportunities.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold`}>
              6
            </div>
            <div>
              <div className={`text-sm font-medium mb-1 ${textClasses}`}>
                Review costs, risk buffer, and team design
              </div>
              <div className={`text-xs ${subTextClasses}`}>
                Analyze total costs, risk margins, and optimal team structure.
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold`}>
              7
            </div>
            <div>
              <div className={`text-sm font-medium mb-1 ${textClasses}`}>
                Export or document the scenario
              </div>
              <div className={`text-xs ${subTextClasses}`}>
                Save your work and share findings with stakeholders.
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="w-full mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-md transition-shadow"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
