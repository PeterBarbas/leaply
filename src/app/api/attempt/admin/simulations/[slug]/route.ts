// src/app/api/attempt/admin/simulations/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { assertAdmin } from "@/lib/adminAuth";

const Upsert = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  steps: z.array(z.unknown()).default([]),
  rubric: z.array(z.string()).default([]),
  role_info: z.any().optional(),
  active: z.boolean().default(true),
});

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> } // 👈 params is now a Promise
) {
  try {
    const { slug } = await ctx.params; // 👈 must await
    assertAdmin(req);
    const body = await req.json();
    const input = Upsert.parse(body);

    const { error } = await supabaseAdmin
      .from("simulations")
      .update({
        slug: input.slug,
        title: input.title,
        steps: input.steps,
        rubric: input.rubric,
        role_info: input.role_info,
        active: input.active,
      })
      .eq("slug", slug);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Update failed" },
      { status: err.status || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> } // 👈 same change
) {
  try {
    const { slug } = await ctx.params; // 👈 must await
    assertAdmin(req);
    const { error } = await supabaseAdmin.from("simulations").delete().eq("slug", slug);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Delete failed" },
      { status: err.status || 500 }
    );
  }
}
