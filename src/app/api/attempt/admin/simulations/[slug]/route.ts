import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { assertAdmin } from "@/lib/adminAuth";

const Upsert = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  steps: z.array(z.any()).default([]),
  rubric: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  try {
    assertAdmin(req);
    const body = await req.json();
    const input = Upsert.parse(body);

    const { error } = await supabaseAdmin
      .from("simulations")
      .update({
        slug: input.slug, // keep same or allow change
        title: input.title,
        steps: input.steps,
        rubric: input.rubric,
        active: input.active,
      })
      .eq("slug", params.slug);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Update failed" }, { status: e.status || 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  try {
    assertAdmin(req);
    const { error } = await supabaseAdmin.from("simulations").delete().eq("slug", params.slug);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Delete failed" }, { status: e.status || 500 });
  }
}
