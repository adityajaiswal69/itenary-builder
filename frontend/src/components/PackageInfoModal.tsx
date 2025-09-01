import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X } from 'lucide-react';
import type { Package } from '../services/api';
import { TipTapEditor } from './TipTapEditor';
import { ErrorBoundary } from './ErrorBoundary';
import { packageStorage } from '../lib/packageStorage';
import { LocationAutocomplete } from './LocationAutocomplete';

interface PackageInfoModalProps {
  package?: Package | null;
  tripTitle?: string;
  onClose: () => void;
  onSave: (pkg: Partial<Package>) => void;
}

export const PackageInfoModal: React.FC<PackageInfoModalProps> = ({
  package: pkg,
  tripTitle,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: '',
    start_location: '',
    valid_till: '',
    description: '',
    price: '',
    price_type: 'per_person' as 'per_person' | 'total',
    people: '',
    currency: '₹ (INR)',
    is_published: false,
    locations: [] as string[],
    inclusions: [] as string[],
    exclusions: [] as string[],
  });

  const [newLocation, setNewLocation] = useState('');
  const [selectedInclusion, setSelectedInclusion] = useState('');
  const [selectedExclusion, setSelectedExclusion] = useState('');

  // Predefined inclusion options
  const inclusionOptions = [
    'Breakfast',
    'Lunch', 
    'Dinner',
    'Air Fare',
    'Airport transfers',
    'Private Cab Transfers',
    'Volvo Transfers',
    'Sightseeing tour',
    'Accommodation',
    'Welcome Drinks',
    'Outdoor activities',
    'Early check-in & late checkout',
    'All meals',
    'Professional guide',
    'Entry tickets',
    'Travel insurance',
    'Wi-Fi access',
    'Photography services'
  ];

  // Predefined exclusion options  
  const exclusionOptions = [
    'Taxes',
    'TOLLS',
    'Personal expenses',
    'Tips and gratuities',
    'Optional activities',
    'Alcoholic beverages',
    'Laundry services',
    'Room service',
    'Medical expenses',
    'Emergency evacuation',
    'Visa fees',
    'Additional meals',
    'Shopping expenses',
    'Phone calls',
    'Spa services',
    'Adventure activities insurance'
  ];

  // Helper function to save form data to localStorage (for new packages only)
  const saveToLocalStorage = (data: typeof formData) => {
    if (!pkg) { // Only save to localStorage for new packages
      packageStorage.save(data);
    }
  };

  // Helper function to update form data and save to localStorage
  const updateFormData = (updates: Partial<typeof formData>) => {
    const updatedData = { ...formData, ...updates };
    setFormData(updatedData);
    saveToLocalStorage(updatedData);
  };

  useEffect(() => {
    if (pkg) {
      // If editing existing package, use package data
      setFormData({
        title: pkg.title,
        start_location: pkg.start_location,
        valid_till: pkg.valid_till.split('T')[0], // Convert to date format
        description: Array.isArray(pkg.description) ? pkg.description[0]?.content || '' : pkg.description,
        price: pkg.price.toString(),
        price_type: pkg.price_type,
        people: pkg.people ? pkg.people.toString() : '',
        currency: '₹ (INR)',
        is_published: pkg.is_published,
        locations: pkg.locations || [],
        inclusions: pkg.inclusions || [],
        exclusions: pkg.exclusions || [],
      });
    } else {
      // For new package, try to load from localStorage first
      const savedData = packageStorage.load();
      console.log('Loading package data from localStorage:', savedData);
      
      setFormData({
        title: savedData.title || tripTitle || '',
        start_location: savedData.start_location || '',
        valid_till: savedData.valid_till || (() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow.toISOString().split('T')[0];
        })(),
        description: savedData.description || '',
        price: savedData.price || '',
        price_type: savedData.price_type || 'per_person',
        people: savedData.people || '',
        currency: savedData.currency || '₹ (INR)',
        is_published: savedData.is_published || false,
        locations: savedData.locations || [],
        inclusions: savedData.inclusions || [],
        exclusions: savedData.exclusions || [],
      });
    }
  }, [pkg, tripTitle]);

  const addLocation = () => {
    if (newLocation.trim() && !formData.locations.includes(newLocation.trim())) {
      const updatedData = {
        ...formData,
        locations: [...formData.locations, newLocation.trim()]
      };
      setFormData(updatedData);
      saveToLocalStorage(updatedData);
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    const updatedData = {
      ...formData,
      locations: formData.locations.filter(l => l !== location)
    };
    setFormData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const addInclusion = () => {
    if (selectedInclusion && !formData.inclusions.includes(selectedInclusion)) {
      const updatedData = {
        ...formData,
        inclusions: [...formData.inclusions, selectedInclusion]
      };
      setFormData(updatedData);
      saveToLocalStorage(updatedData);
      setSelectedInclusion('');
    }
  };

  const removeInclusion = (inclusion: string) => {
    const updatedData = {
      ...formData,
      inclusions: formData.inclusions.filter(i => i !== inclusion)
    };
    setFormData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const addExclusion = () => {
    if (selectedExclusion && !formData.exclusions.includes(selectedExclusion)) {
      const updatedData = {
        ...formData,
        exclusions: [...formData.exclusions, selectedExclusion]
      };
      setFormData(updatedData);
      saveToLocalStorage(updatedData);
      setSelectedExclusion('');
    }
  };

  const removeExclusion = (exclusion: string) => {
    const updatedData = {
      ...formData,
      exclusions: formData.exclusions.filter(e => e !== exclusion)
    };
    setFormData(updatedData);
    saveToLocalStorage(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // First save to localStorage to ensure data is preserved
    saveToLocalStorage(formData);
    
    // Ensure all arrays are properly formatted for the backend
    // Backend requires arrays to not be empty, so provide default values
    const packageData = {
      title: formData.title || '',
      start_location: formData.start_location || '',
      valid_till: formData.valid_till || '',
      description: formData.description ? [{ content: formData.description }] : [{ content: '' }],
      price: parseInt(formData.price) || 0,
      price_type: formData.price_type || 'per_person',
      people: formData.people ? parseInt(formData.people) : undefined,
      locations: Array.isArray(formData.locations) && formData.locations.length > 0 
        ? formData.locations 
        : ['TBD'],
      inclusions: Array.isArray(formData.inclusions) && formData.inclusions.length > 0 
        ? formData.inclusions 
        : ['TBD'],
      exclusions: Array.isArray(formData.exclusions) && formData.exclusions.length > 0 
        ? formData.exclusions 
        : ['TBD'],
      is_published: formData.is_published || false,
    };

    console.log('Sending package data:', packageData);
    
    // Then trigger the save callback
    onSave(packageData);
    
    // Note: localStorage will only be cleared when the package is actually created in the backend
    // This happens in ItineraryBuilder after successful package creation
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Package Info</h2>
            {!pkg && packageStorage.hasSavedData() && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Draft Saved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!pkg && packageStorage.hasSavedData() && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  packageStorage.clear();
                  // Reset form to defaults
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setFormData({
                    title: tripTitle || '',
                    start_location: '',
                    valid_till: tomorrow.toISOString().split('T')[0],
                    description: '',
                    price: '',
                    price_type: 'per_person',
                    people: '',
                    currency: '₹ (INR)',
                    is_published: false,
                    locations: [],
                    inclusions: [],
                    exclusions: [],
                  });
                }}
                className="text-red-600 hover:text-red-700"
              >
                Clear Draft
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={!formData.is_published}
                  onChange={() => updateFormData({ is_published: false })}
                />
                <span>Unpublished</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={formData.is_published}
                  onChange={() => updateFormData({ is_published: true })}
                />
                <span>Published</span>
              </label>
            </div>
          </div>

          {/* Package Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Package Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              placeholder="Enter package title"
              required
            />
          </div>

          {/* Package Start From */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Package Start From (Location Name) <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.start_location}
              onChange={(e) => updateFormData({ start_location: e.target.value })}
              placeholder="Enter start location"
              required
            />
          </div>

          {/* Valid Till */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Valid Till (Date) <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.valid_till}
              onChange={(e) => updateFormData({ valid_till: e.target.value })}
              required
            />
          </div>

          {/* Package Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Package Description</label>
            <ErrorBoundary>
              <TipTapEditor
                value={formData.description}
                onChange={(value) => updateFormData({ description: value })}
                placeholder="Enter package description..."
              />
            </ErrorBoundary>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => updateFormData({ price: e.target.value })}
                placeholder="Enter price"
                required
                className="flex-1"
              />
              <select
                value={formData.currency}
                onChange={(e) => updateFormData({ currency: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="INR">₹ (INR)</option>
                    <option value="CAD">$ (CAD)</option>
                    <option value="CHF">Fr (CHF)</option>
                    <option value="EUR">€ (EUR)</option>
                    <option value="GBP">£ (GBP)</option>
                    <option value="JPY">¥ (JPY)</option>
                    <option value="MXN">$ (MXN)</option>
                    <option value="NZD">$ (NZD)</option>
                    <option value="USD">$ (USD)</option>
              </select>
            </div>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="price_type"
                  checked={formData.price_type === 'per_person'}
                  onChange={() => updateFormData({ price_type: 'per_person', people: '' })}
                />
                <span>Per Person</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="price_type"
                  checked={formData.price_type === 'total'}
                  onChange={() => updateFormData({ price_type: 'total' })}
                />
                <span>Total</span>
              </label>
            </div>
          </div>

          {/* People Count - Only show when price_type is 'total' */}
          {formData.price_type === 'total' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of People <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={formData.people}
                onChange={(e) => updateFormData({ people: e.target.value })}
                placeholder="Enter number of people"
                required={formData.price_type === 'total'}
              />
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Location
              {formData.locations.length === 0 && (
                <span className="text-xs text-gray-500 ml-2">(Will default to "TBD" if empty)</span>
              )}
            </label>
            <div className="flex gap-2 mb-2">
              <LocationAutocomplete
                value={newLocation}
                onLocationSelect={(location) => {
                  // Auto-add the selected location
                  if (location.trim() && !formData.locations.includes(location.trim())) {
                    const updatedData = {
                      ...formData,
                      locations: [...formData.locations, location.trim()]
                    };
                    setFormData(updatedData);
                    saveToLocalStorage(updatedData);
                  }
                  // Input is now cleared automatically by LocationAutocomplete component
                }}
                placeholder="Search and select a city..."
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addLocation} 
                variant="outline"
                disabled={!newLocation.trim() || formData.locations.includes(newLocation.trim())}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.locations.map((location, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1"
                >
                  {location}
                  <button
                    type="button"
                    onClick={() => removeLocation(location)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Inclusion */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Inclusion
              {formData.inclusions.length === 0 && (
                <span className="text-xs text-gray-500 ml-2">(Will default to "TBD" if empty)</span>
              )}
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedInclusion}
                onChange={(e) => setSelectedInclusion(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select an inclusion...</option>
                {inclusionOptions
                  .filter(option => !formData.inclusions.includes(option))
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
              <Button 
                type="button" 
                onClick={addInclusion} 
                variant="outline"
                disabled={!selectedInclusion}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.inclusions.map((inclusion, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1"
                >
                  {inclusion}
                  <button
                    type="button"
                    onClick={() => removeInclusion(inclusion)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Exclusion */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Exclusion
              {formData.exclusions.length === 0 && (
                <span className="text-xs text-gray-500 ml-2">(Will default to "TBD" if empty)</span>
              )}
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedExclusion}
                onChange={(e) => setSelectedExclusion(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select an exclusion...</option>
                {exclusionOptions
                  .filter(option => !formData.exclusions.includes(option))
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
              <Button 
                type="button" 
                onClick={addExclusion} 
                variant="outline"
                disabled={!selectedExclusion}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.exclusions.map((exclusion, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1"
                >
                  {exclusion}
                  <button
                    type="button"
                    onClick={() => removeExclusion(exclusion)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Accept
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
