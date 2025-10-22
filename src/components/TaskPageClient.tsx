"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Lightbulb, CheckCircle, User, Clock, Target, Paperclip, X, FileText, Image as ImageIcon, File, Code, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

type TaskPageClientProps = {
  sim: Sim;
  task: TaskStep;
  taskIndex: number;
  attemptId: string;
};

export default function TaskPageClient({
  sim,
  task,
  taskIndex,
  attemptId,
}: TaskPageClientProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [senior, setSenior] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [showHintPopup, setShowHintPopup] = useState(false);
  const [isMissionCollapsed, setIsMissionCollapsed] = useState(false);
  const [isFeedbackCollapsed, setIsFeedbackCollapsed] = useState(false);
  const [isSeniorCollapsed, setIsSeniorCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<{ 
    hint?: boolean; 
    feedback?: boolean; 
    senior?: boolean; 
    finish?: boolean 
  }>({});

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

  async function getHint() {
    try {
      setLoading((l) => ({ ...l, hint: true }));
      const res = await fetch("/api/attempt/hint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, stepIndex: task.index }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not get hint");
      setHint(data.hint_md);
      setShowHintPopup(true);
    } catch {
      setHint("Try focusing on the goal, constraints, and one key metric.");
      setShowHintPopup(true);
    } finally {
      setLoading((l) => ({ ...l, hint: false }));
    }
  }

  // Auto-hide hint popup after 10 seconds
  useEffect(() => {
    if (showHintPopup && hint) {
      const timer = setTimeout(() => {
        setShowHintPopup(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showHintPopup, hint]);

  async function getFeedback() {
    if (!input.trim()) return;
    
    try {
      setLoading((l) => ({ ...l, feedback: true }));
      const res = await fetch("/api/attempt/step", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ attemptId, stepIndex: task.index, input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not get feedback");
      // The API returns 'feedback', not 'feedback_md'
      setFeedback(data.feedback || "Good effort! Consider the key requirements and constraints mentioned in the task.");
    } catch (error) {
      console.error("Feedback error:", error);
      setFeedback("Good effort! Consider the key requirements and constraints mentioned in the task.");
    } finally {
      setLoading((l) => ({ ...l, feedback: false }));
    }
  }

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
    // Can only complete if feedback has been received
    if (!feedback) return;
    
    // Mark task as completed in sessionStorage
    const sessionKey = `simulation_progress_${sim.slug}`;
    const savedProgress = sessionStorage.getItem(sessionKey);
    if (savedProgress) {
      try {
        const progressData = JSON.parse(savedProgress);
        if (!progressData.completedTasks.includes(taskIndex)) {
          progressData.completedTasks.push(taskIndex);
          sessionStorage.setItem(sessionKey, JSON.stringify(progressData));
        }
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
    
    // Navigate back to overview
    router.push(`/s/${sim.slug}/overview?attemptId=${attemptId}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Back Button - Left aligned like overview */}
      <div className="mb-6">
        <Link
          href={`/s/${sim.slug}/overview?attemptId=${attemptId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to overview
        </Link>
      </div>

      {/* Header - Gamified */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 bg-black bg-clip-text text-transparent">
              {task.title}
            </h1>
          </motion.div>
        </div>
      </motion.div>

      {/* Task Description - Gamified & Collapsable */}
      {task.summary_md && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <Card>
            <CardHeader 
              onClick={() => setIsMissionCollapsed(!isMissionCollapsed)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                  </motion.div>
                  <span className="text-lg font-bold">Your Task</span>
                </div>
                <motion.div
                  animate={{ rotate: isMissionCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-6 w-6" />
                </motion.div>
              </CardTitle>
            </CardHeader>
            {!isMissionCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <div className="prose prose-zinc dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {task.summary_md}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Your Response Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8 space-y-4"
      >
                  {/* Attached Files */}
                  {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Attachments:</p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    {getFileIcon(file)}
                    <span className="text-xs font-medium truncate max-w-[150px]">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
        {/* Text Input Block */}
        <div className="rounded-lg border border-border bg-card/70">
          <div className="relative">
            {isCodeMode ? (
              /* Code Editor Mode */
              <div className="relative bg-[#1e1e1e] rounded-lg overflow-hidden border border-gray-700">
                {/* Line Numbers */}
                <div className="flex">
                  <div className="flex-shrink-0 bg-[#252526] text-gray-500 text-sm font-mono py-3 px-2 select-none">
                    {(input || ' ').split('\n').map((_, i) => (
                      <div key={i} className="leading-6 h-6">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <Textarea
                    placeholder="// Write your code here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 min-h-[300px] p-3 bg-[#1e1e1e] resize-y text-gray-100 font-mono text-sm border-0 focus-visible:ring-0 focus-visible:ring-primary focus-visible:border-foreground/10 rounded-none"
                    style={{ lineHeight: '1.5rem' }}
                  />
                </div>
              </div>
            ) : (
              /* Text Mode */
              <Textarea
                placeholder="Your response here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-md border-0 bg-transparent p-4 min-h-[300px] resize-y focus-visible:ring-0 focus-visible:ring-primary focus-visible:border-foreground/10 placeholder:text-muted-foreground"
              />
            )}
            
            {/* Bottom Right Buttons */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={getHint}
                disabled={loading.hint}
                className="p-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-900 transition-colors shadow-sm disabled:opacity-50"
                title="Get a hint"
              >
                <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCodeMode(!isCodeMode)}
                className={`p-2 rounded-lg transition-colors shadow-sm ${
                  isCodeMode 
                    ? 'bg-purple-200 hover:bg-purple-300 dark:bg-purple-800 dark:hover:bg-purple-700' 
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
                }`}
                title={isCodeMode ? "Switch to text mode" : "Switch to code mode"}
              >
                <Code className={`h-4 w-4 ${isCodeMode ? 'text-purple-700 dark:text-purple-200' : 'text-gray-600 dark:text-gray-400'}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 transition-colors shadow-sm"
                title="Attach files (PDF, images, Excel)"
              >
                <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </motion.button>
            </div>
            
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>


        {/* Action Buttons - Outside the box */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
            <Button 
              onClick={getFeedback} 
              disabled={!input.trim() || loading.feedback}
              className="bg-primary hover:bg-primary/80 w-full sm:w-auto"
            >
              {loading.feedback ? "Loading..." : "Get Feedback"}
            </Button>
            
            {/* Senior Example button only shows after feedback and hides after clicked */}
            {feedback && !senior && (
              <Button variant="outline" onClick={getSeniorExample} disabled={loading.senior} className="w-full sm:w-auto">
                {loading.senior ? "Loading..." : "See how a Senior Would Do It"}
              </Button>
            )}
          </div>

          {/* Complete Task Button - Disabled until feedback received */}
          <motion.div
            whileTap={feedback ? { scale: 0.95 } : {}}
            className="flex justify-center sm:justify-end"
          >
            <Button 
              onClick={handleComplete}
              disabled={!feedback}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Task
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Hint Popup - Bottom Left on Desktop, Top on Mobile */}
      {hint && showHintPopup && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="fixed bottom-6 left-6 md:max-w-xs w-[calc(100%-3rem)] md:w-auto z-50 md:block hidden"
        >
          <Card className="border-2 border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/90 shadow-2xl backdrop-blur-sm">
            <CardContent className="">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100 mb-1">Hint</h4>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200 prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {hint}
                    </ReactMarkdown>
                  </div>
                </div>
                <button
                  onClick={() => setShowHintPopup(false)}
                  className="flex-shrink-0 p-1 hover:bg-yellow-200 dark:hover:bg-yellow-900 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Hint Popup - Mobile (Top) */}
      {hint && showHintPopup && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, type: "spring" }}
          className="md:hidden fixed top-6 left-3 right-3 z-50"
        >
          <Card className="border-2 border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/95 shadow-2xl backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100 mb-1">💡 Hint</h4>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200 prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {hint}
                    </ReactMarkdown>
                  </div>
                </div>
                <button
                  onClick={() => setShowHintPopup(false)}
                  className="flex-shrink-0 p-1 hover:bg-yellow-200 dark:hover:bg-yellow-900 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-yellow-700 dark:text-yellow-300" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Feedback - Gamified & Collapsable */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-6"
        >
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setIsFeedbackCollapsed(!isFeedbackCollapsed)}
            >
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg font-bold text-black">Feedback</span>
                <motion.div
                  animate={{ rotate: isFeedbackCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="h-6 w-6" />
                </motion.div>
              </CardTitle>
            </CardHeader>
            {!isFeedbackCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <div className="prose prose-blue dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {feedback}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </Card>
        </motion.div>
      )}

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

    </div>
  );
}
