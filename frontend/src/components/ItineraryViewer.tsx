import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Package, MapPin, Calendar, DollarSign, Download, Mail, Phone, Info, X, ChevronLeft, ChevronRight, Clock, Building, Plane, Car, Ship, Utensils } from 'lucide-react';
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

export const ItineraryViewer: React.FC = () => {
  const { shareUuid } = useParams<{ shareUuid: string }>();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageSlider, setImageSlider] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    title: string;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: ''
  });

  useEffect(() => {
    if (shareUuid) {
      loadItinerary();
    }
  }, [shareUuid]);

  const loadItinerary = async () => {
    try {
      setLoading(true);
      console.log('Loading itinerary for shareUuid:', shareUuid);
      const response = await shareApi.getByShareUuid(shareUuid!);
      console.log('Itinerary loaded successfully:', response.data);
      setItinerary(response.data);
    } catch (error: any) {
      console.error('Failed to load itinerary:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 404) {
        setError('Itinerary not found or not published');
      } else if (error.response?.status === 401) {
        setError('Authentication required');
      } else {
        setError('Failed to load itinerary. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    // Implement PDF download functionality
    alert('PDF download functionality coming soon!');
  };

  const openImageSlider = (images: string[], initialIndex: number = 0, title: string = '') => {
    setImageSlider({
      isOpen: true,
      images,
      currentIndex: initialIndex,
      title
    });
  };

  const closeImageSlider = () => {
    setImageSlider(prev => ({ ...prev, isOpen: false }));
  };

  const nextImage = () => {
    setImageSlider(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const prevImage = () => {
    setImageSlider(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!imageSlider.isOpen) return;
    
    if (e.key === 'Escape') {
      closeImageSlider();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    }
  };

  const renderCategorySpecificDetails = (event: Event) => {
    const details = [];
    
    // Time information
    if (event.time || event.duration || event.timezone) {
      details.push(
        <div key="time" className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Clock className="h-4 w-4" />
          <span>
            {event.time && `Time: ${event.time}`}
            {event.duration && ` | Duration: ${event.duration}`}
            {event.timezone && ` | ${event.timezone}`}
          </span>
        </div>
      );
    }

    // Booking details
    if (event.bookedThrough || event.confirmationNumber) {
      details.push(
        <div key="booking" className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Info className="h-4 w-4" />
          <span>
            {event.bookedThrough && `Booked through: ${event.bookedThrough}`}
            {event.confirmationNumber && ` | Confirmation: ${event.confirmationNumber}`}
          </span>
        </div>
      );
    }

    // Category-specific details
    switch (event.category) {
      case 'Hotel':
        if (event.roomBedType || event.hotelType) {
          details.push(
            <div key="hotel" className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Building className="h-4 w-4" />
              <span>
                {event.roomBedType && `Room: ${event.roomBedType}`}
                {event.hotelType && ` | Type: ${event.hotelType}`}
              </span>
            </div>
          );
        }
        break;
      
      case 'Activity':
        if (event.provider) {
          details.push(
            <div key="activity" className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Utensils className="h-4 w-4" />
              <span>Provider: {event.provider}</span>
            </div>
          );
        }
        break;
      
      case 'Flights':
        if (event.from || event.to || event.airlines || event.flightNumber || event.terminal || event.gate) {
          details.push(
            <div key="flight" className="space-y-1">
              {event.from && event.to && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Plane className="h-4 w-4" />
                  <span>{event.from} → {event.to}</span>
                </div>
              )}
              {(event.airlines || event.flightNumber) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Plane className="h-4 w-4" />
                  <span>
                    {event.airlines && `Airlines: ${event.airlines}`}
                    {event.flightNumber && ` | Flight: ${event.flightNumber}`}
                  </span>
                </div>
              )}
              {(event.terminal || event.gate) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>
                    {event.terminal && `Terminal: ${event.terminal}`}
                    {event.gate && ` | Gate: ${event.gate}`}
                  </span>
                </div>
              )}
            </div>
          );
        }
        break;
      
      case 'Transport':
        if (event.carrier || event.transportNumber) {
          details.push(
            <div key="transport" className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Car className="h-4 w-4" />
              <span>
                {event.carrier && `Carrier: ${event.carrier}`}
                {event.transportNumber && ` | ${event.subCategory === 'Train' ? 'Train' : 'Number'}: ${event.transportNumber}`}
              </span>
            </div>
          );
        }
        break;
      
      case 'Cruise':
        if (event.carrier || event.cabinType || event.cabinNumber) {
          details.push(
            <div key="cruise" className="space-y-1">
              {event.carrier && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Ship className="h-4 w-4" />
                  <span>Carrier: {event.carrier}</span>
                </div>
              )}
              {(event.cabinType || event.cabinNumber) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>
                    {event.cabinType && `Cabin Type: ${event.cabinType}`}
                    {event.cabinNumber && ` | Cabin: ${event.cabinNumber}`}
                  </span>
                </div>
              )}
            </div>
          );
        }
        break;
    }

    // Price information
    if (event.amount && event.amount > 0) {
      details.push(
        <div key="price" className="flex items-center gap-2 text-sm text-green-600 font-medium">
          <DollarSign className="h-4 w-4" />
          <span>{event.currency || '₹ (INR)'} {event.amount.toLocaleString()}</span>
        </div>
      );
    }

    return details;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [imageSlider.isOpen]);

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
        <div className="relative h-64  rounded-lg mb-8 overflow-hidden">
          {/* Cover Image Background */}
          {itinerary.cover_image && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${itinerary.cover_image})` }}
            />
          )}
          
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent"></div>
          
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
          {days.map((day: Day) => (
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
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {event.category}
                        </span>
                        {event.subCategory && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                            {event.subCategory}
                          </span>
                        )}
                        {event.type && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {event.type}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-semibold mb-3">{event.title}</h4>
                      
                      {/* Category-specific details */}
                      <div className="mb-3">
                        {renderCategorySpecificDetails(event)}
                      </div>
                      
                      {event.notes && (
                        <div 
                          className="prose max-w-none text-sm text-gray-700 mb-3"
                          dangerouslySetInnerHTML={{ __html: event.notes }}
                        />
                      )}
                      
                      {event.images && event.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {event.images.map((image: string, index: number) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Event ${index + 1}`}
                              className="w-full h-32 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity bg-gray-50"
                              onClick={() => openImageSlider(event.images, index, `${event.title} - ${day.title}`)}
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

      {/* Image Slider Modal */}
      {imageSlider.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeImageSlider}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation Arrows */}
            {imageSlider.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronLeft className="h-12 w-12" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                >
                  <ChevronRight className="h-12 w-12" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="max-w-4xl max-h-full p-4">
              <img
                src={imageSlider.images[imageSlider.currentIndex]}
                alt={`Image ${imageSlider.currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Image Counter */}
            {imageSlider.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg">
                {imageSlider.currentIndex + 1} / {imageSlider.images.length}
              </div>
            )}

            {/* Title */}
            {imageSlider.title && (
              <div className="absolute top-4 left-4 text-white text-lg font-medium">
                {imageSlider.title}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
