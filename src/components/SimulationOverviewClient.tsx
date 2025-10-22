"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Lock, Play, Clock, Target, ArrowLeft, Mail, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Sim = {
  slug: string;
  title: string;
  steps: any[] | null;
  rubric: string[] | null;
  role_info: any | null;
  active: boolean;
};

type TaskStep = {
  kind: "task";
  index: number;
  role?: string;
  title: string;
  summary_md?: string;
  hint_md?: string;
  resources?: Array<any>;
  expected_input?: { type: "text"; placeholder?: string };
};

export default function SimulationOverviewClient({ 
  sim, 
  attemptId, 
  completedTasks = [] 
}: { 
  sim: Sim; 
  attemptId: string; 
  completedTasks?: number[] 
}) {
  const router = useRouter();
  const tasks = (sim.steps || []) as TaskStep[];
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [localCompletedTasks, setLocalCompletedTasks] = useState<number[]>(completedTasks);

  const allTasksCompleted = localCompletedTasks.length === tasks.length;

  // Session storage key for this simulation
  const sessionKey = `simulation_progress_${sim.slug}`;

  // Save progress to sessionStorage whenever completed tasks change
  useEffect(() => {
    const progressData = {
      attemptId,
      completedTasks: localCompletedTasks,
      timestamp: Date.now(),
      simulationSlug: sim.slug,
      totalTasks: tasks.length
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(progressData));
  }, [attemptId, localCompletedTasks, sessionKey, sim.slug, tasks.length]);

  // Initialize with server data as source of truth
  useEffect(() => {
    // Server data is always the source of truth
    console.log('Server completed tasks:', completedTasks);
    setLocalCompletedTasks(completedTasks);
    
    // Update sessionStorage to match server
    const progressData = {
      attemptId,
      completedTasks: completedTasks,
      timestamp: Date.now(),
      simulationSlug: sim.slug,
      totalTasks: tasks.length
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(progressData));
  }, [attemptId, completedTasks, sessionKey, sim.slug, tasks.length]);

  // Function to mark a task as completed (can be called from task pages)
  const markTaskCompleted = (taskIndex: number) => {
    if (!localCompletedTasks.includes(taskIndex)) {
      setLocalCompletedTasks(prev => [...prev, taskIndex]);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    
    try {
      setEmailLoading(true);
      setEmailError(null);

      const res = await fetch("/api/attempt/request-results", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send results");

      setEmailSent(true);
    } catch (e: any) {
      setEmailError(e.message || "Failed to send results");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleStartTask = (taskIndex: number) => {
    if (!attemptId) return;
    const status = getTaskStatus(taskIndex);
    // Don't allow clicking on completed or locked tasks
    if (status === "completed" || status === "locked") return;
    router.push(`/s/${sim.slug}/task/${taskIndex}?attemptId=${attemptId}`);
  };

  const getTaskStatus = (index: number): "completed" | "available" | "current" | "locked" => {
    if (localCompletedTasks.includes(index)) return "completed";
    
    // First task is always available
    if (index === 0) return "available";
    
    // Task is available only if previous task is completed
    if (localCompletedTasks.includes(index - 1)) return "available";
    
    // Otherwise it's locked
    return "locked";
  };

  const getTaskIcon = (index: number) => {
    const status = getTaskStatus(index);
    switch (status) {
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "current":
        return <Play className="h-6 w-6 text-blue-500" />;
      case "locked":
        return <Lock className="h-6 w-6 text-gray-400" />;
      default:
        return <Target className="h-6 w-6 text-gray-600" />;
    }
  };

  const getTaskColor = (index: number) => {
    const status = getTaskStatus(index);
    switch (status) {
      case "completed":
        return "bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700";
      case "current":
        return "bg-blue-100 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:border-blue-700";
      case "locked":
        return "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600";
      default:
        return "bg-white border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700";
    }
  };


  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Back Button - Left aligned like simulation overview */}
      <div className="mb-14">
        <Link
          href={`/s/${sim.slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to role overview
        </Link>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          Your Career Path
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Complete each task to to fully understand the role.
        </p>
        
        {/* Progress Stats */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{localCompletedTasks.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{tasks.length}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((localCompletedTasks.length / tasks.length) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </div>
        </div>
      </motion.div>

      {/* Task Path */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative w-full mx-auto mt-16 mb-10 px-6"
      >
        {/* Desktop: Horizontal Layout with Curve */}
        <div className="hidden md:flex relative justify-center items-end gap-16 py-16 overflow-x-auto">
          {tasks.map((task, index) => {
            const status = getTaskStatus(index);
            const isCompleted = status === "completed";
            const isLocked = status === "locked";
            const isClickable = !isCompleted && !isLocked;
            
            // Create upward curve effect - middle tasks are higher
            const totalTasks = tasks.length;
            const midPoint = (totalTasks - 1) / 2;
            const distanceFromMid = Math.abs(index - midPoint);
            const maxLift = 40; // Maximum pixels to lift up
            const lift = maxLift - (distanceFromMid / midPoint) * maxLift;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.3, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: -lift }}
                transition={{ 
                  delay: 0.3 + index * 0.1, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="relative flex flex-col items-center"
                style={{ zIndex: 10 }}
              >
                <motion.div
                  whileHover={isClickable ? { 
                    scale: 1.08,
                    y: -4,
                  } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  className="relative"
                  onClick={() => handleStartTask(index)}
                >
                  {/* Outer Glow Ring for Completed */}
                  {isCompleted && (
                    <motion.div
                      className="absolute -inset-3 rounded-full bg-green-400/20 blur-lg"
                      animate={{ 
                        scale: [1, 1.15, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  {/* Main Task Circle */}
                  <div className={`
                    relative w-28 h-28 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted 
                      ? "bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 shadow-xl shadow-green-500/50" 
                      : isLocked
                      ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-lg opacity-60"
                      : "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-xl shadow-blue-500/50"
                    }
                    ${isClickable ? "cursor-pointer hover:shadow-2xl" : "cursor-not-allowed"}
                  `}>
                    {/* Inner White Circle */}
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/95">
                      {/* Icon */}
                      <div className={isCompleted ? "text-green-500" : isLocked ? "text-gray-400" : "text-blue-500"}>
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: 0.1
                            }}
                          >
                            <CheckCircle className="h-12 w-12" />
                          </motion.div>
                        ) : isLocked ? (
                          <Lock className="h-10 w-10" />
                        ) : (
                          <motion.div
                            animate={{ 
                              y: [-2, 2, -2],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Play className="h-10 w-10" fill="currentColor" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                    
                    {/* Task Number Badge - Bottom Right */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                      className={`
                        absolute -bottom-1 -right-1 w-9 h-9 rounded-full
                        flex items-center justify-center
                        font-bold text-sm
                        ${isCompleted 
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg" 
                          : isLocked
                          ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md"
                          : "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                        }
                      `}
                    >
                      {index + 1}
                    </motion.div>
                  </div>
                  
                </motion.div>
                
                {/* Task Title - Below bubble */}
                {/* <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="mt-3 text-center max-w-[120px]"
                >
                  <p className="text-xs font-medium text-muted-foreground line-clamp-2">
                    {task.title || `Task ${index + 1}`}
                  </p>
                </motion.div> */}
              </motion.div>
            );
          })}
        </div>
        
        {/* Mobile: Vertical Layout */}
        <div className="md:hidden space-y-8">
          {tasks.map((task, index) => {
            const status = getTaskStatus(index);
            const isCompleted = status === "completed";
            const isLocked = status === "locked";
            const isClickable = !isCompleted && !isLocked;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.3, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: 0.3 + index * 0.1, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className="relative flex flex-col items-center"
              >
                <motion.div
                  whileHover={isClickable ? { 
                    scale: 1.08,
                    y: -4,
                  } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  className="relative"
                  onClick={() => handleStartTask(index)}
                >
                  {/* Outer Glow Ring for Completed */}
                  {isCompleted && (
                    <motion.div
                      className="absolute -inset-2 rounded-full bg-green-400/20 blur-lg"
                      animate={{ 
                        scale: [1, 1.15, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  {/* Main Task Circle - Smaller on mobile */}
                  <div className={`
                    relative w-20 h-20 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted 
                      ? "bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 shadow-xl shadow-green-500/50" 
                      : isLocked
                      ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-lg opacity-60"
                      : "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-xl shadow-blue-500/50"
                    }
                    ${isClickable ? "cursor-pointer hover:shadow-2xl" : "cursor-not-allowed"}
                  `}>
                    {/* Inner White Circle */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/95">
                      {/* Icon */}
                      <div className={isCompleted ? "text-green-500" : isLocked ? "text-gray-400" : "text-blue-500"}>
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: 0.1
                            }}
                          >
                            <CheckCircle className="h-8 w-8"/>
                          </motion.div>
                        ) : isLocked ? (
                          <Lock className="h-7 w-7" />
                        ) : (
                          <motion.div
                            animate={{ 
                              y: [-2, 2, -2],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          >
                            <Play className="h-7 w-7" fill="currentColor" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                    
                    {/* Task Number Badge - Bottom Center */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                      className={`
                        absolute -bottom-1 right-0 -translate-x-1/2 w-7 h-7 rounded-full
                        flex items-center justify-center
                        font-bold text-xs
                        ${isCompleted 
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg" 
                          : isLocked
                          ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md"
                          : "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                        }
                      `}
                    >
                      {index + 1}
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Task Title - Below bubble */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="mt-3 text-center max-w-[200px]"
                >
                  <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                    {task.title || `Task ${index + 1}`}
                  </p>
                </motion.div>
                
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Completion Celebration */}
      {allTasksCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto rounded-2xl border-2 border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6">
              
              {/* Content */}
              <div className="flex-1 flex flex-col items-center text-center md:text-left">
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-1">
                  All Tasks Complete!
                </h2>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  Great job! Get your detailed results sent to your email.
                </p>

                {/* Email Form - Stacks on mobile */}
                {!emailSent ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 py-2 focus-visible:ring-0 focus-visible:ring-primary focus-visible:border-foreground/10"
                    />
                    <Button 
                      onClick={handleEmailSubmit}
                      disabled={emailLoading || !email.trim()}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      {emailLoading ? "Sending..." : "Send Results"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="font-medium">🚀 Results sent to {email}!</span>
                  </div>
                )}
                {emailError && (
                  <p className="text-red-600 text-sm mt-2">{emailError}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
