import { supabase } from '../lib/supabase';
import type { BusinessPillar, Company } from '../config/companies';

export interface CustomCompany {
  id: string;
  userId: string;
  companyName: string;
  businessPillar: BusinessPillar;
  createdAt: string;
  updatedAt: string;
}

export const customCompanyService = {
  async getUserCustomCompanies(userId: string): Promise<CustomCompany[]> {
    try {
      const { data, error } = await supabase
        .from('custom_companies')
        .select('*')
        .eq('user_id', userId)
        .order('company_name');

      if (error) {
        console.error('Error loading custom companies:', error);
        return this.getLocalStorageCustomCompanies(userId);
      }

      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        companyName: row.company_name,
        businessPillar: row.business_pillar,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error with Supabase, using localStorage:', error);
      return this.getLocalStorageCustomCompanies(userId);
    }
  },

  async saveCustomCompany(
    userId: string,
    companyName: string,
    businessPillar: BusinessPillar
  ): Promise<CustomCompany | null> {
    try {
      const { data, error } = await supabase
        .from('custom_companies')
        .insert([
          {
            user_id: userId,
            company_name: companyName,
            business_pillar: businessPillar,
          },
        ])
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === '23505') {
          await this.updateCustomCompany(userId, companyName, businessPillar);
          return null;
        }
        console.error('Error saving custom company:', error);
        this.saveToLocalStorage(userId, companyName, businessPillar);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        companyName: data.company_name,
        businessPillar: data.business_pillar,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error with Supabase, using localStorage:', error);
      this.saveToLocalStorage(userId, companyName, businessPillar);
      return null;
    }
  },

  async updateCustomCompany(
    userId: string,
    companyName: string,
    businessPillar: BusinessPillar
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('custom_companies')
        .update({ business_pillar: businessPillar })
        .eq('user_id', userId)
        .eq('company_name', companyName);

      if (error) {
        console.error('Error updating custom company:', error);
        this.saveToLocalStorage(userId, companyName, businessPillar);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error with Supabase, using localStorage:', error);
      this.saveToLocalStorage(userId, companyName, businessPillar);
      return false;
    }
  },

  getLocalStorageCustomCompanies(userId: string): CustomCompany[] {
    try {
      const key = `custom_companies_${userId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveToLocalStorage(userId: string, companyName: string, businessPillar: BusinessPillar): void {
    try {
      const key = `custom_companies_${userId}`;
      const existing = this.getLocalStorageCustomCompanies(userId);

      const index = existing.findIndex(c => c.companyName === companyName);
      const company: CustomCompany = {
        id: crypto.randomUUID(),
        userId,
        companyName,
        businessPillar,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (index !== -1) {
        existing[index] = company;
      } else {
        existing.push(company);
      }

      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  getUserCompaniesAsOptions(userId: string, masterList: Company[]): Promise<Company[]> {
    return this.getUserCustomCompanies(userId).then(customCompanies => {
      const customAsCompanies: Company[] = customCompanies.map(c => ({
        name: c.companyName,
        pillar: c.businessPillar,
      }));

      return [...masterList, ...customAsCompanies];
    });
  },
};
