import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
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

    // Get user's attempts with simulation details and progress
    const { data: attempts, error } = await supabaseAdmin
      .from("attempts")
      .select(`
        id,
        status,
        score,
        created_at,
        completed_at,
        result_summary,
        simulations (
          id,
          slug,
          title,
          steps
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user simulations:", error);
      return NextResponse.json({ error: "Failed to fetch simulations" }, { status: 500 });
    }

    // Get progress for each attempt
    const attemptsWithProgress = await Promise.all(
      (attempts || []).map(async (attempt) => {
        // Get completed steps for this attempt
        const { data: completedSteps } = await supabaseAdmin
          .from("attempt_steps")
          .select("step_index")
          .eq("attempt_id", attempt.id);

        const completedTasks = completedSteps?.map(step => step.step_index) || [];
        const totalTasks = attempt.simulations?.[0]?.steps?.length || 0;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

        return {
          ...attempt,
          progress: {
            completedTasks: completedTasks.length,
            totalTasks,
            percentage: progressPercentage,
            completedTaskIndices: completedTasks
          }
        };
      })
    );

    return NextResponse.json({ simulations: attemptsWithProgress });
  } catch (error: any) {
    console.error("User simulations fetch error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
