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
  stage: z.number().int().min(1).max(3).optional().default(1),
});

export type TaskStep = z.infer<typeof TaskStepSchema>;

// User authentication schemas
export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  terms: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
});

export const SignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  country: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  avatar: z.enum(['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5']).optional(),
  interests: z.array(z.string()).optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export type SignUpData = z.infer<typeof SignUpSchema>;
export type SignInData = z.infer<typeof SignInSchema>;
export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  provider: 'email' | 'google' | 'apple';
  photo_url?: string;
  country?: string;
  location?: string;
  website?: string;
  avatar?: 'avatar1' | 'avatar2' | 'avatar3' | 'avatar4' | 'avatar5';
  interests?: string[];
  bio?: string;
  created_at: string;
  updated_at: string;
}

export function looksVague(text = ""): boolean {
  const t = text.toLowerCase();
  const vaguePhrases = [
    "create an mvp","improve the product","think about","do research","brainstorm",
    "etc","and so on","general","work on","make a plan","figure out","set up things",
  ];
  return t.length < 40 || vaguePhrases.some((k) => t.includes(k));
}
