"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw, Eye } from "lucide-react";

type SimulationProgress = {
  attemptId: string;
  completedTasks: number[];
  timestamp: number;
  simulationSlug: string;
  totalTasks?: number;
};

export default function SimulationStarter({ simulationSlug }: { simulationSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SimulationProgress | null>(null);

  // Check for existing progress on mount
  useEffect(() => {
    const sessionKey = `simulation_progress_${simulationSlug}`;
    const savedProgress = sessionStorage.getItem(sessionKey);
    
    if (savedProgress) {
      try {
        const progressData: SimulationProgress = JSON.parse(savedProgress);
        // Only use progress if it's recent (within 24 hours)
        if (Date.now() - progressData.timestamp < 24 * 60 * 60 * 1000) {
          setProgress(progressData);
        } else {
          // Clear old progress
          sessionStorage.removeItem(sessionKey);
        }
      } catch (error) {
        console.error('Failed to parse saved progress:', error);
        sessionStorage.removeItem(sessionKey);
      }
    }
  }, [simulationSlug]);

  const startAttempt = async () => {
    try {
      setLoading(true);
      setError(null);

      // Redirect directly to the main simulation page - it will create the attempt automatically
      router.push(`/s/${simulationSlug}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const continueAttempt = async () => {
    try {
      setLoading(true);
      setError(null);

      // Redirect to main simulation page with existing attemptId
      if (progress?.attemptId) {
        router.push(`/s/${simulationSlug}?attemptId=${progress.attemptId}`);
      } else {
        router.push(`/s/${simulationSlug}`);
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const viewSimulation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Redirect to main simulation page to view completed simulation
      if (progress?.attemptId) {
        router.push(`/s/${simulationSlug}?attemptId=${progress.attemptId}`);
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Determine button state
  const hasProgress = progress && progress.completedTasks.length > 0;
  const isCompleted = progress && progress.totalTasks && 
                      progress.completedTasks.length === progress.totalTasks;

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      {isCompleted ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
            <Button 
              onClick={viewSimulation} 
              disabled={loading} 
              className="w-full sm:w-auto sm:min-w-[200px]"
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  View Simulation
                </>
              )}
            </Button>
            <Button 
              onClick={startAttempt} 
              disabled={loading} 
              variant="outline"
              className="w-full sm:w-auto sm:min-w-[200px]"
            >
              Start New Attempt
            </Button>
          </div>
        </>
      ) : hasProgress ? (
        <>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
            <Button 
              onClick={continueAttempt} 
              disabled={loading} 
              className="w-full sm:w-auto sm:min-w-[200px]"
            >
              {loading ? (
                "Loading..."
              ) : (
                <>
                  Continue Simulation
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {progress.completedTasks.length} task{progress.completedTasks.length !== 1 ? 's' : ''} completed
          </p>
        </>
      ) : (
        <Button 
          onClick={startAttempt} 
          disabled={loading} 
          className="w-full sm:w-auto sm:min-w-[200px]"
        >
          {loading ? (
            "Starting..."
          ) : (
            <>
              Start Attempt
            </>
          )}
        </Button>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
