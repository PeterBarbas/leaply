import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { to } = await req.json();
    if (!to) return NextResponse.json({ error: "Missing 'to'" }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    if (!apiKey || !from) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY or RESEND_FROM" }, { status: 500 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Leaply test email",
      html: "<strong>Hello from Leaply!</strong> If you see this, Resend is working.",
    });

    if (error) {
      console.error("Resend test error:", error);
      return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Internal error" }, { status: 500 });
  }
}
