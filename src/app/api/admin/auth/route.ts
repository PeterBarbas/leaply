import { NextResponse } from "next/server";
import { z } from "zod";

const AuthSchema = z.object({
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = AuthSchema.parse(body);
    
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin authentication not configured" },
        { status: 500 }
      );
    }
    
    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Invalid admin password" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Authentication successful" 
    });
  } catch (e: any) {
    if (e.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: e.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: e.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
