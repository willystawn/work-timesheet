import { createClient } from '@supabase/supabase-js';

// Ambil dari Vite environment variable
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL and Anon Key are not set in environment variables.");
  const mockSupabase = {
      from: () => ({
          select: async () => ({ data: [], error: { message: 'Supabase not configured' } }),
          insert: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          delete: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      }),
  };
  // @ts-ignore
  globalThis.supabase = mockSupabase;
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);