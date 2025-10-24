import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { supabaseAnon } from "@/lib/supabase";

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

    // 3) Check for existing attempt or create new one
    let attemptId: string;
    
    if (userId) {
      // Check for existing attempt first
      const { data: existingAttempt } = await supabaseAdmin
        .from("attempts")
        .select("id")
        .eq("simulation_id", sim.id)
        .eq("user_id", userId)
        .single();

      if (existingAttempt) {
        attemptId = existingAttempt.id;
      } else {
        // Create new attempt
        const { data: attempt, error: aErr } = await supabaseAdmin
          .from("attempts")
          .insert({ user_id: userId, simulation_id: sim.id, status: "started" })
          .select("id")
          .single();

        if (aErr || !attempt) {
          return NextResponse.json({ error: `Attempt insert failed: ${aErr?.message || "unknown"}` }, { status: 500 });
        }
        attemptId = attempt.id;
      }
    } else {
      // For non-authenticated users, always create new attempt
      const { data: attempt, error: aErr } = await supabaseAdmin
        .from("attempts")
        .insert({ user_id: null, simulation_id: sim.id, status: "started" })
        .select("id")
        .single();

      if (aErr || !attempt) {
        return NextResponse.json({ error: `Attempt insert failed: ${aErr?.message || "unknown"}` }, { status: 500 });
      }
      attemptId = attempt.id;
    }

    // 4️⃣ Track user activity for streak calculation (if user is logged in)
    if (userId) {
      await supabaseAdmin.rpc('track_user_activity', {
        p_user_id: userId,
        p_activity_type: 'simulation_started',
        p_activity_date: new Date().toISOString().split('T')[0],
        p_metadata: {
          simulation_id: sim.id,
          simulation_slug: simulationSlug,
          attempt_id: attemptId
        }
      });
    }

    return NextResponse.json({ attemptId, steps: sim.steps });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unhandled error" }, { status: 500 });
  }
}
