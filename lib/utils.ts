import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Optimizes Supabase storage URLs by using the built-in image transformation service.
 * Converts /object/public/ to /render/image/public/ and appends transformation parameters.
 */
export function getOptimizedImageUrl(url: string, _options: { width?: number; quality?: number; format?: 'webp' | 'avif' | 'origin' } = {}) {
  // We return the original URL because Supabase Image Transformation (the /render/ endpoint)
  // is a paid service and might not be enabled, which explains why the images broke.
  return url;
}
