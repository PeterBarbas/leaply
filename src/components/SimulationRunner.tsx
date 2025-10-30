"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MultipleChoiceQuestion from "@/components/ui/MultipleChoiceQuestion";
import DragDropQuestion from "@/components/ui/DragDropQuestion";
import FullscreenVideoPlayer from "@/components/ui/FullscreenVideoPlayer";

type TaskStep = {
  kind: "task";
  index: number;
  role?: string;
  title: string;
  summary_md?: string;
  hint_md?: string;
  resources?: Array<
    | { type: "image"; url: string; caption?: string }
    | { type: "text"; content_md: string }
    | { type: "code"; language?: string; content: string }
  >;
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
};

type RawStep =
  | TaskStep
  | { index?: number; kind?: string; label?: string; options?: string[] }
  | any;

export default function SimulationRunner({
  attemptId,
  steps,
}: {
  attemptId: string;
  steps: RawStep[];
}) {
  // 🔧 Normalize any legacy steps into rich "task" steps
  const tasks = useMemo<TaskStep[]>(() => {
    console.log("🔍 SimulationRunner - Raw steps received:", steps);
    return (steps || []).map((s: RawStep, idx: number) => {
      console.log(`🔍 Processing step ${idx}:`, s);
      if (s?.kind === "task") {
        // already in the new format - preserve the original expected_input
        const result = {
          ...s,
          index: typeof s.index === "number" ? s.index : idx,
          title: s.title || `Task ${idx + 1}`,
          expected_input: s.expected_input || { type: "text", placeholder: "Your attempt…" },
        };
        console.log(`🔍 Processed task ${idx}:`, result);
        console.log(`🔍 Task ${idx} expected_input type:`, result.expected_input?.type);
        return result;
      }

      // Legacy step → wrap into a task
      const label = typeof s?.label === "string" && s.label.trim() ? s.label.trim() : `Task ${idx + 1}`;
      return {
        kind: "task",
        index: typeof s?.index === "number" ? s.index : idx,
        title: label,
        summary_md: `**Your task:** ${label}\n\nProvide a concise, real-world answer (5–10 minutes).`,
        resources: [],
        expected_input: { type: "text", placeholder: "Your attempt…" },
      };
    });
  }, [steps]);

  const [i, setI] = useState(0);
  const [input, setInput] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [senior, setSenior] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [loading, setLoading] = useState<{ hint?: boolean; feedback?: boolean; senior?: boolean; finish?: boolean }>({});
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [questionResult, setQuestionResult] = useState<{ isCorrect: boolean; explanation?: string } | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const step = tasks[i];
  const isLast = i === tasks.length - 1;
  const stepCount = tasks.length;
  
  console.log("🎯 Current step:", step);
  console.log("🎯 Current step expected_input:", step?.expected_input);
  console.log("🎯 Current step expected_input type:", step?.expected_input?.type);

  async function getHint() {
    try {
      setLoading((l) => ({ ...l, hint: true }));
      const res = await fetch("/api/attempt/hint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, stepIndex: step.index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not get hint");
      setHint(data.hint_md);
    } catch {
      setHint("Try focusing on the goal, constraints, and one key metric.");
    } finally {
      setLoading((l) => ({ ...l, hint: false }));
    }
  }

  async function getFeedback() {
    try {
      setLoading((l) => ({ ...l, feedback: true }));
      const res = await fetch("/api/attempt/step", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, stepIndex: step.index, input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Step failed");
      setFeedback(data.feedback);
    } catch {
      setFeedback("Feedback unavailable right now — focus on clarity and how your answer meets the goal.");
    } finally {
      setLoading((l) => ({ ...l, feedback: false }));
    }
  }

  async function getSenior() {
    try {
      setLoading((l) => ({ ...l, senior: true }));
      const res = await fetch("/api/attempt/senior", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, stepIndex: step.index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not load senior solution");
      setSenior(data.senior_solution_md);
    } catch {
      setSenior("A senior would structure the answer clearly, justify choices, and align with the task goal.");
    } finally {
      setLoading((l) => ({ ...l, senior: false }));
    }
  }

  async function finishAndEmail() {
    if (!email) return;
    try {
      setLoading((l) => ({ ...l, finish: true }));
      const res = await fetch("/api/attempt/request-results", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setEmailSent(data.message || "Results sent!");
    } catch {
      setEmailSent("Could not send results. Please try again later.");
    } finally {
      setLoading((l) => ({ ...l, finish: false }));
    }
  }

  const handleMultipleChoiceAnswer = (selectedIndex: number, isCorrect: boolean) => {
    setQuestionAnswered(true);
    setQuestionResult({ isCorrect, explanation: step.expected_input?.type === "multiple_choice" ? step.expected_input.explanation : undefined });
  };

  const handleDragDropComplete = (matches: { left: string; right: string }[], isCorrect: boolean) => {
    setQuestionAnswered(true);
    setQuestionResult({ isCorrect, explanation: step.expected_input?.type === "drag_drop" ? step.expected_input.explanation : undefined });
  };

  function next() {
    setI((p) => Math.min(p + 1, tasks.length - 1));
    setInput("");
    setHint(null);
    setFeedback(null);
    setSenior(null);
    setQuestionAnswered(false);
    setQuestionResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with progress */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {i + 1}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {step.expected_input?.type === "multiple_choice" ? "Multiple Choice" : 
                   step.expected_input?.type === "drag_drop" ? "Drag & Drop" : "Task"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Question {i + 1} of {stepCount}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${((i + 1) / stepCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {Math.round(((i + 1) / stepCount) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Question header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white text-center">
              {step.expected_input?.type === "multiple_choice" ? step.expected_input.question :
               step.expected_input?.type === "drag_drop" ? step.expected_input.question :
               step.title}
            </h2>
          </div>

            {/* Question content */}
            <div className="p-8">

              {/* Video task */}
              {step.expected_input?.type === "video" && (
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {step.title}
                    </h3>
                    {step.summary_md && (
                      <div className="prose prose-zinc dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.summary_md}</ReactMarkdown>
                      </div>
                    )}
                    {step.expected_input.title && (
                      <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                        {step.expected_input.title}
                      </h4>
                    )}
                    {step.expected_input.description && (
                      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {step.expected_input.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="relative max-w-4xl mx-auto">
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                      {/* Check if it's a YouTube URL */}
                      {step.expected_input.videoUrl.includes('youtube.com') || step.expected_input.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={step.expected_input.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={step.expected_input.title || "Video"}
                        />
                      ) : (
                        <video
                          src={step.expected_input.videoUrl}
                          className="w-full h-full object-cover"
                          poster=""
                          controls
                          preload="metadata"
                        />
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        onClick={() => setShowVideoPlayer(true)}
                        size="lg"
                        className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg"
                      >
                        🎬 Watch Fullscreen
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Resources section - only show for text-based tasks */}
              {step.expected_input?.type === "text" && Array.isArray(step.resources) && step.resources.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Resources</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {step.resources.map((r, idx) => {
                    if (r.type === "image") {
                      return (
                        <figure key={idx} className="rounded-lg border p-2 bg-white dark:bg-gray-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={r.url} alt={r.caption || "resource"} className="w-full rounded-md" />
                          {r.caption && <figcaption className="mt-1 text-xs text-muted-foreground">{r.caption}</figcaption>}
                        </figure>
                      );
                    }
                    if (r.type === "text") {
                      return (
                        <div key={idx} className="rounded-lg border p-3 bg-white dark:bg-gray-800">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.content_md}</ReactMarkdown>
                        </div>
                      );
                    }
                    if (r.type === "code") {
                      return (
                        <pre key={idx} className="rounded-lg border p-3 overflow-x-auto text-xs bg-white dark:bg-gray-800">
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
            {step.expected_input?.type === "multiple_choice" ? (
              <MultipleChoiceQuestion
                question={step.expected_input.question}
                options={step.expected_input.options}
                correctAnswer={step.expected_input.correct_answer}
                explanation={step.expected_input.explanation}
                onAnswer={handleMultipleChoiceAnswer}
                disabled={questionAnswered}
              />
            ) : step.expected_input?.type === "drag_drop" ? (
              <DragDropQuestion
                question={step.expected_input.question}
                pairs={step.expected_input.pairs}
                explanation={step.expected_input.explanation}
                onComplete={handleDragDropComplete}
                disabled={questionAnswered}
              />
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  {step.summary_md && (
                    <div className="prose prose-zinc dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.summary_md}</ReactMarkdown>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your attempt</label>
                  <textarea
                    className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-600 p-4 min-h-[140px] focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
                    placeholder={step.expected_input?.type === "text" ? step.expected_input.placeholder || "Write your attempt here…" : "Write your attempt here…"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {step.expected_input?.type === "text" && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={getHint} 
                      disabled={loading.hint}
                      className="px-6 py-3 rounded-xl border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      {loading.hint ? "Getting hint…" : "💡 Hint"}
                    </Button>
                    <Button 
                      onClick={getFeedback} 
                      disabled={!input || loading.feedback}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                    >
                      {loading.feedback ? "Getting feedback…" : "📝 Get Feedback"}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={getSenior} 
                      disabled={loading.senior}
                      className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      {loading.senior ? "Loading senior solution…" : "👨‍💼 Senior Example"}
                    </Button>
                  </>
                )}
                {(step.expected_input?.type === "multiple_choice" || step.expected_input?.type === "drag_drop") && questionAnswered && (
                  <Button 
                    variant="outline" 
                    onClick={getHint} 
                    disabled={loading.hint}
                    className="px-6 py-3 rounded-xl border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {loading.hint ? "Getting hint…" : "💡 Hint"}
                  </Button>
                )}
                {step.expected_input?.type === "video" && (
                  <Button 
                    variant="outline" 
                    onClick={getHint} 
                    disabled={loading.hint}
                    className="px-6 py-3 rounded-xl border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {loading.hint ? "Getting hint…" : "💡 Hint"}
                  </Button>
                )}
                {!isLast && (
                  <Button 
                    onClick={next}
                    disabled={step.expected_input?.type === "multiple_choice" || step.expected_input?.type === "drag_drop" ? !questionAnswered : false}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium text-lg"
                  >
                    Next Question →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Panels */}
      {(hint || feedback || senior) && (
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {hint && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-400 text-lg">💡</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hint</h3>
                    <div className="prose prose-zinc dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{hint}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {feedback && (
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">📝</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Feedback</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{feedback}</p>
                  </div>
                </div>
              </div>
            )}

            {senior && (
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 text-lg">👨‍💼</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Senior's Example</h3>
                    <div className="prose prose-zinc dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{senior}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Finish & email on last task */}
      {isLast && (
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-center text-white">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
              <h4 className="text-2xl font-bold mb-2">Congratulations!</h4>
              <p className="text-green-100">
                You've completed the simulation! Enter your email to receive your personalized results summary and feedback.
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-xl border-0 bg-white/90 text-gray-900 placeholder-gray-500 focus:bg-white"
                />
                <Button 
                  onClick={finishAndEmail} 
                  disabled={!email || loading.finish}
                  className="px-6 py-3 rounded-xl bg-white text-green-600 hover:bg-green-50 font-medium"
                >
                  {loading.finish ? "Sending…" : "📧 Get Results"}
                </Button>
              </div>

              {emailSent && (
                <p className="mt-4 text-green-100 font-medium">{emailSent}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Video Player */}
      {showVideoPlayer && step.expected_input?.type === "video" && (
        <FullscreenVideoPlayer
          videoUrl={step.expected_input.videoUrl}
          title={step.expected_input.title}
          description={step.expected_input.description}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </div>
  );
}
