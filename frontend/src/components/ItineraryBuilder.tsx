import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Plus, 
  Save, 
  Eye, 
  Trash2, 
  Package, 
  LogOut, 
  Copy,
  ArrowLeft,
  ChevronRight,
  Edit,
  Info,
  Camera,
  X,
  Calendar,
  Check,
  MapPin,
  DollarSign,
  Share2,
  Mail,
  Phone,
  Globe,
  Facebook,
  MessageCircle,
  Instagram,
  Youtube
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { itineraryApi, packageApi, imageApi, companyDetailsApi } from '../services/api';
import type { Itinerary, Package as PackageType, CompanyDetails } from '../services/api';

import { PackageInfoModal } from './PackageInfoModal';
import { EventModal } from './EventModal';
import { packageStorage } from '../lib/packageStorage';

interface Day {
  id: string;
  title: string;
  date?: string;
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

interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: 'event' | 'day';
  category?: string;
  subCategory?: string;
  images?: string[];
}

interface ItineraryBuilderProps {
  onLogout: () => void;
}

export const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ onLogout }) => {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreating = location.pathname === '/create-package';
  
  const [, setItineraries] = useState<Itinerary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingDayTitle, setEditingDayTitle] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingPackageData, setPendingPackageData] = useState<any>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);

  useEffect(() => {
    if (isCreating) {
      // Initialize new package creation
      createNewItinerary();
    } else if (packageId) {
      // Load existing package for editing
      loadPackageForEditing(packageId);
    }
    // Load company details for preview
    loadCompanyDetails();
  }, [isCreating, packageId]);

  const loadCompanyDetails = async () => {
    try {
      const response = await companyDetailsApi.get();
      if (response.data.success && response.data.data) {
        setCompanyDetails(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load company details:', error);
    }
  };

  const loadPackageForEditing = async (id: string) => {
    try {
      setLoading(true);
      // Load the package and its associated itinerary
      const packageResponse = await packageApi.getById(id);
      const packageData = packageResponse.data;
      console.log('Loaded package data:', packageData);
      
      // Load the itinerary if it exists
      let itineraryData = null;
      if (packageData.itinerary_id) {
        try {
          const itineraryResponse = await itineraryApi.getById(packageData.itinerary_id);
          itineraryData = itineraryResponse.data;
          console.log('Loaded itinerary data:', itineraryData);
        } catch (error) {
          console.log('No existing itinerary found, will create new one');
        }
      }
      
      // Use existing itinerary or create new structure
      if (itineraryData) {
        setCurrentItinerary(itineraryData);
        setTitle(itineraryData.title);
        // Prioritize itinerary cover image, fallback to package cover image
        const finalCoverImage = itineraryData.cover_image || packageData.cover_image || null;
        console.log('Setting cover image:', finalCoverImage);
        setCoverImage(finalCoverImage);
        setDays((itineraryData.content as any)?.days || [{
          id: '1',
          title: 'Day 1',
          events: []
        }]);
      } else {
        setCurrentItinerary(null);
        setTitle(packageData.title);
        console.log('Setting cover image from package only:', packageData.cover_image);
        setCoverImage(packageData.cover_image || null);
        setDays([{
          id: '1',
          title: 'Day 1',
          events: []
        }]);
      }
      
      setPackages([packageData]);
      setSelectedDayIndex(0);
      setError(null);
      setSuccessMessage(null);
      
      // Clear any stale localStorage data since we now have a real package
      if (packageData.id) {
        packageStorage.clearOnPackageCreated();
      }
    } catch (error) {
      console.error('Failed to load package for editing:', error);
      setError('Failed to load package');
    } finally {
      setLoading(false);
    }
  };

  const loadItineraries = async () => {
    try {
      const response = await itineraryApi.getAll();
      setItineraries(response.data);
    } catch (error) {
      console.error('Failed to load itineraries:', error);
    }
  };



  const createNewItinerary = () => {
    setCurrentItinerary(null);
    setTitle('');
    setCoverImage(null);
    setDays([{
      id: '1',
      title: 'Day 1',
      events: []
    }]);
    setSelectedDayIndex(0);
    setError(null);
    setPendingPackageData(null);
  };



  const addDay = () => {
    const newDay: Day = {
      id: Date.now().toString(),
      title: `Day ${days.length + 1}`,
      events: []
    };
    setDays([...days, newDay]);
    setSelectedDayIndex(days.length);
  };

  const updateDayTitle = (dayId: string, newTitle: string) => {
    setDays(days.map(day => 
      day.id === dayId ? { ...day, title: newTitle } : day
    ));
  };

  const updateDayDate = (dayId: string, newDate: string) => {
    setDays(days.map(day => 
      day.id === dayId ? { ...day, date: newDate } : day
    ));
  };

  const addEvent = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const editEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const saveEvent = (event: Event) => {
    const updatedDays = [...days];
    if (editingEvent) {
      // Update existing event
      const dayIndex = updatedDays.findIndex(day => 
        day.events.some(e => e.id === editingEvent.id)
      );
      if (dayIndex !== -1) {
        updatedDays[dayIndex].events = updatedDays[dayIndex].events.map(e =>
          e.id === editingEvent.id ? event : e
        );
      }
    } else {
      // Add new event
      updatedDays[selectedDayIndex].events.push(event);
    }
    setDays(updatedDays);
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const deleteEvent = async (eventId: string) => {
    // Find the event to get its images
    const eventToDelete = days.find(day => 
      day.events.find(event => event.id === eventId)
    )?.events.find(event => event.id === eventId);
    
    // Delete images from server if they exist
    if (eventToDelete?.images) {
      for (const imagePath of eventToDelete.images) {
        try {
          let filename;
          if (imagePath.includes('/storage/images/')) {
            filename = imagePath.split('/storage/images/').pop();
          } else if (imagePath.includes('/images/')) {
            filename = imagePath.split('/images/').pop();
          } else {
            filename = imagePath.split('/').pop();
          }
          
          if (filename) {
            await imageApi.delete(filename);
            console.log('Deleted image:', filename);
          }
        } catch (error) {
          console.error('Failed to delete image:', error);
          // Continue with event deletion even if image deletion fails
        }
      }
    }
    
    const updatedDays = days.map(day => ({
      ...day,
      events: day.events.filter(event => event.id !== eventId)
    }));
    setDays(updatedDays);
  };

  const addToLibrary = (event: Event) => {
    const libraryItem: LibraryItem = {
      id: Date.now().toString(),
      title: event.title,
      content: event.notes,
      type: 'event',
      category: event.category,
      subCategory: event.subCategory,
      images: event.images
    };
    setLibrary([...library, libraryItem]);
  };

  const removeFromLibrary = (itemId: string) => {
    setLibrary(library.filter(item => item.id !== itemId));
  };

  const copyFromLibrary = (item: LibraryItem) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      category: (item.category as any) || 'Info',
      subCategory: (item.subCategory as any) || 'Info',
      title: item.title,
      notes: item.content,
      images: item.images || [],
      isInLibrary: false
    };
    const updatedDays = [...days];
    updatedDays[selectedDayIndex].events.push(newEvent);
    setDays(updatedDays);
  };

  const checkContentSize = (content: any): { isValid: boolean; size: number; error?: string } => {
    try {
      const jsonContent = JSON.stringify(content);
      const sizeInBytes = new Blob([jsonContent]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      // Much higher limit since we're now using file storage instead of base64
      if (sizeInMB > 10) { // 10MB limit for content (images are now stored as files)
        return {
          isValid: false,
          size: sizeInMB,
          error: `Content is too large (${sizeInMB.toFixed(2)}MB). Please reduce the amount of text content.`
        };
      }
      
      return { isValid: true, size: sizeInMB };
    } catch (error) {
      return {
        isValid: false,
        size: 0,
        error: 'Content contains invalid data that cannot be serialized'
      };
    }
  };

  const publishItinerary = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    // Check content size before saving
    const contentCheck = checkContentSize({ days });
    if (!contentCheck.isValid) {
      setError(contentCheck.error || 'Content is too large');
      return;
    }

    console.log(`Content size: ${contentCheck.size.toFixed(2)}MB`);

    setLoading(true);
    setError(null);
    try {
      const itineraryData = {
        title,
        content: { days },
        cover_image: coverImage || undefined,
        is_published: true, // Publish the itinerary
      };

      let savedItinerary;
      if (currentItinerary) {
        savedItinerary = await itineraryApi.update(currentItinerary.id, itineraryData);
      } else {
        savedItinerary = await itineraryApi.create(itineraryData);
      }

      // Update package with itinerary_id, title, and cover image
      if (currentPackage && savedItinerary.data) {
        const packageUpdateData = {
          itinerary_id: savedItinerary.data.id,
          title: title, // Sync package title with itinerary title
          cover_image: coverImage || undefined, // Sync cover image
          is_published: true, // Publish the package too
        };
        
        await packageApi.update(currentPackage.id, packageUpdateData);
      }

      // Create package if we have pending package data or if this is a new package creation
      if (savedItinerary.data) {
        try {
          if (pendingPackageData) {
            // Create package with pending data
            const packageData = {
              ...pendingPackageData,
              itinerary_id: savedItinerary.data.id,
              is_published: true, // Publish the package
            };
            console.log('Creating package with pending data:', packageData);
            const packageResponse = await packageApi.create(packageData);
            console.log('Package created successfully:', packageResponse.data);
            setPendingPackageData(null);
            // Clear localStorage since package is now successfully created
            packageStorage.clearOnPackageCreated();
            setSuccessMessage('Package published successfully!');
          } else if (isCreating && !currentPackage) {
            // Create default package for new itinerary
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const packageData = {
              itinerary_id: savedItinerary.data.id,
              title: title,
              start_location: 'TBD', // Required field, can't be empty
              valid_till: tomorrow.toISOString().split('T')[0],
              description: [{ content: 'Package description will be added here.' }],
              price: 0,
              price_type: 'per_person' as const,
              locations: ['TBD'], // Required array, can't be empty
              inclusions: ['TBD'], // Required array, can't be empty
              exclusions: ['TBD'], // Required array, can't be empty
              cover_image: coverImage || undefined,
              is_published: true, // Publish the package
            };
            
            console.log('Creating default package:', packageData);
            const packageResponse = await packageApi.create(packageData);
            console.log('Default package created successfully:', packageResponse.data);
            // Clear localStorage since package is now successfully created
            packageStorage.clearOnPackageCreated();
            setSuccessMessage('Default package published successfully!');
          }
        } catch (packageError) {
          console.error('Failed to create package:', packageError);
          setError('Itinerary published but failed to create package. Please try again.');
          return; // Don't navigate away if package creation failed
        }
      }

      await loadItineraries();
      setError(null);
      
      // Show success message briefly before navigating
      setTimeout(() => {
        // Navigate back to packages list
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to publish itinerary:', error);
      if (error.response?.status === 400) {
        setError('Content is too large. Please reduce the number of images or use smaller images.');
      } else {
        setError('Failed to publish itinerary. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveItinerary = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    // Check content size before saving
    const contentCheck = checkContentSize({ days });
    if (!contentCheck.isValid) {
      setError(contentCheck.error || 'Content is too large');
      return;
    }

    console.log(`Content size: ${contentCheck.size.toFixed(2)}MB`);

    setLoading(true);
    setError(null);
    try {
      // Sanitize the days data to ensure it can be serialized
      const sanitizedDays = days.map(day => ({
        id: day.id,
        title: day.title,
        date: day.date,
        events: day.events.map(event => ({
          id: event.id,
          category: event.category,
          subCategory: event.subCategory,
          type: event.type,
          title: event.title,
          notes: event.notes,
          images: Array.isArray(event.images) ? event.images : [],
          isInLibrary: Boolean(event.isInLibrary),
          time: event.time,
          duration: event.duration,
          timezone: event.timezone,
          bookedThrough: event.bookedThrough,
          confirmationNumber: event.confirmationNumber,
          roomBedType: event.roomBedType,
          hotelType: event.hotelType,
          provider: event.provider,
          from: event.from,
          to: event.to,
          airlines: event.airlines,
          terminal: event.terminal,
          gate: event.gate,
          flightNumber: event.flightNumber,
          carrier: event.carrier,
          transportNumber: event.transportNumber,
          cabinType: event.cabinType,
          cabinNumber: event.cabinNumber,
          amount: typeof event.amount === 'number' ? event.amount : undefined,
          currency: event.currency
        }))
      }));

      // Final validation before sending
      if (coverImage && coverImage.length > 60000) {
        setError('Cover image is too large. Please select a smaller image or compress it further.');
        setLoading(false);
        return;
      }

      const itineraryData: any = {
        title,
        content: { days: sanitizedDays },
        is_published: currentItinerary?.is_published || false,
      };
      
      // Only include cover_image if it has a value
      if (coverImage) {
        itineraryData.cover_image = coverImage;
      }

      let savedItinerary;
      if (currentItinerary) {
        savedItinerary = await itineraryApi.update(currentItinerary.id, itineraryData);
      } else {
        savedItinerary = await itineraryApi.create(itineraryData);
      }

      // Update package with itinerary_id, title, and cover image
      if (currentPackage && savedItinerary.data) {
        const packageUpdateData: any = {
          itinerary_id: savedItinerary.data.id,
          title: title, // Sync package title with itinerary title
        };
        
        // Only include cover_image if it has a value
        if (coverImage) {
          packageUpdateData.cover_image = coverImage;
        }
        
        await packageApi.update(currentPackage.id, packageUpdateData);
      }

             // Create package if we have pending package data or if this is a new package creation
       if (savedItinerary.data) {
         try {
           if (pendingPackageData) {
             // Create package with pending data
             const packageData = {
               ...pendingPackageData,
               itinerary_id: savedItinerary.data.id,
             };
             console.log('Creating package with pending data:', packageData);
             const packageResponse = await packageApi.create(packageData);
             console.log('Package created successfully:', packageResponse.data);
             setPendingPackageData(null);
             setSuccessMessage('Package created successfully!');
           } else if (isCreating && !currentPackage) {
             // Create default package for new itinerary
             const tomorrow = new Date();
             tomorrow.setDate(tomorrow.getDate() + 1);
             
             const packageData: any = {
               itinerary_id: savedItinerary.data.id,
               title: title,
               start_location: 'TBD', // Required field, can't be empty
               valid_till: tomorrow.toISOString().split('T')[0],
               description: [{ content: 'Package description will be added here.' }],
               price: 0,
               price_type: 'per_person' as const,
               locations: ['TBD'], // Required array, can't be empty
               inclusions: ['TBD'], // Required array, can't be empty
               exclusions: ['TBD'], // Required array, can't be empty
               is_published: false,
             };
             
             // Only include cover_image if it has a value
             if (coverImage) {
               packageData.cover_image = coverImage;
             }
             
             console.log('Creating default package:', packageData);
             const packageResponse = await packageApi.create(packageData);
             console.log('Default package created successfully:', packageResponse.data);
             setSuccessMessage('Default package created successfully!');
           }
         } catch (packageError) {
           console.error('Failed to create package:', packageError);
           setError('Itinerary saved but failed to create package. Please try again.');
           return; // Don't navigate away if package creation failed
         }
       }

             await loadItineraries();
       setError(null);
       
       // Show success message briefly before navigating
       setTimeout(() => {
         // Navigate back to packages list
         navigate('/');
       }, 2000);
    } catch (error: any) {
      console.error('Failed to save itinerary:', error);
      
      // Provide more specific error messages
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.status === 400) {
        setError('Content is too large. Please reduce the number of images or use smaller images.');
      } else if (error.response?.status === 500) {
        setError('Server error occurred. Please try again or contact support.');
      } else {
        setError('Failed to save itinerary. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };






  const handleCoverImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Cover image change event:', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name, file.type, file.size);
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WebP, BMP, SVG)');
        return;
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('Image file size must be less than 10MB');
        return;
      }
      
      try {
        // Upload image to server
        const response = await imageApi.upload(file);
        
        if (response.data.success) {
          setCoverImage(response.data.path);
          setError(null); // Clear any previous errors
          setSuccessMessage('Cover image uploaded successfully!');
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        } else {
          setError('Failed to upload image: ' + response.data.error);
        }
      } catch (error: any) {
        console.error('Image upload failed:', error);
        setError('Failed to upload image. Please try again.');
      }
    } else {
      console.log('No file selected');
    }
    
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const removeCoverImage = async () => {
    // Delete cover image from server if it exists
    if (coverImage) {
      try {
        let filename;
        if (coverImage.includes('/storage/images/')) {
          filename = coverImage.split('/storage/images/').pop();
        } else if (coverImage.includes('/images/')) {
          filename = coverImage.split('/images/').pop();
        } else {
          filename = coverImage.split('/').pop();
        }
        
        if (filename) {
          await imageApi.delete(filename);
          console.log('Deleted cover image:', filename);
        }
      } catch (error) {
        console.error('Failed to delete cover image:', error);
        // Continue with removal even if server deletion fails
      }
    }
    
    setCoverImage(null);
    setError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Validate and process the dropped file
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImage(e.target?.result as string);
        setError(null);
        setSuccessMessage('Cover image uploaded successfully!');
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      };
      reader.onerror = () => {
        setError('Failed to load image. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = () => {
    if (!title.trim()) {
      setError('Please enter a title before previewing');
      return;
    }
    
    // Check if we have any content to preview
    if (days.length === 0) {
      setError('Please add at least one day to preview the itinerary');
      return;
    }
    
    if (days.every(day => day.events.length === 0)) {
      setError('Please add some events to preview the itinerary');
      return;
    }
    
    setShowPreview(true);
  };

  const currentDay = days[selectedDayIndex];
  const currentPackage = packages[0]; // Assuming single package per itinerary for now

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={() => {
              if (library.length === 0) {
                alert('No items in library. Add events to library first.');
                return;
              }
              // Show library selection modal or copy the first item
              if (library.length > 0) {
                copyFromLibrary(library[0]);
                alert('Event copied from library!');
              }
            }}>
              <Copy className="h-4 w-4 mr-2" />
              Copy From Library
            </Button>
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Trip Information & Conditions */}
        <div className="w-80 bg-white border-r p-6">
          {/* Trip Overview */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter trip title"
                  className="border-none p-0 text-lg font-semibold"
                  required
                />
              </div>
              <Edit className="h-4 w-4 text-gray-400" />
            </div>
            {currentPackage && (
              <>
                {currentPackage.price > 0 && (
                  <p className="text-gray-600 mb-1">
                    ₹{currentPackage.price.toLocaleString()} {currentPackage.price_type === 'per_person' ? 'Per Person' : 'Total'}
                  </p>
                )}
                {currentPackage.locations && currentPackage.locations.length > 0 && (
                  <p className="text-gray-600">Locations: {currentPackage.locations.join(', ')}</p>
                )}
                {currentPackage.start_location && (
                  <p className="text-gray-600">Start: {currentPackage.start_location}</p>
                )}
              </>
            )}
          </div>

          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image
            </label>
            <div 
              className="bg-gray-200 h-32 rounded-lg flex items-center justify-center mb-2 overflow-hidden relative border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCoverImage}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                      title="Remove cover image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-gray-500 text-sm">No Cover Image</span>
                  <p className="text-xs text-gray-400 mt-1">Drag & drop an image here</p>
                  <p className="text-xs text-gray-400 mt-1">Supports JPEG, PNG, GIF, WebP, BMP, SVG (max 10MB)</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
              onChange={handleCoverImageChange}
              className="hidden"
              id="cover-image"
            />
            <label htmlFor="cover-image" className="cursor-pointer">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  const fileInput = document.getElementById('cover-image') as HTMLInputElement;
                  if (fileInput) {
                    fileInput.click();
                  }
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                {coverImage ? 'Change Cover Image' : 'Add Cover Image'}
              </Button>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </div>

          {/* Trip Information & Conditions */}
          <div>
            <h3 className="font-semibold mb-4">Trip Information & Conditions</h3>
            <div className="space-y-2">
              {days.map((day, index) => (
                <div
                  key={day.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    index === selectedDayIndex ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedDayIndex(index)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{day.title}</div>
                    {day.date ? (
                      <div className="text-xs text-gray-500">{day.date}</div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">No date set</div>
                    )}
                  </div>
                  {index === selectedDayIndex && <ChevronRight className="h-4 w-4" />}
                </div>
              ))}
            </div>
            <Button onClick={addDay} className="w-full mt-4" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Day
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Day Header */}
          <div className="bg-white border-b p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {editingDayTitle === currentDay?.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={currentDay?.title || ''}
                        onChange={(e) => updateDayTitle(currentDay?.id || '', e.target.value)}
                        className="border-none p-0 text-xl font-semibold"
                        autoFocus
                        onBlur={() => setEditingDayTitle(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingDayTitle(null);
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDayTitle(null)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={currentDay?.title || ''}
                        onChange={(e) => updateDayTitle(currentDay?.id || '', e.target.value)}
                        className="border-none p-0 text-xl font-semibold"
                        readOnly
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingDayTitle(currentDay?.id || null)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Date Picker */}
                <div className="relative">
                  {showDatePicker === currentDay?.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={currentDay?.date || ''}
                        onChange={(e) => updateDayDate(currentDay?.id || '', e.target.value)}
                        className="w-auto"
                        autoFocus
                        onBlur={() => setShowDatePicker(null)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDatePicker(null)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      {currentDay?.date && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateDayDate(currentDay?.id || '', '');
                            setShowDatePicker(null);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDatePicker(currentDay?.id || null)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {currentDay?.date || 'Add Date (Optional)'}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                                 <Button onClick={() => setShowPackageModal(true)} variant="outline">
                   <Package className="h-4 w-4 mr-2" />
                   Package Info
                   {pendingPackageData && (
                     <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                       Ready
                     </span>
                   )}
                 </Button>
                <Button onClick={addEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
                <Button onClick={saveItinerary} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Package'}
                </Button>
                <Button onClick={publishItinerary} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  <Share2 className="h-4 w-4 mr-2" />
                  {loading ? 'Publishing...' : 'Publish & Share'}
                </Button>
              </div>
            </div>
          </div>

          {/* Day Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl">
              {/* Day Details Section */}
              <div className="bg-white rounded-lg border p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Day {selectedDayIndex + 1} Details</span>
                </div>
                
                {/* Events */}
                <div className="space-y-4">
                  {currentDay?.events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {event.category}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                            {event.subCategory}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editEvent(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addToLibrary(event)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-2">{event.title}</h4>
                      <div className="prose max-w-none text-sm text-gray-700">
                        {event.notes}
                      </div>
                      {event.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {event.images.map((image, index) => (
                            <img
                              key={index}
                              src={image.startsWith('http') ? image : `http://localhost:8000${image}`}
                              alt={`Event ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {currentDay?.events.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Info className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No events added yet.</p>
                    <p className="text-sm">Click "New Event" to add your first event.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Library */}
        <div className="w-80 bg-white border-l p-6">
          <h3 className="font-semibold mb-4">Library</h3>
          <div className="space-y-3">
            {library.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{item.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyFromLibrary(item)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromLibrary(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

             {/* Error Message */}
       {error && (
         <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
           <div className="flex items-center gap-2">
             <span>Error: {error}</span>
             <Button
               variant="ghost"
               size="sm"
               onClick={() => setError(null)}
             >
               <X className="h-4 w-4" />
             </Button>
           </div>
         </div>
       )}

       {/* Success Message */}
       {successMessage && (
         <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
           <div className="flex items-center gap-2">
             <span>{successMessage}</span>
             <Button
               variant="ghost"
               size="sm"
               onClick={() => setSuccessMessage(null)}
             >
               <X className="h-4 w-4" />
             </Button>
           </div>
         </div>
       )}

      {/* Modals */}
      {showPackageModal && (
        <PackageInfoModal
          package={currentPackage}
          tripTitle={title}
          onClose={() => setShowPackageModal(false)}
          onSave={async (pkg) => {
            try {
              // Sync trip title with package title
              if (pkg.title && pkg.title !== title) {
                setTitle(pkg.title);
              }
              
              if (currentPackage) {
                // Update existing package
                await packageApi.update(currentPackage.id, pkg);
                // Reload packages to get updated data
                const response = await packageApi.getById(currentPackage.id);
                setPackages([response.data]);
                setShowPackageModal(false);
                setSuccessMessage('Package info updated successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
              } else {
                // Store package data temporarily to create later when itinerary is saved
                                 const pendingData: any = {
                   title: pkg.title || title,
                   start_location: pkg.start_location || 'TBD',
                   valid_till: pkg.valid_till || (() => {
                     const tomorrow = new Date();
                     tomorrow.setDate(tomorrow.getDate() + 1);
                     return tomorrow.toISOString().split('T')[0];
                   })(),
                   description: pkg.description || [{ content: 'Package description will be added here.' }],
                   price: pkg.price || 0,
                   price_type: pkg.price_type || 'per_person',
                   people: pkg.people || undefined,
                   locations: pkg.locations && pkg.locations.length > 0 ? pkg.locations : ['TBD'],
                   inclusions: pkg.inclusions && pkg.inclusions.length > 0 ? pkg.inclusions : ['TBD'],
                   exclusions: pkg.exclusions && pkg.exclusions.length > 0 ? pkg.exclusions : ['TBD'],
                   is_published: pkg.is_published || false,
                 };
                 
                 // Only include cover_image if it has a value
                 if (coverImage) {
                   pendingData.cover_image = coverImage;
                 }
                 
                 setPendingPackageData(pendingData);
                setShowPackageModal(false);
                setSuccessMessage('Package info saved! Package will be created when you save the itinerary.');
                setTimeout(() => setSuccessMessage(null), 3000);
              }
            } catch (error) {
              console.error('Failed to save package:', error);
              setError('Failed to save package');
            }
          }}
        />
      )}

      {showEventModal && (
        <EventModal
          event={editingEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          onSave={saveEvent}
          onAddToLibrary={addToLibrary}
        />
      )}

             {/* Preview Modal */}
       {showPreview && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
             <div className="flex items-center justify-between p-6 border-b">
               <div>
                 <h2 className="text-xl font-semibold">Preview - {title}</h2>
                 <p className="text-sm text-gray-500 mt-1">This is a preview of how your itinerary will look when published</p>
               </div>
               <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                 <X className="h-4 w-4" />
               </Button>
             </div>
             <div className="p-6">
               {/* Preview Content */}
               <div className="max-w-4xl mx-auto">
                 {/* Banner Section */}
                 <div className="relative h-64 bg-gradient-to-r from-red-500 via-orange-500 to-blue-500 rounded-lg mb-8 overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-red-600/80 via-orange-500/80 to-blue-600/80"></div>
                   
                   {coverImage && (
                     <img 
                       src={coverImage} 
                       alt="Cover" 
                       className="absolute inset-0 w-full h-full object-cover opacity-50"
                     />
                   )}
                   
                   {/* Package Title and Price Overlay */}
                   <div className="absolute bottom-4 left-4 text-white">
                     <h1 className="text-3xl font-bold mb-2">{title}</h1>
                     {currentPackage && currentPackage.price > 0 && (
                       <p className="text-xl">
                         ₹ {currentPackage.price.toLocaleString()} {currentPackage.price_type === 'per_person' ? '/Per Person' : 'Total'}
                       </p>
                     )}
                   </div>
                 </div>

                 {/* Package Summary */}
                 {currentPackage && (
                   <div className="mb-8">
                     <h2 className="text-2xl font-bold mb-4">Package Summary</h2>
                     <div className="bg-gray-50 p-4 rounded-lg">
                       {currentPackage.description && currentPackage.description.length > 0 && currentPackage.description[0]?.content ? (
                         <div dangerouslySetInnerHTML={{ __html: currentPackage.description[0].content }} />
                       ) : (
                         <p className="text-gray-600">Package description not available.</p>
                       )}
                       
                       {currentPackage.locations && currentPackage.locations.length > 0 && (
                         <div className="mt-4">
                           <p className="text-sm font-medium mb-2">Destinations:</p>
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
                     </div>
                   </div>
                 )}

                 {/* Days Content */}
                 <div className="space-y-8">
                   {days.map((day: Day) => (
                     <div key={day.id}>
                       <h3 className="text-2xl font-bold mb-4">
                         {day.title}
                         {day.date ? (
                           <span className="text-lg font-normal text-gray-600 ml-2">
                             ({day.date})
                           </span>
                         ) : (
                           <span className="text-lg font-normal text-gray-400 ml-2">
                             (Date not set)
                           </span>
                         )}
                       </h3>
                       
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
                                       src={image.startsWith('http') ? image : `http://localhost:8000${image}`}
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

                 {/* Package Details Section */}
                 {currentPackage && (
                   <div className="mt-12 bg-gray-50 rounded-lg p-6">
                     <h3 className="text-xl font-bold mb-4">Package Details</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                       {currentPackage.start_location && (
                         <div className="flex items-center gap-2">
                           <MapPin className="h-4 w-4 text-gray-500" />
                           <span>Start: {currentPackage.start_location}</span>
                         </div>
                       )}
                       {currentPackage.valid_till && (
                         <div className="flex items-center gap-2">
                           <Calendar className="h-4 w-4 text-gray-500" />
                           <span>Valid till: {new Date(currentPackage.valid_till).toLocaleDateString()}</span>
                         </div>
                       )}
                       {currentPackage.price > 0 && (
                         <div className="flex items-center gap-2">
                           <DollarSign className="h-4 w-4 text-gray-500" />
                           <span>
                             ₹{currentPackage.price.toLocaleString()} 
                             {currentPackage.price_type === 'per_person' ? ' per person' : ' total'}
                           </span>
                         </div>
                       )}
                     </div>
                     
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

                 {/* Company Details Section */}
                 {companyDetails && (
                   <div className="mt-12 bg-white rounded-lg border p-6">
                     <h3 className="text-xl font-bold mb-4">Company Information</h3>
                     <div className="flex items-start gap-6">
                       {/* Company Logo */}
                       {companyDetails.logo && (
                         <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                           <img 
                             src={companyDetails.logo.startsWith('http') ? companyDetails.logo : `http://localhost:8000${companyDetails.logo}`} 
                             alt="Company Logo" 
                             className="w-full h-full object-contain"
                           />
                         </div>
                       )}
                       
                       {/* Company Details */}
                       <div className="flex-1 space-y-4">
                         <div>
                           <h4 className="text-lg font-semibold text-gray-900 mb-2">
                             {companyDetails.company_name}
                           </h4>
                           {companyDetails.description && (
                             <p className="text-gray-600 leading-relaxed">
                               {companyDetails.description}
                             </p>
                           )}
                         </div>
                         
                         {/* Contact Information */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {companyDetails.email && (
                             <div className="flex items-center gap-2 text-gray-600">
                               <Mail className="h-4 w-4 text-blue-500" />
                               <span>{companyDetails.email}</span>
                             </div>
                           )}
                           {companyDetails.phone && (
                             <div className="flex items-center gap-2 text-gray-600">
                               <Phone className="h-4 w-4 text-blue-500" />
                               <span>{companyDetails.phone}</span>
                             </div>
                           )}
                           {companyDetails.website && (
                             <div className="flex items-center gap-2 text-gray-600">
                               <Globe className="h-4 w-4 text-blue-500" />
                               <a 
                                 href={companyDetails.website} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="text-blue-600 hover:text-blue-800 hover:underline"
                               >
                                 {companyDetails.website}
                               </a>
                             </div>
                           )}
                           {companyDetails.address && (
                             <div className="flex items-start gap-2 text-gray-600">
                               <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                               <span className="text-sm">{companyDetails.address}</span>
                             </div>
                           )}
                         </div>
                         
                         {/* Social Media Links */}
                         {(companyDetails.facebook_url || 
                           companyDetails.whatsapp_url || 
                           companyDetails.instagram_url || 
                           companyDetails.youtube_url) && (
                           <div className="mt-4 pt-4 border-t border-gray-200">
                             <h5 className="text-sm font-medium text-gray-700 mb-3">Follow Us</h5>
                             <div className="flex flex-wrap gap-3">
                               {companyDetails.facebook_url && (
                                 <a 
                                   href={companyDetails.facebook_url} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                 >
                                   <Facebook className="h-4 w-4" />
                                   Facebook
                                 </a>
                               )}
                               {companyDetails.whatsapp_url && (
                                 <a 
                                   href={companyDetails.whatsapp_url} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                                 >
                                   <MessageCircle className="h-4 w-4" />
                                   WhatsApp
                                 </a>
                               )}
                               {companyDetails.instagram_url && (
                                 <a 
                                   href={companyDetails.instagram_url} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-2 px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
                                 >
                                   <Instagram className="h-4 w-4" />
                                   Instagram
                                 </a>
                               )}
                               {companyDetails.youtube_url && (
                                 <a 
                                   href={companyDetails.youtube_url} 
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
                 )}
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};
