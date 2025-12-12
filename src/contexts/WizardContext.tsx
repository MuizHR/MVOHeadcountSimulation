import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WizardState, WizardStep, WIZARD_STEPS, getStepIndex } from '../types/wizard';
import { SimulationInputs, DEFAULT_SIMULATION_INPUTS } from '../types/simulation';
import { SubFunction } from '../types/subfunction';
import { ScenarioResult } from '../types/scenario';
import { MonteCarloInputs, DEFAULT_MONTE_CARLO_INPUTS, SynchronizedResults } from '../types/monteCarlo';
import type { CanonicalSimulation } from '../types/canonicalSimulation';
import { CURRENT_SCHEMA_VERSION, CURRENT_ENGINE_VERSION } from '../types/canonicalSimulation';
import { migrateSimulation, canonicalToLegacy } from '../utils/simulationMigration';
import { persistenceService } from '../services/persistenceAdapter';

interface WizardContextType {
  state: WizardState;
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  updateSimulationInputs: (inputs: Partial<SimulationInputs>) => void;
  updateSubFunctions: (subFunctions: SubFunction[]) => void;
  addSubFunction: (subFunction: SubFunction) => void;
  removeSubFunction: (id: string) => void;
  updateSubFunction: (id: string, updates: Partial<SubFunction>) => void;
  setCurrentSubFunctionIndex: (index: number) => void;
  setScenarios: (scenarios: ScenarioResult[]) => void;
  setSelectedScenario: (scenario: ScenarioResult | null) => void;
  setCalculated: (calculated: boolean) => void;
  monteCarloInputs: MonteCarloInputs;
  setMonteCarloInputs: (inputs: MonteCarloInputs) => void;
  synchronizedResults: Map<string, SynchronizedResults>;
  setSynchronizedResults: (results: Map<string, SynchronizedResults>) => void;
  loadFromSimulation: (inputPayload: any) => void;
  saveSimulation: () => Promise<CanonicalSimulation>;
  loadSimulationById: (simulationId: string) => Promise<boolean>;
  currentSimulationId: string | null;
  setCurrentSimulationId: (id: string | null) => void;
  reset: () => void;
  duplicateSimulationId: string | null;
  setDuplicateSimulationId: (id: string | null) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const INITIAL_STATE: WizardState = {
  currentStep: 'planning_context',
  simulationInputs: { ...DEFAULT_SIMULATION_INPUTS },
  subFunctions: [],
  currentSubFunctionIndex: 0,
  scenarios: [],
  selectedScenario: null,
  isCalculated: false,
};

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [monteCarloInputs, setMonteCarloInputs] = useState<MonteCarloInputs>(DEFAULT_MONTE_CARLO_INPUTS);
  const [synchronizedResults, setSynchronizedResults] = useState<Map<string, SynchronizedResults>>(new Map());
  const [duplicateSimulationId, setDuplicateSimulationId] = useState<string | null>(null);
  const [currentSimulationId, setCurrentSimulationId] = useState<string | null>(null);

  const goToStep = (step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    const currentIndex = getStepIndex(state.currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      const nextStep = WIZARD_STEPS[currentIndex + 1].id;
      setState(prev => ({ ...prev, currentStep: nextStep }));
    }
  };

  const previousStep = () => {
    const currentIndex = getStepIndex(state.currentStep);
    if (currentIndex > 0) {
      const prevStep = WIZARD_STEPS[currentIndex - 1].id;
      setState(prev => ({ ...prev, currentStep: prevStep }));
    }
  };

  const canGoNext = () => {
    const currentIndex = getStepIndex(state.currentStep);
    return currentIndex < WIZARD_STEPS.length - 1;
  };

  const canGoPrevious = () => {
    const currentIndex = getStepIndex(state.currentStep);
    return currentIndex > 0;
  };

  const updateSimulationInputs = (inputs: Partial<SimulationInputs>) => {
    setState(prev => ({
      ...prev,
      simulationInputs: { ...prev.simulationInputs, ...inputs },
    }));
  };

  const updateSubFunctions = (subFunctions: SubFunction[]) => {
    setState(prev => ({ ...prev, subFunctions }));
  };

  const addSubFunction = (subFunction: SubFunction) => {
    setState(prev => ({
      ...prev,
      subFunctions: [...prev.subFunctions, subFunction],
    }));
  };

  const removeSubFunction = (id: string) => {
    setState(prev => ({
      ...prev,
      subFunctions: prev.subFunctions.filter(sf => sf.id !== id),
    }));
  };

  const updateSubFunction = (id: string, updates: Partial<SubFunction>) => {
    setState(prev => ({
      ...prev,
      subFunctions: prev.subFunctions.map(sf =>
        sf.id === id ? { ...sf, ...updates } : sf
      ),
    }));
  };

  const setCurrentSubFunctionIndex = (index: number) => {
    setState(prev => ({ ...prev, currentSubFunctionIndex: index }));
  };

  const setScenarios = (scenarios: ScenarioResult[]) => {
    setState(prev => ({ ...prev, scenarios }));
  };

