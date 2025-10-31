import { NextResponse } from "next/server";
import { z } from "zod";
import * as brevo from "@getbrevo/brevo";

const Body = z.object({
  email: z.string().email(),
  role: z.string().min(1),
});

async function ensureAttributeRequestedRole() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;
  try {
    const anyBrevo = brevo as any;
    const AttributesApiCtor = anyBrevo.AttributesApi;
    if (!AttributesApiCtor) return; // SDK may not expose it; skip
    const attributesApi = new AttributesApiCtor();
    const apiKeys = anyBrevo.AttributesApiApiKeys || anyBrevo.ContactsApiApiKeys;
    attributesApi.setApiKey(apiKeys.apiKey, apiKey);
    await attributesApi.createContactAttribute("normal", "REQUESTED_ROLE", { type: "text" });
  } catch (e: any) {
    // ignore if exists or not supported
  }
}

async function sendWaitlistEmailToRequest(email: string, role: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME || "Leaply";
  if (!apiKey || !fromEmail) return { sent: false, reason: "missing_config" };

  const client = new brevo.TransactionalEmailsApi();
  client.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const subject = `New Simulation Request: ${role}`;
  const htmlContent = `
    <div style="font-family: ui-sans-serif, system-ui; line-height:1.5">
      <h2 style="margin:0 0 16px 0">New Simulation Request</h2>
      <p style="margin:0 0 8px 0"><strong>Requested Role:</strong> ${role}</p>
      <p style="margin:0 0 8px 0"><strong>User Email:</strong> ${email}</p>
      <p style="margin:16px 0 0 0">A user has requested to be notified when the <strong>${role}</strong> simulation is available.</p>
      <p style="margin:8px 0 0 0">Please create the simulation within 24-48 hours and notify the user.</p>
    </div>
  `;

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { email: fromEmail, name: fromName };
  sendSmtpEmail.to = [{ email: "request@meetleaply.com" }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  try {
    const data = await client.sendTransacEmail(sendSmtpEmail);
    const messageId = (data as any)?.body?.messageId || (data as any)?.body?.messageIds?.[0];
    return { sent: true, id: messageId };
  } catch (error: any) {
    return { sent: false, reason: "brevo_error", error: String(error?.message || error) };
  }
}

async function addToRoleRequestsList(email: string, role: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const listIdEnv = process.env.BREVO_ROLE_REQUESTS_LIST_ID; // numeric list id
  if (!apiKey || !listIdEnv) return { ok: false, reason: "missing_api_key_or_list_id" };
  const listId = Number(listIdEnv);
  if (!Number.isFinite(listId)) return { ok: false, reason: "invalid_list_id" };

  // Ensure custom attribute exists so Brevo shows it as a column
  await ensureAttributeRequestedRole();

  const contacts = new brevo.ContactsApi();
  contacts.setApiKey(brevo.ContactsApiApiKeys.apiKey, apiKey);

  try {
    const payload = {
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes: { 
        REQUESTED_ROLE: role,
        JOB_TITLE: role,
      },
    } as any;
    await contacts.createContact(payload);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: "contact_upsert_failed" };
  }
}

export async function POST(req: Request) {
  try {
    const { email, role } = Body.parse(await req.json());

    // Add to Brevo Role Requests list with attribute
    await addToRoleRequestsList(email, role);

    // Send email to request@meetleaply.com
    await sendWaitlistEmailToRequest(email, role);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email or role", details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}

