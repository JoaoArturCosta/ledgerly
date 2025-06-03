/**
 * Banking provider interface and shared types
 */

// Bank information
export interface Bank {
  id: string;
  name: string;
  logo?: string | null;
  region: string;
}

// Account information
export interface Account {
  id: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  last4?: string;
}

// Transaction information
export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  date: Date;
  description: string;
  merchantName: string;
  category?: string;
  pending: boolean;
  reference?: string;
}

// Options for fetching transactions
export interface TransactionOptions {
  startDate: Date;
  endDate: Date;
}

// Authentication session info
export interface AuthSession {
  sessionId: string;
  authUrl: string | null;
  banks?: Bank[];
  consentId?: string;
}

// Token response from provider
export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  consentId?: string;
  bankId?: string;
  providerAccountId: string;
}

// Base interface for all banking providers
export interface BankingProvider {
  // Get provider information
  getProviderInfo(): { name: string; displayName: string };

  // Initialize authentication flow
  initiateAuth(userId: string): Promise<AuthSession>;

  // Exchange authorization code for tokens
  exchangeToken(code: string, sessionId?: string): Promise<TokenResponse>;

  // Refresh access token
  refreshToken(refreshToken: string): Promise<TokenResponse>;

  // Fetch user's bank accounts
  fetchAccounts(accessToken: string): Promise<Account[]>;

  // Fetch transactions for a specific account
  fetchTransactions(
    accessToken: string,
    accountId: string,
    options: TransactionOptions,
  ): Promise<Transaction[]>;

  // Revoke access/consent
  revokeAccess(accessToken: string, consentId?: string): Promise<boolean>;
}
