import axios from "axios";
// Use CommonJS style import for crypto
const crypto = require("crypto");
import {
  BankingProvider,
  AuthSession,
  TokenResponse,
  Bank,
  Account,
  Transaction,
  TransactionOptions,
} from "../types";
import { storeSessionData, getSessionData } from "../sessionStorage";

interface TrueLayerProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  isSandbox?: boolean;
}

export class TrueLayerProvider implements BankingProvider {
  private baseUrl: string;
  private authUrl: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(config: TrueLayerProviderConfig) {
    // Set URLs based on sandbox or production
    if (config.isSandbox) {
      this.baseUrl = "https://api.truelayer-sandbox.com";
      this.authUrl = "https://auth.truelayer-sandbox.com";
    } else {
      this.baseUrl = "https://api.truelayer.com";
      this.authUrl = "https://auth.truelayer.com";
    }

    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  // Get provider information for the UI
  getProviderInfo() {
    return {
      name: "truelayer",
      displayName: "TrueLayer",
    };
  }

  // Initialize authentication flow
  async initiateAuth(userId: string): Promise<AuthSession> {
    // For TrueLayer, we generate a state parameter to track the session
    const sessionId = crypto.randomUUID();

    // Store session data
    await storeSessionData(sessionId, {
      userId,
      providerName: "truelayer",
      timestamp: Date.now(),
    });

    let authUrl;

    console.log("🔷 TrueLayer: Config values:", {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      baseUrl: this.baseUrl,
      isSandbox: this.baseUrl.includes("sandbox"),
    });

    // Check if we're in development mode (sandbox)
    if (this.baseUrl.includes("sandbox")) {
      console.log("🔷 TrueLayer: Using sandbox authentication");

      // Include specific query parameters for the Mock Bank login
      // For Mock Bank, use:
      // - Username: john
      // - Password: doe
      const params = new URLSearchParams({
        response_type: "code",
        client_id: this.clientId,
        scope:
          "info accounts balance cards transactions direct_debits standing_orders offline_access",
        redirect_uri: this.redirectUri,
        state: sessionId,
        providers: "uk-cs-mock uk-ob-all uk-oauth-all", // Include Mock Bank
      });

      authUrl = `https://auth.truelayer-sandbox.com/?${params.toString()}`;

      console.log("🔷 Generated auth URL for sandbox:", authUrl);
      console.log("🔷 Use these credentials for Mock Bank:");
      console.log("🔷 - Username: john");
      console.log("🔷 - Password: doe");
    } else {
      // Use the standard URL construction for production
      authUrl =
        `${this.authUrl}/authorize?` +
        new URLSearchParams({
          response_type: "code",
          client_id: this.clientId,
          scope: "info accounts balance transactions",
          redirect_uri: this.redirectUri,
          state: sessionId,
          providers:
            "uk-oauth-all uk-oauth-open-banking uk-cs-all uk-cs-open-banking es-oauth-all it-oauth-all",
        }).toString();
    }

    return {
      sessionId,
      authUrl,
    };
  }

  // Exchange authorization code for tokens
  async exchangeToken(
    code: string,
    sessionId?: string,
  ): Promise<TokenResponse> {
    if (!code) {
      throw new Error("Authorization code is required");
    }

    console.log("🔷 TrueLayer: Exchanging token with code:", code);
    console.log("🔷 TrueLayer: Exchange token params:", {
      clientId: this.clientId,
      clientSecret: "****" + (this.clientSecret.slice(-4) || ""),
      redirectUri: this.redirectUri,
    });

    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await axios.post(
        `${this.authUrl}/connect/token`,
        {
          grant_type: "authorization_code",
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: this.redirectUri,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("🔷 TrueLayer: Token exchange successful");

      const data = tokenResponse.data;

      // Get provider information using the access token
      console.log("🔍 Getting provider info using access token...");
      const providerInfo = await this.getUserInfo(data.access_token);
      console.log("📥 Provider info:", JSON.stringify(providerInfo, null, 2));

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        providerAccountId: providerInfo.providerId || "unknown",
      };
    } catch (error) {
      console.error("❌ Error exchanging token with TrueLayer:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  }

  // Get user & provider information from access token
  private async getUserInfo(accessToken: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/data/v1/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data.results[0];
      return {
        providerId: data?.provider?.provider_id || "unknown",
        providerName: data?.provider?.display_name || "Unknown Provider",
        fullName: data?.full_name || "Unknown User",
        email: data?.email || "",
      };
    } catch (error) {
      console.error("Error getting provider info:", error);
      return {
        providerId: "unknown",
        providerName: "Unknown Provider",
      };
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const tokenResponse = await axios.post(
      `${this.authUrl}/connect/token`,
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const data = tokenResponse.data;

    // Get user info
    const userInfo = await this.getUserInfo(data.access_token);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      providerAccountId: userInfo.providerId,
    };
  }

  // Fetch user's bank accounts
  async fetchAccounts(accessToken: string): Promise<Account[]> {
    console.log("🔷 TrueLayer: Fetching accounts with access token");

    try {
      const accountsResponse = await axios.get(
        `${this.baseUrl}/data/v1/accounts`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log(
        `🔷 TrueLayer: Found ${accountsResponse.data.results?.length || 0} accounts`,
      );

      // In sandbox mode with no accounts, create a mock account
      if (
        !accountsResponse.data.results ||
        accountsResponse.data.results.length === 0
      ) {
        if (this.baseUrl.includes("sandbox")) {
          console.log(
            "🔷 TrueLayer: No accounts found in sandbox, creating mock account",
          );

          // Use a consistent ID for the mock account so transactions can be fetched
          const mockAccountId = "mock-sandbox-account-001";

          // Return a mock account for the sandbox environment
          return [
            {
              id: mockAccountId,
              accountName: "Sandbox Current Account",
              accountNumber: "12345678",
              accountType: "TRANSACTION",
              balance: 1250.0,
              currency: "GBP",
            },
          ];
        }
      }

      return accountsResponse.data.results.map((acc: any) => ({
        id: acc.account_id,
        accountName:
          acc.display_name ||
          acc.account_type ||
          `Account ${acc.account_number?.number?.slice(-4)}`,
        accountNumber: acc.account_number?.number || "",
        accountType: this.mapAccountType(acc.account_type),
        balance: parseFloat(acc.balance || "0"),
        currency: acc.currency || "GBP",
      }));
    } catch (error) {
      console.error("🔴 TrueLayer: Error fetching accounts:", error);

      // In sandbox mode, return mock data even on error
      if (this.baseUrl.includes("sandbox")) {
        console.log("🔷 TrueLayer: Error in sandbox, creating mock account");

        // Use a consistent ID for the mock account so transactions can be fetched
        const mockAccountId = "mock-sandbox-account-001";

        return [
          {
            id: mockAccountId,
            accountName: "Sandbox Current Account",
            accountNumber: "12345678",
            accountType: "TRANSACTION",
            balance: 1250.0,
            currency: "GBP",
          },
        ];
      }

      throw error;
    }
  }

  // Fetch transactions for a specific account
  async fetchTransactions(
    accessToken: string,
    accountId: string,
    options: TransactionOptions,
  ): Promise<Transaction[]> {
    console.log(`🔷 TrueLayer: Fetching transactions for account ${accountId}`);

    const startDate =
      options.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const endDate = options.endDate || new Date();

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    // If we're dealing with our mock account in sandbox mode, return mock transactions directly
    if (
      this.baseUrl.includes("sandbox") &&
      accountId === "mock-sandbox-account-001"
    ) {
      console.log(
        "🔷 TrueLayer: Using direct mock transactions for mock account",
      );
      return this.createMockTransactions(accountId, 10);
    }

    try {
      const transactionsResponse = await axios.get(
        `${this.baseUrl}/data/v1/accounts/${accountId}/transactions?` +
          new URLSearchParams({
            from: formatDate(startDate),
            to: formatDate(endDate),
          } as any).toString(),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      console.log(
        `🔷 TrueLayer: Found ${transactionsResponse.data.results?.length || 0} transactions`,
      );

      // If no transactions or error in sandbox mode, create mock data
      if (
        !transactionsResponse.data.results ||
        transactionsResponse.data.results.length === 0
      ) {
        if (this.baseUrl.includes("sandbox")) {
          console.log(
            "🔷 TrueLayer: No transactions found in sandbox, creating mock transactions",
          );

          // Return mock transactions for testing
          return this.createMockTransactions(accountId, 10);
        }
      }

      return transactionsResponse.data.results.map((tx: any) => ({
        id: tx.transaction_id,
        accountId,
        amount: parseFloat(tx.amount),
        date: new Date(tx.timestamp),
        description: tx.description,
        merchantName: tx.merchant_name || "",
        pending: false,
      }));
    } catch (error) {
      console.error("🔴 TrueLayer: Error fetching transactions:", error);

      // In sandbox mode, return mock data even on error
      if (this.baseUrl.includes("sandbox")) {
        console.log(
          "🔷 TrueLayer: Error in sandbox, creating mock transactions",
        );
        return this.createMockTransactions(accountId, 10);
      }

      throw error;
    }
  }

  // Helper method to create mock transactions for sandbox testing
  private createMockTransactions(
    accountId: string,
    count: number,
  ): Transaction[] {
    const mockTransactions: Transaction[] = [];
    const categories = [
      "Groceries",
      "Transport",
      "Entertainment",
      "Shopping",
      "Dining",
    ];
    const merchants = ["Tesco", "Amazon", "Netflix", "Uber", "Starbucks"];

    // Create transactions for the past 30 days
    const today = new Date();

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);

      // Fix the arithmetic operation by converting to number first
      const randomAmount = Math.random() * 100 + 5;
      const amount = -1 * parseFloat(randomAmount.toFixed(2));
      const categoryIndex = Math.floor(Math.random() * categories.length);
      const merchantIndex = Math.floor(Math.random() * merchants.length);

      // Ensure we always have string values for text fields
      const merchant = merchants[merchantIndex] || "Unknown Merchant";
      const category = categories[categoryIndex] || "Other";

      mockTransactions.push({
        id: crypto.randomUUID(),
        accountId,
        amount: amount,
        date,
        description: `Payment to ${merchant}`,
        merchantName: merchant,
        category: category,
        pending: false,
      });
    }

    return mockTransactions;
  }

  // Revoke access
  async revokeAccess(accessToken: string): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/data/v1/revoke_access_token`,
        { access_token: accessToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return true;
    } catch (error) {
      console.error("Failed to revoke access token", error);
      return false;
    }
  }

  // Helper methods
  private mapAccountType(accountType: string): string {
    const typeMap: Record<string, string> = {
      TRANSACTION: "Current",
      SAVINGS: "Savings",
      CREDIT_CARD: "Credit Card",
      LOAN: "Loan",
    };

    // Use type assertion or safe lookup
    return (typeMap as Record<string, string>)[accountType] || "Other";
  }
}
