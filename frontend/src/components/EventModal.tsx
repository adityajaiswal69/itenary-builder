import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Plus, Camera, Info, FileText } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { ErrorBoundary } from './ErrorBoundary';

interface Event {
  id: string;
  category: 'Info' | 'Hotel' | 'Activity' | 'Flights' | 'Transport' | 'Cruise';
  subCategory: 'Info' | 'City Guide';
  title: string;
  notes: string;
  images: string[];
  isInLibrary: boolean;
}

interface EventModalProps {
  event?: Event | null;
  onClose: () => void;
  onSave: (event: Event) => void;
  onAddToLibrary: (event: Event) => void;
}

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
  });

  const [newImage, setNewImage] = useState<File | null>(null);

  useEffect(() => {
    if (event) {
      setFormData({
        category: event.category,
        subCategory: event.subCategory,
        title: event.title,
        notes: event.notes,
        images: event.images,
        isInLibrary: event.isInLibrary,
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

          {/* Sub-Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Sub-Category</label>
            <div className="flex flex-wrap gap-2">
              {(['Info', 'City Guide'] as const).map((subCategory) => (
                <button
                  key={subCategory}
                  type="button"
                  onClick={() => setFormData({ ...formData, subCategory })}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    formData.subCategory === subCategory
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {subCategory === 'Info' ? (
                    <Info className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {subCategory}
                </button>
              ))}
            </div>
          </div>

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
              <RichTextEditor
                value={formData.notes}
                onChange={(value) => setFormData({ ...formData, notes: value })}
                placeholder="Start typing here..."
              />
            </ErrorBoundary>
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
