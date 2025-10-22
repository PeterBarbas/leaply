import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAnon
      .from("simulations")
      .select("slug,title,active,created_at")
      .order("title", { ascending: true });

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + "...",
      count: data?.length || 0,
      simulations: data,
      error: error?.message || null
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message,
      environment: process.env.NODE_ENV
    }, { status: 500 });
  }
}
