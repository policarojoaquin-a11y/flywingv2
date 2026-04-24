import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Optimizes Supabase storage URLs by using the built-in image transformation service.
 * Converts /object/public/ to /render/image/public/ and appends transformation parameters.
 */
export function getOptimizedImageUrl(url: string, options: { width?: number; quality?: number; format?: 'webp' | 'avif' | 'origin' } = {}) {
  if (!url || !url.includes('supabase.co')) return url;
  
  const { width = 600, quality = 80, format = 'webp' } = options;
  
  // Try to convert object/public to render/image/public for Supabase Image Transformation
  if (url.includes('/storage/v1/object/public/')) {
    const transformedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${transformedUrl}?width=${width}&quality=${quality}&format=${format}`;
  }
  
  return url;
}
