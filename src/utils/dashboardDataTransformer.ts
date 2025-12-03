import {
  SimulationResult,
  KeyStats,
  SubFunctionResult,
  SystemRoleComposition,
  RoleCompositionRow,
  ComparisonRow,
  RiskLevel,
  RecommendedStrategy
} from '../types/dashboardResult';
import { SimulationInputs } from '../types/simulation';
import { SubFunction } from '../types/subfunction';
import { OverallRoleComposition } from './overallRoleComposition';

export function transformToSimulationResult(
  simulationInputs: SimulationInputs,
  subFunctions: SubFunction[],
  synchronizedResults: Map<string, any>,
  mvoComposition: OverallRoleComposition | null
): SimulationResult {
  console.log('[transformToSimulationResult] Starting transformation');
  console.log('[transformToSimulationResult] synchronizedResults size:', synchronizedResults.size);
  console.log('[transformToSimulationResult] subFunctions length:', subFunctions.length);

  const resultsArray = Array.from(synchronizedResults.values());
  console.log('[transformToSimulationResult] resultsArray:', resultsArray);

  const totalBaselineHeadcount = resultsArray.reduce(
    (sum, result: any) => sum + (result.mvo?.baselineHeadcount || 0),
    0
  );

  const totalMvoHeadcount = resultsArray.reduce(
    (sum, result: any) => sum + (result.mvo?.recommendedHeadcount || 0),
    0
  );

  const totalBaselineCost = resultsArray.reduce(
    (sum, result: any) => {
      const baselineResult = result.mvo?.results?.find((r: any) => r.headcount === result.mvo?.baselineHeadcount);
      return sum + (baselineResult?.avgCost || 0);
    },
    0
  );

  const totalMvoCost = resultsArray.reduce(
    (sum, result: any) => sum + (result.mvo?.selectedResult?.avgCost || 0),
    0
  );

  const avgDurationDays = resultsArray.length > 0
    ? resultsArray.reduce((sum, result: any) => sum + (result.mvo?.selectedResult?.avgDuration || 0), 0) / resultsArray.length
    : 0;

  const p50DurationDays = Math.round(avgDurationDays * 0.85);
  const p75DurationDays = Math.round(avgDurationDays * 0.95);
  const p90DurationDays = Math.round(avgDurationDays * 1.1);

  const avgSuccessRate = resultsArray.length > 0
    ? resultsArray.reduce((sum, result: any) => sum + (result.mvo?.selectedResult?.successRate || 0), 0) / resultsArray.length
    : 0;

  const avgBaselineRisk = resultsArray.length > 0
    ? resultsArray.reduce((sum, result: any) => {
        const baselineResult = result.mvo?.results?.find((r: any) => r.headcount === result.mvo?.baselineHeadcount);
        return sum + ((1 - (baselineResult?.successRate || 0) / 100) * 100);
      }, 0) / resultsArray.length
    : 0;

  const avgMvoRisk = resultsArray.length > 0
    ? resultsArray.reduce((sum, result: any) => sum + ((1 - (result.mvo?.selectedResult?.successRate || 0) / 100) * 100), 0) / resultsArray.length
    : 0;

  const keyStats: KeyStats = {
    baselineHeadcount: Math.round(totalBaselineHeadcount),
    mvoHeadcount: Math.round(totalMvoHeadcount),
    baselineMonthlyCostRm: Math.round(totalBaselineCost),
    mvoMonthlyCostRm: Math.round(totalMvoCost),
    monthlySavingsRm: Math.round(totalBaselineCost - totalMvoCost),
    annualSavingsRm: Math.round((totalBaselineCost - totalMvoCost) * 12),
    avgDurationDays: Math.round(avgDurationDays),
    p50DurationDays,
    p75DurationDays,
    p90DurationDays,
    baselineFailureRiskPct: avgBaselineRisk,
    mvoFailureRiskPct: avgMvoRisk
  };

  const subFunctionResults: SubFunctionResult[] = subFunctions.map((sf) => {
    const result = synchronizedResults.get(sf.id);
    const mvoData = result?.mvo;

    if (!mvoData) {
      return createEmptySubFunctionResult(sf);
    }

    const baselineHeadcount = mvoData.baselineHeadcount || 0;
    const mvoHeadcount = mvoData.recommendedHeadcount || 0;
    const selectedResult = mvoData.selectedResult || {};

    const baselineResult = mvoData.results?.find((r: any) => r.headcount === baselineHeadcount) || {};
    const baselineRisk = (1 - (baselineResult.successRate || 0) / 100) * 100;
    const mvoRisk = (1 - (selectedResult.successRate || 0) / 100) * 100;

    let riskLevel: RiskLevel = 'LOW';
    if (mvoRisk > 25) riskLevel = 'HIGH';
    else if (mvoRisk > 10) riskLevel = 'MEDIUM';

    const comparisonRows: ComparisonRow[] = (mvoData.results || []).map((r: any) => ({
      headcount: r.headcount,
      isBaseline: r.headcount === baselineHeadcount,
      isMvo: r.headcount === mvoHeadcount,
      avgDurationDays: r.avgDuration || 0,
      p90DurationDays: (r.avgDuration || 0) * 1.1,
      avgCostRm: r.avgCost || 0,
      successRatePct: r.successRate || 0,
      riskPct: (1 - (r.successRate || 0) / 100) * 100,
      riskBucket: getRiskBucket((1 - (r.successRate || 0) / 100) * 100)
    }));

    const workTypeLabel = getWorkTypeLabel(sf);
    const recommendedStrategy = determineStrategy(sf, mvoData);

    const aiSummary = generateAISummary(sf, baselineHeadcount, mvoHeadcount, riskLevel, recommendedStrategy);

    return {
      id: sf.id,
      name: sf.name,
      workTypeLabel,
      baselineHeadcount: Math.round(baselineHeadcount),
      mvoHeadcount: Math.round(mvoHeadcount),
      riskLevel,
      baselineFailureRiskPct: baselineRisk,
      mvoFailureRiskPct: mvoRisk,
      minHeadcountSafeguardApplied: mvoData.safeguardApplied || false,
      recommendedStrategy,
      recommendedStrategyStats: {
        avgDurationDays: Math.round(selectedResult.avgDuration || 0),
        p90DurationDays: Math.round((selectedResult.avgDuration || 0) * 1.1),
        avgMonthlyCostRm: selectedResult.avgCost || 0,
        successRatePct: selectedResult.successRate || 0
      },
      comparisonRows,
      aiSummaryMarkdown: aiSummary
    };
  });

  const systemRoleComposition: SystemRoleComposition = mvoComposition
    ? transformRoleComposition(mvoComposition, totalMvoHeadcount)
    : createDefaultRoleComposition(totalMvoHeadcount);

  const finalResult = {
    simulationId: crypto.randomUUID(),
    simulationName: simulationInputs.simulationName || 'Untitled Simulation',
    planningType: simulationInputs.planningType,
    sizeOfOperation: mapSizeOfOperation(simulationInputs.operationSize),
    totalFte: totalMvoHeadcount,
    avgDurationDays: Math.round(avgDurationDays),
    p90DurationDays,
    avgMonthlyCostRm: Math.round(totalMvoCost),
    successRatePct: avgSuccessRate,
    subFunctions: subFunctionResults,
    systemRoleComposition,
    keyStats
  };

  console.log('[transformToSimulationResult] Transformation complete');
  console.log('[transformToSimulationResult] Final result:', finalResult);

  return finalResult;
}

