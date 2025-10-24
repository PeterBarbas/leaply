import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client
// This should only be used in API routes and server components

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE;

// Debug environment variables
console.log('Server Environment Variables Check:');
console.log('URL:', URL ? 'SET' : 'NOT SET');
console.log('ANON:', ANON ? 'SET' : 'NOT SET');
console.log('SERVICE:', SERVICE ? 'SET' : 'NOT SET');

// Guard against missing envs
if (!URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!ANON) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
if (!SERVICE) throw new Error("Missing SUPABASE_SERVICE_ROLE");

// Server-side clients
// Note: For server-side operations that need service role, use the regular client
export const supabaseAdmin = createClient(URL, SERVICE, {
  auth: { persistSession: false },
});
