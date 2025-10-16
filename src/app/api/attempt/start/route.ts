import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin, supabaseAnon } from "@/lib/supabase";

const Body = z.object({
  simulationSlug: z.string(),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  try {
    // Support form or JSON
    let body: unknown;
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      const form = await req.formData();
      body = Object.fromEntries(form.entries());
    } else {
      body = await req.json().catch(() => ({}));
    }

    const { simulationSlug, email } = Body.parse(body);

    // 1) Fetch simulation
    const { data: sim, error: simErr } = await supabaseAnon
      .from("simulations")
      .select("*")
      .eq("slug", simulationSlug)
      .single();

    if (simErr || !sim) {
      return NextResponse.json(
        { error: `Simulation not found: ${simErr?.message || simulationSlug}` },
        { status: 404 }
      );
    }

    // 2) (Optional) Upsert user by email
    let userId: string | null = null;
    if (email) {
      const { data: u, error: uErr } = await supabaseAdmin
        .from("users")
        .upsert({ email })
        .select("id")
        .single();
      if (uErr) {
        return NextResponse.json({ error: `User upsert failed: ${uErr.message}` }, { status: 500 });
      }
      userId = u?.id ?? null;
    }

    // 3) Insert attempt (service role should bypass RLS)
    const { data: attempt, error: aErr } = await supabaseAdmin
      .from("attempts")
      .insert({ user_id: userId, simulation_id: sim.id, status: "started" })
      .select("id")
      .single();

    if (aErr || !attempt) {
      return NextResponse.json({ error: `Attempt insert failed: ${aErr?.message || "unknown"}` }, { status: 500 });
    }

    return NextResponse.json({ attemptId: attempt.id, steps: sim.steps });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unhandled error" }, { status: 500 });
  }
}
