import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { SYSTEM_SCORE } from "@/lib/prompts";

const Body = z.object({
  attemptId: z.string(),
  email: z.string().email(),
});

async function computeResults(attemptId: string) {
  // 1) Get attempt + sim
  const { data: attempt, error: aErr } = await supabaseAdmin
    .from("attempts")
    .select("id, simulation_id")
    .eq("id", attemptId)
    .single();
  if (aErr || !attempt) throw new Error("Attempt not found");

  const { data: sim, error: sErr } = await supabaseAdmin
    .from("simulations")
    .select("title, rubric")
    .eq("id", attempt.simulation_id)
    .single();
  if (sErr || !sim) throw new Error("Simulation missing");

  // 2) Fetch step data
  const { data: steps } = await supabaseAdmin
    .from("attempt_steps")
    .select("step_index, input, ai_feedback")
    .eq("attempt_id", attemptId)
    .order("step_index", { ascending: true });

  const summary = (steps ?? [])
    .map(
      (s) =>
        `Step ${s.step_index + 1}:\nAnswer: ${s.input?.text}\nFeedback: ${s.ai_feedback?.text}`
    )
    .join("\n\n");

  // 3) Ask OpenAI (fallback to heuristic on error)
  const systemPrompt = SYSTEM_SCORE(sim.title, sim.rubric ?? []);
  let result: { score: number; strengths: string[]; improvements: string[] };

  function mockScore() {
    let score = 6.5;
    if (/cta|call to action|buy|shop|learn more|sign up/i.test(summary)) score += 0.8;
    if (/audience|target|18-24|25-40|runner|sneaker|budget/i.test(summary)) score += 0.7;
    if (summary.length > 400) score += 0.5;
    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));
    return {
      score,
      strengths: ["Clear structure across steps", "Reasonable audience alignment"],
      improvements: ["Tighten language for punchier delivery", "End with a stronger, explicit CTA"],
    };
  }

  try {
    const resp = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: summary || "No steps captured." },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
    result = JSON.parse(resp.choices[0].message.content || "{}");
    if (
      typeof result?.score !== "number" ||
      !Array.isArray(result?.strengths) ||
      !Array.isArray(result?.improvements)
    ) {
      result = mockScore();
    }
  } catch {
    result = mockScore();
  }

  // 4) Store final result on attempts
  await supabaseAdmin
    .from("attempts")
    .update({
      status: "completed",
      score: result.score,
      result_summary: {
        strengths: result.strengths,
        improvements: result.improvements,
      },
      completed_at: new Date().toISOString(),
    })
    .eq("id", attemptId);

  return { result, simTitle: sim.title };
}

async function ensureBrevoTextAttribute(name: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;
  try {
    const brevo = await import("@getbrevo/brevo");
    const anyBrevo = brevo as any;
    const AttributesApiCtor = anyBrevo.AttributesApi;
    if (!AttributesApiCtor) return; // SDK may not expose it; skip
    const attributesApi = new AttributesApiCtor();
    // Reuse ContactsApiApiKeys for setting API key when specific enum is missing
    const apiKeys = anyBrevo.AttributesApiApiKeys || anyBrevo.ContactsApiApiKeys;
    attributesApi.setApiKey(apiKeys.apiKey, apiKey);
    await attributesApi.createContactAttribute("normal", name, { type: "text" });
  } catch {
    // ignore if exists or not supported
  }
}

async function ensureBrevoContactInResults(email: string, roleTitle?: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const listIdEnv = process.env.BREVO_RESULTS_LIST_ID; // numeric list id
  if (!apiKey || !listIdEnv) return { ok: false, reason: "missing_api_key_or_list_id" };
  const listId = Number(listIdEnv);
  if (!Number.isFinite(listId)) return { ok: false, reason: "invalid_list_id" };

  const brevo = await import("@getbrevo/brevo");
  const contacts = new brevo.ContactsApi();
  contacts.setApiKey(brevo.ContactsApiApiKeys.apiKey, apiKey);

  // Ensure attribute exists so Brevo shows the column
  if (roleTitle) {
    await ensureBrevoTextAttribute("ROLE");
  }

  try {
    const payload = {
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes: roleTitle ? { 
        ROLE: roleTitle,
        JOB_TITLE: roleTitle,
      } : undefined,
    } as any;
    await contacts.createContact(payload);
    return { ok: true, listId };
  } catch (e) {
    console.error("Brevo: createContact failed", e);
    return { ok: false, reason: "contact_upsert_failed" };
  }
}

async function maybeSendEmail(to: string, simTitle: string, result: any) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME || "Leaply";
  if (!apiKey || !fromEmail) return { sent: false, reason: "missing_config" };

  // Lazy import Brevo SDK
  const brevo = await import("@getbrevo/brevo");
  const client = new brevo.TransactionalEmailsApi();
  client.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const subject = `Your ${simTitle} results`;
  const htmlContent = `
    <div style="font-family: ui-sans-serif, system-ui; line-height:1.5">
      <h2 style="margin:0 0 8px 0">Your results for <strong>${simTitle}</strong></h2>
      <p style="margin:0 0 16px 0">Thanks for trying a Leaply simulation. Here’s how you did:</p>
      <p style="margin:0 0 8px 0"><strong>Score:</strong> ${result.score}/10</p>
      <p style="margin:12px 0 4px 0"><strong>Strengths</strong></p>
      <ul>${(result.strengths || []).map((s: string) => `<li>${s}</li>`).join("")}</ul>
      <p style="margin:12px 0 4px 0"><strong>Improvements</strong></p>
      <ul>${(result.improvements || []).map((s: string) => `<li>${s}</li>`).join("")}</ul>
      <p style="margin-top:16px">Try another role at <a href="${process.env.NEXT_PUBLIC_SITE_URL}">meetleaply.ai</a>.</p>
    </div>
  `;

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { email: fromEmail, name: fromName };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  try {
    const data = await client.sendTransacEmail(sendSmtpEmail);
    // Brevo returns messageId in the body
    const messageId = data?.body?.messageId || (data?.body as any)?.messageIds?.[0];
    return { sent: true, id: messageId };
  } catch (error: any) {
    console.error("Brevo error:", error?.response?.body || error?.message || error);
    return { sent: false, reason: "brevo_error", error: String(error?.message || error) };
  }
}

export async function POST(req: Request) {
  try {
    const { attemptId, email } = Body.parse(await req.json());

    // ✅ Store email directly on the attempt
    await supabaseAdmin.from("attempts").update({ email }).eq("id", attemptId);

    // Compute & store results
    const { result, simTitle } = await computeResults(attemptId);

    // ✅ Store user in users table (email only)
    if (email) {
      try {
        await supabaseAdmin
          .from("users")
          .upsert({ email });
      } catch (userError) {
        console.error("Failed to store user:", userError);
      }

      // ✅ Ensure guest is saved in Brevo list "Results" in folder "Leaply"
      try {
        await ensureBrevoContactInResults(email, simTitle);
      } catch (e) {
        console.error("Brevo save contact failed:", e);
      }
    }

    // Try to email (optional)
    const sendStatus = await maybeSendEmail(email, simTitle, result);

    return NextResponse.json({
      ok: true,
      sendStatus, // { sent: boolean, id?: string, reason?: string, error?: string }
      message: sendStatus.sent
        ? "Your results are on the way to your inbox."
        : "Saved, but email didn't send. Check server logs / sendStatus.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
