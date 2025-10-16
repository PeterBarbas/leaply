"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  expected_input?: { type: "text"; placeholder?: string };
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
    return (steps || []).map((s: RawStep, idx: number) => {
      if (s?.kind === "task") {
        // already in the new format
        return {
          ...s,
          index: typeof s.index === "number" ? s.index : idx,
          title: s.title || `Task ${idx + 1}`,
          expected_input: s.expected_input || { type: "text", placeholder: "Your attempt…" },
        };
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

  const step = tasks[i];
  const isLast = i === tasks.length - 1;
  const stepCount = tasks.length;

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

  function next() {
    setI((p) => Math.min(p + 1, tasks.length - 1));
    setInput("");
    setHint(null);
    setFeedback(null);
    setSenior(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Task {i + 1} of {stepCount}
        </p>
        <div className="h-2 w-40 overflow-hidden rounded-full bg-muted">
          <div
            className="h-2 bg-primary transition-all"
            style={{ width: `${((i + 1) / stepCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card/70 backdrop-blur-sm p-5 space-y-4">
        <h3 className="text-lg font-semibold">{step.title}</h3>

        {step.summary_md && (
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{step.summary_md}</ReactMarkdown>
          </div>
        )}

        {Array.isArray(step.resources) && step.resources.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Resources</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {step.resources.map((r, idx) => {
                if (r.type === "image") {
                  return (
                    <figure key={idx} className="rounded-lg border p-2 bg-background">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.url} alt={r.caption || "resource"} className="w-full rounded-md" />
                      {r.caption && <figcaption className="mt-1 text-xs text-muted-foreground">{r.caption}</figcaption>}
                    </figure>
                  );
                }
                if (r.type === "text") {
                  return (
                    <div key={idx} className="rounded-lg border p-3 bg-background">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.content_md}</ReactMarkdown>
                    </div>
                  );
                }
                if (r.type === "code") {
                  return (
                    <pre key={idx} className="rounded-lg border p-3 overflow-x-auto text-xs bg-background">
                      {r.content}
                    </pre>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Input */}
        {(step.expected_input?.type === "text" || !step.expected_input) && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Your attempt</label>
            <textarea
              className="w-full rounded-md border p-2 min-h-[140px]"
              placeholder={step.expected_input?.placeholder || "Write your attempt here…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={getHint} disabled={loading.hint}>
            {loading.hint ? "Getting hint…" : "Hint"}
          </Button>
          <Button onClick={getFeedback} disabled={!input || loading.feedback}>
            {loading.feedback ? "Getting feedback…" : "Get feedback on my try"}
          </Button>
          <Button variant="secondary" onClick={getSenior} disabled={loading.senior}>
            {loading.senior ? "Loading senior solution…" : "See how a senior would do it"}
          </Button>
          {!isLast && (
            <Button variant="ghost" onClick={next}>
              Next task →
            </Button>
          )}
        </div>

        {/* Panels */}
        {hint && (
          <div className="rounded-md border p-3 bg-muted/40">
            <p className="text-sm font-medium">Hint</p>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{hint}</ReactMarkdown>
            </div>
          </div>
        )}

        {feedback && (
          <div className="rounded-md border p-3 bg-muted/40">
            <p className="text-sm font-medium">Feedback</p>
            <p className="text-sm whitespace-pre-wrap">{feedback}</p>
          </div>
        )}

        {senior && (
          <div className="rounded-md border p-3 bg-muted/40">
            <p className="text-sm font-medium">Senior’s example</p>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{senior}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Finish & email on last task */}
        {isLast && (
          <div className="pt-6 border-t mt-4 space-y-4">
            <h4 className="text-lg font-semibold">🎯 You’ve completed the simulation!</h4>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive your personalized results summary and feedback.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={finishAndEmail} disabled={!email || loading.finish}>
                {loading.finish ? "Sending…" : "Finish & Email Results"}
              </Button>
            </div>

            {emailSent && (
              <p className="text-sm text-green-600 dark:text-green-400">{emailSent}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
