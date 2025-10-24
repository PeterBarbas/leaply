import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { SYSTEM_SENIOR } from "@/lib/prompts";

const Body = z.object({
  attemptId: z.string(),
  stepIndex: z.number(),
});

export async function POST(req: Request) {
  try {
    const { attemptId, stepIndex } = Body.parse(await req.json());

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

    if (step.senior_solution_md) {
      return NextResponse.json({ senior_solution_md: step.senior_solution_md, source: "authored" });
    }

    const role = step.role || sim.title || "mentor";
    const user = {
      title: step.title,
      summary_md: step.summary_md,
      resources: step.resources ?? [],
    };

    let senior_solution_md =
      "A senior would structure the output clearly, tie it to the stated goal, and justify trade-offs. (Example omitted.)";

    try {
      const resp = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM_SENIOR(role) },
          { role: "user", content: JSON.stringify(user) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });
      const parsed = JSON.parse(resp.choices[0].message.content || "{}");
      if (
        typeof parsed?.senior_solution_md === "string" &&
        parsed.senior_solution_md.trim()
      ) {
        senior_solution_md = parsed.senior_solution_md.trim();
      }
    } catch {
      // keep fallback
    }

    return NextResponse.json({ senior_solution_md, source: "generated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
