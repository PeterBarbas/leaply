import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { assertAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
  try {
    assertAdmin(req);
    
    // Get users first
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select(`
        id,
        email,
        created_at,
        updated_at,
        banned,
        last_activity
      `)
      .order("created_at", { ascending: false });

    if (usersError) throw usersError;

    // Get attempt counts for each user
    const { data: attemptCounts, error: attemptsError } = await supabaseAdmin
      .from("attempts")
      .select("user_id")
      .not("user_id", "is", null);

    if (attemptsError) throw attemptsError;

    // Count attempts per user
    const attemptCountMap = attemptCounts?.reduce((acc, attempt) => {
      if (attempt.user_id) {
        acc[attempt.user_id] = (acc[attempt.user_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Transform the data to include total attempts
    const transformedUsers = users?.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      banned: user.banned || false,
      last_activity: user.last_activity,
      total_attempts: attemptCountMap[user.id] || 0
    })) || [];

    return NextResponse.json({ users: transformedUsers });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: e.status || 500 });
  }
}
