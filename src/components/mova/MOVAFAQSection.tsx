import React from 'react';
import { useMOVA, faqItems } from '../../contexts/MOVAContext';

export const MOVAFAQSection: React.FC = () => {
  const { state, handleFAQ } = useMOVA();

  if (!state.showFAQ || state.messages.length > 1) {
    return null;
  }

  const containerClasses = state.isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const buttonClasses = state.isDarkMode
    ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-white'
    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900';

  return (
    <div className={`border-b ${containerClasses} p-4`}>
      <h3 className={`text-sm font-semibold mb-3 ${state.isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Frequently Asked Questions
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {faqItems.map((faq) => (
          <div key={faq.id} className="relative group">
            <button
              onClick={() => handleFAQ(faq.question)}
              className={`w-full px-3 py-2 rounded-lg border text-left text-xs font-medium transition-all flex items-start gap-2 ${buttonClasses}`}
            >
              <span className="text-base flex-shrink-0">{faq.icon}</span>
              <span className="flex-1 leading-tight">{faq.question}</span>
            </button>

            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-normal w-48 pointer-events-none z-10">
              {faq.tooltip}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
