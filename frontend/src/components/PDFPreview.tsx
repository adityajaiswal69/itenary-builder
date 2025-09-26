import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, FileText } from 'lucide-react';
import { useBackendPDFGenerator } from './BackendPDFGenerator';
import type { Itinerary } from '../services/api';

interface PDFPreviewProps {
  itinerary: Itinerary;
  currentPackage?: any;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ itinerary, currentPackage }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const { downloadPDF } = useBackendPDFGenerator({
    itinerary,
    currentPackage,
    onGenerating: setIsGeneratingPDF
  });

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <FileText className="h-16 w-16 mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Preview</h2>
          <p className="text-gray-600">
            Click the button below to generate and download the PDF for this itinerary.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={downloadPDF}
            disabled={isGeneratingPDF}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Download className="h-5 w-5 mr-2" />
            {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>PDF will be generated on the server and downloaded to your device.</p>
            <p className="mt-1">This includes all images, company details, and itinerary content.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
