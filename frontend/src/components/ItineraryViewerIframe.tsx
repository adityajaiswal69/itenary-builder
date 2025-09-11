import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Package, MapPin, Download, Mail, Phone, Info, X, ChevronLeft, ChevronRight, Clock, Building, Plane, Car, Ship, User, Building2, Globe } from 'lucide-react';
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

export const ItineraryViewerIframe: React.FC = () => {
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
      const response = await shareApi.getByShareUuid(shareUuid!);
      setItinerary(response.data);
    } catch (error: any) {
      console.error('Failed to load itinerary:', error);
      
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
    setImageSlider({
      isOpen: false,
      images: [],
      currentIndex: 0,
      title: ''
    });
  };

  const getEventIcon = (category: string) => {
    switch (category) {
      case 'Hotel':
        return <Building className="h-4 w-4" />;
      case 'Activity':
        return <Package className="h-4 w-4" />;
      case 'Flights':
        return <Plane className="h-4 w-4" />;
      case 'Transport':
        return <Car className="h-4 w-4" />;
      case 'Cruise':
        return <Ship className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getEventColor = (category: string) => {
    switch (category) {
      case 'Hotel':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Activity':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Flights':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Transport':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Cruise':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Itinerary Found</h2>
          <p className="text-gray-600">The requested itinerary could not be found.</p>
        </div>
      </div>
    );
  }

  const currentPackage = itinerary.packages?.[selectedPackageIndex] || itinerary.packages?.[0];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Banner Section */}
        <div className="relative h-64 rounded-lg mb-8 overflow-hidden">
          {/* Cover Image Background */}
          {itinerary.cover_image && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${itinerary.cover_image})` }}
            />
          )}
          
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/30 to-transparent"></div>
          
          {/* Company Logo and Contact Details Overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start text-white text-sm">
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              {itinerary.user?.company_details?.logo && (
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={itinerary.user.company_details.logo} 
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

          {/* Package Title and Price Overlay */}
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="text-3xl font-bold mb-2">{itinerary.title}</h1>
            {currentPackage && (
              <p className="text-xl">
                ₹ (INR) {currentPackage.price.toLocaleString()} /Per Person
              </p>
            )}
          </div>
          
          {/* PDF Download Button */}
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
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

        {/* Company More Info Card */}
        {itinerary.user?.company_details && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  More Information
                </h3>
              </div>
              
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  {itinerary.user.company_details.logo && (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img 
                        src={itinerary.user.company_details.logo} 
                        alt="Company Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  
                  {/* Company Details */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {itinerary.user.company_details.company_name}
                      </h4>
                      {itinerary.user.company_details.description && (
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {itinerary.user.company_details.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {itinerary.user.company_details.email && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Mail className="h-3 w-3 text-blue-500" />
                          <span>{itinerary.user.company_details.email}</span>
                        </div>
                      )}
                      {itinerary.user.company_details.phone && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone className="h-3 w-3 text-blue-500" />
                          <span>{itinerary.user.company_details.phone}</span>
                        </div>
                      )}
                      {itinerary.user.company_details.website && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Globe className="h-3 w-3 text-blue-500" />
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
                        <div className="flex items-start gap-2 text-gray-600 text-sm">
                          <MapPin className="h-3 w-3 text-blue-500 mt-0.5" />
                          <span>{itinerary.user.company_details.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Package Details */}
        {currentPackage && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">{currentPackage.title}</h2>
              
              {currentPackage.description && currentPackage.description.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{currentPackage.description[0]?.content}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {currentPackage.locations && currentPackage.locations.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Locations</h4>
                    <div className="space-y-1">
                      {currentPackage.locations.map((location, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{location}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentPackage.inclusions && currentPackage.inclusions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Inclusions</h4>
                    <div className="space-y-1">
                      {currentPackage.inclusions.map((inclusion, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{inclusion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentPackage.exclusions && currentPackage.exclusions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Exclusions</h4>
                    <div className="space-y-1">
                      {currentPackage.exclusions.map((exclusion, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>{exclusion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              {itinerary.user && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{itinerary.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{itinerary.user.email}</span>
                    </div>
                    {itinerary.user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{itinerary.user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Itinerary Days */}
        {itinerary.content && itinerary.content.days && itinerary.content.days.length > 0 ? (
          <div className="space-y-6">
            {itinerary.content.days.map((day: Day, dayIndex: number) => (
              <Card key={day.id || dayIndex}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">
                    Day {dayIndex + 1}: {day.title}
                  </h3>
                  
                  {day.events && day.events.length > 0 ? (
                    <div className="space-y-4">
                      {day.events.map((event: Event, eventIndex: number) => (
                        <div key={event.id || eventIndex} className="border-l-4 border-blue-200 pl-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${getEventColor(event.category)}`}>
                              {getEventIcon(event.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900">{event.title}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full border ${getEventColor(event.category)}`}>
                                  {event.category}
                                </span>
                                {event.subCategory && event.subCategory !== event.category && (
                                  <span className="text-xs text-gray-500">{event.subCategory}</span>
                                )}
                              </div>
                              
                              {event.notes && (
                                <p className="text-gray-600 text-sm mb-2">{event.notes}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {event.time && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {event.time}
                                  </span>
                                )}
                                {event.duration && (
                                  <span>Duration: {event.duration}</span>
                                )}
                                {event.amount && (
                                  <span>₹{event.amount.toLocaleString()}</span>
                                )}
                              </div>
                              
                              {event.images && event.images.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex gap-2 overflow-x-auto">
                                    {event.images.map((image, imgIndex) => (
                                      <img
                                        key={imgIndex}
                                        src={image.startsWith('http') ? image : `http://localhost:8000${image}`}
                                        alt={`${event.title} ${imgIndex + 1}`}
                                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => openImageSlider(event.images, imgIndex, event.title)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No events scheduled for this day.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Itinerary Content</h3>
              <p className="text-gray-500">This itinerary doesn't have any scheduled events yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Slider Modal */}
      {imageSlider.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeImageSlider}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="relative">
              <img
                src={imageSlider.images[imageSlider.currentIndex].startsWith('http') ? imageSlider.images[imageSlider.currentIndex] : `http://localhost:8000${imageSlider.images[imageSlider.currentIndex]}`}
                alt={`${imageSlider.title} ${imageSlider.currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {imageSlider.images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageSlider(prev => ({
                      ...prev,
                      currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : prev.images.length - 1
                    }))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={() => setImageSlider(prev => ({
                      ...prev,
                      currentIndex: prev.currentIndex < prev.images.length - 1 ? prev.currentIndex + 1 : 0
                    }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 hover:bg-gray-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {imageSlider.currentIndex + 1} / {imageSlider.images.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
