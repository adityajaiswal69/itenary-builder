import { pdfApi } from '../services/api';
import type { Itinerary } from '../services/api';

interface BackendPDFGeneratorProps {
  itinerary: Itinerary;
  currentPackage?: any;
  onGenerating?: (isGenerating: boolean) => void;
}

export const useBackendPDFGenerator = ({ 
  itinerary, 
  currentPackage, 
  onGenerating 
}: BackendPDFGeneratorProps) => {
  
  const downloadPDF = async () => {
    if (!itinerary) return;

    try {
      onGenerating?.(true);

      // Determine which endpoint to use based on available data
      let response;
      if (currentPackage && currentPackage.id) {
        // Use package PDF endpoint if we have a package
        response = await pdfApi.generatePackagePDF(currentPackage.id);
      } else if (itinerary.id) {
        // Use itinerary PDF endpoint
        response = await pdfApi.generateItineraryPDF(itinerary.id);
      } else {
        throw new Error('No itinerary or package ID available');
      }

      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const filename = `${itinerary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      onGenerating?.(false);
      console.log('PDF generated successfully from backend!');

    } catch (error) {
      console.error('Error generating PDF from backend:', error);
      alert('Failed to generate PDF. Please try again.');
      onGenerating?.(false);
    }
  };

  return { downloadPDF };
};
