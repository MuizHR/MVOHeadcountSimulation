import React from 'react';
import { DashboardPreviewData } from '../../types/mova';
import { useMOVA } from '../../contexts/MOVAContext';

interface MOVADashboardPreviewProps {
  data: DashboardPreviewData;
}

export const MOVADashboardPreview: React.FC<MOVADashboardPreviewProps> = ({ data }) => {
  const { state } = useMOVA();

  const cardClasses = state.isDarkMode
    ? 'bg-gray-700 border-gray-600'
    : 'bg-gray-50 border-gray-200';

  const textClasses = state.isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextClasses = state.isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const getRiskBufferColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="my-4">
      <h4 className={`text-sm font-semibold mb-3 ${textClasses}`}>
        Dashboard Preview
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg border ${cardClasses}`}>
          <div className={`text-xs mb-1 ${subTextClasses}`}>Total FTE</div>
          <div className={`text-2xl font-bold ${textClasses}`}>{data.totalFTE.toFixed(1)}</div>
        </div>

        <div className={`p-3 rounded-lg border ${cardClasses}`}>
          <div className={`text-xs mb-1 ${subTextClasses}`}>Monthly Cost</div>
          <div className={`text-2xl font-bold ${textClasses}`}>
            ${data.monthlyCost.toLocaleString()}
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${cardClasses}`}>
          <div className={`text-xs mb-1 ${subTextClasses}`}>Automation Potential</div>
          <div className={`text-2xl font-bold ${textClasses}`}>{data.automationPotential}%</div>
          <div className="mt-1 w-full bg-gray-300 dark:bg-gray-600 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${data.automationPotential}%` }}
            />
          </div>
        </div>

        <div className={`p-3 rounded-lg border ${cardClasses}`}>
          <div className={`text-xs mb-1 ${subTextClasses}`}>Risk Buffer</div>
          <div className={`text-2xl font-bold capitalize ${getRiskBufferColor(data.riskBuffer)}`}>
            {data.riskBuffer}
          </div>
        </div>
      </div>

      <p className={`text-xs mt-3 ${subTextClasses} italic`}>
        To see full details, open the main dashboard in the app.
      </p>
    </div>
  );
};
