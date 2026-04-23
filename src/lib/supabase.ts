import { createClient } from '@supabase/supabase-js';
import { Sneaker } from '../types';

// Use environment variables or hardcoded fallback for the current setup
// @ts-ignore
const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xqikzccsnzelpumevmxo.supabase.co';
// Sanitize URL to prevent double /rest/v1 if the env var already includes it
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxaWt6Y2NzbnplbHB1bWV2bXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzA5NzUsImV4cCI6MjA5MjQ0Njk3NX0.bTwBIxc6bxkw4XNiucH6xRIHlw_HWbLvBHnl88DCx-s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Debug helper to see accessible buckets
 */
export async function debugBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) console.error("Error listado buckets:", error);
  else console.log("Buckets disponibles en este proyecto:", data.map(b => b.name));
}

/**
 * Upload an image to Supabase Storage and create a record in public.imagenes_producto
 */
export async function uploadProductImage(productId: string, file: File, color?: string): Promise<{ data: any; error: any }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${productId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  console.log("Iniciando subida:", filePath, "para producto:", productId);

  // 1. Upload to Storage (Trying lowercase 'productos')
  const { data: storageData, error: storageError } = await supabase.storage
    .from('productos')
    .upload(filePath, file);

  if (storageError) {
    console.error("Error en Storage (con 'productos'):", storageError);
    return { data: null, error: storageError };
  }

  console.log("Subida a Storage exitosa:", storageData);

  // 2. Get Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('productos')
    .getPublicUrl(filePath);

  // 3. Insert into Database
  const { data, error } = await supabase
    .from('imagenes_producto')
    .insert([
      { 
        producto_id: productId, 
        url: publicUrl,
        color_variante: color || null
      }
    ])
    .select();

  if (error) {
    console.error("Error insertando en tabla imagenes_producto:", error);
  } else {
    console.log("Registro en base de datos creado:", data);
  }

  return { data, error };
}

/**
 * Helper to fetch sneakers from the 'productos' table.
 */
export async function fetchSneakers(): Promise<Sneaker[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*, imagenes_producto(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sneakers:', error);
    // Fallback try without order if created_at fails
    if (error.code === 'PGRST125' || error.code === '42703') {
       const { data: simpleData, error: simpleError } = await supabase
         .from('productos')
         .select('*, imagenes_producto(*)');
       if (simpleError) return [];
       return simpleData as unknown as Sneaker[];
    }
    return [];
  }

  return (data || []) as unknown as Sneaker[];
}
