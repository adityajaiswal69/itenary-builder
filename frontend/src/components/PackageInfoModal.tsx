import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Plus } from 'lucide-react';
import type { Package } from '../services/api';
import { RichTextEditor } from './RichTextEditor';
import { ErrorBoundary } from './ErrorBoundary';

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
    currency: '₹ (INR)',
    is_published: false,
    locations: [] as string[],
    inclusions: [] as string[],
    exclusions: [] as string[],
  });

  const [newLocation, setNewLocation] = useState('');
  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  useEffect(() => {
    if (pkg) {
      setFormData({
        title: pkg.title,
        start_location: pkg.start_location,
        valid_till: pkg.valid_till.split('T')[0], // Convert to date format
        description: Array.isArray(pkg.description) ? pkg.description[0]?.content || '' : pkg.description,
        price: pkg.price.toString(),
        price_type: pkg.price_type,
        currency: '₹ (INR)',
        is_published: pkg.is_published,
        locations: pkg.locations || [],
        inclusions: pkg.inclusions || [],
        exclusions: pkg.exclusions || [],
      });
    } else {
      // Initialize with empty data for new package
      setFormData({
        title: tripTitle || '',
        start_location: '',
        valid_till: new Date().toISOString().split('T')[0],
        description: '',
        price: '',
        price_type: 'per_person',
        currency: '₹ (INR)',
        is_published: false,
        locations: [],
        inclusions: [],
        exclusions: [],
      });
    }
  }, [pkg]);

  const addLocation = () => {
    if (newLocation.trim() && !formData.locations.includes(newLocation.trim())) {
      setFormData({
        ...formData,
        locations: [...formData.locations, newLocation.trim()]
      });
      setNewLocation('');
    }
  };

  const removeLocation = (location: string) => {
    setFormData({
      ...formData,
      locations: formData.locations.filter(l => l !== location)
    });
  };

  const addInclusion = () => {
    if (newInclusion.trim() && !formData.inclusions.includes(newInclusion.trim())) {
      setFormData({
        ...formData,
        inclusions: [...formData.inclusions, newInclusion.trim()]
      });
      setNewInclusion('');
    }
  };

  const removeInclusion = (inclusion: string) => {
    setFormData({
      ...formData,
      inclusions: formData.inclusions.filter(i => i !== inclusion)
    });
  };

  const addExclusion = () => {
    if (newExclusion.trim() && !formData.exclusions.includes(newExclusion.trim())) {
      setFormData({
        ...formData,
        exclusions: [...formData.exclusions, newExclusion.trim()]
      });
      setNewExclusion('');
    }
  };

  const removeExclusion = (exclusion: string) => {
    setFormData({
      ...formData,
      exclusions: formData.exclusions.filter(e => e !== exclusion)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      start_location: formData.start_location,
      valid_till: formData.valid_till,
      description: [{ content: formData.description }],
      price: parseInt(formData.price),
      price_type: formData.price_type,
      locations: formData.locations,
      inclusions: formData.inclusions,
      exclusions: formData.exclusions,
      is_published: formData.is_published,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Package Info</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
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
                  onChange={() => setFormData({ ...formData, is_published: false })}
                />
                <span>Unpublished</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={formData.is_published}
                  onChange={() => setFormData({ ...formData, is_published: true })}
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, valid_till: e.target.value })}
              required
            />
          </div>

          {/* Package Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Package Description</label>
            <ErrorBoundary>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
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
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Enter price"
                required
                className="flex-1"
              />
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="px-3 py-2 border rounded-md"
              >
                <option value="₹ (INR)">₹ (INR)</option>
                <option value="$ (USD)">$ (USD)</option>
                <option value="€ (EUR)">€ (EUR)</option>
              </select>
            </div>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="price_type"
                  checked={formData.price_type === 'per_person'}
                  onChange={() => setFormData({ ...formData, price_type: 'per_person' })}
                />
                <span>Per Person</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="price_type"
                  checked={formData.price_type === 'total'}
                  onChange={() => setFormData({ ...formData, price_type: 'total' })}
                />
                <span>Total</span>
              </label>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add location"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
              />
              <Button type="button" onClick={addLocation} variant="outline">
                <Plus className="h-4 w-4" />
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
            <label className="block text-sm font-medium mb-2">Inclusion</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                placeholder="Add inclusion"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInclusion())}
              />
              <Button type="button" onClick={addInclusion} variant="outline">
                <Plus className="h-4 w-4" />
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
            <label className="block text-sm font-medium mb-2">Exclusion</label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                placeholder="Add exclusion"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExclusion())}
              />
              <Button type="button" onClick={addExclusion} variant="outline">
                <Plus className="h-4 w-4" />
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
