import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, Download, Mail, Phone, Info } from 'lucide-react';
import { shareApi } from '../services/api';
import type { Itinerary } from '../services/api';

interface Day {
  id: string;
  title: string;
  events: Event[];
}

interface Event {
  id: string;
  category: 'Info' | 'Hotel' | 'Activity' | 'Flights' | 'Transport' | 'Cruise';
  subCategory: 'Info' | 'City Guide';
  title: string;
  notes: string;
  images: string[];
  isInLibrary: boolean;
}

export const ItineraryViewer: React.FC = () => {
  const { shareUuid } = useParams<{ shareUuid: string }>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareUuid) {
      loadItinerary();
    }
  }, [shareUuid]);

  const loadItinerary = async () => {
    try {
      setLoading(true);
      const response = await shareApi.getByShareUuid(shareUuid!);
      setItinerary(response.data);
    } catch (error) {
      console.error('Failed to load itinerary:', error);
      setError('Itinerary not found or not published');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    // Implement PDF download functionality
    alert('PDF download functionality coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Itinerary Not Found</h2>
              <p className="text-gray-600 mb-4">
                {error || 'This itinerary could not be found or is not published.'}
              </p>
              <Button onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const days = (itinerary.content as { days?: Day[] })?.days || [];
  const currentPackage = itinerary.packages?.[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <span className="text-lg font-semibold">aditya</span>
          </div>
          <Button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 border-green-500">
            <Download className="h-4 w-4 mr-2" />
            Download Pdf
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Banner Section */}
        <div className="relative h-64 bg-gradient-to-r from-red-500 via-orange-500 to-blue-500 rounded-lg mb-8 overflow-hidden">
          {/* Banner Image or Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/80 via-orange-500/80 to-blue-600/80"></div>
          
          {/* Contact Details Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between text-white text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>jaiszaditya@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>8327693057</span>
            </div>
          </div>

          {/* Package Title and Price Overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold mb-2">{itinerary.title}</h1>
            {currentPackage && (
              <p className="text-xl">
                ₹ (INR) {currentPackage.price.toLocaleString()} /Per Person
              </p>
            )}
          </div>
        </div>

        {/* Package Summary */}
        <div className="mb-8">
          {currentPackage && currentPackage.locations && (
            <p className="text-gray-700 mb-4">
              Destination Covered : {currentPackage.locations.join(', ')}
            </p>
          )}
          
          <h2 className="text-2xl font-bold mb-4">Package Summary</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            {currentPackage && Array.isArray(currentPackage.description) ? (
              <div dangerouslySetInnerHTML={{ __html: currentPackage.description[0]?.content || '' }} />
            ) : (
              <p className="text-gray-600">Package description not available.</p>
            )}
          </div>
        </div>

        {/* Days Content */}
        <div className="space-y-8">
          {days.map((day: Day, dayIndex: number) => (
            <div key={day.id}>
              <h3 className="text-2xl font-bold mb-4">{day.title}</h3>
              
              {/* Day Details Section */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{day.title} Details</span>
                </div>
                
                {/* Events */}
                <div className="space-y-4">
                  {day.events.map((event: Event) => (
                    <div key={event.id} className="bg-white border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {event.category}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {event.subCategory}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold mb-2">{event.title}</h4>
                      
                      <div 
                        className="prose max-w-none text-sm text-gray-700 mb-3"
                        dangerouslySetInnerHTML={{ __html: event.notes }}
                      />
                      
                      {event.images && event.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {event.images.map((image: string, index: number) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Event ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {day.events.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No events added for this day.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Package Details */}
        {currentPackage && (
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Package Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>Start: {currentPackage.start_location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Valid till: {new Date(currentPackage.valid_till).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>
                  ₹{currentPackage.price.toLocaleString()} 
                  {currentPackage.price_type === 'per_person' ? ' per person' : ' total'}
                </span>
              </div>
            </div>
            
            {currentPackage.locations && currentPackage.locations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Locations:</p>
                <div className="flex flex-wrap gap-1">
                  {currentPackage.locations.map((location, index) => (
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

            {currentPackage.inclusions && currentPackage.inclusions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Inclusions:</p>
                <ul className="text-xs space-y-1">
                  {currentPackage.inclusions.map((inclusion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{inclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentPackage.exclusions && currentPackage.exclusions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Exclusions:</p>
                <ul className="text-xs space-y-1">
                  {currentPackage.exclusions.map((exclusion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{exclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
