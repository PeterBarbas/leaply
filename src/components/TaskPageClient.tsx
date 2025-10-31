"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, User, Clock, Target, Paperclip, X, FileText, Image as ImageIcon, File, Code, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MultipleChoiceQuestion, { MultipleChoiceQuestionRef } from "@/components/ui/MultipleChoiceQuestion";
import DragDropQuestion from "@/components/ui/DragDropQuestion";
import CompletionScreen, { CompletionScreenProps } from "@/components/ui/CompletionScreen";
import FullscreenVideoPlayer from "@/components/ui/FullscreenVideoPlayer";

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
    | {
        type: "video";
        videoUrl: string;
        title?: string;
        description?: string;
      };
  stage?: number;
};

type TaskPageClientProps = {
  sim: Sim;
  task: TaskStep;
  taskIndex: number;
  attemptId: string;
  userId?: string;
};

export default function TaskPageClient({
  sim,
  task,
  taskIndex,
  attemptId,
  userId,
}: TaskPageClientProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [senior, setSenior] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [isMissionCollapsed, setIsMissionCollapsed] = useState(false);
  const [isSeniorCollapsed, setIsSeniorCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleChoiceRef = useRef<MultipleChoiceQuestionRef>(null);
  const [loading, setLoading] = useState<{ 
    senior?: boolean; 
    finish?: boolean 
  }>({});
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [questionResult, setQuestionResult] = useState<{ isCorrect: boolean; explanation?: string } | null>(null);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [completionResult, setCompletionResult] = useState<{ isCorrect: boolean; timeSpent?: string; xpEarned?: number; accuracy?: number } | null>(null);
  const [hasMultipleChoiceSelection, setHasMultipleChoiceSelection] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  
  // Calculate XP based on task level and correctness
  const calculateXP = (taskLevel: number, isCorrect: boolean): number => {
    // Base XP multipliers by level
    const levelMultipliers = {
      1: 10,  // Beginner
      2: 15,  // Easy
      3: 20,  // Medium
      4: 30,  // Hard
      5: 40,  // Expert
      6: 50,  // Master
    };

    // Get base XP for the level (default to level 1 if not found)
    const baseXP = levelMultipliers[taskLevel as keyof typeof levelMultipliers] || levelMultipliers[1];
    
    // Apply correctness multiplier
    const correctnessMultiplier = isCorrect ? 1.0 : 0.3; // 30% XP for incorrect answers
    
    return Math.round(baseXP * correctnessMultiplier);
  };

  // Audio for completion sound
  const playCompletionSound = () => {
    try {
      // Create a simple success sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a pleasant success sound (like Duolingo)
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set up the sound - a pleasant ascending tone
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      // Set volume envelope
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      // Fallback: try to play a simple beep if Web Audio API fails
      console.log('Audio playback not available');
    }
  };

  const totalTasks = sim.steps?.length || 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const handlePasteFile = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new (File as any)([blob], `pasted-image-${Date.now()}.png`, { type });
            setAttachments(prev => [...prev, file]);
          }
        }
      }
    } catch (error) {
      console.error('Paste failed:', error);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (file.type.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };




  async function getSeniorExample() {
    try {
      setLoading((l) => ({ ...l, senior: true }));
      const res = await fetch("/api/attempt/senior", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, stepIndex: task.index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not get senior example");
      // The API returns 'senior_solution_md', not 'senior_md'
      setSenior(data.senior_solution_md || "Here's how a senior professional might approach this task...");
    } catch (error) {
      console.error("Senior example error:", error);
      setSenior("Here's how a senior professional might approach this task...");
    } finally {
      setLoading((l) => ({ ...l, senior: false }));
    }
  }

  const handleComplete = async () => {
    // Video tasks: never considered complete. Just return to stages page immediately.
    if (task.expected_input?.type === "video") {
      router.push(`/s/${sim.slug}?attemptId=${attemptId}`);
      return;
    }

    // For multiple choice: compute correctness immediately from ref and show popup in one click
    if (task.expected_input?.type === "multiple_choice") {
      const refApi = multipleChoiceRef.current;
      if (!refApi?.hasSelection) return;
      // Determine correctness synchronously
      const selected = refApi.selectedIndex;
      const isCorrect = selected === task.expected_input.correct_answer;
      // Persist answer via existing API so onAnswer side-effects run
      refApi.finalizeAnswer();
      // Small tick to allow state to settle (keeps UI snappy without needing a second click)
      await Promise.resolve();

      const timeSpent = "1:32";
      const taskLevel = task.stage || 1;
      const xpEarned = calculateXP(taskLevel, isCorrect);
      const accuracy = isCorrect ? 100 : 50;

      setQuestionAnswered(true);
      setQuestionResult({ isCorrect, explanation: task.expected_input.explanation });
      setCompletionResult({ isCorrect, timeSpent, xpEarned, accuracy });
      // Always show completion popup for multiple choice (guest or logged in)
      playCompletionSound();
      setShowCompletionScreen(true);
      return;
    }

    // For drag_drop/text/video flows, keep existing gating
    if ((task.expected_input?.type === "drag_drop") && !questionAnswered) return;
    // For guests on text tasks, allow completion without input
    if (task.expected_input?.type === "text" && !input.trim() && userId) return;

    const isCorrect = questionResult?.isCorrect ?? true;
    const timeSpent = "1:32";
    const taskLevel = task.stage || 1;
    const xpEarned = calculateXP(taskLevel, isCorrect);
    const accuracy = isCorrect ? 100 : 50;

    setCompletionResult({ isCorrect, timeSpent, xpEarned, accuracy });
    // Show completion screen for all users (both logged in and guests)
    playCompletionSound();
    setShowCompletionScreen(true);
  };

  const handleCompletionClose = async () => {
    setIsNavigating(true);
    setLoading(prev => ({ ...prev, finish: true }));
    
    // Only try to save to database and claim XP if user is logged in
    if (userId) {
      try {
        // Save progress to database
        const response = await fetch('/api/attempt/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attemptId,
            taskIndex,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          // If attempt not found, continue with sessionStorage fallback
          if (response.status === 404) {
            console.log('Attempt not found, using sessionStorage fallback');
          } else {
            throw new Error(errorData.error || 'Failed to save progress');
          }
        }

        // Claim XP if user is authenticated and task was completed
        if (questionResult && attemptId !== 'test') {
          try {
            const taskLevel = task.stage || 1;
            const xpResponse = await fetch('/api/user/claim-xp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                attemptId,
                taskIndex,
                isCorrect: questionResult.isCorrect,
                taskLevel,
              }),
            });

            if (xpResponse.ok) {
              const xpData = await xpResponse.json();
              console.log('XP claimed successfully:', xpData);
            } else {
              console.error('Failed to claim XP:', await xpResponse.text());
            }
          } catch (xpError) {
            console.error('Error claiming XP:', xpError);
            // Don't fail the whole process if XP claiming fails
          }
        }
      } catch (error) {
        console.error('Failed to save progress to database:', error);
        // Continue with sessionStorage fallback even for logged-in users
      }
    }
    
    // Always save to sessionStorage (for both logged-in and guest users)
    // This ensures progress persists even if database operations fail
    const sessionKey = `simulation_progress_${sim.slug}`;
    const savedProgress = sessionStorage.getItem(sessionKey);
    
    try {
      let progressData;
      if (savedProgress) {
        progressData = JSON.parse(savedProgress);
      } else {
        // Initialize progress data if it doesn't exist
        progressData = {
          attemptId,
          completedTasks: [],
          timestamp: Date.now(),
          simulationSlug: sim.slug,
          totalTasks: totalTasks
        };
      }
      
      // Do not mark video tasks as completed
      if (task.expected_input?.type !== "video" && !progressData.completedTasks.includes(taskIndex)) {
        progressData.completedTasks.push(taskIndex);
        progressData.timestamp = Date.now();
        sessionStorage.setItem(sessionKey, JSON.stringify(progressData));
        console.log('Task completed and saved to sessionStorage:', taskIndex);
      }
    } catch (error) {
      console.error('Failed to update progress in sessionStorage:', error);
    }
    
    setLoading(prev => ({ ...prev, finish: false }));
    setIsNavigating(false);
    
    // Always navigate back to main simulation page
    router.push(`/s/${sim.slug}?attemptId=${attemptId}`);
  };

  const handleMultipleChoiceAnswer = (selectedIndex: number, isCorrect: boolean) => {
    setQuestionAnswered(true);
    setQuestionResult({ isCorrect, explanation: task.expected_input?.type === "multiple_choice" ? task.expected_input.explanation : undefined });
  };

  const handleDragDropComplete = (matches: { left: string; right: string }[], isCorrect: boolean) => {
    setQuestionAnswered(true);
    setQuestionResult({ isCorrect, explanation: task.expected_input?.type === "drag_drop" ? task.expected_input.explanation : undefined });
  };

  const handleMultipleChoiceSelectionChange = (selectedIndex: number | null) => {
    setHasMultipleChoiceSelection(selectedIndex !== null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="w-full">
          {/* Question header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 px-4 sm:px-0">
              {task.expected_input?.type === "multiple_choice" ? task.expected_input.question :
               task.expected_input?.type === "drag_drop" ? task.expected_input.question :
               task.title}
            </h2>
          </div>

          {/* Question content */}
          <div className="space-y-4 sm:space-y-6 flex flex-col items-center px-2 sm:px-0">
          {/* Video task */}
          {task.expected_input?.type === "video" && (
            <div className="w-full max-w-3xl space-y-4">
              {task.summary_md && (
                <div className="text-center">
                  <div className="prose prose-zinc max-w-none text-gray-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.summary_md}</ReactMarkdown>
                  </div>
                </div>
              )}
              <div className="relative">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow">
                  {/* YouTube or direct video */}
                  {task.expected_input.videoUrl.includes('youtube.com') || task.expected_input.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={task.expected_input.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={task.expected_input.title || "Video"}
                    />
                  ) : (
                    <video
                      src={task.expected_input.videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    onClick={() => setShowVideoPlayer(true)}
                    className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-6 py-3 rounded-lg"
                  >
                    🎬 Watch Fullscreen
                  </Button>
                </div>
              </div>
            </div>
          )}
          {/* Resources section - only show for text-based tasks */}
          {task.expected_input?.type === "text" && Array.isArray(task.resources) && task.resources.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3 text-center">📚 Resources</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {task.resources.map((r, idx) => {
                  if (r.type === "image") {
                    return (
                      <figure key={idx} className="rounded-lg p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.url} alt={r.caption || "resource"} className="w-full rounded-md" />
                        {r.caption && <figcaption className="mt-1 text-xs text-gray-600 text-center">{r.caption}</figcaption>}
                      </figure>
                    );
                  }
                  if (r.type === "text") {
                    return (
                      <div key={idx} className="rounded-lg p-3 bg-gray-50">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.content_md}</ReactMarkdown>
                      </div>
                    );
                  }
                  if (r.type === "code") {
                    return (
                      <pre key={idx} className="rounded-lg p-3 overflow-x-auto text-xs bg-gray-50">
                        {r.content}
                      </pre>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

            {/* Interactive Question Components */}
            {task.expected_input?.type === "multiple_choice" ? (
              <div className="w-full max-w-2xl px-2 sm:px-0">
                <MultipleChoiceQuestion
                  ref={multipleChoiceRef}
                  question={task.expected_input.question}
                  options={task.expected_input.options}
                  correctAnswer={task.expected_input.correct_answer}
                  explanation={task.expected_input.explanation}
                  onAnswer={handleMultipleChoiceAnswer}
                  disabled={questionAnswered}
                  color="blue"
                  onSelectionChange={handleMultipleChoiceSelectionChange}
                />
              </div>
            ) : task.expected_input?.type === "drag_drop" ? (
              <div className="w-full max-w-4xl px-2 sm:px-0">
                <DragDropQuestion
                  question={task.expected_input.question}
                  pairs={task.expected_input.pairs}
                  explanation={task.expected_input.explanation}
                  onComplete={handleDragDropComplete}
                  disabled={questionAnswered}
                />
              </div>
            ) : task.expected_input?.type === "video" ? (
              <></>
            ) : (
              <div className="space-y-6">
                {task.summary_md && (
                  <div className="text-center">
                    <div className="prose prose-zinc max-w-none text-gray-600">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.summary_md}</ReactMarkdown>
                    </div>
                  </div>
                )}
                <div className="space-y-3 w-full max-w-2xl">
                  <label className="text-base sm:text-lg font-medium text-gray-700 text-center block">✍️ Your Answer</label>
                  <Textarea
                    className="w-full rounded-2xl border-2 border-gray-200 p-4 sm:p-6 min-h-[120px] sm:min-h-[160px] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-base sm:text-lg"
                    placeholder={task.expected_input?.placeholder || "Write your attempt here…"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Sticky Footer with Complete Button */}
      <div className="sticky bottom-0 z-10">
        <div className="w-full bg-white/80 backdrop-blur-sm border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              <Link
                href={`/s/${sim.slug}?attemptId=${attemptId}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>

              <div className="flex items-center gap-2 sm:gap-3">
                {task.expected_input?.type === "text" && (
                  <>
                    <Button 
                      variant="secondary" 
                      onClick={getSeniorExample} 
                      disabled={loading.senior}
                      className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold text-xs sm:text-sm shadow-lg"
                    >
                      {loading.senior ? "Loading…" : "👨‍💼 Senior"}
                    </Button>
                  </>
                )}
                <Button 
                  onClick={handleComplete}
                  disabled={task.expected_input?.type === "multiple_choice" 
                    ? !hasMultipleChoiceSelection 
                    : task.expected_input?.type === "drag_drop" 
                      ? !questionAnswered 
                      : task.expected_input?.type === "video"
                        ? false
                        : userId
                          ? !input
                          : false}
                  className="px-4 sm:px-8 py-2 sm:py-3 rounded-md bg-black hover:bg-white hover:border hover:border-black text-white hover:text-black font-bold text-sm sm:text-lg"
                >
                  <span className="">Complete</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Senior Example - Gamified & Collapsable */}
      {senior && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-8"
        >
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setIsSeniorCollapsed(!isSeniorCollapsed)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-bold text-black">Senior Example</span>
                <motion.div
                  animate={{ rotate: isSeniorCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-6 w-6" />
                </motion.div>
              </CardTitle>
            </CardHeader>
            {!isSeniorCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <div className="prose prose-green dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {senior}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Completion Screen */}
      {completionResult && (
        <CompletionScreen
          isOpen={showCompletionScreen}
          onClose={handleCompletionClose}
          isCorrect={completionResult.isCorrect}
          timeSpent={completionResult.timeSpent}
          xpEarned={completionResult.xpEarned}
          accuracy={completionResult.accuracy}
          isNavigating={isNavigating}
        />
      )}

      {/* Fullscreen Video Player */}
      {showVideoPlayer && task.expected_input?.type === "video" && (
        <FullscreenVideoPlayer
          videoUrl={task.expected_input.videoUrl}
          title={task.expected_input.title}
          description={task.expected_input.description}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}

    </div>
  );
}
