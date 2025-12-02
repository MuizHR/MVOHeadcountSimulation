import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { SynchronizedResults } from '../types/monteCarlo';

interface MonteCarloResultsProps {
  results: SynchronizedResults;
  subFunctionName: string;
}

export function MonteCarloResults({ results, subFunctionName }: MonteCarloResultsProps) {
  const { baseline, monteCarlo, comparison } = results;
  const { statistics, confidenceIntervals } = monteCarlo;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg font-semibold text-blue-900">
              Baseline Calculator
            </h3>
          </div>
          <div className="text-4xl font-bold text-blue-900 mb-2">
            {baseline.fte} FTE
          </div>
          <div className="text-sm text-blue-700">Deterministic calculation</div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="text-xs text-blue-700 space-y-1">
              <div>Workload: {Math.round(baseline.workloadHours)} hrs/mo</div>
              <div>Adjusted: {Math.round(baseline.adjustedHours)} hrs/mo</div>
              <div>
                Utilization: {(baseline.factors.utilization * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-teal-900">
              Monte Carlo Simulation
            </h3>
          </div>
          <div className="text-4xl font-bold text-teal-900 mb-2">
            {Math.round(statistics.mean)} FTE
          </div>
          <div className="text-sm text-teal-700">
            Mean from {monteCarlo.results.length.toLocaleString()} iterations
          </div>
          <div className="mt-4 pt-4 border-t border-teal-200">
            <div className="text-xs text-teal-700 space-y-1">
              <div>Median: {Math.round(statistics.median)} FTE</div>
              <div>Std Dev: ±{statistics.stdDev.toFixed(1)} FTE</div>
              <div>
                {confidenceIntervals.level}% CI: [{Math.round(confidenceIntervals.lower)}, {Math.round(confidenceIntervals.upper)}]
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`border-2 rounded-lg p-6 ${getRiskColor(comparison.riskLevel)}`}>
        <div className="flex items-start gap-3">
          {getRiskIcon(comparison.riskLevel)}
          <div className="flex-1">
            <h4 className="font-semibold mb-2 capitalize">
              Risk Assessment: {comparison.riskLevel} Risk
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Baseline Position:</span>{' '}
                {comparison.baselineWithinRange
                  ? `Within ${confidenceIntervals.level}% confidence interval`
                  : `Outside ${confidenceIntervals.level}% confidence interval`}
              </div>
              <div>
                <span className="font-medium">Probability:</span>{' '}
                {comparison.probabilityOfBaseline.toFixed(1)}% of simulations resulted in ≤{baseline.fte} FTE
              </div>
              <div>
                <span className="font-medium">Interpretation:</span>{' '}
                {comparison.riskLevel === 'low' &&
                  'Baseline estimate is well-supported by probabilistic analysis. Low risk of underestimation.'}
                {comparison.riskLevel === 'medium' &&
                  'Baseline estimate is at the edge of probable outcomes. Moderate risk - consider adding buffer.'}
                {comparison.riskLevel === 'high' &&
                  'Baseline estimate is outside typical range. High risk - significant buffer recommended.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Distribution Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">P10 (Optimistic)</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(statistics.p10)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">P25</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(statistics.p25)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">P75</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(statistics.p75)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">P90 (Conservative)</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(statistics.p90)}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Min:</span>{' '}
              <span className="font-medium">{Math.round(statistics.min)} FTE</span>
            </div>
            <div>
              <span className="text-gray-600">Mode:</span>{' '}
              <span className="font-medium">{Math.round(statistics.mode)} FTE</span>
            </div>
            <div>
              <span className="text-gray-600">Max:</span>{' '}
              <span className="font-medium">{Math.round(statistics.max)} FTE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Distribution Visualization</h4>
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 800 250">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            <line x1="50" y1="200" x2="750" y2="200" stroke="#e5e7eb" strokeWidth="2" />
            <line x1="50" y1="20" x2="50" y2="200" stroke="#e5e7eb" strokeWidth="2" />

            {monteCarlo.distribution.bins.map((bin, idx) => {
              const x = 50 + (idx / monteCarlo.distribution.bins.length) * 700;
              const maxFreq = Math.max(...monteCarlo.distribution.frequencies);
              const height = (monteCarlo.distribution.frequencies[idx] / maxFreq) * 170;
              const y = 200 - height;

              const fteValue = Math.round(bin);
              const isBaseline = Math.abs(fteValue - baseline.fte) < 1;
              const isInCI =
                fteValue >= confidenceIntervals.lower && fteValue <= confidenceIntervals.upper;

              return (
                <rect
                  key={idx}
                  x={x}
                  y={y}
                  width={700 / monteCarlo.distribution.bins.length - 1}
                  height={height}
                  fill={isBaseline ? '#3b82f6' : isInCI ? 'url(#gradient)' : '#d1d5db'}
                  opacity={isBaseline ? 1 : 0.8}
                />
              );
            })}

            <line
              x1={50 + ((baseline.fte - statistics.min) / (statistics.max - statistics.min)) * 700}
              y1="20"
              x2={50 + ((baseline.fte - statistics.min) / (statistics.max - statistics.min)) * 700}
              y2="200"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="5,5"
            />

            <text x="400" y="230" textAnchor="middle" fill="#6b7280" fontSize="12">
              FTE Required
            </text>
            <text
              x="30"
              y="110"
              textAnchor="middle"
              fill="#6b7280"
              fontSize="12"
              transform="rotate(-90, 30, 110)"
            >
              Probability (%)
            </text>
          </svg>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-b from-teal-600/80 to-teal-600/20 rounded"></div>
            <span className="text-gray-700">
              {confidenceIntervals.level}% CI Range
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700">Baseline ({baseline.fte} FTE)</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">Baseline Rationale</h4>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
          {baseline.rationale}
        </pre>
      </div>
    </div>
  );
}
