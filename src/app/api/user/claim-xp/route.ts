import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const Body = z.object({
  attemptId: z.string(),
  taskIndex: z.number(),
  isCorrect: z.boolean(),
  taskLevel: z.number().optional().default(1), // Default to level 1 if not specified
});

export async function POST(req: Request) {
  try {
    const { attemptId, taskIndex, isCorrect, taskLevel } = Body.parse(await req.json());

    // 1. Get the attempt and user information
    const { data: attempt, error: attemptError } = await supabaseAdmin
      .from("attempts")
      .select("user_id, simulations(title)")
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // If no user_id, this is a test attempt - don't award XP
    if (!attempt.user_id) {
      return NextResponse.json({ 
        message: "Test attempt - no XP awarded",
        xpAwarded: 0 
      });
    }

    // 2. Calculate XP based on task level and correctness
    const baseXP = calculateXP(taskLevel, isCorrect);
    
    // 3. Add XP to user's account using the database function
    const { data: xpResult, error: xpError } = await supabaseAdmin
      .rpc('add_user_xp', {
        user_id: attempt.user_id,
        xp_amount: baseXP
      });

    if (xpError) {
      console.error('XP update error:', xpError);
      return NextResponse.json({ error: "Failed to update XP" }, { status: 500 });
    }

    // 4. Log the XP transaction for tracking
    await supabaseAdmin
      .from("xp_transactions")
      .insert({
        user_id: attempt.user_id,
        attempt_id: attemptId,
        task_index: taskIndex,
        xp_amount: baseXP,
        task_level: taskLevel,
        is_correct: isCorrect,
        simulation_title: attempt.simulations?.title || 'Unknown',
        created_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      xpAwarded: baseXP,
      newTotalXP: xpResult.new_xp,
      newLevel: xpResult.new_level,
      xpToNextLevel: xpResult.xp_to_next_level,
      leveledUp: xpResult.leveled_up
    });

  } catch (error: any) {
    console.error('Claim XP error:', error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

// Calculate XP based on task level and correctness
function calculateXP(taskLevel: number, isCorrect: boolean): number {
  // Base XP multipliers by level
  const levelMultipliers = {
    1: 10,  // Beginner
    2: 15,  // Easy
    3: 20,  // Medium
    4: 30,  // Hard
    5: 40,  // Expert
    6: 50,  // Master
  };

  // Get base XP for the level (default to level 1 if not found)
  const baseXP = levelMultipliers[taskLevel as keyof typeof levelMultipliers] || levelMultipliers[1];
  
  // Apply correctness multiplier
  const correctnessMultiplier = isCorrect ? 1.0 : 0.3; // 30% XP for incorrect answers
  
  return Math.round(baseXP * correctnessMultiplier);
}
