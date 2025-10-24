import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from "@/lib/supabase-server";
import { z } from "zod";

const TrackActivitySchema = z.object({
  activityType: z.enum(['simulation_completed', 'simulation_started', 'login', 'discovery_session']),
  activityDate: z.string().optional(), // ISO date string, defaults to today
  metadata: z.record(z.string(), z.any()).optional()
});

export async function POST(req: Request) {
  try {
    // Get current user session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { activityType, activityDate, metadata } = TrackActivitySchema.parse(body);

    // Use provided date or default to today
    const targetDate = activityDate ? new Date(activityDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Track the activity using the database function
    const { error } = await supabaseAdmin.rpc('track_user_activity', {
      p_user_id: session.user.id,
      p_activity_type: activityType,
      p_activity_date: targetDate,
      p_metadata: metadata || {}
    });

    if (error) {
      console.error("Error tracking user activity:", error);
      return NextResponse.json({ error: "Failed to track activity" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("User activity tracking error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // Get current user session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Calculate user streaks
    const { data: streakData, error } = await supabaseAdmin.rpc('calculate_user_streaks', {
      p_user_id: session.user.id
    });

    if (error) {
      console.error("Error calculating user streaks:", error);
      return NextResponse.json({ error: "Failed to calculate streaks" }, { status: 500 });
    }

    const streaks = streakData?.[0] || { current_streak: 0, longest_streak: 0, total_active_days: 0 };

    // Get recent activity (last 30 days)
    const { data: recentActivity, error: activityError } = await supabaseAdmin
      .from('user_activity')
      .select('activity_date, activity_type, metadata')
      .eq('user_id', session.user.id)
      .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('activity_date', { ascending: false });

    if (activityError) {
      console.error("Error fetching recent activity:", activityError);
    }

    return NextResponse.json({
      streaks: {
        current: streaks.current_streak,
        longest: streaks.longest_streak,
        totalActiveDays: streaks.total_active_days
      },
      recentActivity: recentActivity || []
    });
  } catch (error: any) {
    console.error("User activity fetch error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
