import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, verificationTokens } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json(
      { success: false, message: "Missing token or email." },
      { status: 400 },
    );
  }

  try {
    // First check if user is already verified
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (user?.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified. You can now sign in.",
      });
    }

    // Find the verification token
    const vToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, token),
      ),
    });

    if (!vToken) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification link." },
        { status: 400 },
      );
    }

    if (vToken.expires < new Date()) {
      return NextResponse.json(
        { success: false, message: "Verification link has expired." },
        { status: 400 },
      );
    }

    // Mark user as verified
    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, email));

    // Delete the token
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, token),
        ),
      );

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during verification." },
      { status: 500 },
    );
  }
}
