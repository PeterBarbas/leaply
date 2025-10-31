import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to } = await req.json();
    if (!to) return NextResponse.json({ error: "Missing 'to'" }, { status: 400 });

    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.BREVO_FROM_EMAIL;
    const fromName = process.env.BREVO_FROM_NAME || "Leaply";
    if (!apiKey || !fromEmail) {
      return NextResponse.json({ error: "Missing BREVO_API_KEY or BREVO_FROM_EMAIL" }, { status: 500 });
    }

    const brevo = await import("@getbrevo/brevo");
    const client = new brevo.TransactionalEmailsApi();
    client.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { email: fromEmail, name: fromName };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = "Leaply test email";
    sendSmtpEmail.htmlContent = "<strong>Hello from Leaply!</strong> If you see this, Brevo is working.";

    try {
      const data = await client.sendTransacEmail(sendSmtpEmail);
      return NextResponse.json({ ok: true, id: data?.messageId || data?.messageIds?.[0] });
    } catch (error: any) {
      console.error("Brevo test error:", error?.response?.body || error);
      return NextResponse.json({ ok: false, error: String(error?.message || error) }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
