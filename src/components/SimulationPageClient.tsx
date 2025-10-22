"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Lightbulb, TrendingUp, DollarSign, Users, BookOpen, Target, Briefcase } from "lucide-react";
import SimulationStarter from "@/components/SimulationStarter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Sim = {
  slug: string;
  title: string;
  steps: any[] | null;
  rubric: string[] | null;
  role_info: any | null;
  active: boolean;
};

export default function SimulationPageClient({ sim }: { sim: Sim }) {
  const stepCount = Array.isArray(sim.steps) ? sim.steps.length : 0;
  const roleInfo = sim.role_info;

  // Fallback for simulations without role_info
  if (!roleInfo) {
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
              You'll work through realistic, day-to-day tasks for this role. Each takes
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

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to simulations
        </Link>
      </div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          {sim.title}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6">
          {stepCount} realistic tasks · ~10 minutes total
        </p>
        {roleInfo?.overview && (
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto leading-relaxed mb-8">
            {roleInfo.overview}
          </p>
        )}
      </motion.div>

      {/* Simulation Starter - Moved to top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm mb-12"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Ready to Experience This Role?</h2>
          <p className="text-muted-foreground">
            Work through realistic, day-to-day tasks for this role. Each takes about 5–10 minutes 
            and includes hints, feedback, and a senior example.
          </p>
        </div>
        <SimulationStarter simulationSlug={sim.slug} />
      </motion.div>

      {/* Role Information Grid */}
      {roleInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Fun Facts */}
          {roleInfo.funFacts && roleInfo.funFacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Fun Facts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {roleInfo.funFacts.map((fact: string, index: number) => (
                      <li key={index} className="text-sm leading-relaxed flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Skills Needed */}
          {roleInfo.skillsNeeded && roleInfo.skillsNeeded.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Key Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {roleInfo.skillsNeeded.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Career Path */}
          {roleInfo.careerPath && roleInfo.careerPath.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Career Path
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {roleInfo.careerPath.map((path: string, index: number) => (
                      <li key={index} className="text-sm leading-relaxed flex items-start gap-2">
                        <span className="text-green-500 mt-1">→</span>
                        {path}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Salary & Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-4"
          >
            {roleInfo.salaryRange && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-500" />
                    Salary Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-emerald-600">{roleInfo.salaryRange}</p>
                </CardContent>
              </Card>
            )}

            {roleInfo.growthOutlook && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    Growth Outlook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{roleInfo.growthOutlook}</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      )}

      {/* Additional Information */}
      {roleInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Daily Tasks */}
          {roleInfo.dailyTasks && roleInfo.dailyTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Briefcase className="h-4 w-4 text-orange-500" />
                    Daily Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {roleInfo.dailyTasks.map((task: string, index: number) => (
                      <li key={index} className="text-sm leading-relaxed flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Industries */}
          {roleInfo.industries && roleInfo.industries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-indigo-500" />
                    Industries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {roleInfo.industries.map((industry: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Education & Traits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="space-y-4"
          >
            {roleInfo.education && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-4 w-4 text-teal-500" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{roleInfo.education}</p>
                </CardContent>
              </Card>
            )}

            {roleInfo.personalityTraits && roleInfo.personalityTraits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4 text-pink-500" />
                    Ideal Traits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {roleInfo.personalityTraits.map((trait: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}
