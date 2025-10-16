import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { SYSTEM_HINT } from "@/lib/prompts";

const Body = z.object({
  attemptId: z.string(),
  stepIndex: z.number(),
});

export async function POST(req: Request) {
  try {
    const { attemptId, stepIndex } = Body.parse(await req.json());

    // 1) Get attempt & simulation & step
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from("attempts")
      .select("id, simulation_id")
      .eq("id", attemptId)
      .single();
    if (aErr || !attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

    const { data: sim, error: sErr } = await supabaseAdmin
      .from("simulations")
      .select("title, steps")
      .eq("id", attempt.simulation_id)
      .single();
    if (sErr || !sim) return NextResponse.json({ error: "Simulation missing" }, { status: 404 });

    const step = Array.isArray(sim.steps) ? sim.steps[stepIndex] : null;
    if (!step) return NextResponse.json({ error: "Step not found" }, { status: 404 });

    // 2) If author provided hint, use it
    if (step.hint_md) {
      return NextResponse.json({ hint_md: step.hint_md, source: "authored" });
    }

    // 3) Otherwise generate via OpenAI (with fallback)
    const role = step.role || sim.title || "mentor";
    const user = {
      title: step.title,
      summary_md: step.summary_md,
      resources: step.resources ?? [],
    };

    let hint_md = "Consider clarifying the goal, constraints, and one tangible metric. Start from the user’s perspective.";
    try {
      const resp = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_HINT(role) },
          { role: "user", content: JSON.stringify(user) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });
      const parsed = JSON.parse(resp.choices[0].message.content || "{}");
      if (typeof parsed?.hint_md === "string" && parsed.hint_md.trim()) {
        hint_md = parsed.hint_md.trim();
      }
    } catch {
      // fallback stays
    }

    return NextResponse.json({ hint_md, source: "generated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
