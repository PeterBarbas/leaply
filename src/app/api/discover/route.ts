import { NextResponse } from "next/server";
import { z } from "zod";
import { openai, OPENAI_MODEL } from "@/lib/openai";

const Body = z.object({
  answers: z.array(z.object({ index: z.number(), answer: z.string().min(1) })),
});

// v1 supported roles (title → slug) — adjust slugs to match your DB
const ROLES = [
  { title: "Marketing", slug: "marketing-101" },
  { title: "Software Engineering", slug: "software-engineering-101" },
  { title: "Product Management", slug: "project-management-101" },
  { title: "Data & Analytics", slug: "data-analytics-101" },
  { title: "Sales / Business Development", slug: "sales-bd-101" },
  { title: "Design", slug: "design-101" },
];

const SYSTEM = `
You are a career discovery assistant.
Goal: From user answers, recommend ONE corporate path among:
${ROLES.map((r) => r.title).join(", ")}.

Rules:
- If answers point to a non-corporate path (e.g., chef, sports, music, psychology), return status="unsupported" with a short friendly message containing 3 concrete tips and mention that only corporate simulations are available now.
- Otherwise return status="supported" with:
  - role: the chosen title (exactly one of the list),
  - slug: the provided slug for that role (you'll receive a map),
  - message: 2–3 sentences explaining why.
- Be concise, friendly, and practical.
Return strictly JSON:
{ "status": "supported" | "unsupported", "role"?: string, "slug"?: string, "message": string }
`;

function heuristic(answers: string[]) {
  const text = answers.join(" ").toLowerCase();
  const score: Record<string, number> = {
    Marketing: 0,
    "Software Engineering": 0,
    "Product Management": 0,
    "Data & Analytics": 0,
    "Sales / Business Development": 0,
    Design: 0,
  };

  // crude keyword buckets
  if (/(creative|story|campaign|brand|ad|copy|social)/.test(text)) score["Marketing"] += 2;
  if (/(code|coding|program|algorithm|bug|build|website|app)/.test(text)) score["Software Engineering"] += 2;
  if (/(priorit|roadmap|stakeholder|mvp|ship|align|project)/.test(text)) score["Product Management"] += 2;
  if (/(data|analysis|analytics|ab test|experiment|sql|insight|metric)/.test(text)) score["Data & Analytics"] += 2;
  if (/(sell|sales|pitch|deal|prospect|bd|partnership)/.test(text)) score["Sales / Business Development"] += 2;
  if (/(design|ux|ui|figma|wireframe|prototype|visual)/.test(text)) score["Design"] += 2;

  // work style nudges
  if (/(team|cross-functional|collaborative)/.test(text)) {
    score["Product Management"] += 0.5;
    score["Marketing"] += 0.5;
    score["Sales / Business Development"] += 0.5;
  }
  if (/(independent|focus|deep work)/.test(text)) {
    score["Software Engineering"] += 0.5;
    score["Data & Analytics"] += 0.5;
  }

  const entries = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const [best, bestScore] = entries[0] || ["Marketing", 0];
  const threshold = 1.2; // require at least some signal

  if (bestScore < threshold && /(chef|cook|kitchen|sports?|athlete|music|artist|psychology|therapy|nurse|doctor|law)/.test(text)) {
    return {
      status: "unsupported",
      message:
        "That’s amazing! 👏 While we focus on corporate paths for now, here are 3 tips: 1) Follow pros on YouTube/LinkedIn to see their day-to-day. 2) Shadow or volunteer for a day to get real experience. 3) Join an online community or workshop to learn the basics. We’re expanding soon!",
    };
  }

  const role = best as (typeof ROLES)[number]["title"];
  const slug = ROLES.find((r) => r.title === role)?.slug;
  return {
    status: "supported",
    role,
    slug,
    message: `You lean ${role === "Software Engineering" ? "technical and logical" : role === "Data & Analytics" ? "analytical and experiment-driven" : role === "Design" ? "visual and user-centered" : role === "Product Management" ? "organized, strategic, and collaborative" : role === "Sales / Business Development" ? "persuasive and people-focused" : "creative and audience-focused"}. Try a short ${role} simulation to see how it feels.`,
  };
}

export async function POST(req: Request) {
  try {
    const { answers } = Body.parse(await req.json());
    const compact = answers
      .sort((a, b) => a.index - b.index)
      .map((a) => a.answer)
      .slice(0, 5);

    // Try OpenAI first
    try {
      const resp = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: JSON.stringify({
              answers: compact,
              roleSlugMap: ROLES, // gives model the slugs
            }),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const parsed = JSON.parse(resp.choices[0].message.content || "{}");
      // Validate minimal fields
      if (
        parsed &&
        typeof parsed.message === "string" &&
        (parsed.status === "unsupported" ||
          (parsed.status === "supported" &&
            typeof parsed.role === "string" &&
            typeof parsed.slug === "string"))
      ) {
        return NextResponse.json(parsed);
      }
      // fallthrough to heuristic if malformed
    } catch (e) {
      // swallow and fallback
    }

    // Heuristic fallback (no external calls)
    const h = heuristic(compact);
    return NextResponse.json(h);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Bad request" }, { status: 400 });
  }
}
