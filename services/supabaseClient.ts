import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to validate URL
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

let client: SupabaseClient;

// Check if variables are missing or invalid (e.g., "undefined" string)
if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl) || supabaseUrl === 'undefined' || supabaseAnonKey === 'undefined') {
  console.warn('⚠️ Supabase configuration is missing or invalid. Using mock client for offline/local mode.');
  if (supabaseUrl && !isValidUrl(supabaseUrl)) {
    console.error(`❌ Invalid Supabase URL: "${supabaseUrl}". Must be a valid HTTP/HTTPS URL.`);
  }
  
  // Create a minimal mock client to prevent crashes
  client = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
    },
    from: () => {
      const chain = {
        select: () => chain,
        order: () => chain,
        insert: () => Promise.resolve({ data: [], error: null }),
        update: () => chain,
        delete: () => chain,
        eq: () => chain,
        then: (onfulfilled: any) => onfulfilled({ data: [], error: null }),
      };
      return chain;
    },
  } as unknown as SupabaseClient;
} else {
  client = createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = client;
