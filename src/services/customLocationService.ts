import { supabase } from '../lib/supabase';
import type { Region, Country } from '../config/countries';

export interface CustomLocation {
  id: string;
  userId: string;
  countryName: string;
  region: Region;
  createdAt: string;
  updatedAt: string;
}

export const customLocationService = {
  async getUserCustomLocations(userId: string): Promise<CustomLocation[]> {
    try {
      const { data, error } = await supabase
        .from('user_custom_locations')
        .select('*')
        .eq('user_id', userId)
        .order('country_name');

      if (error) {
        console.error('Error loading custom locations:', error);
        return this.getLocalStorageCustomLocations(userId);
      }

      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        countryName: row.country_name,
        region: row.region as Region,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error with Supabase, using localStorage:', error);
      return this.getLocalStorageCustomLocations(userId);
    }
  },

  async saveCustomLocation(
    userId: string,
    countryName: string,
    region: Region
  ): Promise<CustomLocation | null> {
    try {
      const { data, error } = await supabase
        .from('user_custom_locations')
        .insert([
          {
            user_id: userId,
            country_name: countryName,
            region: region,
          },
        ])
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === '23505') {
          await this.updateCustomLocation(userId, countryName, region);
          return null;
        }
        console.error('Error saving custom location:', error);
        this.saveToLocalStorage(userId, countryName, region);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        countryName: data.country_name,
        region: data.region as Region,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error with Supabase, using localStorage:', error);
      this.saveToLocalStorage(userId, countryName, region);
      return null;
    }
  },

  async updateCustomLocation(
    userId: string,
    countryName: string,
    region: Region
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_custom_locations')
        .update({ region: region })
        .eq('user_id', userId)
        .eq('country_name', countryName);

      if (error) {
        console.error('Error updating custom location:', error);
        this.saveToLocalStorage(userId, countryName, region);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error with Supabase, using localStorage:', error);
      this.saveToLocalStorage(userId, countryName, region);
      return false;
    }
  },

  getLocalStorageCustomLocations(userId: string): CustomLocation[] {
    try {
      const key = `custom_locations_${userId}`;
      const stored = localStorage.getItem(key);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveToLocalStorage(userId: string, countryName: string, region: Region): void {
    try {
      const key = `custom_locations_${userId}`;
      const existing = this.getLocalStorageCustomLocations(userId);

      const index = existing.findIndex(c => c.countryName === countryName);
      const location: CustomLocation = {
        id: crypto.randomUUID(),
        userId,
        countryName,
        region,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (index !== -1) {
        existing[index] = location;
      } else {
        existing.push(location);
      }

      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  async getUserCountriesAsOptions(userId: string, masterList: Country[]): Promise<Country[]> {
    const customLocations = await this.getUserCustomLocations(userId);
    const customAsCountries: Country[] = customLocations.map(c => ({
      name: c.countryName,
      code: '',
      region: c.region,
    }));

    return [...masterList, ...customAsCountries];
  },
};
