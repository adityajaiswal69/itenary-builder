import api from './api';

export interface PDFData {
  itinerary: any;
  currentPackage?: any;
  user?: any;
}

export const simplePdfService = {
  /**
   * Generate simple PDF with images
   */
  async generatePDF(data: PDFData): Promise<void> {
    try {
      console.log('Generating simple PDF...');
      
      const response = await api.post('/simple-pdf', data, {
        responseType: 'blob',
        headers: {
          'Accept': 'text/html',
        },
      });
      
      // Create blob URL and open in new tab
      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.focus();
      }
      
      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('Simple PDF generated successfully');
      
    } catch (error) {
      console.error('Failed to generate simple PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
};
