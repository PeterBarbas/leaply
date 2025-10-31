"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Users,
  BookOpen,
  CheckCircle,
  Lock,
  Play,
  Target,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FullscreenVideoPlayer from "@/components/ui/FullscreenVideoPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";

type Sim = {
  id: string;
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
  expected_input?: 
    | { type: "text"; placeholder?: string }
    | { 
        type: "multiple_choice"; 
        question: string; 
        options: string[]; 
        correct_answer: number; 
        explanation?: string; 
      }
    | { 
        type: "drag_drop"; 
        question: string; 
        pairs: Array<{ left: string; right: string }>; 
        explanation?: string; 
      }
  stage?: number;
};

export default function SimulationPageClient({
  sim,
  attemptId,
  completedTasks = [],
  userId,
}: {
  sim: Sim;
  attemptId: string;
  completedTasks?: number[];
  userId?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const tasks = (sim.steps || []) as TaskStep[];
  const roleInfo = sim.role_info;

  // Session storage key for this simulation
  const sessionKey = `simulation_progress_${sim.slug}`;

  // Track hydration to avoid client/server HTML mismatches
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Initialize localCompletedTasks from sessionStorage first for guests to unlock immediately
  const initializeCompletedTasks = (): number[] => {
    try {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem(sessionKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.completedTasks)) {
            const nums = (parsed.completedTasks as any[])
              .map((v) => Number(v))
              .filter((n) => Number.isFinite(n));
            if (nums.length) return nums;
          }
        }
      }
    } catch {}
    return Array.isArray(completedTasks) ? completedTasks : [];
  };

  const [email, setEmail] = useState("");
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [localCompletedTasks, setLocalCompletedTasks] =
    useState<number[]>(initializeCompletedTasks);
  const [activeTab, setActiveTab] = useState<"tasks" | "guide">("tasks");
  const [previousTab, setPreviousTab] = useState<"tasks" | "guide">("tasks");
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoPayload, setVideoPayload] = useState<{ url: string; title?: string; description?: string } | null>(null);

  const allTasksCompleted = localCompletedTasks.length === tasks.length;

  // Open completion modal when all tasks are completed
  useEffect(() => {
    if (allTasksCompleted) setIsCompleteModalOpen(true);
  }, [allTasksCompleted]);

  // Auto-send results to logged-in users when all tasks are completed
  useEffect(() => {
    if (allTasksCompleted && user && user.email && !emailSent && !emailLoading) {
      handleAutoSendResults();
    }
  }, [allTasksCompleted, user, emailSent, emailLoading]);

  const handleAutoSendResults = async () => {
    if (!user?.email) return;

    try {
      setEmailLoading(true);
      setEmailError(null);

      const res = await fetch("/api/attempt/request-results", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, email: user.email }),
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

  // Save progress to sessionStorage whenever completed tasks change
  useEffect(() => {
    const progressData = {
      attemptId,
      completedTasks: localCompletedTasks,
      timestamp: Date.now(),
      simulationSlug: sim.slug,
      totalTasks: tasks.length,
    };
    sessionStorage.setItem(sessionKey, JSON.stringify(progressData));
  }, [attemptId, localCompletedTasks, sessionKey, sim.slug, tasks.length]);

  // Initialize/merge progress: prefer sessionStorage when present (guest), merge with server
  useEffect(() => {
    let sessionList: number[] = [];
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.completedTasks)) {
          sessionList = (parsed.completedTasks as any[])
            .map((v) => Number(v))
            .filter((n) => Number.isFinite(n));
          console.log('Loaded from sessionStorage:', sessionList);
        }
      }
    } catch (error) {
      console.error('Failed to read sessionStorage in merge effect:', error);
    }

    const serverList = Array.isArray(completedTasks) ? completedTasks : [];
    // For guests, prioritize sessionStorage. For logged-in users, merge both
    const merged = userId 
      ? Array.from(new Set([...(sessionList || []), ...(serverList || [])])).sort((a, b) => a - b)
      : sessionList.length > 0 ? sessionList : serverList;

    console.log('Merged completed tasks:', merged, '(session:', sessionList, ', server:', serverList, ')');
    setLocalCompletedTasks(merged);

    // Persist merged back to session for guests
    try {
      const payload = {
        attemptId,
        completedTasks: merged,
        timestamp: Date.now(),
        simulationSlug: sim.slug,
        totalTasks: tasks.length,
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to save merged progress to sessionStorage:', error);
    }
  }, [attemptId, completedTasks, sessionKey, sim.slug, tasks.length, userId]);

  // Also re-sync guest progress from sessionStorage when page regains focus or storage changes
  useEffect(() => {
    const syncFromSession = () => {
      try {
        const saved = sessionStorage.getItem(sessionKey);
        if (!saved) return;
        const progress = JSON.parse(saved);
        if (Array.isArray(progress.completedTasks)) {
          const nums = (progress.completedTasks as any[]).map((v: any) => Number(v)).filter((n: number) => Number.isFinite(n));
          setLocalCompletedTasks(nums);
        }
      } catch {}
    };
    syncFromSession();
    window.addEventListener('focus', syncFromSession);
    window.addEventListener('storage', syncFromSession);
    return () => {
      window.removeEventListener('focus', syncFromSession);
      window.removeEventListener('storage', syncFromSession);
    };
  }, [sessionKey]);

  // Load progress from database for logged-in users
  useEffect(() => {
    if (userId && attemptId) {
      const loadProgressFromDatabase = async () => {
        try {
          const response = await fetch(
            `/api/attempt/progress?attemptId=${attemptId}`
          );
          if (response.ok) {
            const data = await response.json();
            setLocalCompletedTasks(data.completedTasks);

            // Update sessionStorage to match database
            const progressData = {
              attemptId,
              completedTasks: data.completedTasks,
              timestamp: Date.now(),
              simulationSlug: sim.slug,
              totalTasks: tasks.length,
            };
            sessionStorage.setItem(sessionKey, JSON.stringify(progressData));
          }
        } catch (error) {
          console.error("Failed to load progress from database:", error);
        }
      };

      loadProgressFromDatabase();
    }
  }, [userId, attemptId, sessionKey, sim.slug, tasks.length]);

  // Function to mark a task as completed (can be called from task pages)
  const markTaskCompleted = (taskIndex: number) => {
    if (!localCompletedTasks.includes(taskIndex)) {
      setLocalCompletedTasks((prev) => [...prev, taskIndex]);
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

  const handleDayInLifeClick = () => {
    // Save current tab so we can restore it when video closes
    setPreviousTab(activeTab);
    const videoUrl = roleInfo?.day_in_life_video || roleInfo?.videoUrl;
    if (videoUrl) {
      setVideoPayload({ 
        url: videoUrl, 
        title: `Day in the Life: ${sim.title}`,
        description: `Experience a day in the life of a ${sim.title}`
      });
      setShowVideoPlayer(true);
    }
  };

  const handleVideoClose = () => {
    setShowVideoPlayer(false);
    // Restore the previous tab
    setActiveTab(previousTab);
  };

  const getTaskStatus = (
    index: number
  ): "completed" | "available" | "current" | "locked" => {
    const completedForView = hydrated
      ? localCompletedTasks
      : (Array.isArray(completedTasks) ? completedTasks : []);

    // Check if this task is completed
    const isCompleted = completedForView.includes(index);
    if (isCompleted) {
      return "completed";
    }

    // First task is always available
    if (index === 0) return "available";

    // Task is available only if previous task is completed
    const prevCompleted = completedForView.includes(index - 1);
    if (prevCompleted) {
      return "available";
    }

    // Otherwise it's locked
    return "locked";
  };

  // Compute the active (next) lesson index to focus/scroll into view
  const getActiveLessonIndex = (): number | null => {
    // Don't scroll if all tasks are completed
    if (allTasksCompleted) return null;
    
    for (let i = 0; i < tasks.length; i++) {
      const status = getTaskStatus(i);
      if (status === "available" || status === "current") return i;
    }
    return null;
  };

  // Scroll into view of the active lesson when landing on the stages page
  useEffect(() => {
    // Don't scroll if all tasks are completed
    if (allTasksCompleted) return;

    // Immediate scroll attempt
    const scrollToActive = () => {
      const activeIndex = getActiveLessonIndex();
      if (activeIndex === null) return false;
      
      const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
      const id = isMobile ? `task-mobile-${activeIndex}` : `task-desktop-${activeIndex}`;
      const el = document.getElementById(id) || document.getElementById(`task-${activeIndex}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        return true;
      }
      return false;
    };

    // Try immediately, then with small delays if elements aren't ready
    if (!scrollToActive()) {
      const timer1 = setTimeout(() => {
        if (!scrollToActive()) {
          const timer2 = setTimeout(scrollToActive, 200);
          return () => clearTimeout(timer2);
        }
      }, 100);
      return () => clearTimeout(timer1);
    }
  }, [localCompletedTasks, tasks.length, allTasksCompleted]);

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
    const task = tasks[index];
    const stage = task?.stage || 1;

    const stageColors = {
      1: {
        // Easy - Blue
        completed:
          "bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700",
        current:
          "bg-blue-100 border-blue-300 hover:bg-blue-200 dark:bg-blue-900/20 dark:border-blue-700",
        locked:
          "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600",
        default:
          "bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/10 dark:border-blue-700 dark:hover:bg-blue-900/20",
      },
      2: {
        // Medium - Orange
        completed:
          "bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700",
        current:
          "bg-orange-100 border-orange-300 hover:bg-orange-200 dark:bg-orange-900/20 dark:border-orange-700",
        locked:
          "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600",
        default:
          "bg-orange-50 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/10 dark:border-orange-700 dark:hover:bg-orange-900/20",
      },
      3: {
        // Hard - Red
        completed:
          "bg-green-100 border-green-300 hover:bg-green-200 dark:bg-green-900/20 dark:border-green-700",
        current:
          "bg-red-100 border-red-300 hover:bg-red-200 dark:bg-red-900/20 dark:border-red-700",
        locked:
          "bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600",
        default:
          "bg-red-50 border-red-200 hover:bg-red-100 dark:bg-red-900/10 dark:border-red-700 dark:hover:bg-red-900/20",
      },
    };

    const colors =
      stageColors[stage as keyof typeof stageColors] || stageColors[1];

    switch (status) {
      case "completed":
        return colors.completed;
      case "current":
        return colors.current;
      case "locked":
        return colors.locked;
      default:
        return colors.default;
    }
  };

  const getStageColor = (stage: number) => {
    switch (stage) {
      case 1:
        return "text-blue-600 dark:text-blue-400";
      case 2:
        return "text-orange-600 dark:text-orange-400";
      case 3:
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStageGradient = (stage: number) => {
    switch (stage) {
      case 1:
        return "from-blue-400 via-blue-500 to-indigo-600";
      case 2:
        return "from-orange-400 via-orange-500 to-red-600";
      case 3:
        return "from-red-400 via-red-500 to-pink-600";
      default:
        return "from-gray-400 via-gray-500 to-gray-600";
    }
  };

  const getStageShadow = (stage: number) => {
    switch (stage) {
      case 1:
        return "shadow-xl shadow-blue-500/50";
      case 2:
        return "shadow-xl shadow-orange-500/50";
      case 3:
        return "shadow-xl shadow-red-500/50";
      default:
        return "shadow-xl shadow-gray-500/50";
    }
  };

  const getStageIconColor = (stage: number) => {
    switch (stage) {
      case 1:
        return "text-blue-500";
      case 2:
        return "text-orange-500";
      case 3:
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStageBadgeColor = (stage: number) => {
    switch (stage) {
      case 1:
        return "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg";
      case 2:
        return "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg";
      case 3:
        return "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg";
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg";
    }
  };

  // If role_info is missing, continue to render the full tasks UI.

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Back Button */}
      <div className="mb-14">
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all roles
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
          Complete each task to fully understand the role.
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex justify-center mb-8"
      >
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(roleInfo?.day_in_life_video || roleInfo?.videoUrl) && (
            <button
              onClick={handleDayInLifeClick}
              className="px-6 py-2 rounded-md text-sm font-medium transition-all text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-0 border-0"
            >
              Day in the life
            </button>
          )}
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "tasks"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "guide"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            Guide
          </button>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {activeTab === "tasks" ? (
          /* Tasks Tab Content */
          <div>
            {/* Desktop: Horizontal Layout with Stages */}
            <div className="hidden md:block relative w-full mx-auto mt-16 mb-10 px-6">
              {[1, 2, 3].map((stageNumber) => {
                const stageTasks = tasks.filter(
                  (task) => (task.stage || 1) === stageNumber
                );
                if (stageTasks.length === 0) return null;

                return (
                  <div key={stageNumber} className="mb-16">
                    {/* Stage Divider */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                      <div className="mx-6 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <span
                          className={`text-sm font-semibold ${getStageColor(
                            stageNumber
                          )}`}
                        >
                          Stage {stageNumber}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    </div>

                    {/* Stage Tasks - Alternating S Pattern */}
                    <div className="relative py-8 overflow-x-auto">
                      <div className="flex relative justify-center items-center gap-16 min-h-[200px]">
                        {stageTasks.map((task, stageIndex) => {
                          const index = tasks.indexOf(task);
                          const status = getTaskStatus(index);
                          const isCompleted = status === "completed";
                          const isLocked = status === "locked";
                          const isClickable = !isCompleted && !isLocked;

                          // Straight line layout: remove S-curve vertical lift
                          const lift = 0;

                          return (
                                <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.3, y: 20 }}
                              animate={{ opacity: 1, scale: 1, y: lift }}
                              transition={{
                                delay: 0.3 + index * 0.1,
                                duration: 0.6,
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                              }}
                              className="relative flex flex-col items-center"
                                  id={`task-desktop-${index}`}
                            >
                              <motion.div
                                whileHover={
                                  isClickable
                                    ? {
                                        scale: 1.08,
                                        y: -4,
                                      }
                                    : {}
                                }
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                                className="relative"
                                onClick={() => handleStartTask(index)}
                              >
                                {/* Outer Glow Ring for Completed */}
                                <motion.div
                                  className={`absolute -inset-2 rounded-full bg-green-400/20 blur-lg ${isCompleted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                  animate={isCompleted ? { scale: [1, 1.15, 1] } : undefined}
                                  transition={isCompleted ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
                                />

                                {/* Main Task Circle */}
                                <div
                                  className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isCompleted
                                      ? "bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 shadow-xl shadow-green-500/50"
                                      : isLocked
                                      ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-lg opacity-60"
                                      : `bg-gradient-to-br ${getStageGradient(
                                          task.stage || 1
                                        )} ${getStageShadow(task.stage || 1)}`
                                  } ${
                                    isClickable
                                      ? "cursor-pointer hover:shadow-2xl"
                                      : "cursor-not-allowed"
                                  }`}
                                >
                                  {/* Inner White Circle */}
                                  <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/95">
                                    {/* Icon */}
                                    <div
                                      className={
                                        isCompleted
                                          ? "text-green-500"
                                          : isLocked
                                          ? "text-gray-400"
                                          : getStageIconColor(task.stage || 1)
                                      }
                                    >
                                      {isCompleted ? (
                                        <motion.div
                                          initial={{ scale: 0, rotate: -180 }}
                                          animate={{ scale: 1, rotate: 0 }}
                                          transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            delay: 0.1,
                                          }}
                                        >
                                          <CheckCircle className="h-10 w-10" />
                                        </motion.div>
                                      ) : isLocked ? (
                                        <Lock className="h-9 w-9" />
                                      ) : (
                                        <motion.div
                                          animate={{
                                            y: [-2, 2, -2],
                                          }}
                                          transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                          }}
                                        >
                                          <Play
                                            className="h-9 w-9"
                                            fill="currentColor"
                                          />
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Task Number Badge - Bottom Center */}
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      delay: 0.4 + index * 0.1,
                                      type: "spring",
                                    }}
                                    className={`absolute -bottom-1 right-0 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                      isCompleted
                                        ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg"
                                        : isLocked
                                        ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md"
                                        : getStageBadgeColor(task.stage || 1)
                                    }`}
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
                                className="mt-3 text-center max-w-[120px]"
                              >
                                <p className="text-xs font-medium text-muted-foreground line-clamp-2">
                                  {task.title || `Task ${index + 1}`}
                                </p>
                              </motion.div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: Vertical Layout with Stages */}
            <div className="md:hidden relative w-full mx-auto mt-16 mb-10 px-6">
              {[1, 2, 3].map((stageNumber) => {
                const stageTasks = tasks.filter(
                  (task) => (task.stage || 1) === stageNumber
                );
                if (stageTasks.length === 0) return null;

                return (
                  <div key={stageNumber} className="mb-12">
                    {/* Stage Divider - Mobile */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                      <div className="mx-4 px-3 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <span
                          className={`text-xs font-semibold ${getStageColor(
                            stageNumber
                          )}`}
                        >
                          Stage {stageNumber}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    </div>

                    {/* Stage Tasks - Mobile with Alternating S Pattern */}
                    <div className="relative py-6 min-h-[300px]">
                      <div className="flex flex-col items-center gap-8">
                        {stageTasks.map((task, stageIndex) => {
                          const index = tasks.indexOf(task);
                          const status = getTaskStatus(index);
                          const isCompleted = status === "completed";
                          const isLocked = status === "locked";
                          const isClickable = !isCompleted && !isLocked;

                          // Straight line layout: remove S-curve horizontal shift on mobile
                          const shift = 0;

                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.3, x: 20 }}
                              animate={{ opacity: 1, scale: 1, x: shift }}
                              transition={{
                                delay: 0.3 + index * 0.1,
                                duration: 0.6,
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                              }}
                              className="relative flex flex-col items-center"
                              id={`task-mobile-${index}`}
                            >
                              <motion.div
                                whileHover={
                                  isClickable
                                    ? {
                                        scale: 1.08,
                                        y: -4,
                                      }
                                    : {}
                                }
                                whileTap={isClickable ? { scale: 0.95 } : {}}
                                className="relative"
                                onClick={() => handleStartTask(index)}
                              >
                                {/* Outer Glow Ring for Completed */}
                                <motion.div
                                  className={`absolute -inset-2 rounded-full bg-green-400/20 blur-lg ${isCompleted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                                  animate={isCompleted ? { scale: [1, 1.15, 1] } : undefined}
                                  transition={isCompleted ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
                                />

                                {/* Main Task Circle - Smaller on mobile */}
                                <div
                                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isCompleted
                                      ? "bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 shadow-xl shadow-green-500/50"
                                      : isLocked
                                      ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 shadow-lg opacity-60"
                                      : `bg-gradient-to-br ${getStageGradient(
                                          task.stage || 1
                                        )} ${getStageShadow(task.stage || 1)}`
                                  } ${
                                    isClickable
                                      ? "cursor-pointer hover:shadow-2xl"
                                      : "cursor-not-allowed"
                                  }`}
                                >
                                  {/* Inner White Circle */}
                                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/95">
                                    {/* Icon */}
                                    <div
                                      className={
                                        isCompleted
                                          ? "text-green-500"
                                          : isLocked
                                          ? "text-gray-400"
                                          : getStageIconColor(task.stage || 1)
                                      }
                                    >
                                      {isCompleted ? (
                                        <motion.div
                                          initial={{ scale: 0, rotate: -180 }}
                                          animate={{ scale: 1, rotate: 0 }}
                                          transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            delay: 0.1,
                                          }}
                                        >
                                          <CheckCircle className="h-8 w-8" />
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
                                            ease: "easeInOut",
                                          }}
                                        >
                                          <Play
                                            className="h-7 w-7"
                                            fill="currentColor"
                                          />
                                        </motion.div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Task Number Badge - Bottom Center */}
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      delay: 0.4 + index * 0.1,
                                      type: "spring",
                                    }}
                                    className={`absolute -bottom-1 right-0 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                      isCompleted
                                        ? "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg"
                                        : isLocked
                                        ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-md"
                                        : getStageBadgeColor(task.stage || 1)
                                    }`}
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion Modal (formatted like Experiment "Get Early Access") */}
            <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center text-xl font-semibold">
                    All Tasks Complete!
                  </DialogTitle>
                </DialogHeader>

                {user ? (
                  <div className="py-4 text-center">
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      Great job! Your results are being sent to your email automatically.
                    </p>
                    {emailLoading ? (
                      <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" />
                        <span className="font-medium">Sending results to {user.email}...</span>
                      </div>
                    ) : emailSent ? (
                      <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                        <span className="font-medium">🚀 Results sent to {user.email}!</span>
                      </div>
                    ) : null}
                    {emailError && (
                      <p className="text-red-600 text-sm mt-2">{emailError}</p>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!email.trim() || emailLoading) return;
                      handleEmailSubmit();
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="results-email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address
                      </label>
                      <Input
                        id="results-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCompleteModalOpen(false)}
                        className="flex-1"
                      >
                        Close
                      </Button>
                      <Button
                        type="submit"
                        disabled={emailLoading || !email.trim()}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {emailLoading ? "Sending..." : "Send Results"}
                      </Button>
                    </div>
                    {emailError && (
                      <p className="text-red-600 text-sm mt-1 text-center">{emailError}</p>
                    )}
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          /* Guide Tab Content - Role Information */
          <div className="space-y-8">
            {/* Role Overview */}
            {roleInfo?.overview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm"
              >
                <h2 className="text-2xl font-semibold mb-4">About This Role</h2>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  {roleInfo.overview}
                </p>
              </motion.div>
            )}

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
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-200 via-green-400 to-green-600" />
                        <div className="space-y-4">
                          {roleInfo.careerPath.map(
                            (path: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: 0.3 + index * 0.1,
                                  duration: 0.4,
                                }}
                                className="relative flex items-start gap-4"
                              >
                                {/* Timeline Node */}
                                <div className="relative z-10 flex-shrink-0">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                      index === 0
                                        ? "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50"
                                        : index === roleInfo.careerPath.length - 1
                                        ? "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/50"
                                        : "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/50"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  {/* Glow effect for current role */}
                                  {index === 0 && (
                                    <motion.div
                                      className="absolute inset-0 rounded-full bg-green-400/30 blur-md"
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                      }}
                                    />
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1">
                                  <div
                                    className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                      index === 0
                                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800"
                                        : index === roleInfo.careerPath.length - 1
                                        ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 dark:from-purple-950/20 dark:to-indigo-950/20 dark:border-purple-800"
                                        : "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800"
                                    }`}
                                  >
                                    <p
                                      className={`text-sm font-medium leading-relaxed ${
                                        index === 0
                                          ? "text-green-800 dark:text-green-200"
                                          : index === roleInfo.careerPath.length - 1
                                          ? "text-purple-800 dark:text-purple-200"
                                          : "text-blue-800 dark:text-blue-200"
                                      }`}
                                    >
                                      {path}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          )}
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
                      <p className="text-2xl font-semibold text-emerald-600 whitespace-pre-line">
                        {roleInfo.salaryRange}
                      </p>
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
                      <p className="text-sm leading-relaxed">
                        {roleInfo.growthOutlook}
                      </p>
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
                        {roleInfo.industries.map(
                          (industry: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {industry}
                            </Badge>
                          )
                        )}
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
                      <p className="text-sm leading-relaxed">
                        {roleInfo.education}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Ideal Traits */}
              {roleInfo.personalityTraits &&
                roleInfo.personalityTraits.length > 0 && (
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
                          {roleInfo.personalityTraits.map(
                            (trait: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {trait}
                              </Badge>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
            </div>
          </div>
        )}
      </motion.div>
      {showVideoPlayer && videoPayload && (
        <FullscreenVideoPlayer
          videoUrl={videoPayload.url}
          title={videoPayload.title}
          description={videoPayload.description}
          onClose={handleVideoClose}
        />
      )}
    </div>
  );
}
