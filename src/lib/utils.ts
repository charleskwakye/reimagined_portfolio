import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Builds a partial update payload from the request body.
 * Only includes fields that are explicitly provided (not undefined).
 * Allows null values to pass through (for clearing optional fields).
 *
 * @param payload - The incoming request body
 * @param allowedFields - Array of field names that can be updated
 * @returns Object with only the provided fields
 *
 * @example
 * // User sends { title: "New", coverImage: null }
 * // buildPartialUpdatePayload(body, ['title', 'coverImage', 'shortDesc'])
 * // Returns: { title: "New", coverImage: null } (shortDesc excluded as undefined)
 */
export const buildPartialUpdatePayload = <T extends Record<string, any>>(
  payload: Partial<T>,
  allowedFields: (keyof T)[]
): Partial<T> => {
  const updateData: Partial<T> = {};

  allowedFields.forEach(field => {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  });

  return updateData;
}

/**
 * Combines Tailwind CSS classes with proper precedence handling
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts
 *
 * @param inputs - Class values to combine (strings, objects, arrays)
 * @returns Merged class string with Tailwind conflicts resolved
 * @example
 * cn('px-2', 'py-1', condition && 'bg-blue-500')
 * // Result: 'px-2 py-1 bg-blue-500' (if condition is true)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Delete a file from Vercel Blob Storage
 * @param url The URL of the file to delete
 * @returns Promise that resolves when the file is deleted
 */
export async function deleteVercelBlobFile(url: string): Promise<boolean> {
  if (!url || !url.includes('blob.vercel-storage.com')) {
    return false;
  }
  
  try {
    const response = await fetch('/api/file/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Converts various YouTube URL formats to the proper embed URL format
 */
export function convertToYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  
  // If it's already an embed URL, return it
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Extract video ID from various YouTube URL formats
  let videoId = '';
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch')) {
    const urlObj = new URL(url);
    videoId = urlObj.searchParams.get('v') || '';
  } 
  // Format: https://youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  // Format: https://www.youtube.com/v/VIDEO_ID
  else if (url.includes('youtube.com/v/')) {
    videoId = url.split('youtube.com/v/')[1]?.split('?')[0] || '';
  }
  
  // Return embed URL if we found a video ID
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // If we couldn't parse it, return the original URL
  return url;
}
