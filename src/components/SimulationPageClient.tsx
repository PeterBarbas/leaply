"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import SimulationStarter from "@/components/SimulationStarter";

type Sim = {
  slug: string;
  title: string;
  steps: any[] | null;
  rubric: string[] | null;
  active: boolean;
};

export default function SimulationPageClient({ sim }: { sim: Sim }) {
  const stepCount = Array.isArray(sim.steps) ? sim.steps.length : 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to simulations
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          {sim.title}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-muted-foreground">
          {stepCount} short tasks · ~10 minutes total
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-8 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm"
      >
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p>
            You’ll work through realistic, day-to-day tasks for this role. Each takes
            about 5–10 minutes and includes hints, feedback, and a senior example.
          </p>
        </div>

        <div className="mt-8">
          <SimulationStarter simulationSlug={sim.slug} />
        </div>
      </motion.div>
    </div>
  );
}
