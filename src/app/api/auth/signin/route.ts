import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { SignInSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = SignInSchema.parse(body);

    // Sign in user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { error: "Failed to sign in" },
        { status: 500 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }

    return NextResponse.json({
      message: "Signed in successfully",
      user: authData.user,
      session: authData.session,
      profile: profile || null,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
