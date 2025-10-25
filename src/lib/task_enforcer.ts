import { TaskStep, TaskStepSchema, looksVague } from "./schemas";

type RawStep = any;

function structuredBrief(title: string, body: string) {
  // body holds role-specific context/inputs. Title must be atomic & imperative.
  return `**Your task:** ${title}

**Goal**
${body.split("GOAL: ")[1]?.split("\n")[0] || "Produce a small, inspectable output that meets the specified constraint."}

**Context**
${body.split("CONTEXT: ")[1]?.split("\n")[0] || "You have the minimal info provided in the task; assume reasonable defaults."}

**Constraints**
- Timebox: **5–10 minutes**
${body.split("CONSTRAINTS: ")[1]?.split("\n")[0] ? `- ${body.split("CONSTRAINTS: ")[1]?.split("\n")[0]}` : "- Follow the explicit length/format limits in the task."}

**Deliverable**
${body.split("DELIVERABLE: ")[1]?.split("\n")[0] || "Provide exactly the requested output (e.g., one line, 3 bullets, a short paragraph, or a corrected inline code statement with a 1-sentence rationale)."}

**Tips**
${body.split("TIPS: ")[1]?.split("\n")[0] || "Be concrete. Match the constraint precisely. Keep reasoning short and practical."}`;
}

// Pattern library to make tasks truly specific per role
function atomicPattern(role?: string, idx = 0): { title: string; body: string } {
  const r = (role || "").toLowerCase();
  // A few concrete patterns per role; rotate by idx
  if (r.includes("marketing")) {
    const patterns = [
      {
        title: "Write a 120-character slogan for a running shoe launch",
        body: `GOAL: Create a punchy slogan that mentions either speed or comfort.
CONTEXT: Brand is launching “VoltBoost Runner” to adult runners (25–40).
CONSTRAINTS: Max 120 characters; include one benefit and an implicit CTA.
DELIVERABLE: One slogan line (<= 120 chars).
TIPS: Use tangible benefits (pace, cushioning) and avoid generic hype.`,
      },
      {
        title: "Draft 3 bullet headlines for a waitlist email",
        body: `GOAL: Increase click-through to the waitlist page.
CONTEXT: Audience follows running gear creators; they value measurable gains.
CONSTRAINTS: Exactly 3 bullets; each <= 12 words; mention a concrete benefit or metric.
DELIVERABLE: 3 bullet headlines.
TIPS: Make each bullet standalone and specific.`,
      },
    ];
    return patterns[idx % patterns.length];
  }

  if (r.includes("project") || r.includes("product")) {
    const patterns = [
      {
        title: "Write one INVEST user story with 3 acceptance criteria",
        body: `GOAL: Specify a minimal, testable story for a waitlist signup.
CONTEXT: Pre-launch landing page; storing email + timestamp; duplicate handling.
CONSTRAINTS: Story (1 line); 3 AC with Given/When/Then structure.
DELIVERABLE: 1 story + 3 AC lines.
TIPS: Keep AC observable and include a duplicate email case.`,
      },
      {
        title: "Prioritize 5 backlog items using MoSCoW",
        body: `GOAL: Classify items by Must/Should/Could/Won’t for the next sprint.
CONTEXT: Mixed backlog: email capture, validation, confirmation banner, analytics, A/B test.
CONSTRAINTS: Provide exactly 5 items, each with a MoSCoW tag and 1-line rationale.
DELIVERABLE: 5 tagged lines (e.g., “Must — Email validation: prevent bad data”).
TIPS: Tie rationale to risk or value.`,
      },
    ];
    return patterns[idx % patterns.length];
  }

  if (r.includes("software") || r.includes("engineer")) {
    const patterns = [
      {
        title: "Find the bug in this JS line and fix it, then explain why",
        body: `GOAL: Correct string concatenation vs arithmetic precedence.
CONTEXT: Provided line: \`console.log("The sum is: " + 5 + 3);\`
CONSTRAINTS: Output must compute 5 + 3 = 8. Explain the bug in 1 sentence.
DELIVERABLE: One corrected JS line in backticks + 1 sentence explanation.
TIPS: Use parentheses or coercion to ensure numeric addition.`,
      },
      {
        title: "Write a one-line regex to validate simple emails (plain text)",
        body: `GOAL: Provide a pragmatic, not-perfect email regex (e.g., local@domain.tld).
CONTEXT: Basic client-side check; allow letters, digits, dot, dash, underscore.
CONSTRAINTS: Just the regex between slashes and a short rationale (<= 20 words).
DELIVERABLE: One line: \`/.../ — rationale\`
TIPS: Keep it practical; avoid overly strict RFC coverage.`,
      },
    ];
    return patterns[idx % patterns.length];
  }

  if (r.includes("data")) {
    const patterns = [
      {
        title: "Define a metric for landing page performance and its formula",
        body: `GOAL: Choose one actionable metric (e.g., “Waitlist conversion rate”).
CONTEXT: We track page views and successful email submissions.
CONSTRAINTS: Name + formula; 1 sentence on why it’s actionable.
DELIVERABLE: “Metric: X — Formula: Y — Why: Z”
TIPS: Prefer ratios tied to the goal.`,
      },
    ];
    return patterns[idx % patterns.length];
  }

  if (r.includes("sales") || r.includes("business")) {
    const patterns = [
      {
        title: "Write a 2-sentence cold opener for a running store buyer",
        body: `GOAL: Book a 15-minute intro about VoltBoost.
CONTEXT: Buyer stocks performance shoes; values measurable benefits.
CONSTRAINTS: Exactly 2 sentences; mention one specific benefit; ask for time.
DELIVERABLE: Two sentences.
TIPS: Be respectful, direct, and outcome-focused.`,
      },
    ];
    return patterns[idx % patterns.length];
  }

  if (r.includes("design")) {
    const patterns = [
      {
        title: "List 3 usability heuristics violated by this vague CTA",
        body: `GOAL: Identify issues with “Click here” as a CTA on mobile.
CONTEXT: Landing page aims for waitlist signups.
CONSTRAINTS: Exactly 3 bullets; each names the heuristic + 1-line fix.
DELIVERABLE: 3 bullets.
TIPS: Think clarity, affordance, and feedback.`,
      },
    ];
    return patterns[idx % patterns.length];
  }

  // Default generic but atomic
  return {
    title: "Write a 1-paragraph explanation of a concrete decision you’d take",
    body: `GOAL: Make one specific decision with rationale.
CONTEXT: You have minimal, realistic information.
CONSTRAINTS: 80–120 words; include 1 metric or constraint.
DELIVERABLE: One paragraph.
TIPS: Be decisive and practical.`,
  };
}

