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
    // For multiple choice, finalize the answer first
    if (task.expected_input?.type === "multiple_choice") {
      if (!multipleChoiceRef.current?.hasSelection) return;
      multipleChoiceRef.current.finalizeAnswer();
      // Wait a bit for the answer to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // For interactive questions, can complete if question has been answered
    // For text-based tasks, can complete if input is provided
    if ((task.expected_input?.type === "multiple_choice" || task.expected_input?.type === "drag_drop") && !questionAnswered) return;
    if (task.expected_input?.type === "text" && !input.trim()) return;
    
    // Calculate completion metrics
    const isCorrect = questionResult?.isCorrect ?? true; // Default to true for text-based tasks
    const timeSpent = "1:32"; // This could be calculated based on actual time
    const taskLevel = task.stage || 1; // Get task difficulty level
    const xpEarned = calculateXP(taskLevel, isCorrect);
    const accuracy = isCorrect ? 100 : 50;
    
    // Play completion sound
    playCompletionSound();
    
    // Set completion result and show screen
    setCompletionResult({ isCorrect, timeSpent, xpEarned, accuracy });
    setShowCompletionScreen(true);
  };

  const handleCompletionClose = async () => {
    setIsNavigating(true);
    setLoading(prev => ({ ...prev, finish: true }));
    
    try {
      // Save progress to database if user is logged in
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
        // If user is not authenticated or attempt not found (test attempts), continue with sessionStorage fallback
        if (response.status === 401 || response.status === 404) {
          console.log('User not authenticated or attempt not found, using sessionStorage fallback');
        } else {
          throw new Error(errorData.error || 'Failed to save progress');
        }
      }

      // Claim XP if user is authenticated and task was completed
      if (attemptId !== 'test' && questionResult) {
        try {
          const taskLevel = task.stage || 1; // Default to level 1 if no stage specified
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
            // You could show a notification here about XP gained
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
      // Continue with sessionStorage fallback
    }
    
    // Mark task as completed in sessionStorage (fallback for non-authenticated users)
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
      
      if (!progressData.completedTasks.includes(taskIndex)) {
        progressData.completedTasks.push(taskIndex);
        progressData.timestamp = Date.now(); // Update timestamp
        sessionStorage.setItem(sessionKey, JSON.stringify(progressData));
        console.log('Task completed and saved to sessionStorage:', taskIndex);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
    
    setLoading(prev => ({ ...prev, finish: false }));
    
    // Navigate back to main simulation page
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
                  disabled={task.expected_input?.type === "multiple_choice" ? !hasMultipleChoiceSelection : task.expected_input?.type === "drag_drop" ? !questionAnswered : !input}
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

    </div>
  );
}
