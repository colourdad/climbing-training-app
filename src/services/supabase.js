import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Returns a Supabase client that injects the Clerk JWT on every request.
// getClerkToken must be useAuth().getToken from @clerk/clerk-react.
export function createSupabaseClient(getClerkToken) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      fetch: async (url, options = {}) => {
        const token = await getClerkToken({ template: 'supabase' });
        const headers = new Headers(options.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return fetch(url, { ...options, headers });
      },
    },
  });
}
