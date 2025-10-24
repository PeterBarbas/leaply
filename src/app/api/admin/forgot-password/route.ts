import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-server";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = ForgotPasswordSchema.parse(body);
    
    // Check if this is a valid admin email
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(email.toLowerCase())) {
      return NextResponse.json(
        { error: "Email not authorized for admin access" },
        { status: 403 }
      );
    }
    
    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    // Store the reset token in the database
    const { error: dbError } = await supabaseAdmin
      .from('admin_reset_tokens')
      .upsert({
        email: email.toLowerCase(),
        token: resetToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: "Failed to process reset request" },
        { status: 500 }
      );
    }
    
    // Send reset email (you can implement your email service here)
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
    
    // For now, we'll log the reset URL (in production, send actual email)
    console.log(`Password reset requested for ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    
    // In a real implementation, you would send an email here
    // await sendResetEmail(email, resetUrl);
    
    return NextResponse.json({ 
      success: true,
      message: "Password reset instructions sent to your email",
      // For development, include the reset URL in the response
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email address", details: e.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: e.message || "Failed to process reset request" },
      { status: 500 }
    );
  }
}
