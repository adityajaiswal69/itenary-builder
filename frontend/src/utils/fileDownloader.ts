/**
 * Utility for downloading files to the public folder
 * Since browsers can't directly write to the public folder,
 * this provides a way to download files that users can then
 * manually place in the public/images folder
 */

import { ImageUploadService } from '../services/imageUploadService';

export class FileDownloader {
  /**
   * Download all stored images as a zip file
   */
  static async downloadAllImages(): Promise<void> {
    try {
      const storedImages = ImageUploadService.getStoredImages();
      
      if (storedImages.length === 0) {
        alert('No images to download');
        return;
      }

      // Create a zip file with all images
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Add each image to the zip
      for (const imageData of storedImages) {
        // Convert base64 to binary
        const binaryString = atob(imageData.base64.split(',')[1]);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        zip.file(imageData.filename, bytes);
      }
      
      // Generate and download the zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'uploaded-images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Images downloaded as zip file. Extract to public/images/ folder.');
      
    } catch (error) {
      console.error('Failed to download images:', error);
      alert('Failed to download images');
    }
  }

  /**
   * Download a single image
   */
  static downloadImage(filename: string): void {
    try {
      const imageData = ImageUploadService.getStoredImages().find(
        (img: any) => img.filename === filename
      );
      
      if (!imageData) {
        alert('Image not found');
        return;
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = imageData.base64;
      link.download = imageData.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image');
    }
  }

  /**
   * Get instructions for manual file placement
   */
  static getInstructions(): string {
    return `
To use the uploaded images in your project:

1. Download the images using the download button
2. Extract the zip file
3. Copy all images to: frontend/public/images/
4. The images will then be accessible at: /images/filename.jpg

Alternatively, you can manually save each image:
1. Right-click on the image preview
2. Select "Save image as..."
3. Save to: frontend/public/images/
    `.trim();
  }
}

export default FileDownloader;
