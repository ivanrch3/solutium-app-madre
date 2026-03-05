import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key missing. Authentication will be disabled.');
  
  // Create a minimal mock client to prevent crashes
  // This allows the app to run in "offline/local" mode
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
