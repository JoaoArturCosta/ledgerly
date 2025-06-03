import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { getBankingProvider } from "@/server/services/banking/providerFactory";
import { db } from "@/server/db";
import { bankConnections } from "@/server/db/schema";
// Use CommonJS style import for uuid
const { v4: uuidv4 } = require("uuid");
import { syncBankingData } from "@/server/services/banking/syncService";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const providerName = searchParams.get("provider") || "truelayer"; // Default to TrueLayer for now

  console.log("🔷 Banking callback received:", {
    code: code ? `${code.substring(0, 6)}...` : null,
    state,
    providerName,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  if (!code || !state) {
    console.error("🔴 Banking callback missing params:", { code, state });
    return NextResponse.redirect(
      new URL("/banking?error=missing_params", req.url),
    );
  }

  try {
    // Get user session
    const session = await getServerAuthSession();

    if (!session?.user) {
      console.error("🔴 Banking callback - no user session");
      return NextResponse.redirect(
        new URL("/auth/signin?error=authentication_required", req.url),
      );
    }

    console.log("🔷 Banking callback - attempting to complete connection");

    try {
      const sessionId = state;
      const provider = getBankingProvider(providerName);

      // Exchange the code for tokens
      console.log("🔷 Exchanging code for tokens");
      const tokenResponse = await provider.exchangeToken(code, sessionId);
      console.log("🔷 Received token response:", {
        hasAccessToken: !!tokenResponse.accessToken,
        hasRefreshToken: !!tokenResponse.refreshToken,
        hasProviderAccountId: !!tokenResponse.providerAccountId,
      });

      // Store the connection in the database
      const connectionId = uuidv4();
      await db.insert(bankConnections).values({
        id: connectionId,
        userId: session.user.id,
        providerName: providerName,
        providerAccountId: tokenResponse.providerAccountId,
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken || null,
        consentId: tokenResponse.consentId || null,
        bankId: tokenResponse.bankId || null,
        status: "active",
        expiresAt: tokenResponse.expiresAt || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Trigger initial sync of accounts and transactions
      console.log("🔷 Syncing banking data");
      await syncBankingData(connectionId);

      console.log("✅ Banking connection completed successfully");

      // Redirect to success page
      return NextResponse.redirect(new URL("/banking?success=true", req.url));
    } catch (error) {
      console.error("🔴 Error completing connection:", error);
      throw error; // Re-throw to be caught by outer try/catch
    }
  } catch (error) {
    console.error("🔴 Banking connection error:", error);
    return NextResponse.redirect(
      new URL("/banking?error=connection_failed", req.url),
    );
  }
}
