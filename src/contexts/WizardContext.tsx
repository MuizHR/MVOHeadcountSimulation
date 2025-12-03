import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WizardState, WizardStep, WIZARD_STEPS, getStepIndex } from '../types/wizard';
import { SimulationInputs, DEFAULT_SIMULATION_INPUTS } from '../types/simulation';
import { SubFunction } from '../types/subfunction';
import { ScenarioResult } from '../types/scenario';
import { MonteCarloInputs, DEFAULT_MONTE_CARLO_INPUTS, SynchronizedResults } from '../types/monteCarlo';

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
        subFunctions: subFunctions.map((sf: any) => ({
          id: sf.id || crypto.randomUUID(),
          name: sf.name || 'Unnamed Function',
          workTypes: sf.workTypes || {},
          currentFTE: sf.currentFTE || 0,
          template: sf.template || null,
        })),
      }));
    }
  };

  const reset = () => {
    setState(INITIAL_STATE);
    setSynchronizedResults(new Map());
    setMonteCarloInputs(DEFAULT_MONTE_CARLO_INPUTS);
    setDuplicateSimulationId(null);
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
