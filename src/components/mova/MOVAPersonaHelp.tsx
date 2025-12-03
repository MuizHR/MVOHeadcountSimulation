import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { personaConfigs } from '../../contexts/MOVAContext';
import { useMOVA } from '../../contexts/MOVAContext';

export const MOVAPersonaHelp: React.FC = () => {
  const { state } = useMOVA();
  const [isVisible, setIsVisible] = useState(false);

  const panelClasses = state.isDarkMode
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="Persona help"
      >
        <HelpCircle className="w-4 h-4 text-white" />
      </button>

      {isVisible && (
        <div className={`absolute top-full right-0 mt-2 w-72 rounded-lg border shadow-lg p-4 z-50 ${panelClasses}`}>
          <h3 className="text-sm font-semibold mb-3">Choose Your Persona</h3>
          <div className="space-y-3">
            {Object.entries(personaConfigs).map(([key, config]) => (
              <div key={key} className="flex gap-2">
                <span className="text-lg flex-shrink-0">{config.icon}</span>
                <div>
                  <div className="font-medium text-sm">{config.name}</div>
                  <div className={`text-xs ${state.isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {config.fullDescription}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
