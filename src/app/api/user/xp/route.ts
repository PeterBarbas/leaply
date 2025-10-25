import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: Request) {
  try {
    // Get user ID from the request (this should be set by middleware or auth)
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user's XP data from the database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("total_xp, level, xp_to_next_level")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error('Error fetching user XP:', userError);
      return NextResponse.json({ error: "Failed to fetch user XP" }, { status: 500 });
    }

    // If user doesn't exist or has no XP data, return default values
    if (!user) {
      return NextResponse.json({
        totalXp: 0,
        level: 1,
        xpToNextLevel: 100
      });
    }

    return NextResponse.json({
      totalXp: user.total_xp || 0,
      level: user.level || 1,
      xpToNextLevel: user.xp_to_next_level || 100
    });

  } catch (error: any) {
    console.error('XP API error:', error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
