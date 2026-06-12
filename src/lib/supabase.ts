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
 * Compresses an image client-side to WebP using HTML Canvas.
 * Standardizes size (max 1200px width) and quality (0.82) for supreme egress and storage savings.
 */
function compressImageToWebP(file: File, maxWidth = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Fit to max width keeping aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (err) => {
      console.error("Error loading image for client-side compression:", err);
      resolve(file);
    };
  });
}

/**
 * Upload an image to Supabase Storage and create a record in public.imagenes_producto
 */
export async function uploadProductImage(productId: string, file: File, color?: string): Promise<{ data: any; error: any }> {
  console.log("Iniciando subida con compresión client-side:", file.name, "tamaño original:", (file.size / 1024).toFixed(1), "KB");
  
  let uploadBlob: Blob | File = file;
  let isWebP = false;
  
  try {
    uploadBlob = await compressImageToWebP(file, 1200, 0.82);
    isWebP = uploadBlob.type === 'image/webp';
    console.log("Compresión completada. Nuevo tamaño:", (uploadBlob.size / 1024).toFixed(1), "KB | Formato WebP:", isWebP);
  } catch (err) {
    console.error("Error en compresión client-side, se subirá original:", err);
  }

  const fileExt = isWebP ? 'webp' : (file.name.split('.').pop() || 'jpg');
  const fileName = `${productId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  // 1. Upload to Storage (Trying lowercase 'productos')
  const { data: storageData, error: storageError } = await supabase.storage
    .from('productos')
    .upload(filePath, uploadBlob, {
      contentType: isWebP ? 'image/webp' : file.type,
      upsert: true
    });

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
    .order('created_at', { ascending: false })
    .order('id', { foreignTable: 'imagenes_producto', ascending: true });

  if (error) {
    console.error('Error fetching sneakers:', error);
    // Fallback try without order if created_at fails
    if (error.code === 'PGRST125' || error.code === '42703') {
       const { data: simpleData, error: simpleError } = await supabase
         .from('productos')
         .select('*, imagenes_producto(*)')
         .order('id', { foreignTable: 'imagenes_producto', ascending: true });
       if (simpleError) return [];
       return simpleData as unknown as Sneaker[];
    }
    return [];
  }

  return (data || []) as unknown as Sneaker[];
}

/**
 * Register a pre-sale reservation click/add event
 */
export async function recordPreSaleReservation(
  productoId: string,
  name: string,
  color: string,
  packs: number,
  packSize: number
): Promise<void> {
  const timestamp = new Date().toISOString();
  const newItem = {
    producto_id: productoId,
    producto_name: name,
    color: color || "No especificado",
    packs: packs,
    pack_size: packSize,
    created_at: timestamp
  };

  // 1. Save locally to localStorage (always succeeds)
  try {
    const local = localStorage.getItem("local_preventa_reservas");
    const list = local ? JSON.parse(local) : [];
    list.push(newItem);
    localStorage.setItem("local_preventa_reservas", JSON.stringify(list));
  } catch (e) {
    console.error("Error saving pre-sale reservation locally:", e);
  }

  // 2. Try to insert into Supabase table 'preventa_reservas'
  try {
    const { error } = await supabase
      .from('preventa_reservas')
      .insert([newItem]);
    
    if (error) {
      console.warn("Supabase 'preventa_reservas' insertion failed, utilizing local storage. Details:", error.message);
    }
  } catch (e) {
    console.warn("Could not connect to Supabase 'preventa_reservas' table:", e);
  }
}

/**
 * Fetch all pre-sale reservation records
 */
export async function fetchPreSaleReservations(): Promise<any[]> {
  // Try to get remote items from Supabase first
  try {
    const { data, error } = await supabase
      .from('preventa_reservas')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // If the query succeeds, return database records (even if empty, i.e., 0 records)
      return data;
    }
    
    if (error) {
      console.warn("Supabase 'preventa_reservas' query returned error. Falling back to local logs. Details:", error);
    }
  } catch (e) {
    console.warn("Supabase Table 'preventa_reservas' is unavailable. Falling back to local temporary logs.");
  }

  // Fallback to local items if database is unreachable or table doesn't exist yet
  try {
    const local = localStorage.getItem("local_preventa_reservas");
    return local ? JSON.parse(local) : [];
  } catch (e) {
    console.error("Error fetching local pre-sale reservations:", e);
    return [];
  }
}

/**
 * Clear pre-sale reservation records
 */
export async function clearPreSaleReservations(): Promise<void> {
  try {
    localStorage.removeItem("local_preventa_reservas");
  } catch (e) {
    console.error("Error removing local storage pre-sale items:", e);
  }

  try {
    const { error } = await supabase
      .from('preventa_reservas')
      .delete()
      .neq('producto_id', '00000000-0000-0000-0000-000000000000'); // delete all rows
    if (error) {
      console.warn("Could not delete from Supabase preventa_reservas:", error);
    }
  } catch (e) {
    console.warn("Supabase reset failed:", e);
  }
}
