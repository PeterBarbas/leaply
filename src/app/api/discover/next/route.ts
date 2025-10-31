import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { supabaseAnon } from "@/lib/supabase";
import { getNextAction, generateSimulationSpec, generateRoleInformation, QA } from "@/lib/discover";
import { slugify } from "@/lib/slug";
import { normalizeAndEnforceSteps } from "@/lib/task_enforcer";


const Body = z.object({
  qas: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })),
  allowCreate: z.boolean().optional().default(true),
});

async function getExistingSims() {
  const { data } = await supabaseAnon
    .from("simulations")
    .select("slug,title,active");
  return (data ?? []) as { slug: string; title: string; active: boolean }[];
}

function findClosestMatch(title: string, sims: { slug: string; title: string }[]) {
  const t = title.toLowerCase();
  // simple normalization for PM/Project Management, Data, Sales, Design, etc.
  const alias: Record<string, string> = {
    "product management": "project management",
    "pm": "project management",
    "software developer": "software engineering",
    "data": "data & analytics",
    "data science": "data & analytics",
    "bd": "sales / business development",
  };
  const norm = alias[t] || t;

  // exact or includes match by title
  let best = sims.find(
    (s) => s.title.toLowerCase() === norm || s.title.toLowerCase().includes(norm)
  );
  if (best) return best;

  // soft match by keywords
  for (const s of sims) {
    const st = s.title.toLowerCase();
    if (
      (norm.includes("marketing") && st.includes("marketing")) ||
      (norm.includes("project") && st.includes("project")) ||
      (norm.includes("product") && st.includes("project")) ||
      (norm.includes("software") && st.includes("software")) ||
      (norm.includes("design") && st.includes("design")) ||
      (norm.includes("data") && st.includes("data")) ||
      (norm.includes("sales") && st.includes("sales")) ||
      (norm.includes("business development") && st.includes("sales"))
    ) {
      return s;
    }
  }
  return null;
}

function toTask(step: any, idx: number, roleTitle: string): any {
  if (step?.kind === "task") return step;
  const label = typeof step?.label === "string" && step.label.trim() ? step.label.trim() : `Task ${idx + 1}`;
  return {
    index: typeof step?.index === "number" ? step.index : idx,
    kind: "task",
    role: roleTitle,
    title: label,
    summary_md: `**Your task:** ${label}\n\nProvide a concise, real-world answer (5–10 minutes).`,
    resources: [],
    expected_input: { type: "text", placeholder: "Your attempt…" },
  };
}

async function ensureSimulationExists(
  title: string,
  allowCreate: boolean
): Promise<{ slug?: string; created: boolean; exists: boolean }> {
  const sims = await getExistingSims();

  const match = findClosestMatch(title, sims);
  if (match) return { slug: match.slug, created: false, exists: true };

  // Don't create simulations anymore - just return that it doesn't exist
  return { slug: undefined, created: false, exists: false };
}


export async function POST(req: Request) {
  try {
    const { qas, allowCreate } = Body.parse(await req.json());
    const action = await getNextAction(qas as QA[]);

    if (action.action === "ask") {
      return NextResponse.json({ type: "question", question: action.question });
    }

    // action: recommend
    if (action.status === "unsupported") {
      return NextResponse.json({
        type: "result",
        status: "unsupported",
        message:
          action.message_if_unsupported ||
          "Amazing path! While we focus on corporate roles for now, here are 3 tips: 1) Follow pros on YouTube/LinkedIn. 2) Shadow or volunteer for a day. 3) Join a community or short workshop. We’re expanding soon!",
      });
    }

    const roleTitle = (action.role_title || "").trim() || "Project Management";

    // Check if simulation exists (don't create)
    const ensured = await ensureSimulationExists(roleTitle, false);

    if (!ensured.exists) {
      // Simulation doesn't exist - return status to prompt for email
      return NextResponse.json({
        type: "result",
        status: "not_found",
        role: roleTitle,
        message: `Great choice! We're working on a ${roleTitle} simulation. Enter your email below and we'll notify you when it's ready (usually within 24-48 hours).`,
      });
    }

    return NextResponse.json({
      type: "result",
      status: "supported",
      role: roleTitle,
      slug: ensured.slug,
      created: false,
      message:
        action.rationale ||
        `You seem well aligned with ${roleTitle}. Try the simulation to see how it feels.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Bad request" }, { status: 400 });
  }
}
