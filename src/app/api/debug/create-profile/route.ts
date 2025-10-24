import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get the auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authUser.user.id,
        email: authUser.user.email!,
        name: authUser.user.user_metadata?.name || authUser.user.user_metadata?.full_name || 'User',
        provider: 'email',
        photo_url: authUser.user.user_metadata?.avatar_url || authUser.user.user_metadata?.picture,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ 
        error: "Failed to create profile", 
        details: profileError 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profile 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
