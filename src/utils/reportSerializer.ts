import { SimulationInputs } from '../types/simulation';
import { SubFunction } from '../types/subfunction';
import { SynchronizedResults } from '../types/monteCarlo';

export interface ReportData {
  projectName: string;
  planningType: string;
  createdBy: string;
  createdAt: string;
  recipientEmail: string;
  sizeOfOperation: string;
  riskLevel: string;
  planningHorizon: string;
  mainFunction: string;
  currency: string;

  headcount: {
    baseline: number;
    recommended: number;
    breakdown: {
      subFunctionName: string;
      baseline: number;
      recommended: number;
    }[];
  };

  cost: {
    monthly: number;
    annual: number;
    breakdown: {
      subFunctionName: string;
      avgCost: number;
      costRange: {
        min: number;
        max: number;
      };
    }[];
  };

  assumptions: {
    sizeOfOperation: string;
    planningHorizon: string;
    riskTolerance: string;
    notes: string;
  };

  subFunctions: {
    name: string;
    baseline: {
      headcount: number;
      description: string;
      failureRisk: number;
    };
    mvo: {
      headcount: number;
      description: string;
      riskLevel: string;
      failureRisk: number;
    };
    strategy: {
      type: string;
      avgDuration: number;
      avgCost: number;
      successRate: number;
    };
    comparisonTable: {
      headcount: number;
      avgDuration: number;
      p90Duration: number;
      avgCost: number;
      successRate: number;
      failureRisk: number;
      status: string;
    }[];
    keyStatistics: {
      durationRange: {
        min: number;
        max: number;
      };
      costRange: {
        min: number;
        max: number;
      };
      p50Duration: number;
      p75Duration: number;
      withinBudgetProbability: number;
    };
    analysis: string;
    suggestions: string[];
  }[];
}

export function serializeReportData(
  simulationInputs: SimulationInputs,
  subFunctions: SubFunction[],
  synchronizedResults: Map<string, SynchronizedResults>,
  userEmail: string
): ReportData {
  const subFunctionsData = subFunctions.map(sf => {
    const result = synchronizedResults.get(sf.id);
    const mvoData = result ? (result as any).mvo : {};
    const selectedResult = mvoData.selectedResult || {};
    const testResults = mvoData.testResults || [];

    return {
      name: sf.name,
      baseline: {
        headcount: mvoData.baselineHeadcount || 0,
        description: 'Traditional calculation',
        failureRisk: mvoData.comparison?.baselineRisk || 0,
      },
      mvo: {
        headcount: mvoData.recommendedHeadcount || 0,
        description: `Minimum viable for ${(100 - (selectedResult.failureRisk || 0)).toFixed(0)}% confidence`,
        riskLevel: selectedResult.riskLevel || 'medium',
        failureRisk: selectedResult.failureRisk || 0,
      },
      strategy: {
        type: mvoData.strategy || 'hire_permanent',
        avgDuration: selectedResult.avgDuration || 0,
        avgCost: selectedResult.avgCost || 0,
        successRate: selectedResult.deadlineMetProbability || 0,
      },
      comparisonTable: testResults.map((tr: any) => ({
        headcount: tr.headcount,
        avgDuration: tr.avgDuration,
        p90Duration: tr.p90Duration,
        avgCost: tr.avgCost,
        successRate: tr.deadlineMetProbability,
        failureRisk: tr.failureRisk,
        status: tr.rejected ? 'Rejected' : tr.headcount === mvoData.recommendedHeadcount ? 'MVO' : tr.headcount === mvoData.baselineHeadcount ? 'Baseline' : 'Valid',
      })),
      keyStatistics: {
        durationRange: {
          min: selectedResult.minDuration || 0,
          max: selectedResult.maxDuration || 0,
        },
        costRange: {
          min: selectedResult.minCost || 0,
          max: selectedResult.maxCost || 0,
        },
        p50Duration: selectedResult.p50Duration || 0,
        p75Duration: selectedResult.p75Duration || 0,
        withinBudgetProbability: selectedResult.withinBudgetProbability || 0,
      },
      analysis: mvoData.explanation || '',
      suggestions: mvoData.suggestions || [],
    };
  });

  const totalBaseline = subFunctionsData.reduce((sum, sf) => sum + sf.baseline.headcount, 0);
  const totalMVO = subFunctionsData.reduce((sum, sf) => sum + sf.mvo.headcount, 0);
  const totalAvgCost = subFunctionsData.reduce((sum, sf) => sum + sf.strategy.avgCost, 0);

  return {
    projectName: simulationInputs.simulationName,
    planningType: simulationInputs.planningType,
    createdBy: userEmail,
    createdAt: new Date().toISOString(),
    recipientEmail: userEmail,
    sizeOfOperation: simulationInputs.sizeOfOperation,
    riskLevel: simulationInputs.riskTolerance || 'medium',
    planningHorizon: simulationInputs.planningHorizon,
    mainFunction: simulationInputs.mainFunction,
    currency: simulationInputs.currency,

    headcount: {
      baseline: totalBaseline,
      recommended: totalMVO,
      breakdown: subFunctionsData.map(sf => ({
        subFunctionName: sf.name,
        baseline: sf.baseline.headcount,
        recommended: sf.mvo.headcount,
      })),
    },

    cost: {
      monthly: totalAvgCost,
      annual: totalAvgCost * 12,
      breakdown: subFunctionsData.map(sf => ({
        subFunctionName: sf.name,
        avgCost: sf.strategy.avgCost,
        costRange: sf.keyStatistics.costRange,
      })),
    },

    assumptions: {
      sizeOfOperation: simulationInputs.sizeOfOperation,
      planningHorizon: simulationInputs.planningHorizon,
      riskTolerance: simulationInputs.riskTolerance || 'medium',
      notes: `Based on Monte Carlo simulation with ${subFunctions.length} sub-function(s)`,
    },

    subFunctions: subFunctionsData,
  };
}
