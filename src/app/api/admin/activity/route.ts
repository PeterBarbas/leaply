import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { assertAdmin } from "@/lib/adminAuth";

export async function GET(req: Request) {
  try {
    assertAdmin(req);
    
    // Get total users count
    const { count: totalUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get active users (users with activity in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: activeUsers } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_activity", sevenDaysAgo.toISOString());

    // Get total attempts count
    const { count: totalAttempts } = await supabaseAdmin
      .from("attempts")
      .select("*", { count: "exact", head: true });

    // Get recent activity (last 10 activities) - fallback to empty array if table doesn't exist
    let recentActivity: any[] = [];
    try {
      const { data: activityData } = await supabaseAdmin
        .from("user_activity")
        .select(`
          id,
          user_email,
          action,
          timestamp,
          details
        `)
        .order("timestamp", { ascending: false })
        .limit(10);
      recentActivity = activityData || [];
    } catch (activityError) {
      // Table might not exist, use empty array
      recentActivity = [];
    }

    // Check system health
    const systemHealth: {
      database: 'healthy' | 'warning' | 'error';
      api: 'healthy' | 'warning' | 'error';
      lastCheck: string;
    } = {
      database: 'healthy',
      api: 'healthy',
      lastCheck: new Date().toISOString()
    };

    // Test database connection
    try {
      await supabaseAdmin.from("users").select("id").limit(1);
    } catch (error) {
      systemHealth.database = 'error';
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalAttempts: totalAttempts || 0,
      recentActivity: recentActivity || [],
      systemHealth
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: e.status || 500 });
  }
}
