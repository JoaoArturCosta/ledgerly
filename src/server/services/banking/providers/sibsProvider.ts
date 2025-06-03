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
import {
  storeSessionData,
  getSessionData,
  updateSessionData,
} from "../sessionStorage";

interface SibsProviderConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  certificate: string;
  certificateKey: string;
  isSandbox?: boolean;
}

export class SibsProvider implements BankingProvider {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private certificate: string;
  private certificateKey: string;

  constructor(config: SibsProviderConfig) {
    this.baseUrl = config.isSandbox
      ? "https://sandbox.sibsapimarket.com"
      : "https://api.sibsapimarket.com";
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
    this.certificate = config.certificate;
    this.certificateKey = config.certificateKey;
  }

  getProviderInfo() {
    return {
      name: "sibs",
      displayName: "SIBS API Market",
    };
  }

  // Initialize authentication flow
  async initiateAuth(userId: string): Promise<AuthSession> {
    // First, fetch available banks
    const banks = await this.getBanks();

    // Store banks in session for the UI to display
    const sessionId = crypto.randomUUID();
    await storeSessionData(sessionId, {
      userId,
      providerName: "sibs",
      banks,
      timestamp: Date.now(),
    });

    // Note: Actual bank selection will be done by the user in the UI
    // before proceeding to completeAuth

    return {
      sessionId,
      authUrl: null, // Will be determined after bank selection
      banks,
    };
  }

  // Complete authentication after bank selection
  async completeAuth(sessionId: string, bankId: string): Promise<AuthSession> {
    const session = await getSessionData(sessionId);

    // Create consent for account access
    const consentResponse = await axios.post(
      `${this.baseUrl}/v1/consents`,
      {
        access: {
          accounts: true,
          balances: true,
          transactions: true,
          availableFunds: true,
        },
        recurringIndicator: true,
        validUntil: this.getDateMonthsFromNow(6), // 6 months consent
        frequencyPerDay: 4,
      },
      {
        headers: this.getAuthHeaders(),
        cert: this.certificate,
        key: this.certificateKey,
      },
    );

    const consentId = consentResponse.data.consentId;

    // Generate the authorization URL for the selected bank
    const authUrl =
      `${this.baseUrl}/auth/${bankId}?` +
      new URLSearchParams({
        response_type: "code",
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        scope: "AIS",
        consent_id: consentId,
        state: sessionId,
      }).toString();

    // Update the session with consent info
    await updateSessionData(sessionId, {
      ...session,
      consentId,
      bankId,
    });

    return {
      sessionId,
      authUrl,
      consentId,
    };
  }

