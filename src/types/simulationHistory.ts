export interface SimulationHistory {
  id: string;
  user_id: string;
  simulation_id: string;
  simulation_name: string;
  business_area: string | null;
  planning_type: string | null;
  size_of_operation: string | null;
  workload_score: number;
  total_fte: number;
  total_monthly_cost: number;
  input_payload: any;
  result_payload: any;
  created_at: string;
  updated_at?: string;
  parent_simulation_id?: string | null;
  duplication_note?: string | null;
  scenario_label?: string | null;
  user_email?: string;
  user_name?: string;
  parent_simulation_name?: string;
}

export interface SimulationHistoryFilters {
  search?: string;
  planning_type?: string;
  size_of_operation?: string;
  date_from?: string;
  date_to?: string;
  user_id?: string;
}

export type SortField = 'created_at' | 'workload_score' | 'total_fte' | 'total_monthly_cost';
export type SortOrder = 'asc' | 'desc';
