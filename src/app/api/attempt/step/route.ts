import { NextResponse } from "next/server";
import { z } from "zod";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase-server";
import { SYSTEM_SIM } from "@/lib/prompts";

const Body = z.object({
  attemptId: z.string(),
  stepIndex: z.number(),
  input: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { attemptId, stepIndex, input } = Body.parse(await req.json());

    // 1️⃣ Fetch attempt + simulation
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from("attempts")
      .select("*, simulations(*)")
      .eq("id", attemptId)
      .single();
    if (aErr || !attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const sim = attempt.simulations;
    if (!sim) return NextResponse.json({ error: "Simulation missing" }, { status: 404 });

    // 2️⃣ Build system prompt
    const systemPrompt = SYSTEM_SIM(sim.title, sim.rubric ?? []);

    // 3️⃣ Send to OpenAI for feedback
    const resp = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            step: stepIndex,
            label: sim.steps[stepIndex].label,
            input,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const { feedback } = JSON.parse(resp.choices[0].message.content || "{}");

    // 4️⃣ Save step result
    await supabaseAdmin.from("attempt_steps").insert({
      attempt_id: attemptId,
      step_index: stepIndex,
      input: { text: input },
      ai_feedback: { text: feedback },
    });

    return NextResponse.json({ feedback });
  } catch (err: any) {
    console.error("step error", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
