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
 * Helper to fetch sneakers from the 'productos' table.
 */
export async function fetchSneakers(): Promise<Sneaker[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sneakers:', error);
    // Fallback try without order if created_at fails
    if (error.code === 'PGRST125' || error.code === '42703') {
       const { data: simpleData, error: simpleError } = await supabase
         .from('productos')
         .select('*');
       if (simpleError) return [];
       return simpleData as unknown as Sneaker[];
    }
    return [];
  }

  return (data || []) as unknown as Sneaker[];
}
