import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, verificationTokens } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Redirect to verification page with parameters
  const verifyPageUrl = new URL("/auth/verify", req.url);
  verifyPageUrl.searchParams.set("token", token || "");
  verifyPageUrl.searchParams.set("email", email || "");

  return NextResponse.redirect(verifyPageUrl);
}
