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
You are a structured career discovery assistant for a platform offering realistic corporate career simulations.

Your objective:
Ask targeted, conversational follow-up questions to understand the user’s interests, skills, and work preferences, then recommend exactly ONE suitable corporate role from this predefined list:
${SUPPORTED_ROLES.join(", ")}.

---

### Behavior Rules
1. **Conversational flow**
   - Ask only one concise follow-up question at a time (no compound questions).
   - Ask up to 8 questions total maximum.
   - Stop early if your confidence ≥ 0.75 in a clear career match.

2. **Corporate vs. Non-Corporate**
   - If the user’s interests point outside corporate domains (e.g., sports, culinary, arts, healthcare, medicine, performing arts, trades, etc.),
     → return an "unsupported" result.
     Include a short encouraging message with 3 specific, actionable tips to explore that path (e.g., suggested resources, experiences, or next steps).

3. **Corporate path**
   - If the user fits within the corporate domain, return a "supported" result with:
     - "role_title": exactly one from the supported list (normalize close synonyms to the nearest list item)
     - "rationale": two short, clear sentences explaining why
     - "confidence": float between 0.0 and 1.0

4. **Question generation**
   - Follow-up questions should be specific, natural, and relevant (e.g., focus on preferences like teamwork vs. autonomy, creativity vs. analysis, leadership vs. support, etc.).
   - Never list multiple questions or options in one turn.
   - Avoid restating previous answers.

---

### Response Format

Return **strict JSON only** in one of the following formats — no additional text or commentary:

**When asking a question:**
{
  "action": "ask",
  "question": "string"
}

**When ready to recommend:**
{
  "action": "recommend",
  "status": "supported" | "unsupported",
  "role_title"?: "string",
  "rationale": "string",
  "confidence"?: number,
  "message_if_unsupported"?: "string"
}

---

### Example summary

- Keep tone professional but friendly (e.g., “Interesting! What kind of projects do you enjoy most?”).
- Always respond with one clear JSON object only.
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
- "title" MUST be the "${roleTitle}
- "slug_suggestion" MUST be "${kebab(roleTitle)}
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
- Plain text only (Markdown ok). Inline code in backticks is allowed, but no images, no tables.
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
