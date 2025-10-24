import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from "@/lib/supabase-server";

const SaveProgressSchema = z.object({
  attemptId: z.string(),
  taskIndex: z.number(),
});

const GetProgressSchema = z.object({
  attemptId: z.string(),
});

// Save task completion progress
export async function POST(req: Request) {
  try {
    const { attemptId, taskIndex } = SaveProgressSchema.parse(await req.json());

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
      .select("user_id")
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if this task step already exists
    const { data: existingStep } = await supabaseAdmin
      .from("attempt_steps")
      .select("id")
      .eq("attempt_id", attemptId)
      .eq("step_index", taskIndex)
      .single();

    if (existingStep) {
      // Task already completed
      return NextResponse.json({ success: true, message: "Task already completed" });
    }

    // Mark task as completed by inserting a record in attempt_steps
    // We'll insert a minimal record since the actual step completion happens in the step API
    const { error: insertError } = await supabaseAdmin
      .from("attempt_steps")
      .insert({
        attempt_id: attemptId,
        step_index: taskIndex,
        input: { text: "Task completed" },
        ai_feedback: { text: "Task marked as completed" },
      });

    if (insertError) {
      console.error("Error saving progress:", insertError);
      return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Progress save error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

// Get completed tasks for an attempt
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("attemptId");

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId required" }, { status: 400 });
    }

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
      .select("user_id")
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get completed tasks
    const { data: completedSteps, error } = await supabaseAdmin
      .from("attempt_steps")
      .select("step_index")
      .eq("attempt_id", attemptId);

    if (error) {
      console.error("Error fetching progress:", error);
      return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
    }

    const completedTasks = completedSteps?.map(step => step.step_index) || [];

    return NextResponse.json({ completedTasks });
  } catch (error: any) {
    console.error("Progress fetch error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
