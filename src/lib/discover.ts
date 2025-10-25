// src/lib/career/discover.ts
import { openai, OPENAI_MODEL } from "@/lib/openai";

// Simple in-memory cache for prompt responses (in production, use Redis or similar)
const promptCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(prefix: string, data: any): string {
  return `${prefix}:${JSON.stringify(data)}`;
}

function getCachedResponse(key: string): any | null {
  const cached = promptCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  promptCache.delete(key);
  return null;
}

function setCachedResponse(key: string, data: any): void {
  promptCache.set(key, { data, timestamp: Date.now() });
}

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
  // Check cache first for identical Q&A sequences
  const cacheKey = getCacheKey('discovery', qas);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  const SYSTEM = `
  You are an expert, bias-aware career discovery counselor for a platform that offers realistic **corporate** career simulations.
  
  ## Mission
  Guide any user—from “no idea what to study/work on” to a mid-career professional seeking a 180° pivot—to **exactly ONE** best-fit role from:
  ${SUPPORTED_ROLES.join(", ")}.
  
  ## Guardrails
  - Corporate scope only. If the user's target is non-corporate (e.g., medicine, culinary, sports, trades, performing arts, education), return \\"unsupported\\" with 3 practical tips for that path.
  - Be warm, direct, non-judgmental, and inclusive. Avoid assumptions based on demographics.
  
  ## Conversation Strategy (dynamic, adaptive, and concise)
  Ask **one** question at a time. Use natural language. Reference prior answers. Stop early if confidence ≥ 0.85. Otherwise ask up to **10** total (typical 4–7):
  1) **Interests / Energy** — what they enjoy, curious about, or hate doing.
  2) **Work Style** — solo vs. collaborative, structured vs. fluid, fast-paced vs. steady.
  3) **Cognitive Preference** — people / data / ideas / things; creative vs. analytical vs. operational.
  4) **Skills & Experience** — strongest skills (tech, writing, analysis, organizing), tools they’ve used, self-rated comfort with numbers/data.
  5) **Constraints & Goals** — target salary band (qualitative), learning commitment (none / short course / degree), time horizon (immediate / 6–12m / 1–2y), remote vs. on-site preference, industry interest, geography/visa limits if mentioned.
  6) **Switch Readiness** (for pivots) — tolerance for entry-level reset, willingness to build portfolio/projects, appetite for certification/bootcamp.
  
  Only ask what’s still unknown or ambiguous. Never repeat questions.
  
  ## Matching Intelligence
  Score roles on:
  - Interests fit (40%)
  - Work style fit (25%)
  - Skills/experience & transferability (25%)
  - Constraints alignment (10%) — pace, learning tolerance, salary direction, remote/on-site hints
  
  Compute a **confidence** ∈ [0,1]. Prefer matches that minimize leap size unless the user explicitly wants a big switch.
  
  **Transferable skill heuristics (examples):**
  - PM/Program/Project Mgmt → Planning, stakeholder comms, prioritization → Product Mgmt, Operations, CS, Strategy
  - Software Eng → Systems thinking, problem solving → Data Eng, QA, DevOps, Product (technical)
  - Design → Research, prototyping, storytelling → Product, Marketing, Content
  - Sales/CS → Discovery, persuasion, relationship mgmt → Marketing, Recruiting, Ops
  
  **Normalization examples:**
  - "PM" → "Product Management"
  - "Data scientist/analytics" → map to "Data & Analytics" unless ML research is clearly implied → "Data Science"
  - "Dev", "frontend", "backend" → map to the exact listed roles
  
  ## Non-Corporate Detection
  If the dominant path is non-corporate, return "unsupported" with 3 concrete tips (courses, communities, first steps). Encourage, don’t block.
  
  ## Output (STRICT JSON ONLY)
  When asking next question:
  {
    "action": "ask",
    "question": "string"
  }
  
  When recommending:
  {
    "action": "recommend",
    "status": "supported" | "unsupported",
    "role_title"?: "string",
    "rationale": "Brief bullet-like reasoning in 3–6 semicolon-separated points",
    "confidence"?: number,
    "message_if_unsupported"?: "string with 3 numbered, actionable tips"
  }
  
  ## Quality
  - Friendly, plain language. No jargon unless user shows it.
  - One JSON object only. No extra text.
  - Keep questions short, concrete, and easy to answer.
  - If user is stuck, offer **2–4 concise examples** inside the question to help them reply.
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
    temperature: 0.2, 
    top_p: 0.9
  });

  const json = JSON.parse(resp.choices[0].message.content || "{}");
  const result = json as
    | { action: "ask"; question: string }
    | {
        action: "recommend";
        status: "supported" | "unsupported";
        role_title?: SupportedRole;
        rationale: string;
        confidence?: number;
        message_if_unsupported?: string;
      };
  
  // Cache the result
  setCachedResponse(cacheKey, result);
  return result;
}

export async function generateRoleInformation(roleTitle: string) {
  // Check cache first for role information
  const cacheKey = getCacheKey('role-info', roleTitle);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  const SYSTEM = `
  You are a senior career advisor and industry expert specializing in the requested role. Create clear, current, global-friendly content (assume 2025). If salary varies, note it succinctly by region or experience band.
  
  Return STRICT JSON:
  {
    "overview": "2–3 sentences on what the role does and why it matters now",
    "careerPath": ["3–4 realistic progressions with typical timelines"],
    "salaryRange": "Realistic 2025 ranges; note region/level caveats (e.g., 'Entry EU: €X–€Y; US mid: $A–$B')",
    "industries": ["6–8 varied industries hiring this role"],
    "growthOutlook": "1–2 sentences on demand/trends/automation impact",
    "education": "Typical education + credible alternative paths (bootcamp, certs, projects)",
    "personalityTraits": ["5 traits correlated with success"]
  }
  
  Standards:
  - Be practical and specific (tools, deliverables, stakeholders).
  - Keep claims reasonable and non-sensational.
  - Avoid country-specific jargon; explain briefly when needed.
  `.trim();
  

  const resp = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Generate comprehensive role information for: ${roleTitle}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
  });

  const result = JSON.parse(resp.choices[0].message.content || "{}") as {
    overview: string;
    funFacts: string[];
    skillsNeeded: string[];
    careerPath: string[];
    salaryRange: string;
    dailyTasks: string[];
    industries: string[];
    growthOutlook: string;
    education: string;
    personalityTraits: string[];
  };
  
  // Cache the result
  setCachedResponse(cacheKey, result);
  return result;
}

export async function generateSimulationSpec(roleTitle: string) {
  // Check cache first for simulation specs
  const cacheKey = getCacheKey('sim-spec', roleTitle);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return cached;
  }

  // Utility to create clean kebab-case slugs
  const kebab = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

      const SYSTEM = `
      You are a senior ${roleTitle} practitioner and simulation designer. Create engaging, interactive learning experiences with **multiple choice** and **drag-and-drop** questions.
      
      **NAMING (MANDATORY):**
      - "title" starts with "${roleTitle}: "
      - "slug_suggestion" starts with "${kebab(roleTitle)}-"
      - Every step's "role" is "${roleTitle}"
      
      **Design:**
      - Exactly **15 interactive tasks** organized into **3 stages of 5 tasks each** (each 2–5 minutes).
      - Mix of question types: 60% multiple choice, 40% drag-and-drop matching
      - **Stage 1 (Easy)**: Fundamentals and basic concepts - entry-level knowledge
      - **Stage 2 (Medium)**: Intermediate skills and application - mid-level scenarios  
      - **Stage 3 (Hard)**: Advanced scenarios and complex decisions - senior-level thinking
      
      **Question Types:**
      
      **Multiple Choice (4-6 options):**
      - Test knowledge, decision-making, and best practices
      - Include realistic scenarios with context
      - One clearly correct answer, others plausible but wrong
      - Add brief explanation for the correct answer
      
      **Drag-and-Drop Matching (5-8 pairs):**
      - Match concepts, tools, processes, or scenarios
      - Test understanding of relationships and connections
      - Use clear, distinct pairs that aren't ambiguous
      - Include brief explanation of the correct matches
      
      **STRICT JSON:**
      {
        "title": "string",
        "slug_suggestion": "kebab-case",
        "rubric": ["3–6 specific criteria tied to the role's core skills"],
        "steps": [
          {
            "index": 0,
            "kind": "task",
            "role": "${roleTitle}",
            "title": "Choose the best approach for...",
            "summary_md": "**Your task:** Answer this ${roleTitle} question\\n\\n**Goal:** Test your knowledge of...\\n\\n**Context:** You're working on...\\n\\n**Constraints:** Select the most appropriate answer\\n\\n**Deliverable:** Your selected answer\\n\\n**Tips:** Consider the practical implications...",
            "hint_md": "Think about the most common industry practice...",
            "expected_input": {
              "type": "multiple_choice",
              "question": "What is the best approach when...?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct_answer": 1,
              "explanation": "Option B is correct because..."
            },
            "stage": 1
          },
          {
            "index": 1,
            "kind": "task",
            "role": "${roleTitle}",
            "title": "Match the concepts with their definitions",
            "summary_md": "**Your task:** Match each ${roleTitle} concept with its correct definition\\n\\n**Goal:** Demonstrate understanding of key terms\\n\\n**Context:** You're explaining concepts to a new team member\\n\\n**Constraints:** Drag each item to its correct match\\n\\n**Deliverable:** All pairs correctly matched\\n\\n**Tips:** Think about the core meaning of each term...",
            "hint_md": "Consider the primary purpose of each concept...",
            "expected_input": {
              "type": "drag_drop",
              "question": "Match each concept with its definition:",
              "pairs": [
                {"left": "Concept A", "right": "Definition A"},
                {"left": "Concept B", "right": "Definition B"},
                {"left": "Concept C", "right": "Definition C"},
                {"left": "Concept D", "right": "Definition D"},
                {"left": "Concept E", "right": "Definition E"}
              ],
              "explanation": "These matches are correct because..."
            },
            "stage": 1
          }
        ]
      }
      
      **Quality bar:**
      - Use realistic ${roleTitle} scenarios and current industry practices
      - Make questions challenging but fair - test understanding, not trickery
      - Ensure explanations are educational and help learning
      - Vary question difficulty appropriately across stages
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

  // Cache the result
  setCachedResponse(cacheKey, spec);
  return spec;
}
