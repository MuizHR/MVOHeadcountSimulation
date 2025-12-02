import { supabase } from '../lib/supabase';
import { SalaryBand } from '../utils/salaryCalculator';

export async function fetchAllSalaryBands(): Promise<SalaryBand[]> {
  const { data, error } = await supabase
    .from('salary_bands')
    .select('*')
    .order('employment_type', { ascending: true })
    .order('salary_min', { ascending: false });

  if (error) {
    console.error('Error fetching salary bands:', error);
    throw error;
  }

  return data || [];
}

export async function fetchSalaryBandsByEmploymentType(
  employmentType: 'Permanent' | 'GIG'
): Promise<SalaryBand[]> {
  const { data, error } = await supabase
    .from('salary_bands')
    .select('*')
    .eq('employment_type', employmentType)
    .order('salary_min', { ascending: false });

  if (error) {
    console.error('Error fetching salary bands:', error);
    throw error;
  }

  return data || [];
}

export async function fetchSalaryBandById(id: string): Promise<SalaryBand | null> {
  const { data, error } = await supabase
    .from('salary_bands')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching salary band:', error);
    throw error;
  }

  return data;
}
