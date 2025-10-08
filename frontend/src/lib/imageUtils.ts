/**
 * Convert storage URL to CORS-enabled proxy URL
 */
export function getCorsEnabledImageUrl(imageUrl: string): string {
  // If it's already a data URL, return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's already a proxy URL, return as is
  if (imageUrl.includes('/api/image-proxy/')) {
    return imageUrl;
  }
  
  // Extract filename from storage URL
  const filename = imageUrl.split('/').pop();
  
  if (!filename) {
    return imageUrl;
  }
  
  // Convert to proxy URL
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000/';
  return `${backendUrl}api/image-proxy/${filename}`;
}

/**
 * Check if an image URL is a storage URL that needs CORS
 */
export function isStorageUrl(imageUrl: string): boolean {
  return imageUrl.includes('/storage/') && !imageUrl.includes('/api/image-proxy/');
}