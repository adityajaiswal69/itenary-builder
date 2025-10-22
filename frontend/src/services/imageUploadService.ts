/**
 * Frontend Image Upload Service
 * Stores images in browser storage for easy access
 */

import { v4 as uuidv4 } from 'uuid';

export class ImageUploadService {
  /**
   * Upload a single image to browser storage
   */
  static async uploadSingle(file: File): Promise<{ success: boolean; filename?: string; path?: string; error?: string }> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Only image files are allowed.'
        };
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File size must be less than 10MB'
        };
      }

      // Generate unique filename
      const extension = file.name.split('.').pop();
      const filename = `${uuidv4()}.${extension}`;
      
      // Create blob URL for immediate preview
      const blobUrl = URL.createObjectURL(file);
      
      // Convert file to base64 for storage
      const base64 = await this.fileToBase64(file);
      
      // Store the image data in localStorage
      const imageData = {
        filename: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        base64: base64,
        blobUrl: blobUrl,
        timestamp: Date.now()
      };

      // Store in localStorage
      const storedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
      storedImages.push(imageData);
      localStorage.setItem('uploadedImages', JSON.stringify(storedImages));

      return {
        success: true,
        filename: filename,
        path: blobUrl // Return blob URL for immediate preview
      };

    } catch (error: any) {
      console.error('Image upload failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image'
      };
    }
  }

  /**
   * Convert file to base64 string
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Upload multiple images to frontend public folder
   */
  static async uploadMultiple(files: File[]): Promise<{ success: boolean; images?: any[]; error?: string }> {
    try {
      if (files.length > 6) {
        return {
          success: false,
          error: 'Maximum 6 images allowed'
        };
      }

      const uploadedImages = [];
      
      for (const file of files) {
        const result = await this.uploadSingle(file);
        if (result.success) {
          uploadedImages.push({
            filename: result.filename,
            path: result.path,
            original_name: file.name,
            size: file.size
          });
        } else {
          return {
            success: false,
            error: result.error
          };
        }
      }

      return {
        success: true,
        images: uploadedImages
      };

    } catch (error: any) {
      console.error('Multiple image upload failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload images'
      };
    }
  }

  /**
   * Delete an image from frontend storage
   */
  static async deleteImage(filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove from localStorage
      const storedImages = JSON.parse(localStorage.getItem('uploadedImages') || '[]');
      const filteredImages = storedImages.filter((img: any) => img.filename !== filename);
      localStorage.setItem('uploadedImages', JSON.stringify(filteredImages));

      // Revoke the blob URL to free memory
      const imageData = storedImages.find((img: any) => img.filename === filename);
      if (imageData && imageData.url) {
        URL.revokeObjectURL(imageData.url);
      }

      return {
        success: true
      };

    } catch (error: any) {
      console.error('Image deletion failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image'
      };
    }
  }

  /**
   * Get all stored images
   */
  static getStoredImages(): any[] {
    try {
      return JSON.parse(localStorage.getItem('uploadedImages') || '[]');
    } catch (error) {
      console.error('Failed to get stored images:', error);
      return [];
    }
  }

  /**
   * Get image URL by filename
   */
  static getImageUrl(filename: string): string | null {
    try {
      const storedImages = this.getStoredImages();
      const imageData = storedImages.find((img: any) => img.filename === filename);
      return imageData ? (imageData.blobUrl || imageData.base64) : null;
    } catch (error) {
      console.error('Failed to get image URL:', error);
      return null;
    }
  }
}

export default ImageUploadService;
