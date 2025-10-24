import { NextResponse } from "next/server";
import { z } from "zod";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase-server";
import { SYSTEM_SCORE } from "@/lib/prompts";

const Body = z.object({
  attemptId: z.string(),
});

export async function POST(req: Request) {
  try {
    const { attemptId } = Body.parse(await req.json());

    // 1️⃣ Get attempt, steps, and simulation
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from("attempts")
      .select("*, simulations(*)")
      .eq("id", attemptId)
      .single();
    if (aErr || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    const sim = attempt.simulations;

    const { data: steps } = await supabaseAdmin
      .from("attempt_steps")
      .select("step_index, input, ai_feedback")
      .eq("attempt_id", attemptId)
      .order("step_index", { ascending: true });

    // 2️⃣ Combine all answers
    const summary = (steps ?? [])
      .map(
        (s) =>
          `${s.step_index + 1}. ${s.input?.text}\nAI Feedback: ${s.ai_feedback?.text}`
      )
      .join("\n\n");

    // 3️⃣ Ask OpenAI for final score
    const systemPrompt = SYSTEM_SCORE(sim.title, sim.rubric ?? []);

    const resp = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: summary },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(resp.choices[0].message.content || "{}");

    // 4️⃣ Save final result
    await supabaseAdmin
      .from("attempts")
      .update({
        status: "completed",
        score: result.score,
        result_summary: {
          strengths: result.strengths,
          improvements: result.improvements,
        },
        completed_at: new Date().toISOString(),
      })
      .eq("id", attemptId);

      // 5️⃣ Track user activity for streak calculation
    if (attempt.user_id) {
      await supabaseAdmin.rpc('track_user_activity', {
        p_user_id: attempt.user_id,
        p_activity_type: 'simulation_completed',
        p_activity_date: new Date().toISOString().split('T')[0],
        p_metadata: {
          simulation_id: attempt.simulation_id,
          score: result.score,
          attempt_id: attemptId
        }
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("finish error", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
