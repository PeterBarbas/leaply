import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from "@/lib/supabase-server";

const ResetSchema = z.object({
  attemptId: z.string(),
});

export async function POST(req: Request) {
  try {
    const { attemptId } = ResetSchema.parse(await req.json());

    // Get current user session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify the attempt belongs to the current user
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("attempts")
      .select("user_id, status")
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Reset the attempt status and clear progress
    const { error: resetError } = await supabaseAdmin
      .from("attempts")
      .update({
        status: "started",
        score: null,
        result_summary: null,
        completed_at: null,
      })
      .eq("id", attemptId);

    if (resetError) {
      console.error("Error resetting attempt:", resetError);
      return NextResponse.json({ error: "Failed to reset attempt" }, { status: 500 });
    }

    // Delete all attempt steps to clear progress
    const { error: deleteStepsError } = await supabaseAdmin
      .from("attempt_steps")
      .delete()
      .eq("attempt_id", attemptId);

    if (deleteStepsError) {
      console.error("Error deleting attempt steps:", deleteStepsError);
      // Don't fail the request if we can't delete steps, the main reset worked
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reset attempt error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
