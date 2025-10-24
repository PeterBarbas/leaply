import { createBrowserClient } from '@supabase/ssr'

// Client-side environment variables (only NEXT_PUBLIC_* variables are available in browser)
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Client Environment Variables Check:');
  console.log('URL:', URL ? 'SET' : 'NOT SET');
  console.log('ANON:', ANON ? 'SET' : 'NOT SET');
  console.log('All NEXT_PUBLIC env keys:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
}

// Guard against missing client-side envs
if (!URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL. Available NEXT_PUBLIC env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}
if (!ANON) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Available NEXT_PUBLIC env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Client for browser usage with SSR support (uses cookies for session persistence)
export const supabaseAnon = createBrowserClient(URL, ANON);

// Helper to get the current user from the client
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabaseAnon.auth.getUser();
  if (error) throw error;
  return user;
};