function createEmptySubFunctionResult(sf: SubFunction): SubFunctionResult {
  return {
    id: sf.id,
    name: sf.name,
    workTypeLabel: 'Unknown',
    baselineHeadcount: 0,
    mvoHeadcount: 0,
    riskLevel: 'LOW',
    baselineFailureRiskPct: 0,
    mvoFailureRiskPct: 0,
    minHeadcountSafeguardApplied: false,
    recommendedStrategy: 'hire_permanent',
    recommendedStrategyStats: {
      avgDurationDays: 0,
      p90DurationDays: 0,
      avgMonthlyCostRm: 0,
      successRatePct: 0
    },
    comparisonRows: [],
    aiSummaryMarkdown: 'No data available for this sub-function.'
  };
}

function getRiskBucket(riskPct: number): RiskLevel {
  if (riskPct > 25) return 'HIGH';
  if (riskPct > 10) return 'MEDIUM';
  return 'LOW';
}

function getWorkTypeLabel(sf: SubFunction): string {
  const workTypes = sf.workTypes || {};
  const entries = Object.entries(workTypes).filter(([_, value]) => value > 0);

  if (entries.length === 0) return 'General';
  if (entries.length === 1) return formatWorkTypeLabel(entries[0][0]);

  return entries.map(([key]) => formatWorkTypeLabel(key)).join(', ');
}