  const setSelectedScenario = (scenario: ScenarioResult | null) => {
    setState(prev => ({ ...prev, selectedScenario: scenario }));
  };

  const setCalculated = (calculated: boolean) => {
    setState(prev => ({ ...prev, isCalculated: calculated }));
  };

  const loadFromSimulation = (inputPayload: any) => {
    if (!inputPayload) return;

    const { simulationInputs, subFunctions } = inputPayload;

    if (simulationInputs) {
      setState(prev => ({
        ...prev,
        simulationInputs: { ...DEFAULT_SIMULATION_INPUTS, ...simulationInputs },
      }));
    }

    if (subFunctions && Array.isArray(subFunctions)) {
      setState(prev => ({
        ...prev,
        subFunctions,
      }));
    }
  };

  const saveSimulation = async (): Promise<CanonicalSimulation> => {
    const canonical: CanonicalSimulation = {
      id: currentSimulationId || undefined,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      context: {
        simulationName: state.simulationInputs.simulationName,
        entity: state.simulationInputs.entity || null,
        region: state.simulationInputs.region || null,
        planningType: state.simulationInputs.planningType,
        planningTypeKey: state.simulationInputs.planningTypeKey,
        scopeDriverType: state.simulationInputs.scopeDriverType || null,
        scopeDriverValue: state.simulationInputs.scopeDriverValue || null,
        autoSizeEnabled: state.simulationInputs.autoSizeEnabled,
        operationSize: state.simulationInputs.operationSize,
        sizeOfOperationKey: state.simulationInputs.sizeOfOperationKey,
        contextNotes: state.simulationInputs.contextNotes || null,
        contextObjectives: state.simulationInputs.contextObjectives || null,
      },
      setup: {
        functionType: state.simulationInputs.functionType,
        isCustomFunction: state.simulationInputs.isCustomFunction,
        customFunctionName: state.simulationInputs.customFunctionName || null,
      },
      workload: {
        natureOfWork: state.simulationInputs.natureOfWork,
        projectLength: state.simulationInputs.projectLength || null,
        totalProjectValue: state.simulationInputs.totalProjectValue || null,
        workloadLevel: state.simulationInputs.workloadLevel,
        complexityLevel: state.simulationInputs.complexityLevel,
        serviceLevel: state.simulationInputs.serviceLevel,
        complianceIntensity: state.simulationInputs.complianceIntensity,
        automationPotential: state.simulationInputs.automationPotential,
        outsourcingLevel: state.simulationInputs.outsourcingLevel,
        expectedGrowth: state.simulationInputs.expectedGrowth || null,
        digitalMaturity: state.simulationInputs.digitalMaturity,
        existingHeadcount: state.simulationInputs.existingHeadcount || null,
        currentMonthlyCost: state.simulationInputs.currentMonthlyCost || null,
        restructuringGoal: state.simulationInputs.restructuringGoal || null,
        targetSavings: state.simulationInputs.targetSavings || null,
      },
      operatingModel: {
        workforceMix: state.simulationInputs.workforceMix,
      },
      results: state.scenarios.length > 0 ? {
        engineVersion: CURRENT_ENGINE_VERSION,
        scenarios: state.scenarios,
        selectedScenario: state.selectedScenario || undefined,
        calculatedAt: new Date().toISOString(),
      } : undefined,
      selectedScenarioType: state.selectedScenario?.type || null,
    };

    const saved = await persistenceService.saveSimulation(canonical);
    setCurrentSimulationId(saved.id || null);
    return saved;
  };

  const loadSimulationById = async (simulationId: string): Promise<boolean> => {
    try {
      const canonical = await persistenceService.loadSimulation(simulationId);
      if (!canonical) return false;

      const legacyInputs = canonicalToLegacy(canonical);

      setState(prev => ({
        ...prev,
        simulationInputs: legacyInputs,
        scenarios: canonical.results?.scenarios || [],
        selectedScenario: canonical.results?.selectedScenario || null,
        isCalculated: !!canonical.results,
      }));

      setCurrentSimulationId(canonical.id || null);
      return true;
    } catch (error) {
      console.error('Error loading simulation:', error);
      return false;
    }
  };

  const reset = () => {
    setState(INITIAL_STATE);
    setSynchronizedResults(new Map());
    setMonteCarloInputs(DEFAULT_MONTE_CARLO_INPUTS);
    setDuplicateSimulationId(null);
    setCurrentSimulationId(null);
  };

  return (
    <WizardContext.Provider
      value={{
        state,
        goToStep,
        nextStep,
        previousStep,
        canGoNext,
        canGoPrevious,
        updateSimulationInputs,
        updateSubFunctions,
        addSubFunction,
        removeSubFunction,
        updateSubFunction,
        setCurrentSubFunctionIndex,
        setScenarios,
        setSelectedScenario,
        setCalculated,
        monteCarloInputs,
        setMonteCarloInputs,
        synchronizedResults,
        setSynchronizedResults,
        loadFromSimulation,
        saveSimulation,
        loadSimulationById,
        currentSimulationId,
        setCurrentSimulationId,
        reset,
        duplicateSimulationId,
        setDuplicateSimulationId,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
}
