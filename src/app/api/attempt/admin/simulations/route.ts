import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { assertAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
  try {
    assertAdmin(req);
    const { data, error } = await supabaseAdmin
      .from("simulations")
      .select("slug,title,steps,rubric,active")
      .order("title", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ sims: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: e.status || 500 });
  }
}

const Upsert = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  steps: z.array(z.any()).default([]),
  rubric: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    assertAdmin(req);
    const body = await req.json();
    const input = Upsert.parse(body);

    const { error } = await supabaseAdmin.from("simulations").insert({
      slug: input.slug,
      title: input.title,
      steps: input.steps,
      rubric: input.rubric,
      active: input.active,
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Create failed" }, { status: e.status || 500 });
  }
}
