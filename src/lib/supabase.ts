import { createClient } from '@supabase/supabase-js';
import { SubFunction } from '../types/subfunction';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SimulationRecord {
  id?: string;
  user_id?: string | null;
  simulation_name: string;
  inputs: any;
  scenarios: any;
  selected_scenario_type: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SubFunctionRecord {
  id?: string;
  simulation_id: string;
  name: string;
  description?: string | null;
  current_headcount?: number | null;
  current_monthly_cost?: number | null;
  workload_drivers: any;
  complexity: string;
  service_level: string;
  operating_model: any;
  recommended_fte?: any | null;
  gap?: number | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export async function saveSimulation(data: SimulationRecord) {
  const { data: result, error } = await supabase
    .from('simulations')
    .insert([data])
    .select()
    .maybeSingle();

  if (error) throw error;
  return result;
}

export async function updateSimulation(id: string, data: Partial<SimulationRecord>) {
  const { data: result, error } = await supabase
    .from('simulations')
    .update(data)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return result;
}

export async function getSimulations(limit = 50) {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getSimulation(id: string) {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteSimulation(id: string) {
  const { error } = await supabase
    .from('simulations')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function saveSubFunctions(simulationId: string, subFunctions: SubFunction[]) {
  await supabase
    .from('sub_functions')
    .delete()
    .eq('simulation_id', simulationId);

  if (subFunctions.length === 0) return [];

  const records: SubFunctionRecord[] = subFunctions.map(sf => ({
    simulation_id: simulationId,
    name: sf.name,
    description: sf.description || null,
    current_headcount: sf.currentHeadcount || null,
    current_monthly_cost: sf.currentMonthlyCost || null,
    workload_drivers: sf.workloadDrivers,
    complexity: sf.complexity,
    service_level: sf.serviceLevel,
    operating_model: sf.operatingModel,
    recommended_fte: sf.recommendedFTE || null,
    gap: sf.gap || null,
    status: sf.status,
  }));

  const { data, error } = await supabase
    .from('sub_functions')
    .insert(records)
    .select();

  if (error) throw error;
  return data;
}

export async function getSubFunctions(simulationId: string): Promise<SubFunction[]> {
  const { data, error } = await supabase
    .from('sub_functions')
    .select('*')
    .eq('simulation_id', simulationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return data.map((record): SubFunction => ({
    id: record.id || crypto.randomUUID(),
    name: record.name,
    description: record.description || undefined,
    currentHeadcount: record.current_headcount || undefined,
    currentMonthlyCost: record.current_monthly_cost || undefined,
    workloadDrivers: record.workload_drivers,
    complexity: record.complexity as any,
    serviceLevel: record.service_level as any,
    operatingModel: record.operating_model,
    recommendedFTE: record.recommended_fte || undefined,
    gap: record.gap || undefined,
    status: record.status as any,
  }));
}
