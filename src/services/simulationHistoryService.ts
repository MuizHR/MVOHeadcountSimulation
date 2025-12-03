import { supabase } from '../lib/supabase';
import { SimulationHistory, SimulationHistoryFilters, SortField, SortOrder } from '../types/simulationHistory';

export const simulationHistoryService = {
  async getUserSimulations(
    userId: string,
    filters?: SimulationHistoryFilters,
    sortField: SortField = 'created_at',
    sortOrder: SortOrder = 'desc'
  ): Promise<SimulationHistory[]> {
    let query = supabase
      .from('simulation_history')
      .select('*')
      .eq('user_id', userId);

    if (filters?.search) {
      query = query.or(`simulation_name.ilike.%${filters.search}%,business_area.ilike.%${filters.search}%`);
    }

    if (filters?.planning_type) {
      query = query.eq('planning_type', filters.planning_type);
    }

    if (filters?.size_of_operation) {
      query = query.eq('size_of_operation', filters.size_of_operation);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    const { data, error } = await query;

    if (error) throw error;

    const simulations = data || [];

    const parentIds = simulations
      .filter(s => s.parent_simulation_id)
      .map(s => s.parent_simulation_id);

    if (parentIds.length > 0) {
      const { data: parents } = await supabase
        .from('simulation_history')
        .select('id, simulation_name')
        .in('id', parentIds);

      const parentMap = new Map((parents || []).map(p => [p.id, p.simulation_name]));

      return simulations.map(sim => ({
        ...sim,
        parent_simulation_name: sim.parent_simulation_id
          ? parentMap.get(sim.parent_simulation_id) || '[Unavailable]'
          : undefined
      }));
    }

    return simulations;
  },

  async getAllSimulations(
    filters?: SimulationHistoryFilters,
    sortField: SortField = 'created_at',
    sortOrder: SortOrder = 'desc'
  ): Promise<SimulationHistory[]> {
    try {
      let query = supabase
        .from('simulation_history')
        .select('*');

      if (filters?.search) {
        query = query.or(`simulation_name.ilike.%${filters.search}%,business_area.ilike.%${filters.search}%`);
      }

      if (filters?.planning_type) {
        query = query.eq('planning_type', filters.planning_type);
      }

      if (filters?.size_of_operation) {
        query = query.eq('size_of_operation', filters.size_of_operation);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      query = query.order(sortField, { ascending: sortOrder === 'asc' });

      const { data: simulations, error: simError } = await query;

      if (simError) {
        console.error('Error fetching simulations:', simError);
        throw simError;
      }

      console.log('Raw simulations fetched:', simulations?.length || 0);

      if (!simulations || simulations.length === 0) {
        return [];
      }

      const userIds = [...new Set(simulations.map(s => s.user_id))];

      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
      }

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const parentIds = simulations
        .filter(s => s.parent_simulation_id)
        .map(s => s.parent_simulation_id);

      let parentMap = new Map();
      if (parentIds.length > 0) {
        const { data: parents } = await supabase
          .from('simulation_history')
          .select('id, simulation_name')
          .in('id', parentIds);

        parentMap = new Map((parents || []).map(p => [p.id, p.simulation_name]));
      }

      return simulations.map((sim: any) => {
        const profile = profileMap.get(sim.user_id);
        return {
          ...sim,
          user_email: profile?.email,
          user_name: profile?.full_name,
          parent_simulation_name: sim.parent_simulation_id
            ? parentMap.get(sim.parent_simulation_id) || '[Unavailable]'
            : undefined
        };
      });
    } catch (error) {
      console.error('getAllSimulations error:', error);
      throw error;
    }
  },

  async getSimulationById(id: string): Promise<SimulationHistory | null> {
    const { data, error } = await supabase
      .from('simulation_history')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', data.user_id)
      .maybeSingle();

    let parentSimulationName;
    if (data.parent_simulation_id) {
      const { data: parent } = await supabase
        .from('simulation_history')
        .select('simulation_name')
        .eq('id', data.parent_simulation_id)
        .maybeSingle();
      parentSimulationName = parent?.simulation_name;
    }

    return {
      ...data,
      user_email: profile?.email,
      user_name: profile?.full_name,
      parent_simulation_name: parentSimulationName
    };
  },

  async saveSimulation(simulation: Omit<SimulationHistory, 'id' | 'created_at'>): Promise<SimulationHistory> {
    const { data, error } = await supabase
      .from('simulation_history')
      .insert(simulation)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSimulation(
    id: string,
    updates: {
      simulation_name?: string;
      business_area?: string;
      planning_type?: string;
      size_of_operation?: string;
      workload_score?: number;
      total_fte?: number;
      total_monthly_cost?: number;
      input_payload?: any;
      result_payload?: any;
    }
  ): Promise<SimulationHistory> {
    const { data, error } = await supabase
      .from('simulation_history')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSimulation(id: string): Promise<void> {
    const { error } = await supabase
      .from('simulation_history')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async duplicateSimulation(
    originalId: string,
    userId: string,
    options: {
      newName: string;
      scenarioLabel?: string;
      duplicationNote?: string;
    }
  ): Promise<SimulationHistory> {
    const original = await this.getSimulationById(originalId);

    if (!original) {
      throw new Error('Original simulation not found');
    }

    const now = new Date().toISOString();

    const newSimulation = {
      user_id: userId,
      simulation_id: `SIM-${Date.now().toString().slice(-8)}`,
      simulation_name: options.newName,
      business_area: original.business_area,
      planning_type: original.planning_type,
      size_of_operation: original.size_of_operation,
      workload_score: 0,
      total_fte: 0,
      total_monthly_cost: 0,
      input_payload: original.input_payload,
      result_payload: null,
      parent_simulation_id: original.id,
      scenario_label: options.scenarioLabel || null,
      duplication_note: options.duplicationNote || null,
      created_at: now,
      updated_at: now
    };

    const { data, error } = await supabase
      .from('simulation_history')
      .insert(newSimulation)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