function makeAtomicFromLabel(label: string, role?: string, idx = 0): { title: string; brief: string } {
  const pattern = atomicPattern(role, idx);
  // Prefer pattern; if label contains a concrete topic, weave it in
  const concrete = /write|draft|find|choose|prioritize|outline|estimate|design|review|refactor|plan|define/i.test(label)
    ? label
    : pattern.title;
  return { title: concrete, brief: structuredBrief(concrete, pattern.body) };
}

function enforceSpecificityOnTask(step: TaskStep, idx: number): TaskStep {
  let out = { ...step, index: typeof step.index === "number" ? step.index : idx };
  if (looksVague(out.title)) {
    const { title, brief } = makeAtomicFromLabel(out.title, out.role, idx);
    out.title = title;
    out.summary_md = brief;
  }
  if (looksVague(out.summary_md) || out.summary_md.length < 80) {
    const { title, brief } = makeAtomicFromLabel(out.title, out.role, idx);
    out.title = title;
    out.summary_md = brief;
  }
  if (!out.hint_md || out.hint_md.trim().length < 12) {
    out.hint_md = "State the exact constraint, then produce the deliverable precisely (length, count, or corrected line).";
  }
  return TaskStepSchema.parse(out);
}

function upgradeLegacy(step: RawStep, idx: number, role?: string): TaskStep {
  const rawTitle =
    (typeof step?.title === "string" && step.title) ||
    (typeof step?.label === "string" && step.label) ||
    `Task ${idx + 1}`;
  
  // Determine stage based on task index (0-4 = stage 1, 5-9 = stage 2, 10-14 = stage 3)
  const stage = Math.floor(idx / 5) + 1;
  
  // If the step already has the new question format, use it directly
  if (step?.expected_input && (step.expected_input.type === "multiple_choice" || step.expected_input.type === "drag_drop")) {
    const base: TaskStep = {
      kind: "task",
      index: idx,
      role,
      title: rawTitle,
      summary_md: step.summary_md || `**Your task:** ${rawTitle}\n\nAnswer this interactive question.`,
      expected_input: step.expected_input,
      hint_md: step.hint_md || "Think carefully about your answer.",
      stage: Math.min(stage, 3),
    };
    return TaskStepSchema.parse(base);
  }
  
  // Legacy text-based tasks
  const { title, brief } = makeAtomicFromLabel(rawTitle, role, idx);
  
  const base: TaskStep = {
    kind: "task",
    index: idx,
    role,
    title,
    summary_md: brief,
    expected_input: { type: "text", placeholder: "Write your attempt…" },
    hint_md: "Follow the constraint exactly and keep the output tight.",
    stage: Math.min(stage, 3), // Ensure stage is between 1-3
  };
  return TaskStepSchema.parse(base);
}

export function normalizeAndEnforceSteps(rawSteps: RawStep[], roleTitle?: string): TaskStep[] {
  const tasks = (rawSteps || []).map((s, i) => {
    if (s?.kind === "task") {
      return enforceSpecificityOnTask(TaskStepSchema.parse({
        ...s,
        index: typeof s.index === "number" ? s.index : i,
      }), i);
    }
    return upgradeLegacy(s, i, roleTitle);
  });
  return tasks.map((t, i) => ({ ...t, index: i }));
}
