import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Plus, Camera, Calendar, Utensils, Car } from 'lucide-react';
import { TipTapEditor } from './TipTapEditor';
import { ErrorBoundary } from './ErrorBoundary';

interface Event {
  id: string;
  category: 'Info' | 'Hotel' | 'Activity' | 'Flights' | 'Transport' | 'Cruise';
  subCategory?: string;
  type?: 'Check In' | 'Check Out' | 'Departure' | 'Arrival';
  title: string;
  notes: string;
  images: string[];
  isInLibrary: boolean;
  
  // Time fields
  time?: string;
  duration?: string;
  timezone?: string;
  
  // Common details
  bookedThrough?: string;
  confirmationNumber?: string;
  
  // Category-specific fields
  // Hotel fields
  roomBedType?: string;
  hotelType?: string;
  
  // Activity fields
  provider?: string;
  
  // Flight fields
  from?: string;
  to?: string;
  airlines?: string;
  terminal?: string;
  gate?: string;
  flightNumber?: string;
  
  // Transport fields
  carrier?: string;
  transportNumber?: string;
  
  // Cruise fields
  cabinType?: string;
  cabinNumber?: string;
  
  // Price
  amount?: number;
  currency?: string;
}

interface EventModalProps {
  event?: Event | null;
  onClose: () => void;
  onSave: (event: Event) => void;
  onAddToLibrary: (event: Event) => void;
}

