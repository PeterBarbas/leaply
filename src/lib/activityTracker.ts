/**
 * Utility functions for tracking user activity and calculating streaks
 */

export type ActivityType = 'simulation_completed' | 'simulation_started' | 'login' | 'discovery_session';

export interface ActivityMetadata {
  simulationId?: string;
  simulationSlug?: string;
  score?: number;
  [key: string]: any;
}

/**
 * Track user activity
 */
export async function trackActivity(
  activityType: ActivityType,
  metadata?: ActivityMetadata,
  activityDate?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/user/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityType,
        metadata,
        activityDate
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to track activity' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error tracking activity:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Get user streaks and recent activity
 */
export async function getUserStreaks(): Promise<{
  success: boolean;
  data?: {
    streaks: {
      current: number;
      longest: number;
      totalActiveDays: number;
    };
    recentActivity: Array<{
      activity_date: string;
      activity_type: ActivityType;
      metadata: ActivityMetadata;
    }>;
  };
  error?: string;
}> {
  try {
    const response = await fetch('/api/user/activity');

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Failed to fetch streaks' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user streaks:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Track simulation completion
 */
export async function trackSimulationCompleted(
  simulationId: string,
  simulationSlug: string,
  score: number
): Promise<{ success: boolean; error?: string }> {
  return trackActivity('simulation_completed', {
    simulationId,
    simulationSlug,
    score
  });
}

/**
 * Track simulation start
 */
export async function trackSimulationStarted(
  simulationId: string,
  simulationSlug: string
): Promise<{ success: boolean; error?: string }> {
  return trackActivity('simulation_started', {
    simulationId,
    simulationSlug
  });
}

/**
 * Track user login
 */
export async function trackLogin(): Promise<{ success: boolean; error?: string }> {
  return trackActivity('login');
}

/**
 * Track discovery session
 */
export async function trackDiscoverySession(
  questionsAnswered: number,
  finalRecommendation?: string
): Promise<{ success: boolean; error?: string }> {
  return trackActivity('discovery_session', {
    questionsAnswered,
    finalRecommendation
  });
}
