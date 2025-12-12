import { supabase } from '../lib/supabase';
import type { OperationSize, ScopeDriverType } from '../types/planningConfig';

export interface ScopeThreshold {
  id: string;
  scope_driver_type: ScopeDriverType;
  operation_size: OperationSize;
  min_value: number | null;
  max_value: number | null;
  created_at: string;
  updated_at: string;
}

export const scopeThresholdService = {
  async fetchThresholds(): Promise<ScopeThreshold[]> {
    const { data, error } = await supabase
      .from('scope_thresholds')
      .select('*')
      .order('scope_driver_type', { ascending: true })
      .order('min_value', { ascending: true });

    if (error) {
      console.error('Error fetching scope thresholds:', error);
      return this.getDefaultThresholds();
    }

    return data || this.getDefaultThresholds();
  },

  async updateThreshold(
    id: string,
    updates: Partial<Pick<ScopeThreshold, 'min_value' | 'max_value'>>
  ): Promise<ScopeThreshold | null> {
    const { data, error } = await supabase
      .from('scope_thresholds')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating scope threshold:', error);
      return null;
    }

    return data;
  },

  determineOperationSize(
    thresholds: ScopeThreshold[],
    driverType: ScopeDriverType,
    value: number
  ): OperationSize {
    const relevantThresholds = thresholds.filter(
      t => t.scope_driver_type === driverType
    );

    for (const threshold of relevantThresholds) {
      const meetsMin = threshold.min_value === null || value >= threshold.min_value;
      const meetsMax = threshold.max_value === null || value <= threshold.max_value;

      if (meetsMin && meetsMax) {
        return threshold.operation_size;
      }
    }

    return 'medium';
  },

  getDefaultThresholds(): ScopeThreshold[] {
    return [
      {
        id: '1',
        scope_driver_type: 'employees_supported',
        operation_size: 'small',
        min_value: 1,
        max_value: 300,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        scope_driver_type: 'employees_supported',
        operation_size: 'medium',
        min_value: 301,
        max_value: 1500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        scope_driver_type: 'employees_supported',
        operation_size: 'large',
        min_value: 1501,
        max_value: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '4',
        scope_driver_type: 'sites_locations',
        operation_size: 'small',
        min_value: 1,
        max_value: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '5',
        scope_driver_type: 'sites_locations',
        operation_size: 'medium',
        min_value: 6,
        max_value: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '6',
        scope_driver_type: 'sites_locations',
        operation_size: 'large',
        min_value: 31,
        max_value: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '7',
        scope_driver_type: 'projects_portfolios',
        operation_size: 'small',
        min_value: 1,
        max_value: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '8',
        scope_driver_type: 'projects_portfolios',
        operation_size: 'medium',
        min_value: 4,
        max_value: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '9',
        scope_driver_type: 'projects_portfolios',
        operation_size: 'large',
        min_value: 11,
        max_value: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  },

  getDriverDisplayName(driverType: ScopeDriverType): string {
    switch (driverType) {
      case 'employees_supported':
        return 'Employees Supported';
      case 'sites_locations':
        return 'Work Locations';
      case 'projects_portfolios':
        return 'Active Workstreams';
      default:
        return driverType;
    }
  },
};
