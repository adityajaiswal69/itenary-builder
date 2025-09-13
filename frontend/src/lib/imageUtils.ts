/**
 * Utility functions for handling image URLs with CORS support
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

/**
 * Converts a storage path to a CORS-enabled URL
 * @param imagePath - The storage path (e.g., '/storage/images/filename.jpg')
 * @returns The CORS-enabled URL
 */
export const getCorsEnabledImageUrl = (imagePath: string): string => {
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a storage path, use the original endpoint (CORS will be handled by middleware)
  if (imagePath.startsWith('/storage/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  
  // If it's just a filename, assume it's in storage/images
  if (!imagePath.startsWith('/')) {
    return `${BACKEND_URL}/storage/images/${imagePath}`;
  }
  
  // Default case - prepend backend URL
  return `${BACKEND_URL}${imagePath}`;
};

/**
 * Converts multiple image paths to CORS-enabled URLs
 * @param imagePaths - Array of storage paths
 * @returns Array of CORS-enabled URLs
 */
export const getCorsEnabledImageUrls = (imagePaths: string[]): string[] => {
  return imagePaths.map(getCorsEnabledImageUrl);
};
