// src/lib/career/discover.ts
import { openai, OPENAI_MODEL } from "@/lib/openai";

const SUPPORTED_ROLES = [
  "Marketing",
  "Social Media Management",
  "Content Creation",
  "Copywriting",
  "Frontend Development",
  "Backend Development",
  "Software Engineering",
  "Product Management",
  "Project Management",
  "Program Management",
  "Quality Assurance",
  "Customer Support",
  "Data & Analytics",
  "Data Science",
  "Data Engineering",
  "Business Intelligence",
  "Business Analysis",
  "Finance",
  "Accounting",
  "Operations",
  "Sales / Business Development",
  "Customer Success",
  "Recruiting",
  "Design",
  "Human Resources",
  "IT / Tech Support",
  "Consulting",
  "Strategy",
  "Legal",
  "Supply Chain / Logistics",
] as const;

export type SupportedRole = (typeof SUPPORTED_ROLES)[number];
export type QA = { q: string; a: string };

export async function getNextAction(qas: QA[]) {
  const SYSTEM = `
You are a career discovery assistant for a platform that offers corporate career simulations.
Your job is to ask targeted follow-up questions until you have enough signal, then recommend ONE role from this list:
${SUPPORTED_ROLES.join(", ")}.

Rules:
- Ask only ONE concise follow-up at a time (max 8 total questions). If confidence >= 0.75, stop and recommend.
- If the user's interests clearly point OUTSIDE corporate careers (e.g., sports, culinary, arts, medicine), return an "unsupported" result with an encouraging message including 3 concrete tips to explore that path.
- If inside corporate, return a "supported" result with:
  role_title (exactly one from the list or a close synonym you normalize to a list item),
  rationale (2 short sentences),
  confidence (0..1).
- When asking a follow-up, return a single, specific question — not multiple.

Return strict JSON:
{
  "action": "ask",
  "question": "string"
}
OR
{
  "action": "recommend",
  "status": "supported" | "unsupported",
  "role_title"?: "string",
  "rationale": "string",
  "confidence"?: number,
  "message_if_unsupported"?: "string"
}
`.trim();

  const user = {
    answers: qas.map((x, i) => ({ index: i, question: x.q, answer: x.a })),
  };

  const resp = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: JSON.stringify(user) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const json = JSON.parse(resp.choices[0].message.content || "{}");
  return json as
    | { action: "ask"; question: string }
    | {
        action: "recommend";
        status: "supported" | "unsupported";
        role_title?: SupportedRole;
        rationale: string;
        confidence?: number;
        message_if_unsupported?: string;
      };
}

export async function generateSimulationSpec(roleTitle: string) {
  // Utility to create clean kebab-case slugs
  const kebab = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const SYSTEM = `
You generate highly specific, **text-only** corporate simulation specs for the role: ${roleTitle}.

**Naming requirements (MANDATORY):**
- "title" MUST start with "${roleTitle}: " (prefix the exact role title followed by a colon and a space).
- "slug_suggestion" MUST start with "${kebab(roleTitle)}-" and be valid kebab-case.
- Every step's "role" MUST equal "${roleTitle}".

Each simulation must contain 4–6 **atomic** day-to-day micro-tasks that take ~5–10 minutes.

Atomic means a single concrete action with explicit constraints (length/format/count/metric) and a tiny deliverable.
Examples:
- "Write a 120-character slogan for a running shoe launch targeting runners 25–40."
- "Find the bug in this JS line \`console.log("The sum is: " + 5 + 3);\`, output the corrected line and a 1-sentence reason."
- "Write one INVEST user story with exactly 3 acceptance criteria using Given/When/Then."

STRICT JSON:
{
  "title": "string",              // MUST start with "${roleTitle}: "
  "slug_suggestion": "kebab-case",// MUST start with "${kebab(roleTitle)}-"
  "rubric": ["3-6 short criteria"],
  "steps": [
    {
      "index": 0,
      "kind": "task",
      "role": "${roleTitle}",
      "title": "Start with an imperative verb and be specific",
      "summary_md": "**Your task:** ...\\n\\n**Goal** ...\\n\\n**Context** ...\\n\\n**Constraints** ... (must include explicit length or count)\\n\\n**Deliverable** ...\\n\\n**Tips** ...",
      "hint_md": "1-2 concrete sentences",
      "expected_input": { "type": "text", "placeholder": "Write your attempt…" }
    }
  ]
}

RULES:
- Plain text only (Markdown ok). Inline code in backticks is allowed, but **no images**, **no tables**.
- Every task must include Goal, Context, Constraints, Deliverable, Tips.
- Constraints must be explicit (e.g., "exactly 3 bullets", "<= 120 characters", "1 sentence rationale").
- Prefer realistic corporate scenarios for ${roleTitle}.
- Avoid vague phrasing like "Create an MVP" or "Do research".
`.trim();

  const resp = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Generate an atomic, text-only simulation for: ${roleTitle}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const spec = JSON.parse(resp.choices[0].message.content || "{}") as {
    title: string;
    slug_suggestion: string;
    rubric: string[];
    steps: Array<{ role: string } & Record<string, any>>;
  };

  // --- Enforce naming rules after parsing (safety check) ---
  if (!spec.title || !spec.title.startsWith(`${roleTitle}: `)) {
    spec.title = `${roleTitle}: ${spec.title || "Simulation"}`;
  }

  const requiredSlugPrefix = `${kebab(roleTitle)}-`;
  if (!spec.slug_suggestion || !spec.slug_suggestion.startsWith(requiredSlugPrefix)) {
    const rest = spec.slug_suggestion ? kebab(spec.slug_suggestion) : "simulation";
    const normalizedRest = rest.replace(new RegExp(`^${requiredSlugPrefix}`), "");
    spec.slug_suggestion = `${requiredSlugPrefix}${normalizedRest}`;
  }

  if (Array.isArray(spec.steps)) {
    spec.steps = spec.steps.map((s, i) => ({
      index: i,
      ...s,
      role: roleTitle,
    }));
  }

  return spec;
}
