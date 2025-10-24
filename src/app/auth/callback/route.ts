import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  try {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: any) {
              // This is handled by the middleware
            },
            remove(name: string, options: any) {
              // This is handled by the middleware
            },
          },
        }
      )
      
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Redirect to the intended page or dashboard
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // If there's an error or no code, redirect to sign in with error
    return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_error`);
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${new URL(req.url).origin}/auth/signin?error=auth_callback_error`);
  }
}
