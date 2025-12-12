import { supabase } from '../lib/supabase';
import type { CanonicalSimulation } from '../types/canonicalSimulation';
import { migrateSimulation } from '../utils/simulationMigration';
import { CURRENT_SCHEMA_VERSION, CURRENT_ENGINE_VERSION } from '../types/canonicalSimulation';

export interface SimulationFilters {
  entity?: string;
  planningType?: string;
  operationSize?: string;
  searchText?: string;
}

export interface PersistenceAdapter {
  saveSimulation(simulation: CanonicalSimulation): Promise<CanonicalSimulation>;
  loadSimulation(simulationId: string): Promise<CanonicalSimulation | null>;
  listSimulations(filters?: SimulationFilters): Promise<CanonicalSimulation[]>;
  duplicateSimulation(simulationId: string, newName?: string): Promise<CanonicalSimulation>;
  deleteSimulation(simulationId: string): Promise<void>;
}

class SupabasePersistenceAdapter implements PersistenceAdapter {
  async saveSimulation(simulation: CanonicalSimulation): Promise<CanonicalSimulation> {
    const isUpdate = !!simulation.id;

    const record: any = {
      simulation_name: simulation.context.simulationName,
      inputs: {
        ...simulation.context,
        ...simulation.setup,
        ...simulation.workload,
        ...simulation.operatingModel,
      },
      scenarios: simulation.results?.scenarios || [],
      selected_scenario_type: simulation.selectedScenarioType,
      schema_version: simulation.schemaVersion || CURRENT_SCHEMA_VERSION,
      engine_version: simulation.results?.engineVersion || CURRENT_ENGINE_VERSION,
    };

    if (simulation.userId) {
      record.user_id = simulation.userId;
    }

    let result;
    if (isUpdate) {
      const { data, error } = await supabase
        .from('simulations')
        .update(record)
        .eq('id', simulation.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('simulations')
        .insert([record])
        .select()
        .maybeSingle();

      if (error) throw error;
      result = data;
    }

    if (!result) {
      throw new Error('Failed to save simulation');
    }

    return migrateSimulation(result);
  }

  async loadSimulation(simulationId: string): Promise<CanonicalSimulation | null> {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('id', simulationId)
      .maybeSingle();

    if (error) {
      console.error('Error loading simulation:', error);
      return null;
    }

    if (!data) return null;

    return migrateSimulation(data);
  }

  async listSimulations(filters?: SimulationFilters): Promise<CanonicalSimulation[]> {
    let query = supabase.from('simulations').select('*').order('created_at', { ascending: false });

    if (filters?.searchText) {
      query = query.ilike('simulation_name', `%${filters.searchText}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing simulations:', error);
      return [];
    }

    if (!data) return [];

    const migratedSimulations = data.map((raw) => migrateSimulation(raw));

    let filtered = migratedSimulations;

    if (filters?.entity) {
      filtered = filtered.filter((sim) => sim.context.entity === filters.entity);
    }

    if (filters?.planningType) {
      filtered = filtered.filter((sim) => sim.context.planningType === filters.planningType);
    }

    if (filters?.operationSize) {
      filtered = filtered.filter((sim) => sim.context.operationSize === filters.operationSize);
    }

    return filtered;
  }

  async duplicateSimulation(simulationId: string, newName?: string): Promise<CanonicalSimulation> {
    const original = await this.loadSimulation(simulationId);
    if (!original) {
      throw new Error('Simulation not found');
    }

    const duplicate: CanonicalSimulation = {
      ...original,
      id: undefined,
      context: {
        ...original.context,
        simulationName: newName || `${original.context.simulationName} (Copy)`,
      },
      createdAt: undefined,
      updatedAt: undefined,
    };

    return this.saveSimulation(duplicate);
  }

  async deleteSimulation(simulationId: string): Promise<void> {
    const { error } = await supabase.from('simulations').delete().eq('id', simulationId);

    if (error) {
      throw error;
    }
  }
}

class LocalStoragePersistenceAdapter implements PersistenceAdapter {
  private storageKey = 'mvo_simulations';

  private getAllSimulations(): CanonicalSimulation[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];

    try {
      const raw = JSON.parse(stored);
      return raw.map((item: any) => migrateSimulation(item));
    } catch (error) {
      console.error('Error parsing local simulations:', error);
      return [];
    }
  }

  private saveAllSimulations(simulations: CanonicalSimulation[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(simulations));
  }

  async saveSimulation(simulation: CanonicalSimulation): Promise<CanonicalSimulation> {
    const simulations = this.getAllSimulations();
    const isUpdate = !!simulation.id;

    const saved: CanonicalSimulation = {
      ...simulation,
      id: simulation.id || crypto.randomUUID(),
      schemaVersion: simulation.schemaVersion || CURRENT_SCHEMA_VERSION,
      updatedAt: new Date().toISOString(),
      createdAt: simulation.createdAt || new Date().toISOString(),
    };

    if (isUpdate) {
      const index = simulations.findIndex((s) => s.id === simulation.id);
      if (index !== -1) {
        simulations[index] = saved;
      } else {
        simulations.push(saved);
      }
    } else {
      simulations.push(saved);
    }

    this.saveAllSimulations(simulations);
    return saved;
  }

  async loadSimulation(simulationId: string): Promise<CanonicalSimulation | null> {
    const simulations = this.getAllSimulations();
    return simulations.find((s) => s.id === simulationId) || null;
  }

  async listSimulations(filters?: SimulationFilters): Promise<CanonicalSimulation[]> {
    let simulations = this.getAllSimulations();

    if (filters?.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      simulations = simulations.filter((sim) =>
        sim.context.simulationName.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.entity) {
      simulations = simulations.filter((sim) => sim.context.entity === filters.entity);
    }

    if (filters?.planningType) {
      simulations = simulations.filter((sim) => sim.context.planningType === filters.planningType);
    }

    if (filters?.operationSize) {
      simulations = simulations.filter((sim) => sim.context.operationSize === filters.operationSize);
    }

    simulations.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return simulations;
  }

  async duplicateSimulation(simulationId: string, newName?: string): Promise<CanonicalSimulation> {
    const original = await this.loadSimulation(simulationId);
    if (!original) {
      throw new Error('Simulation not found');
    }

    const duplicate: CanonicalSimulation = {
      ...original,
      id: crypto.randomUUID(),
      context: {
        ...original.context,
        simulationName: newName || `${original.context.simulationName} (Copy)`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveSimulation(duplicate);
  }

  async deleteSimulation(simulationId: string): Promise<void> {
    const simulations = this.getAllSimulations();
    const filtered = simulations.filter((s) => s.id !== simulationId);
    this.saveAllSimulations(filtered);
  }
}

let adapter: PersistenceAdapter | null = null;

async function getAdapter(): Promise<PersistenceAdapter> {
  if (adapter) return adapter;

  try {
    const { data, error } = await supabase.from('simulations').select('id').limit(1);

    if (!error) {
      adapter = new SupabasePersistenceAdapter();
      console.log('Using Supabase persistence adapter');
      return adapter;
    }
  } catch (error) {
    console.warn('Supabase not available, falling back to localStorage');
  }

  adapter = new LocalStoragePersistenceAdapter();
  console.log('Using LocalStorage persistence adapter');
  return adapter;
}

export const persistenceService = {
  async saveSimulation(simulation: CanonicalSimulation): Promise<CanonicalSimulation> {
    const adapter = await getAdapter();
    return adapter.saveSimulation(simulation);
  },

  async loadSimulation(simulationId: string): Promise<CanonicalSimulation | null> {
    const adapter = await getAdapter();
    return adapter.loadSimulation(simulationId);
  },

  async listSimulations(filters?: SimulationFilters): Promise<CanonicalSimulation[]> {
    const adapter = await getAdapter();
    return adapter.listSimulations(filters);
  },

  async duplicateSimulation(simulationId: string, newName?: string): Promise<CanonicalSimulation> {
    const adapter = await getAdapter();
    return adapter.duplicateSimulation(simulationId, newName);
  },

  async deleteSimulation(simulationId: string): Promise<void> {
    const adapter = await getAdapter();
    return adapter.deleteSimulation(simulationId);
  },
};
