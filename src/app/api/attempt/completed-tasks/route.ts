import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const Body = z.object({
  attemptId: z.string(),
});

export async function POST(req: Request) {
  try {
    const { attemptId } = Body.parse(await req.json());

    // Get completed tasks for this attempt
    const { data: completedSteps, error } = await supabaseAdmin
      .from("attempt_steps")
      .select("step_index")
      .eq("attempt_id", attemptId);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch completed tasks" }, { status: 500 });
    }

    // Return array of completed step indices
    const completedTaskIndices = completedSteps?.map(step => step.step_index) || [];
    
    return NextResponse.json({ completedTasks: completedTaskIndices });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
