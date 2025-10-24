import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { assertAdmin } from "@/lib/adminAuth";

const SettingsSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().default("We're currently performing maintenance. Please check back later."),
  allowUserRegistration: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  maxUsersPerDay: z.number().default(100),
  systemAnnouncement: z.string().default(""),
});

export async function GET(req: Request) {
  try {
    assertAdmin(req);
    
    // Get admin settings from a dedicated table or return defaults
    const { data: settings, error } = await supabaseAdmin
      .from("admin_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    // Return settings or defaults
    const defaultSettings = {
      maintenanceMode: false,
      maintenanceMessage: "We're currently performing maintenance. Please check back later.",
      allowUserRegistration: true,
      emailNotifications: true,
      maxUsersPerDay: 100,
      systemAnnouncement: "",
    };

    return NextResponse.json({ 
      settings: settings || defaultSettings 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unauthorized" }, { status: e.status || 500 });
  }
}

export async function PUT(req: Request) {
  try {
    assertAdmin(req);
    
    const body = await req.json();
    const settings = SettingsSchema.parse(body);

    // Upsert admin settings
    const { error } = await supabaseAdmin
      .from("admin_settings")
      .upsert({
        id: 1, // Single row for settings
        ...settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const err = e as { message?: string; status?: number };
    return NextResponse.json(
      { error: err.message || "Save failed" },
      { status: err.status || 500 }
    );
  }
}
