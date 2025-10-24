import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    // Test database connection
    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("*")
      .limit(5);

    // Test auth users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    return NextResponse.json({
      success: true,
      users: users || [],
      usersError: usersError?.message || null,
      authUsers: authUsers?.users?.length || 0,
      authError: authError?.message || null,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
