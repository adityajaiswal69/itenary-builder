import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Package, MapPin, Calendar, Download, Mail, Phone, Info, X, ChevronLeft, ChevronRight, Clock, Building, Plane, Car, Ship, Utensils, Building2, Globe, Facebook, MessageCircle, Instagram, Youtube } from 'lucide-react';
import { shareApi } from '../services/api';
import type { Itinerary } from '../services/api';
import { usePDFGenerator } from './PDFGenerator';

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
  const [selectedPackageIndex] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
      console.log('User data in itinerary:', response.data.user);
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

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!itinerary) return;
    
    const currentPackage = itinerary.packages?.[selectedPackageIndex] || itinerary.packages?.[0];
    const { downloadPDF } = usePDFGenerator({
      itinerary,
      currentPackage,
      onGenerating: setIsGeneratingPDF
    });
    
    await downloadPDF();
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
          {/* <DollarSign className="h-4 w-4" /> */}
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
          <div className="flex gap-2">
           
            <Button 
              onClick={handleDownloadPDF} 
              className="bg-green-600 hover:bg-green-700 border-green-500" 
              disabled={isGeneratingPDF}
              data-download-btn
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Banner Section */}
        <div className="relative h-80 md:h-96 rounded-xl mb-8 overflow-hidden shadow-xl">
          {/* Cover Image Background */}
          {itinerary.cover_image && (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${itinerary.cover_image.startsWith('http') ? itinerary.cover_image : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${itinerary.cover_image}`})` }}
            />
          )}
          
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/40 to-black/20"></div>
          
          {/* Company Logo and Contact Details Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-white text-sm">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              {itinerary.user?.company_details?.logo && (
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={itinerary.user.company_details.logo.startsWith('http') ? itinerary.user.company_details.logo : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${itinerary.user.company_details.logo}`} 
                    alt="Company Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              {/* Contact Details */}
              <div className="space-y-1">
                {itinerary.user?.company_details?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{itinerary.user.company_details.email}</span>
                  </div>
                )}
                {itinerary.user?.company_details?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{itinerary.user.company_details.phone}</span>
                  </div>
                )}
                {/* Fallback to user contact if no company details */}
                {!itinerary.user?.company_details?.email && itinerary.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{itinerary.user.email}</span>
                  </div>
                )}
                {!itinerary.user?.company_details?.phone && itinerary.user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{itinerary.user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
+
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Destinations Covered</span>
              </div>
              <p className="text-blue-700">
                {currentPackage.locations.join(' → ')}
              </p>
            </div>
          )}
          
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Package Summary</h2>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
            {currentPackage && Array.isArray(currentPackage.description) ? (
              <div 
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentPackage.description[0]?.content || '' }} 
              />
            ) : (
              <p className="text-gray-600">Package description not available.</p>
            )}
          </div>
        </div>

        {/* Company More Info Card */}
        {itinerary.user?.company_details && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  More Information
                </h3>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Company Logo */}
                  {itinerary.user.company_details.logo && (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img 
                        src={itinerary.user.company_details.logo.startsWith('http') ? itinerary.user.company_details.logo : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${itinerary.user.company_details.logo}`} 
                        alt="Company Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Company Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {itinerary.user.company_details.company_name}
                      </h4>
                      {itinerary.user.company_details.description && (
                        <p className="text-gray-600 leading-relaxed">
                          {itinerary.user.company_details.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {itinerary.user.company_details.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 text-blue-500" />
                          <span>{itinerary.user.company_details.email}</span>
                        </div>
                      )}
                      {itinerary.user.company_details.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 text-blue-500" />
                          <span>{itinerary.user.company_details.phone}</span>
                        </div>
                      )}
                      {itinerary.user.company_details.website && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Globe className="h-4 w-4 text-blue-500" />
                          <a 
                            href={itinerary.user.company_details.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {itinerary.user.company_details.website}
                          </a>
                        </div>
                      )}
                      {itinerary.user.company_details.address && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{itinerary.user.company_details.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Social Media Links */}
                    {(itinerary.user.company_details.facebook_url || 
                      itinerary.user.company_details.whatsapp_url || 
                      itinerary.user.company_details.instagram_url || 
                      itinerary.user.company_details.youtube_url) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Follow Us</h5>
                        <div className="flex flex-wrap gap-3">
                          {itinerary.user.company_details.facebook_url && (
                            <a 
                              href={itinerary.user.company_details.facebook_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Facebook className="h-4 w-4" />
                              Facebook
                            </a>
                          )}
                          {itinerary.user.company_details.whatsapp_url && (
                            <a 
                              href={itinerary.user.company_details.whatsapp_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </a>
                          )}
                          {itinerary.user.company_details.instagram_url && (
                            <a 
                              href={itinerary.user.company_details.instagram_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
                            >
                              <Instagram className="h-4 w-4" />
                              Instagram
                            </a>
                          )}
                          {itinerary.user.company_details.youtube_url && (
                            <a 
                              href={itinerary.user.company_details.youtube_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <Youtube className="h-4 w-4" />
                              YouTube
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Days Content */}
        <div className="space-y-12">
          {days.map((day: Day) => (
            <div key={day.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h3 className="text-2xl font-bold text-white">{day.title}</h3>
              </div>
              
              {/* Day Details Section */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Info className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-gray-700">{day.title} Details</span>
                </div>
                
                {/* Events */}
                <div className="space-y-6">
                  {day.events.map((event: Event) => (
                    <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {event.category}
                        </span>
                        {event.subCategory && event.subCategory !== event.category && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            {event.subCategory}
                          </span>
                        )}
                        {event.type && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {event.type}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-lg font-semibold mb-4 text-gray-800">{event.title}</h4>
                      
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
                        <div className="mt-4">
                          {/* Smart Grid Layout based on number of images */}
                          <div className={`grid gap-3 ${
                            event.images.length === 1 ? 'grid-cols-1' :
                            event.images.length === 2 ? 'grid-cols-2' :
                            event.images.length === 3 ? 'grid-cols-3' :
                            event.images.length === 4 ? 'grid-cols-2' :
                            event.images.length === 5 ? 'grid-cols-3' :
                            'grid-cols-3'
                          }`}>
                            {event.images.map((image: string, index: number) => (
                              <div
                                key={index}
                                className={`relative group cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
                                  event.images.length === 1 ? 'aspect-video' :
                                  event.images.length === 2 ? 'aspect-square' :
                                  event.images.length === 3 ? 'aspect-square' :
                                  event.images.length === 4 ? 'aspect-square' :
                                  event.images.length === 5 ? 'aspect-square' :
                                  'aspect-square'
                                }`}
                                onClick={() => openImageSlider(event.images, index, `${event.title} - ${day.title}`)}
                              >
                                <img
                                  src={image.startsWith('http') ? image : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${image}`}
                                  alt={`Event ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* Overlay for better visibility */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                                
                                {/* Image counter for multiple images */}
                                {event.images.length > 1 && (
                                  <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                                    {index + 1}/{event.images.length}
                                  </div>
                                )}
                                
                                {/* Hover effect indicator */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="bg-white bg-opacity-90 rounded-full p-2">
                                    <ChevronRight className="h-6 w-6 text-gray-700" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Image count indicator */}
                          {event.images.length > 6 && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Showing first 6 of {event.images.length} images. Click any image to view all.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {day.events.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Info className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No events added for this day.</p>
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
                {/* <DollarSign className="h-4 w-4 text-gray-500" /> */}
                <span>
                  ₹{currentPackage.price.toLocaleString()} 
                  {currentPackage.price_type === 'per_person' ? ' per person' : 
                   ` total${currentPackage.people ? ` (${currentPackage.people} people)` : ''}`}
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
                src={imageSlider.images[imageSlider.currentIndex].startsWith('http') ? imageSlider.images[imageSlider.currentIndex] : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${imageSlider.images[imageSlider.currentIndex]}`}
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
