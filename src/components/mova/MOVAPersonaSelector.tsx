import React from 'react';
import { useMOVA } from '../../contexts/MOVAContext';
import { personaConfigs } from '../../contexts/MOVAContext';
import { MOVAPersona } from '../../types/mova';

export const MOVAPersonaSelector: React.FC = () => {
  const { state, setPersona } = useMOVA();

  const personas: MOVAPersona[] = ['expert', 'advisor', 'analyst'];

  const containerClasses = state.isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inactiveClasses = state.isDarkMode
    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';

  return (
    <div className={`border-b ${containerClasses} px-4 py-3`}>
      <div className="flex items-center gap-2 overflow-x-auto">
        {personas.map((persona) => {
          const config = personaConfigs[persona];
          const isActive = state.persona === persona;

          return (
            <button
              key={persona}
              onClick={() => setPersona(persona)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : inactiveClasses
              }`}
            >
              <span>{config.icon}</span>
              <span>{config.name}</span>
            </button>
          );
        })}
      </div>

      <p className={`text-xs mt-2 ${state.isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {personaConfigs[state.persona].description}
      </p>
    </div>
  );
};
