/**
 * Utility functions for handling image URLs with frontend storage
 */

import { ImageUploadService } from '../services/imageUploadService';

/**
 * Converts a storage path to a frontend-accessible URL
 * @param imagePath - The storage path (e.g., '/images/filename.jpg')
 * @returns The frontend-accessible URL
 */
export const getFrontendImageUrl = (imagePath: string): string => {
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a base64 data URL, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's a blob URL (from frontend storage), return as is
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // If it's a frontend public path, try to get from storage
  if (imagePath.startsWith('/images/')) {
    const filename = imagePath.split('/images/').pop();
    if (filename) {
      const storedUrl = getStoredImageUrl(filename);
      if (storedUrl) {
        return storedUrl;
      }
    }
    return imagePath;
  }
  
  // If it's just a filename, try to get from storage
  if (!imagePath.startsWith('/')) {
    const storedUrl = getStoredImageUrl(imagePath);
    if (storedUrl) {
      return storedUrl;
    }
    return `/images/${imagePath}`;
  }
  
  // Default case - return as is
  return imagePath;
};

/**
 * Converts multiple image paths to frontend-accessible URLs
 * @param imagePaths - Array of storage paths
 * @returns Array of frontend-accessible URLs
 */
export const getFrontendImageUrls = (imagePaths: string[]): string[] => {
  return imagePaths.map(getFrontendImageUrl);
};

/**
 * Get image URL from frontend storage by filename
 * @param filename - The filename to look up
 * @returns The image URL or null if not found
 */
export const getStoredImageUrl = (filename: string): string | null => {
  return ImageUploadService.getImageUrl(filename);
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use getFrontendImageUrl instead
 */
export const getCorsEnabledImageUrl = getFrontendImageUrl;

/**
 * Legacy function for backward compatibility
 * @deprecated Use getFrontendImageUrls instead
 */
export const getCorsEnabledImageUrls = getFrontendImageUrls;
