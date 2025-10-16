import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE!;

// Guard against missing envs (don’t log secrets)
if (!URL) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!ANON) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
if (!SERVICE) throw new Error("Missing SUPABASE_SERVICE_ROLE");

export const supabaseAnon = createClient(URL, ANON);
export const supabaseAdmin = createClient(URL, SERVICE, {
  auth: { persistSession: false },
});
