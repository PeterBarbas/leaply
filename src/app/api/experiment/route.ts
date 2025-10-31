import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const ExperimentEventSchema = z.object({
  eventType: z.enum(['page_visit', 'button_click', 'email_submit', 'session_end']),
  sessionId: z.string(),
  email: z.string().email().optional(),
  sessionDurationMs: z.number().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  referrer: z.string().optional(),
});

async function ensureBrevoContactInWaitlist(email: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const listIdEnv = process.env.BREVO_WAITLIST_LIST_ID; // numeric list id for "Waitlist"
  if (!apiKey || !listIdEnv) return { ok: false, reason: "missing_api_key_or_list_id" };
  const listId = Number(listIdEnv);
  if (!Number.isFinite(listId)) return { ok: false, reason: "invalid_list_id" };

  const brevo = await import("@getbrevo/brevo");
  const contacts = new brevo.ContactsApi();
  contacts.setApiKey(brevo.ContactsApiApiKeys.apiKey, apiKey);

  try {
    const payload = {
      email,
      listIds: [listId],
      updateEnabled: true,
    } as any;
    await contacts.createContact(payload);
    return { ok: true, listId };
  } catch (e) {
    console.error("Brevo Waitlist createContact failed", e);
    return { ok: false, reason: "contact_upsert_failed" };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = ExperimentEventSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('experiment_tracking')
      .insert({
        event_type: validatedData.eventType,
        session_id: validatedData.sessionId,
        email: validatedData.email,
        session_duration_ms: validatedData.sessionDurationMs,
        user_agent: validatedData.userAgent,
        ip_address: validatedData.ipAddress,
        referrer: validatedData.referrer,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting experiment tracking data:', error);
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
    }

    // If email was submitted, upsert into Brevo Waitlist
    if (validatedData.eventType === 'email_submit' && validatedData.email) {
      try {
        await ensureBrevoContactInWaitlist(validatedData.email);
      } catch (e) {
        console.error('Brevo waitlist upsert failed:', e);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in experiment tracking API:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    // Get experiment analytics
    const { data: analytics, error } = await supabaseAdmin
      .from('experiment_tracking')
      .select('event_type, session_id, email, session_duration_ms, created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiment analytics:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    // Process analytics data
    const stats = {
      totalPageVisits: analytics.filter(a => a.event_type === 'page_visit').length,
      totalButtonClicks: analytics.filter(a => a.event_type === 'button_click').length,
      totalEmailSubmissions: analytics.filter(a => a.event_type === 'email_submit').length,
      uniqueSessions: new Set(analytics.map(a => a.session_id)).size,
      averageSessionDuration: 0,
      conversionRate: 0,
      emailSubmissionRate: 0,
    };

    // Calculate average session duration
    const sessionEnds = analytics.filter(a => a.event_type === 'session_end' && a.session_duration_ms);
    if (sessionEnds.length > 0) {
      stats.averageSessionDuration = Math.round(
        sessionEnds.reduce((sum, session) => sum + session.session_duration_ms, 0) / sessionEnds.length
      );
    }

    // Calculate conversion rates
    if (stats.totalPageVisits > 0) {
      stats.conversionRate = Math.round((stats.totalButtonClicks / stats.totalPageVisits) * 100);
      stats.emailSubmissionRate = Math.round((stats.totalEmailSubmissions / stats.totalPageVisits) * 100);
    }

    return NextResponse.json({ stats, rawData: analytics });
  } catch (error) {
    console.error('Error in experiment analytics API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
