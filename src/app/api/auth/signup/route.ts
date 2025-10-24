import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import { SignUpSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, terms } = SignUpSchema.parse(body);

    if (!terms) {
      return NextResponse.json(
        { error: "You must accept the terms and conditions" },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        full_name: name,
      },
      email_confirm: true, // Auto-confirm for MVP
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Create user profile in our users table
    try {
      const { error: profileError } = await supabaseAdmin
        .from("users")
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name,
          provider: "email",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
        console.error("Profile error details:", JSON.stringify(profileError, null, 2));
        // Don't fail the request if profile creation fails
      } else {
        console.log("User profile created successfully");
      }
    } catch (profileError) {
      console.error("Exception creating user profile:", profileError);
    }

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name,
      },
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
