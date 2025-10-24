import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, newPassword } = ResetPasswordSchema.parse(body);
    
    // Verify the reset token
    const { data: resetData, error: tokenError } = await supabaseAdmin
      .from('admin_reset_tokens')
      .select('*')
      .eq('token', token)
      .single();
    
    if (tokenError || !resetData) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }
    
    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(resetData.expires_at);
    if (now > expiresAt) {
      // Clean up expired token
      await supabaseAdmin
        .from('admin_reset_tokens')
        .delete()
        .eq('token', token);
      
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }
    
    // Update the admin password in environment variable
    // Note: In a production environment, you'd want to store this securely
    // and update it through your deployment system
    console.log(`Password reset for admin email: ${resetData.email}`);
    console.log(`New password: ${newPassword}`);
    
    // Clean up the used token
    await supabaseAdmin
      .from('admin_reset_tokens')
      .delete()
      .eq('token', token);
    
    return NextResponse.json({ 
      success: true,
      message: "Password reset successfully. Please update the ADMIN_PASSWORD environment variable with the new password."
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: e.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: e.message || "Failed to reset password" },
      { status: 500 }
    );
  }
}
