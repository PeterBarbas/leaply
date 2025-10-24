import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    // First, get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("id, name, email, photo_url, avatar");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    // Then get all attempts for these users
    const userIds = users.map(user => user.id);
    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from("attempts")
      .select("id, user_id, status, score, completed_at")
      .in("user_id", userIds);

    if (attemptsError) {
      console.error("Error fetching attempts:", attemptsError);
      return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
    }

    // Calculate leaderboard scores for each user
    const leaderboardData = users
      .map(user => {
        const userAttempts = (attempts || []).filter(attempt => attempt.user_id === user.id);
        const completedAttempts = userAttempts.filter(attempt => attempt.status === 'completed');
        
        if (completedAttempts.length === 0) {
          return null; // Skip users with no completed attempts
        }

        // Calculate total score and average
        const totalScore = completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
        const averageScore = totalScore / completedAttempts.length;
        
        // Calculate total completed tasks across all simulations
        const totalCompletedTasks = completedAttempts.length; // Each completed attempt = 1 simulation completed
        
        // Leaderboard score: weighted combination of completed simulations and average score
        // 70% weight on number of completed simulations, 30% on average score
        const leaderboardScore = (totalCompletedTasks * 0.7) + (averageScore * 0.3);

        return {
          id: user.id,
          name: user.name || 'Anonymous',
          email: user.email,
          photo_url: user.photo_url,
          totalCompletedSimulations: totalCompletedTasks,
          averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
          totalScore: Math.round(totalScore * 10) / 10,
          leaderboardScore: Math.round(leaderboardScore * 100) / 100,
          completedAt: completedAttempts.map(a => a.completed_at).sort().reverse()[0] // Most recent completion
        };
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => {
        // Primary sort: leaderboard score (descending)
        if (b.leaderboardScore !== a.leaderboardScore) {
          return b.leaderboardScore - a.leaderboardScore;
        }
        // Secondary sort: total completed simulations (descending)
        if (b.totalCompletedSimulations !== a.totalCompletedSimulations) {
          return b.totalCompletedSimulations - a.totalCompletedSimulations;
        }
        // Tertiary sort: average score (descending)
        return b.averageScore - a.averageScore;
      });

    return NextResponse.json({ leaderboard: leaderboardData });
  } catch (error: any) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
