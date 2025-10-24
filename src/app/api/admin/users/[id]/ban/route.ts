import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { assertAdmin } from "@/lib/adminAuth";

const BanSchema = z.object({
  banned: z.boolean(),
});

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    assertAdmin(req);
    
    const body = await req.json();
    const { banned } = BanSchema.parse(body);

    const { error } = await supabaseAdmin
      .from("users")
      .update({ 
        banned,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true, banned });
  } catch (e) {
    const err = e as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Ban toggle failed" },
      { status: err.status || 500 }
    );
  }
}
