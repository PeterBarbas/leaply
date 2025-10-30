"use client"

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type MultipleChoice = {
  type: "multiple_choice";
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
};

type DragDrop = {
  type: "drag_drop";
  question: string;
  pairs: Array<{ left: string; right: string }>;
  explanation?: string;
};

type TextInput = { type: "text"; placeholder?: string };

type VideoInput = { type: "video"; videoUrl: string; title?: string; description?: string };

type ExpectedInput = MultipleChoice | DragDrop | TextInput | VideoInput;

type Task = {
  kind: "task";
  index: number;
  title: string;
  role?: string;
  summary_md?: string;
  hint_md?: string;
  expected_input: ExpectedInput;
  stage: number;
};

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ManualSimulationCreatorTab() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("editSlug") || "";
  const [adminKey, setAdminKey] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [active, setActive] = useState(true);
  const [rubric, setRubric] = useState<string>("");
  const [steps, setSteps] = useState<Task[]>([]);
  const [overview, setOverview] = useState("");
  const [careerPath, setCareerPath] = useState(""); // one per line
  const [salaryRange, setSalaryRange] = useState("");
  const [growthOutlook, setGrowthOutlook] = useState("");
  const [industries, setIndustries] = useState(""); // one per line
  const [education, setEducation] = useState("");
  const [personalityTraits, setPersonalityTraits] = useState(""); // one per line
  const [originalSlug, setOriginalSlug] = useState<string>("");
  const [stages, setStages] = useState<Array<{ id: number; name: string; description: string }>>([
    { id: 1, name: "Stage 1 (Easy)", description: "Fundamentals and basic concepts" },
    { id: 2, name: "Stage 2 (Medium)", description: "Intermediate skills and application" },
    { id: 3, name: "Stage 3 (Hard)", description: "Advanced scenarios and complex decisions" }
  ]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const k = sessionStorage.getItem("admin_key") || "";
    setAdminKey(k);
  }, []);

  // Load existing simulation when editing
  useEffect(() => {
    const loadExisting = async () => {
      if (!editSlug) return;
      try {
        setErr(null);
        setOk(null);
        if (!adminKey) return;
        const res = await fetch("/api/attempt/admin/simulations", {
          headers: { "x-admin-key": adminKey },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load simulations");
        const sim = (data.sims || []).find((s: any) => s.slug === editSlug);
        if (!sim) {
          setErr("Simulation not found");
          return;
        }
        setOriginalSlug(sim.slug);
        setTitle(sim.title || "");
        setSlug(sim.slug || "");
        setActive(Boolean(sim.active));
        setRubric(Array.isArray(sim.rubric) ? sim.rubric.join("\n") : "");
        const ri = sim.role_info || {};
        setOverview(ri.overview || "");
        setCareerPath(Array.isArray(ri.careerPath) ? ri.careerPath.join("\n") : "");
        setSalaryRange(ri.salaryRange || "");
        setGrowthOutlook(ri.growthOutlook || "");
        setIndustries(Array.isArray(ri.industries) ? ri.industries.join("\n") : "");
        setEducation(ri.education || "");
        setPersonalityTraits(Array.isArray(ri.personalityTraits) ? ri.personalityTraits.join("\n") : "");
        const rawSteps = Array.isArray(sim.steps) ? sim.steps : [];
        const mapped: Task[] = rawSteps.map((s: any, i: number) => ({
          kind: "task",
          index: typeof s.index === "number" ? s.index : i,
          title: s.title || `Task ${i + 1}`,
          role: s.role,
          summary_md: s.summary_md || "",
          hint_md: s.hint_md || "",
          stage: Math.max(1, Math.min(3, Number(s.stage) || 1)),
          expected_input: s.expected_input || { type: "text", placeholder: "Your attempt…" },
        }));
        setSteps(mapped);
      } catch (e: any) {
        setErr(e.message || "Failed to load simulation");
      }
    };
    loadExisting();
  }, [editSlug, adminKey]);

  useEffect(() => {
    if (!slug && title.trim()) {
      setSlug(slugify(title));
    }
  }, [title, slug]);

  const canSubmit = useMemo(() => {
    if (!title.trim() || !slug.trim()) return false;
    if (steps.length === 0) return false;
    return steps.every((s) => {
      if (!s.title.trim()) return false;
      if (s.stage < 1 || s.stage > 3) return false;
      if (s.expected_input.type === "multiple_choice") {
        const m = s.expected_input as MultipleChoice;
        return (
          m.question.trim().length > 0 &&
          Array.isArray(m.options) &&
          m.options.length >= 2 &&
          m.correct_answer >= 0 &&
          m.correct_answer < m.options.length
        );
      }
      if (s.expected_input.type === "drag_drop") {
        const d = s.expected_input as DragDrop;
        return d.question.trim().length > 0 && d.pairs.length >= 1 && d.pairs.every(p => p.left.trim() && p.right.trim());
      }
      if (s.expected_input.type === "video") {
        const v = s.expected_input as VideoInput;
        return v.videoUrl.trim().length > 0;
      }
      return true;
    });
  }, [title, slug, steps]);

  function addTask(kind: ExpectedInput["type"], stageId: number = 1) {
    const index = steps.length;
    if (kind === "multiple_choice") {
      setSteps((prev) => [
        ...prev,
        {
          kind: "task",
          index,
          title: `Task ${index + 1}`,
          summary_md: "",
          hint_md: "",
          stage: stageId,
          expected_input: {
            type: "multiple_choice",
            question: "",
            options: ["", ""],
            correct_answer: 0,
            explanation: "",
          },
        },
      ]);
    } else if (kind === "drag_drop") {
      setSteps((prev) => [
        ...prev,
        {
          kind: "task",
          index,
          title: `Task ${index + 1}`,
          summary_md: "",
          hint_md: "",
          stage: stageId,
          expected_input: {
            type: "drag_drop",
            question: "",
            pairs: [{ left: "", right: "" }],
            explanation: "",
          },
        },
      ]);
    } else if (kind === "video") {
      setSteps((prev) => [
        ...prev,
        {
          kind: "task",
          index,
          title: `Task ${index + 1}`,
          summary_md: "",
          hint_md: "",
          stage: stageId,
          expected_input: {
            type: "video",
            videoUrl: "",
            title: "",
            description: "",
          },
        },
      ]);
    } else {
      setSteps((prev) => [
        ...prev,
        {
          kind: "task",
          index,
          title: `Task ${index + 1}`,
          summary_md: "",
          hint_md: "",
          stage: stageId,
          expected_input: { type: "text", placeholder: "Your attempt…" },
        },
      ]);
    }
  }

  function updateTask(idx: number, next: Partial<Task>) {
    setSteps((prev) => prev.map((t, i) => (i === idx ? { ...t, ...next } : t)));
  }

  function removeTask(idx: number) {
    setSteps((prev) => prev.filter((_, i) => i !== idx).map((t, i) => ({ ...t, index: i })));
  }

  function moveTask(idx: number, dir: -1 | 1) {
    setSteps((prev) => {
      const next = [...prev];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= next.length) return prev;
      const [item] = next.splice(idx, 1);
      next.splice(newIdx, 0, item);
      return next.map((t, i) => ({ ...t, index: i }));
    });
  }

  async function submit() {
    setErr(null);
    setOk(null);
    setSubmitting(true);
    try {
      if (!adminKey) throw new Error("Admin key not found");
      const body = {
        slug: slug.trim(),
        title: title.trim(),
        steps: steps.map((s, i) => ({ ...s, index: i, stage: s.stage })),
        rubric: rubric
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
        role_info: {
          overview: overview.trim() || undefined,
          careerPath: careerPath
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean),
          salaryRange: salaryRange.trim() || undefined,
          growthOutlook: growthOutlook.trim() || undefined,
          industries: industries
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean),
          education: education.trim() || undefined,
          personalityTraits: personalityTraits
            .split("\n")
            .map((x) => x.trim())
            .filter(Boolean),
        },
        active,
      };
      const isEditing = Boolean(editSlug);
      const url = isEditing
        ? `/api/attempt/admin/simulations/${encodeURIComponent(originalSlug || editSlug)}`
        : "/api/attempt/admin/simulations";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");
      setOk(isEditing ? "Simulation updated" : "Simulation created");
      if (!isEditing) {
        setSteps([]);
      }
    } catch (e: any) {
      setErr(e.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-none shadow-none">
          <CardHeader>
          <CardTitle className="text-lg">
            {editSlug ? `Edit Simulation: ${originalSlug || editSlug}` : "Create Manual Simulation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Product Manager" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="product-manager" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Active</label>
              <Button type="button" variant={active ? "default" : "outline"} onClick={() => setActive((v) => !v)}>
                {active ? "Active" : "Inactive"}
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rubric (one per line)</label>
              <Textarea value={rubric} onChange={(e) => setRubric(e.target.value)} rows={3} placeholder="Clarity\nAccuracy\nReasoning" />
            </div>
          </div>

          {/* Guide Tab Content Inputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Guide Tab (Role Information)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Overview</label>
                <Textarea rows={3} value={overview} onChange={(e) => setOverview(e.target.value)} placeholder="2–3 sentences about the role" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Career Path (one per line)</label>
                <Textarea rows={4} value={careerPath} onChange={(e) => setCareerPath(e.target.value)} placeholder={"Junior → Mid → Senior\nSenior → Lead → Manager"} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industries (one per line)</label>
                <Textarea rows={4} value={industries} onChange={(e) => setIndustries(e.target.value)} placeholder={"Tech\nHealthcare\nFinance"} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salary Range</label>
                <Input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="US mid: $90k–$130k; EU entry: €35k–€55k" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Growth Outlook</label>
                <Input value={growthOutlook} onChange={(e) => setGrowthOutlook(e.target.value)} placeholder="High demand due to ..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Education</label>
                <Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Typical education + alternative paths" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ideal Traits (one per line)</label>
                <Textarea rows={3} value={personalityTraits} onChange={(e) => setPersonalityTraits(e.target.value)} placeholder={"Analytical\nCollaborative\nDetail-oriented"} />
              </div>
            </div>
          </div>

          {/* Steps Builder */}
          <div className="space-y-6">
            {/* Stage Overview */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Stages & Tasks</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stages.map((stage) => {
                  const stageTasks = steps.filter(s => s.stage === stage.id);
                  return (
                    <div key={stage.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{stage.name}</h4>
                        <span className="text-xs text-gray-500">{stageTasks.length} tasks</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{stage.description}</p>
                      <div className="space-y-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addTask("text", stage.id)}
                          className="w-full text-xs"
                        >
                          + Text Task
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addTask("multiple_choice", stage.id)}
                          className="w-full text-xs"
                        >
                          + Multiple Choice
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addTask("drag_drop", stage.id)}
                          className="w-full text-xs"
                        >
                          + Drag to Match
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => addTask("video", stage.id)}
                          className="w-full text-xs"
                        >
                          + Video Task
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {steps.length === 0 && (
              <p className="text-sm text-muted-foreground">No steps yet. Add a task type to get started.</p>
            )}

            {steps.map((s, idx) => {
              const stage = stages.find(st => st.id === s.stage);
              const stageColors = {
                1: "bg-blue-100 text-blue-800 border-blue-200",
                2: "bg-yellow-100 text-yellow-800 border-yellow-200", 
                3: "bg-red-100 text-red-800 border-red-200"
              };
              return (
                <div key={idx} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-sm font-medium">Task Title</label>
                        <span className={`px-2 py-1 text-xs rounded-full border ${stageColors[s.stage as keyof typeof stageColors]}`}>
                          {stage?.name || `Stage ${s.stage}`}
                        </span>
                      </div>
                      <Input
                        value={s.title}
                        onChange={(e) => updateTask(idx, { title: e.target.value })}
                        placeholder={`Task ${idx + 1}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => moveTask(idx, -1)}>Up</Button>
                      <Button type="button" variant="outline" onClick={() => moveTask(idx, 1)}>Down</Button>
                      <Button type="button" variant="destructive" onClick={() => removeTask(idx)}>Remove</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Stage</label>
                      <select
                        value={s.stage}
                        onChange={(e) => updateTask(idx, { stage: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {stages.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Task Type</label>
                      <div className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50">
                        {s.expected_input.type === "text" && "Text Input"}
                        {s.expected_input.type === "multiple_choice" && "Multiple Choice"}
                        {s.expected_input.type === "drag_drop" && "Drag to Match"}
                        {s.expected_input.type === "video" && "Video Task"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Summary (Markdown)</label>
                      <Textarea
                        value={s.summary_md || ""}
                        onChange={(e) => updateTask(idx, { summary_md: e.target.value })}
                        rows={3}
                        placeholder="What the user should do..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Hint (Markdown)</label>
                      <Textarea
                        value={s.hint_md || ""}
                        onChange={(e) => updateTask(idx, { hint_md: e.target.value })}
                        rows={3}
                        placeholder="Optional hint to help the user"
                      />
                    </div>
                  </div>

                  {s.expected_input.type === "text" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Text Placeholder</label>
                      <Input
                        value={(s.expected_input as TextInput).placeholder || ""}
                        onChange={(e) =>
                          updateTask(idx, {
                            expected_input: { type: "text", placeholder: e.target.value },
                          })
                        }
                        placeholder="Your attempt…"
                      />
                    </div>
                  )}

                  {s.expected_input.type === "multiple_choice" && (() => {
                    const m = s.expected_input as MultipleChoice;
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Question</label>
                          <Input
                            value={m.question}
                            onChange={(e) =>
                              updateTask(idx, {
                                expected_input: { ...m, question: e.target.value },
                              })
                            }
                            placeholder="What is..."
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Options</span>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                updateTask(idx, {
                                  expected_input: { ...m, options: [...m.options, ""] },
                                })
                              }
                            >
                              Add Option
                            </Button>
                          </div>
                          {m.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <Input
                                value={opt}
                                onChange={(e) => {
                                  const next = [...m.options];
                                  next[oi] = e.target.value;
                                  updateTask(idx, { expected_input: { ...m, options: next } });
                                }}
                                placeholder={`Option ${oi + 1}`}
                              />
                              <Button
                                type="button"
                                variant={m.correct_answer === oi ? "default" : "outline"}
                                onClick={() => updateTask(idx, { expected_input: { ...m, correct_answer: oi } })}
                              >
                                Correct
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                  const next = m.options.filter((_, i) => i !== oi);
                                  const nextCorrect = Math.min(
                                    m.correct_answer >= next.length ? next.length - 1 : m.correct_answer,
                                    Math.max(0, next.length - 1)
                                  );
                                  updateTask(idx, { expected_input: { ...m, options: next, correct_answer: Math.max(0, nextCorrect) } });
                                }}
                                disabled={m.options.length <= 2}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Explanation (optional)</label>
                          <Textarea
                            value={m.explanation || ""}
                            onChange={(e) => updateTask(idx, { expected_input: { ...m, explanation: e.target.value } })}
                            rows={2}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {s.expected_input.type === "drag_drop" && (() => {
                    const d = s.expected_input as DragDrop;
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Question</label>
                          <Input
                            value={d.question}
                            onChange={(e) => updateTask(idx, { expected_input: { ...d, question: e.target.value } })}
                            placeholder="Match the terms..."
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Pairs</span>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => updateTask(idx, { expected_input: { ...d, pairs: [...d.pairs, { left: "", right: "" }] } })}
                            >
                              Add Pair
                            </Button>
                          </div>
                          {d.pairs.map((p, pi) => (
                            <div key={pi} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                              <Input
                                value={p.left}
                                onChange={(e) => {
                                  const next = [...d.pairs];
                                  next[pi] = { ...p, left: e.target.value };
                                  updateTask(idx, { expected_input: { ...d, pairs: next } });
                                }}
                                placeholder={`Left ${pi + 1}`}
                              />
                              <Input
                                value={p.right}
                                onChange={(e) => {
                                  const next = [...d.pairs];
                                  next[pi] = { ...p, right: e.target.value };
                                  updateTask(idx, { expected_input: { ...d, pairs: next } });
                                }}
                                placeholder={`Right ${pi + 1}`}
                              />
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => {
                                    const next = d.pairs.filter((_, i) => i !== pi);
                                    updateTask(idx, { expected_input: { ...d, pairs: next } });
                                  }}
                                  disabled={d.pairs.length <= 1}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Explanation (optional)</label>
                          <Textarea
                            value={d.explanation || ""}
                            onChange={(e) => updateTask(idx, { expected_input: { ...d, explanation: e.target.value } })}
                            rows={2}
                          />
                        </div>
                      </div>
                    );
                  })()}

                  {s.expected_input.type === "video" && (() => {
                    const v = s.expected_input as VideoInput;
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Video URL</label>
                          <Input
                            value={v.videoUrl}
                            onChange={(e) => updateTask(idx, { expected_input: { ...v, videoUrl: e.target.value } })}
                            placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Video Title (optional)</label>
                          <Input
                            value={v.title || ""}
                            onChange={(e) => updateTask(idx, { expected_input: { ...v, title: e.target.value } })}
                            placeholder="Video title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description (optional)</label>
                          <Textarea
                            value={v.description || ""}
                            onChange={(e) => updateTask(idx, { expected_input: { ...v, description: e.target.value } })}
                            rows={2}
                            placeholder="Brief description of what the video covers"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>

          {err && <p className="text-sm text-red-600">{err}</p>}
          {ok && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-green-700">{ok}</p>
              {slug ? (
                <a
                  href={`/s/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary underline"
                >
                  Open simulation
                </a>
              ) : null}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" onClick={submit} disabled={!canSubmit || submitting}>
              {submitting ? (editSlug ? "Updating..." : "Creating...") : (editSlug ? "Update Simulation" : "Create Simulation")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