  // Exchange authorization code for tokens
  async exchangeToken(
    code: string,
    sessionId?: string,
  ): Promise<TokenResponse> {
    if (!sessionId) {
      throw new Error("Session ID is required for SIBS provider");
    }

    const session = await getSessionData(sessionId);

    const tokenResponse = await axios.post(
      `${this.baseUrl}/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        cert: this.certificate,
        key: this.certificateKey,
      },
    );

    const data = tokenResponse.data;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      consentId: session.consentId,
      bankId: session.bankId,
      providerAccountId: session.bankId, // Using bankId as the provider account ID
    };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const tokenResponse = await axios.post(
      `${this.baseUrl}/oauth2/token`,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        cert: this.certificate,
        key: this.certificateKey,
      },
    );

    const data = tokenResponse.data;

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      consentId: data.consent_id,
      bankId: data.bankId || "",
      providerAccountId: data.bankId || "",
    };
  }

  // Fetch user's bank accounts
  async fetchAccounts(accessToken: string): Promise<Account[]> {
    const accountsResponse = await axios.get(`${this.baseUrl}/v1/accounts`, {
      headers: {
        ...this.getAuthHeaders(),
        Authorization: `Bearer ${accessToken}`,
      },
      cert: this.certificate,
      key: this.certificateKey,
    });

    return accountsResponse.data.accounts.map((acc) => ({
      id: acc.resourceId,
      accountName: acc.name || `Account ${acc.iban.slice(-4)}`,
      accountNumber: acc.iban,
      accountType: this.mapAccountType(acc.cashAccountType),
      balance:
        acc.balances.find((b) => b.balanceType === "closingBooked")?.amount
          ?.amount || 0,
      currency: acc.currency,
      last4: acc.iban.slice(-4),
    }));
  }

  // Fetch transactions for a specific account
  async fetchTransactions(
    accessToken: string,
    accountId: string,
    options: TransactionOptions,
  ): Promise<Transaction[]> {
    const { startDate, endDate } = options;

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    const transactionsResponse = await axios.get(
      `${this.baseUrl}/v1/accounts/${accountId}/transactions?` +
        new URLSearchParams({
          dateFrom: formatDate(startDate),
          dateTo: formatDate(endDate),
          bookingStatus: "both", // Get both booked and pending transactions
        }).toString(),
      {
        headers: {
          ...this.getAuthHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
        cert: this.certificate,
        key: this.certificateKey,
      },
    );

    const booked = transactionsResponse.data.transactions.booked || [];
    const pending = transactionsResponse.data.transactions.pending || [];

    // Process both booked and pending transactions
    const processTransactions = (transactions, isPending) => {
      return transactions.map((tx) => ({
        id: tx.transactionId || `${tx.bookingDate}-${tx.amount.amount}`,
        accountId,
        amount: this.normalizeAmount(tx.amount.amount, tx.creditDebitIndicator),
        date: new Date(tx.bookingDate || tx.valueDate),
        description:
          tx.remittanceInformationUnstructured ||
          tx.additionalInformation ||
          "",
        merchantName: tx.creditorName || tx.debtorName || "",
        category: "", // Will be categorized later
        pending: isPending,
        reference: tx.endToEndId || "",
      }));
    };

    return [
      ...processTransactions(booked, false),
      ...processTransactions(pending, true),
    ];
  }

  // Get consent status
  async getConsentStatus(
    accessToken: string,
    consentId: string,
  ): Promise<string> {
    const response = await axios.get(
      `${this.baseUrl}/v1/consents/${consentId}`,
      {
        headers: {
          ...this.getAuthHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
        cert: this.certificate,
        key: this.certificateKey,
      },
    );

    return response.data.consentStatus;
  }

  // Revoke access/consent
  async revokeAccess(
    accessToken: string,
    consentId?: string,
  ): Promise<boolean> {
    if (!consentId) {
      throw new Error("Consent ID is required for SIBS provider");
    }

    try {
      await axios.delete(`${this.baseUrl}/v1/consents/${consentId}`, {
        headers: {
          ...this.getAuthHeaders(),
          Authorization: `Bearer ${accessToken}`,
        },
        cert: this.certificate,
        key: this.certificateKey,
      });
      return true;
    } catch (error) {
      console.error("Failed to revoke consent", error);
      return false;
    }
  }

  // Get available banks
  private async getBanks(): Promise<Bank[]> {
    const banksResponse = await axios.get(`${this.baseUrl}/v1/banks`, {
      headers: this.getAuthHeaders(),
      cert: this.certificate,
      key: this.certificateKey,
    });

    return banksResponse.data.banks.map((bank) => ({
      id: bank.bankId,
      name: bank.name,
      logo: bank.logo || null,
      region: "PT",
    }));
  }

  // Helper methods
  private getAuthHeaders() {
    return {
      "Content-Type": "application/json",
      "X-Request-ID": crypto.randomUUID(),
      "PSU-IP-Address": "127.0.0.1", // Should be user's IP in production
    };
  }

  private mapAccountType(cashAccountType: string): string {
    const typeMap = {
      CACC: "Current",
      SVGS: "Savings",
      LOAN: "Loan",
      CRDT: "Credit Card",
    };

    return typeMap[cashAccountType] || "Other";
  }

  private normalizeAmount(amount: string, indicator: string): number {
    const value = parseFloat(amount);
    // Convert to negative value if it's a debit transaction
    return indicator === "DBIT" ? -Math.abs(value) : Math.abs(value);
  }

  private getDateMonthsFromNow(months: number): string {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split("T")[0];
  }
}
