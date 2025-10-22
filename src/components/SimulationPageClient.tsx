"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, DollarSign, Users, BookOpen } from "lucide-react";
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
        <div className="space-y-8 mb-12">
          {/* Top Row - Career Path and Salary/Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Career Path */}
            {roleInfo.careerPath && roleInfo.careerPath.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Career Path
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Timeline */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-200 via-green-400 to-green-600"></div>
                      
                      <div className="space-y-4">
                        {roleInfo.careerPath.map((path: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                            className="relative flex items-start gap-4"
                          >
                            {/* Timeline Node */}
                            <div className="relative z-10 flex-shrink-0">
                              <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                                ${index === 0 
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50' 
                                  : index === roleInfo.careerPath.length - 1
                                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/50'
                                  : 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50'
                                }
                              `}>
                                {index + 1}
                              </div>
                              {/* Glow effect for current role */}
                              {index === 0 && (
                                <motion.div
                                  className="absolute inset-0 rounded-full bg-green-400/30 blur-md"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                              )}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 pt-1">
                              <div className={`
                                p-3 rounded-lg border transition-all duration-200 hover:shadow-md
                                ${index === 0 
                                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800' 
                                  : index === roleInfo.careerPath.length - 1
                                  ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 dark:from-purple-950/20 dark:to-indigo-950/20 dark:border-purple-800'
                                  : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800'
                                }
                              `}>
                                <p className={`
                                  text-sm font-medium leading-relaxed
                                  ${index === 0 
                                    ? 'text-green-800 dark:text-green-200' 
                                    : index === roleInfo.careerPath.length - 1
                                    ? 'text-purple-800 dark:text-purple-200'
                                    : 'text-blue-800 dark:text-blue-200'
                                  }
                                `}>
                                  {path}
                                </p>
                            
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Salary & Growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
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

          {/* Bottom Row - Industries, Education, and Traits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Industries */}
            {roleInfo.industries && roleInfo.industries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
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

            {/* Education */}
            {roleInfo.education && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
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
              </motion.div>
            )}

            {/* Ideal Traits */}
            {roleInfo.personalityTraits && roleInfo.personalityTraits.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
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
              </motion.div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
