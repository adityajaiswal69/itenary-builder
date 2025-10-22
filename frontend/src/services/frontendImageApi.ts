/**
 * Frontend Image API Service
 * Replaces backend image upload with frontend storage
 */

import { ImageUploadService } from './imageUploadService';

export interface ImageUploadResponse {
  success: boolean;
  filename?: string;
  path?: string;
  original_name?: string;
  size?: number;
  error?: string;
}

export interface MultipleImageUploadResponse {
  success: boolean;
  images?: Array<{
    filename: string;
    path: string;
    original_name: string;
    size: number;
  }>;
  error?: string;
}

export interface ImageDeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class FrontendImageApi {
  /**
   * Upload a single image to frontend storage
   */
  async upload(file: File): Promise<{ data: ImageUploadResponse }> {
    try {
      const result = await ImageUploadService.uploadSingle(file);
      
      return {
        data: {
          success: result.success,
          filename: result.filename,
          path: result.path,
          original_name: file.name,
          size: file.size,
          error: result.error
        }
      };
    } catch (error: any) {
      return {
        data: {
          success: false,
          error: error.message || 'Upload failed'
        }
      };
    }
  }

  /**
   * Upload multiple images to frontend storage
   */
  async uploadMultiple(files: File[]): Promise<{ data: MultipleImageUploadResponse }> {
    try {
      const result = await ImageUploadService.uploadMultiple(files);
      
      return {
        data: {
          success: result.success,
          images: result.images,
          error: result.error
        }
      };
    } catch (error: any) {
      return {
        data: {
          success: false,
          error: error.message || 'Multiple upload failed'
        }
      };
    }
  }

  /**
   * Delete an image from frontend storage
   */
  async delete(filename: string): Promise<{ data: ImageDeleteResponse }> {
    try {
      const result = await ImageUploadService.deleteImage(filename);
      
      return {
        data: {
          success: result.success,
          message: result.success ? 'Image deleted successfully' : undefined,
          error: result.error
        }
      };
    } catch (error: any) {
      return {
        data: {
          success: false,
          error: error.message || 'Delete failed'
        }
      };
    }
  }

  /**
   * Get all stored images
   */
  getStoredImages() {
    return ImageUploadService.getStoredImages();
  }

  /**
   * Get image URL by filename
   */
  getImageUrl(filename: string): string | null {
    return ImageUploadService.getImageUrl(filename);
  }
}

// Export singleton instance
export const frontendImageApi = new FrontendImageApi();
export default frontendImageApi;
