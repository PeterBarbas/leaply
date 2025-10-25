import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    // Get all users with their XP data
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, photo_url, avatar, total_xp, level");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // Get all attempts for these users to calculate simulation stats
    const userIds = users.map(user => user.id);
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from("attempts")
      .select("id, user_id, status, score, completed_at")
      .in("user_id", userIds);

    if (attemptsError) {
      console.error("Error fetching attempts:", attemptsError);
      return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
    }

    // Calculate leaderboard data based on XP
    const leaderboardData = users
      .map(user => {
        const userAttempts = (attempts || []).filter(attempt => attempt.user_id === user.id);
        const completedAttempts = userAttempts.filter(attempt => attempt.status === 'completed');
        
        // Skip users with no XP and no completed attempts
        if ((user.total_xp || 0) === 0 && completedAttempts.length === 0) {
          return null;
        }

        // Calculate simulation stats
        const totalScore = completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
        const averageScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
        const totalCompletedTasks = completedAttempts.length;

        return {
          id: user.id,
          name: user.name || 'Anonymous',
          email: user.email,
          photo_url: user.photo_url,
          avatar: user.avatar,
          totalCompletedSimulations: totalCompletedTasks,
          averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
          totalScore: Math.round(totalScore * 10) / 10,
          leaderboardScore: user.total_xp || 0, // Use total XP as the leaderboard score
          level: user.level || 1,
          totalXp: user.total_xp || 0,
          completedAt: completedAttempts.length > 0 ? 
            completedAttempts.map(a => a.completed_at).sort().reverse()[0] : null // Most recent completion
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null) // Remove null entries with proper type guard
      .sort((a, b) => {
        // Primary sort: total XP (descending)
        if (b.totalXp !== a.totalXp) {
          return b.totalXp - a.totalXp;
        }
        // Secondary sort: level (descending)
        if (b.level !== a.level) {
          return b.level - a.level;
        }
        // Tertiary sort: total completed simulations (descending)
        if (b.totalCompletedSimulations !== a.totalCompletedSimulations) {
          return b.totalCompletedSimulations - a.totalCompletedSimulations;
        }
        // Quaternary sort: average score (descending)
        return b.averageScore - a.averageScore;
      });

    return NextResponse.json({ leaderboard: leaderboardData });
  } catch (error: any) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
