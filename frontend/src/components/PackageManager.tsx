import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Save, Trash2, Package, MapPin, Calendar, DollarSign } from 'lucide-react';
import { packageApi } from '../services/api';
import type { Package } from '../services/api';

interface PackageManagerProps {
  itineraryId: string;
  packages: Package[];
  onPackagesUpdate: () => void;
}

export const PackageManager: React.FC<PackageManagerProps> = ({ 
  itineraryId, 
  packages, 
  onPackagesUpdate 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    start_location: '',
    valid_till: '',
    description: '',
    price: '',
    price_type: 'per_person' as 'per_person' | 'total',
    locations: '',
    inclusions: '',
    exclusions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await packageApi.create({
        itinerary_id: itineraryId,
        title: formData.title,
        start_location: formData.start_location,
        valid_till: formData.valid_till,
        description: [{ content: formData.description }],
        price: parseInt(formData.price),
        price_type: formData.price_type,
        locations: formData.locations.split(',').map(l => l.trim()).filter(Boolean),
        inclusions: formData.inclusions.split(',').map(l => l.trim()).filter(Boolean),
        exclusions: formData.exclusions.split(',').map(l => l.trim()).filter(Boolean),
        is_published: false,
      });

      setFormData({
        title: '',
        start_location: '',
        valid_till: '',
        description: '',
        price: '',
        price_type: 'per_person',
        locations: '',
        inclusions: '',
        exclusions: '',
      });
      setShowForm(false);
      onPackagesUpdate();
    } catch (error) {
      console.error('Failed to create package:', error);
      alert('Failed to create package');
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await packageApi.delete(id);
      onPackagesUpdate();
    } catch (error) {
      console.error('Failed to delete package:', error);
      alert('Failed to delete package');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Travel Packages
          </CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4 p-4 border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Package Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter package title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Start Location</label>
                <Input
                  value={formData.start_location}
                  onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                  placeholder="Enter start location"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valid Till</label>
                <Input
                  type="date"
                  value={formData.valid_till}
                  onChange={(e) => setFormData({ ...formData, valid_till: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Enter price"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price Type</label>
                <select
                  value={formData.price_type}
                  onChange={(e) => setFormData({ ...formData, price_type: e.target.value as 'per_person' | 'total' })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="per_person">Per Person</option>
                  <option value="total">Total</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter package description"
                className="w-full p-2 border rounded-md min-h-[80px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Locations (comma-separated)</label>
                <Input
                  value={formData.locations}
                  onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                  placeholder="Location 1, Location 2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Inclusions (comma-separated)</label>
                <Input
                  value={formData.inclusions}
                  onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                  placeholder="Inclusion 1, Inclusion 2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Exclusions (comma-separated)</label>
                <Input
                  value={formData.exclusions}
                  onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                  placeholder="Exclusion 1, Exclusion 2"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Package'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {packages.map((pkg) => (
            <div key={pkg.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{pkg.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePackage(pkg.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{pkg.start_location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Valid till: {new Date(pkg.valid_till).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>
                    ${pkg.price.toLocaleString()} 
                    {pkg.price_type === 'per_person' ? ' per person' : ' total'}
                  </span>
                </div>
              </div>

              {pkg.locations && pkg.locations.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Locations:</p>
                  <div className="flex flex-wrap gap-1">
                    {pkg.locations.map((location, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Inclusions:</p>
                  <ul className="text-xs space-y-1">
                    {pkg.inclusions.map((inclusion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pkg.exclusions && pkg.exclusions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-1">Exclusions:</p>
                  <ul className="text-xs space-y-1">
                    {pkg.exclusions.map((exclusion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{exclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {packages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No packages created yet.</p>
              <p className="text-sm">Click "Add Package" to create your first travel package.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
