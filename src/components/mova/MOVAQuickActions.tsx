import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMOVA, quickActions } from '../../contexts/MOVAContext';

export const MOVAQuickActions: React.FC = () => {
  const { state, handleQuickAction, toggleQuickActions } = useMOVA();

  const containerClasses = state.isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const buttonClasses = state.isDarkMode
    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white';

  const headerClasses = state.isDarkMode ? 'text-gray-300' : 'text-gray-700';

  return (
    <div className={`border-b ${containerClasses}`}>
      <button
        onClick={toggleQuickActions}
        className={`w-full px-4 py-2 flex items-center justify-between text-sm font-semibold ${headerClasses} hover:opacity-80 transition-opacity`}
      >
        <span>Quick Actions</span>
        {state.isQuickActionsExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {state.isQuickActionsExpanded && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              disabled={state.isThinking}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${buttonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-base">{action.icon}</span>
              <span className="flex-1 text-left leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
