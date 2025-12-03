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
    let query = supabase
      .from('simulation_history')
      .select(`
        *,
        user_profiles(email, full_name)
      `);

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

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all simulations:', error);
      throw error;
    }

    console.log('Admin query returned:', data?.length || 0, 'simulations');

    return (data || []).map((item: any) => ({
      ...item,
      user_email: item.user_profiles?.email,
      user_name: item.user_profiles?.full_name
    }));
  },

  async getSimulationById(id: string): Promise<SimulationHistory | null> {
    const { data, error } = await supabase
      .from('simulation_history')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
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
