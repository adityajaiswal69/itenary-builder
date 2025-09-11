import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PDFPreview } from '../components/PDFPreview';
import { shareApi } from '../services/api';
import type { Itinerary } from '../services/api';

export const PDFPreviewPage: React.FC = () => {
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
      console.log('Loading itinerary for shareUuid:', shareUuid);
      const response = await shareApi.getByShareUuid(shareUuid!);
      console.log('Itinerary loaded successfully:', response.data);
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
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Itinerary Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'This itinerary could not be found or is not published.'}
          </p>
        </div>
      </div>
    );
  }

  const currentPackage = itinerary.packages?.[0];

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">PDF Preview - {itinerary.title}</h1>
            <p className="text-sm text-gray-600">Live preview for debugging PDF generation issues</p>
          </div>
          <div className="text-sm text-gray-500">
            Use this preview to test image loading and pagination before generating the actual PDF
          </div>
        </div>
      </div>
      
      <div className="flex-1">
        <PDFPreview itinerary={itinerary} currentPackage={currentPackage} />
      </div>
    </div>
  );
};
