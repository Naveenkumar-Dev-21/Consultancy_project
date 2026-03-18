/**
 * Normalizes image URLs to ensure they point to the backend server if they are local paths.
 * @param {string} path - The image path or URL
 * @returns {string} - The full URL to the image
 */
export const getFullUrl = (path) => {
  if (!path) return '/placeholder-image.png'; // Fallback
  
  // If it's already a full URL (http/https) or a data URL, return it
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // Get API URL from env, or default to localhost if not set
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${apiBase}${cleanPath}`;
};