// Category-specific form components
const CategorySpecificForm: React.FC<{
  category: string;
  formData: Omit<Event, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<Event, 'id'>>>;
}> = ({ category, formData, setFormData }) => {
  const updateField = (field: keyof Event, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderSubCategories = () => {
    switch (category) {
      case 'Activity':
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateField('subCategory', 'Activity')}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                formData.subCategory === 'Activity'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Activity
            </button>
            <button
              type="button"
              onClick={() => updateField('subCategory', 'Food/Drink')}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                formData.subCategory === 'Food/Drink'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Utensils className="h-4 w-4" />
              Food/Drink
            </button>
          </div>
        );
      case 'Transport':
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateField('subCategory', 'Train')}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                formData.subCategory === 'Train'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Car className="h-4 w-4" />
              Train
            </button>
            <button
              type="button"
              onClick={() => updateField('subCategory', 'Car Rental')}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                formData.subCategory === 'Car Rental'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Car className="h-4 w-4" />
              Car Rental
            </button>
            <button
              type="button"
              onClick={() => updateField('subCategory', 'Other')}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                formData.subCategory === 'Other'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Car className="h-4 w-4" />
              Other
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderTypeSelection = () => {
    if (category === 'Hotel') {
      return (
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="Check In"
              checked={formData.type === 'Check In'}
              onChange={(e) => updateField('type', e.target.value)}
              className="text-purple-600"
            />
            Check In
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="Check Out"
              checked={formData.type === 'Check Out'}
              onChange={(e) => updateField('type', e.target.value)}
              className="text-purple-600"
            />
            Check Out
          </label>
        </div>
      );
    } else if (['Flights', 'Transport', 'Cruise'].includes(category)) {
      return (
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="Departure"
              checked={formData.type === 'Departure'}
              onChange={(e) => updateField('type', e.target.value)}
              className="text-purple-600"
            />
            Departure
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="type"
              value="Arrival"
              checked={formData.type === 'Arrival'}
              onChange={(e) => updateField('type', e.target.value)}
              className="text-purple-600"
            />
            Arrival
          </label>
        </div>
      );
    }
    return null;
  };

  const renderSpecificFields = () => {
    switch (category) {
      case 'Hotel':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room/Bed Type</label>
              <Input
                value={formData.roomBedType || ''}
                onChange={(e) => updateField('roomBedType', e.target.value)}
                placeholder="e.g. king"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hotel Type</label>
              <Input
                value={formData.hotelType || '5 Star'}
                onChange={(e) => updateField('hotelType', e.target.value)}
                placeholder="e.g. 5 Star"
              />
            </div>
          </div>
        );
      case 'Activity':
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Provider</label>
            <Input
              value={formData.provider || ''}
              onChange={(e) => updateField('provider', e.target.value)}
              placeholder="Black Car NY"
            />
          </div>
        );
      case 'Flights':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">From</label>
                <Input
                  value={formData.from || ''}
                  onChange={(e) => updateField('from', e.target.value)}
                  placeholder="Departure city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <Input
                  value={formData.to || ''}
                  onChange={(e) => updateField('to', e.target.value)}
                  placeholder="Arrival city"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Airlines</label>
                <Input
                  value={formData.airlines || ''}
                  onChange={(e) => updateField('airlines', e.target.value)}
                  placeholder="Black Car NY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Terminal</label>
                <Input
                  value={formData.terminal || ''}
                  onChange={(e) => updateField('terminal', e.target.value)}
                  placeholder="e.g.3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gate</label>
                <Input
                  value={formData.gate || ''}
                  onChange={(e) => updateField('gate', e.target.value)}
                  placeholder="e.g.A3"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Flight Number</label>
              <Input
                value={formData.flightNumber || ''}
                onChange={(e) => updateField('flightNumber', e.target.value)}
                placeholder="e.g.407"
              />
            </div>
          </div>
        );
      case 'Transport':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Carrier</label>
              <Input
                value={formData.carrier || ''}
                onChange={(e) => updateField('carrier', e.target.value)}
                placeholder="Black Car NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.subCategory === 'Train' ? 'Train Number' : 'Number'}
              </label>
              <Input
                value={formData.transportNumber || ''}
                onChange={(e) => updateField('transportNumber', e.target.value)}
                placeholder="e.g. 407"
              />
            </div>
          </div>
        );
      case 'Cruise':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Carrier</label>
              <Input
                value={formData.carrier || ''}
                onChange={(e) => updateField('carrier', e.target.value)}
                placeholder="Black Car NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cabin Type</label>
              <Input
                value={formData.cabinType || ''}
                onChange={(e) => updateField('cabinType', e.target.value)}
                placeholder="e.g. deluxe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cabin Number</label>
              <Input
                value={formData.cabinNumber || ''}
                onChange={(e) => updateField('cabinNumber', e.target.value)}
                placeholder="e.g. 407"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-Category Selection */}
      {renderSubCategories() && (
        <div>
          <label className="block text-sm font-medium mb-2">Sub-Category</label>
          {renderSubCategories()}
        </div>
      )}

      {/* Type Selection */}
      {renderTypeSelection() && (
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          {renderTypeSelection()}
        </div>
      )}

      {/* Category-specific fields */}
      {renderSpecificFields() && (
        <div>
          <label className="block text-sm font-medium mb-2">Details</label>
          {renderSpecificFields()}
        </div>
      )}
    </div>
  );
};

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onSave,
  onAddToLibrary
}) => {
  const [formData, setFormData] = useState<Omit<Event, 'id'>>({
    category: 'Info',
    subCategory: 'Info',
    title: '',
    notes: '',
    images: [],
    isInLibrary: false,
    time: '',
    duration: '',
    timezone: 'IST (Kolkata, Calcutta)',
    bookedThrough: '',
    confirmationNumber: '',
    amount: 0,
    currency: '₹ (INR)',
  });



  useEffect(() => {
    if (event) {
      setFormData({
        category: event.category,
        subCategory: event.subCategory || 'Info',
        type: event.type,
        title: event.title,
        notes: event.notes,
        images: event.images,
        isInLibrary: event.isInLibrary,
        time: event.time || '',
        duration: event.duration || '',
        timezone: event.timezone || 'IST (Kolkata, Calcutta)',
        bookedThrough: event.bookedThrough || '',
        confirmationNumber: event.confirmationNumber || '',
        roomBedType: event.roomBedType || '',
        hotelType: event.hotelType || '',
        provider: event.provider || '',
        from: event.from || '',
        to: event.to || '',
        airlines: event.airlines || '',
        terminal: event.terminal || '',
        gate: event.gate || '',
        flightNumber: event.flightNumber || '',
        carrier: event.carrier || '',
        transportNumber: event.transportNumber || '',
        cabinType: event.cabinType || '',
        cabinNumber: event.cabinNumber || '',
        amount: event.amount || 0,
        currency: event.currency || '₹ (INR)',
      });
    }
  }, [event]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && formData.images.length < 5) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({
          ...formData,
          images: [...formData.images, e.target?.result as string]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData: Event = {
      id: event?.id || Date.now().toString(),
      ...formData
    };
    onSave(eventData);
  };

  const handleAddToLibrary = () => {
    const eventData: Event = {
      id: event?.id || Date.now().toString(),
      ...formData
    };
    onAddToLibrary(eventData);
    // Show success feedback
    alert('Event added to library successfully!');
  };

  const handleDelete = () => {
    if (event) {
      // Handle delete - you might want to add a delete callback prop
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Day Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {(['Info', 'Hotel', 'Activity', 'Flights', 'Transport', 'Cruise'] as const).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setFormData({ ...formData, category })}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    formData.category === category
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Category-specific form fields */}
          <CategorySpecificForm
            category={formData.category}
            formData={formData}
            setFormData={setFormData}
          />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <ErrorBoundary>
              <TipTapEditor
                value={formData.notes}
                onChange={(value) => setFormData({ ...formData, notes: value })}
                placeholder="Start typing here..."
              />
            </ErrorBoundary>
          </div>

          {/* Check-in Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Check-in Time</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Time</label>
                <Input
                  value={formData.time || ''}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="add a time"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Duration</label>
                <Input
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 2 hrs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Timezone</label>
                <select
                  value={formData.timezone || 'IST (Kolkata, Calcutta)'}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="IST (Kolkata, Calcutta)">IST (Kolkata, Calcutta)</option>
                  <option value="UTC">UTC</option>
                  <option value="EST (New York)">EST (New York)</option>
                  <option value="PST (Los Angeles)">PST (Los Angeles)</option>
                  <option value="GMT (London)">GMT (London)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium mb-2">Details</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Booked Through</label>
                <Input
                  value={formData.bookedThrough || ''}
                  onChange={(e) => setFormData({ ...formData, bookedThrough: e.target.value })}
                  placeholder="e.g. Expedia"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Confirmation #</label>
                <Input
                  value={formData.confirmationNumber || ''}
                  onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })}
                  placeholder="e.g. 345678"
                />
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount || 0}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Currency</label>
                <select
                  value={formData.currency || '₹ (INR)'}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Click to Add up to 5 Photos</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={formData.images.length >= 5}
              />
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md cursor-pointer ${
                  formData.images.length >= 5
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </label>
            </div>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              onClick={handleAddToLibrary}
              className="bg-green-600 hover:bg-green-700"
            >
              Add To Library
            </Button>
            {event && (
              <Button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            )}
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
