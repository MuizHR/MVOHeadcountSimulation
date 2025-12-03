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
    return data || [];
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

      return simulations.map((sim: any) => {
        const profile = profileMap.get(sim.user_id);
        return {
          ...sim,
          user_email: profile?.email,
          user_name: profile?.full_name
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

    return {
      ...data,
      user_email: profile?.email,
      user_name: profile?.full_name
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

  async deleteSimulation(id: string): Promise<void> {
    const { error } = await supabase
      .from('simulation_history')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