function formatWorkTypeLabel(workType: string): string {
  return workType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function determineStrategy(sf: SubFunction, mvoData: any): RecommendedStrategy {
  const workTypes = sf.workTypes || {};
  const hasRoutine = (workTypes.routine_processing || 0) > 50;
  const hasKnowledge = (workTypes.knowledge_work || 0) > 40;
  const hasOperational = (workTypes.operational_support || 0) > 40;

  if (hasRoutine) return 'automate';
  if (hasKnowledge) return 'hire_permanent';
  if (hasOperational) return 'hybrid_perm_gig';

  return 'hire_permanent';
}

function generateAISummary(
  sf: SubFunction,
  baseline: number,
  mvo: number,
  risk: RiskLevel,
  strategy: RecommendedStrategy
): string {
  const diff = mvo - baseline;
  const diffText = diff > 0
    ? `recommends ${diff} additional person${diff > 1 ? 's' : ''} compared to baseline`
    : diff < 0
    ? `suggests ${Math.abs(diff)} fewer person${Math.abs(diff) > 1 ? 's' : ''} than baseline`
    : 'aligns with baseline headcount';

  const riskText = risk === 'HIGH'
    ? 'This is a high-risk configuration; consider adding buffer capacity or implementing mitigation strategies.'
    : risk === 'MEDIUM'
    ? 'This carries moderate risk; monitor closely during initial phases.'
    : 'This presents low risk with good delivery confidence.';

  const strategyText = getStrategyDescription(strategy);

  return `The MVO analysis ${diffText} (${baseline} → ${mvo} FTE). ${riskText}\n\nRecommended approach: ${strategyText}`;
}

function getStrategyDescription(strategy: RecommendedStrategy): string {
  switch (strategy) {
    case 'hire_permanent':
      return 'Build internal permanent capability for stable, long-term work.';
    case 'hybrid_perm_gig':
      return 'Use a hybrid model with permanent core team supplemented by contract staff for flexibility.';
    case 'outsource':
      return 'Consider outsourcing to specialist vendors for efficiency and focus.';
    case 'automate':
      return 'Invest in automation and process optimization to reduce manual effort.';
    default:
      return 'Build appropriate staffing model based on work characteristics.';
  }
}

function transformRoleComposition(
  composition: OverallRoleComposition,
  totalFte: number
): SystemRoleComposition {
  const rows: RoleCompositionRow[] = composition.rows.map(row => ({
    roleLabel: row.roleLabel,
    levelLabel: row.levelLabel,
    units: row.units,
    fteShare: row.fteShare,
    monthlyCostRm: row.monthlyCostRm
  }));

  return {
    patternLabel: composition.patternLabel,
    totalFte: composition.totalFte,
    rows,
    totalMonthlyCostRm: composition.totalMonthlyCostRm,
    rationale: `System-suggested mix: ${composition.patternLabel}, aligned to total FTE ≈ ${totalFte.toFixed(1)} and JLG salary bands for Support / Admin / Back-office work.`
  };
}

function createDefaultRoleComposition(totalFte: number): SystemRoleComposition {
  return {
    patternLabel: 'Mixed roles',
    totalFte,
    rows: [],
    totalMonthlyCostRm: 0,
    rationale: 'Default role composition based on total FTE requirements.'
  };
}

function mapSizeOfOperation(operationSize: string): 'small' | 'medium' | 'large' | 'custom' {
  if (operationSize.includes('small')) return 'small';
  if (operationSize.includes('medium')) return 'medium';
  if (operationSize.includes('large')) return 'large';
  return 'custom';
}
