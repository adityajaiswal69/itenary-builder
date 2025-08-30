// Utility functions for persisting package data in localStorage

export interface PackageFormData {
  title: string;
  start_location: string;
  valid_till: string;
  description: string;
  price: string;
  price_type: 'per_person' | 'total';
  people: string;
  currency: string;
  is_published: boolean;
  locations: string[];
  inclusions: string[];
  exclusions: string[];
}

const PACKAGE_STORAGE_KEY = 'package_form_data';

export const packageStorage = {
  // Save package form data to localStorage
  save: (data: Partial<PackageFormData>): void => {
    try {
      const existing = packageStorage.load();
      const merged = { ...existing, ...data };
      localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(merged));
    } catch (error) {
      console.error('Failed to save package data to localStorage:', error);
    }
  },

  // Load package form data from localStorage
  load: (): Partial<PackageFormData> => {
    try {
      const stored = localStorage.getItem(PACKAGE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load package data from localStorage:', error);
    }
    return {};
  },

  // Clear package form data from localStorage
  clear: (): void => {
    try {
      localStorage.removeItem(PACKAGE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear package data from localStorage:', error);
    }
  },

  // Check if there's saved package data
  hasSavedData: (): boolean => {
    try {
      const stored = localStorage.getItem(PACKAGE_STORAGE_KEY);
      return stored !== null && stored !== undefined;
    } catch (error) {
      console.error('Failed to check saved package data:', error);
      return false;
    }
  },

  // Save only specific fields (useful for real-time saving)
  saveField: (field: keyof PackageFormData, value: any): void => {
    try {
      const existing = packageStorage.load();
      const updated = { ...existing, [field]: value };
      localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save package field to localStorage:', error);
    }
  },

  // Clear localStorage when package is successfully created in backend
  clearOnPackageCreated: (): void => {
    try {
      console.log('Clearing package localStorage after successful backend creation');
      localStorage.removeItem(PACKAGE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear package data from localStorage:', error);
    }
  }
};
