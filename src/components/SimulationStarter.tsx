"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SimulationRunner from "./SimulationRunner";

type Step =
  | { kind: "prompt"; index: number; label: string }
  | { kind: "mcq"; index: number; label: string; options: string[] };

export default function SimulationStarter({ simulationSlug }: { simulationSlug: string }) {
  const [loading, setLoading] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAttempt = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ RELATIVE URL (no NEXT_PUBLIC_SITE_URL)
      const res = await fetch("/api/attempt/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ simulationSlug }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to start attempt");

      setAttemptId(data.attemptId);
      setSteps(data.steps);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (attemptId && steps) {
    return <SimulationRunner attemptId={attemptId} steps={steps} />;
  }

  return (
    <div className="mt-6">
      <Button onClick={startAttempt} disabled={loading}>
        {loading ? "Starting..." : "Start attempt"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
