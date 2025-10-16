import { z } from "zod";

// Helpers to enforce specificity
const hasSections = (s: string) =>
  /\*\*Goal\*\*/i.test(s) &&
  /\*\*Context\*\*/i.test(s) &&
  /\*\*Constraints\*\*/i.test(s) &&
  /\*\*Deliverable\*\*/i.test(s) &&
  /\*\*Tips\*\*/i.test(s);

const startsWithImperative = (t: string) => /^[A-Z][a-z]+/.test(t) && /^(Write|Draft|Find|Choose|Prioritize|Outline|Estimate|Design|Review|Refactor|Plan|Define)\b/i.test(t);

export const TaskStepSchema = z.object({
  kind: z.literal("task"),
  index: z.number().int().nonnegative(),
  role: z.string().optional(),
  title: z.string().min(8).refine(startsWithImperative, { message: "Title must start with a concrete action (e.g., 'Write', 'Find', 'Draft')." }),
  summary_md: z.string().min(80).refine(hasSections, { message: "summary_md must include Goal, Context, Constraints, Deliverable, Tips sections." })
    .refine((s) => /\b\d/.test(s) || /character|word|limit|minutes|kpi|score|rate|error/i.test(s), { message: "summary_md must include at least one concrete constraint (e.g., length, timebox, metric)." }),
  hint_md: z.string().optional(),
  expected_input: z.object({
    type: z.literal("text"),
    placeholder: z.string().optional(),
  }).default({ type: "text", placeholder: "Write your attempt…" }),
});

export type TaskStep = z.infer<typeof TaskStepSchema>;

export function looksVague(text = ""): boolean {
  const t = text.toLowerCase();
  const vaguePhrases = [
    "create an mvp","improve the product","think about","do research","brainstorm",
    "etc","and so on","general","work on","make a plan","figure out","set up things",
  ];
  return t.length < 40 || vaguePhrases.some((k) => t.includes(k));
}
