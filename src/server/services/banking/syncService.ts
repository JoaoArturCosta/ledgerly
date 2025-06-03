import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import {
  bankConnections,
  bankAccounts,
  bankTransactions,
  type BankConnection,
  type BankAccount,
  type BankTransaction,
} from "@/server/db/schema";
import { getBankingProvider } from "./providerFactory";
import { BankingProvider } from "./types";
import { categorizeTransaction } from "./categorizationService";
import { addDays } from "date-fns";
// Use CommonJS style import for uuid
const { v4: uuidv4 } = require("uuid");

/**
 * Sync banking data for a given connection
 *
 * @param connectionId The ID of the bank connection to sync
 * @param specificAccountId Optional account ID to sync only a specific account
 */
export async function syncBankingData(
  connectionId: string,
  specificAccountId?: string,
): Promise<void> {
  console.log(`🔄 Syncing banking data for connection: ${connectionId}`);

  // Get connection details
  const connection = await db.query.bankConnections.findFirst({
    where: eq(bankConnections.id, connectionId),
  });

  if (!connection) {
    throw new Error("Bank connection not found");
  }

  if (connection.status !== "active") {
    throw new Error("Bank connection is not active");
  }

  // Get the provider and refresh tokens if needed
  const provider = getBankingProvider(connection.providerName);

  // Check if token needs refreshing
  if (connection.expiresAt && new Date(connection.expiresAt) < new Date()) {
    if (!connection.refreshToken) {
      throw new Error("Refresh token not available");
    }

    try {
      const tokenResponse = await provider.refreshToken(
        connection.refreshToken,
      );

      // Update tokens in database
      await db
        .update(bankConnections)
        .set({
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken || connection.refreshToken,
          expiresAt: tokenResponse.expiresAt || null,
          updatedAt: new Date(),
        })
        .where(eq(bankConnections.id, connectionId));

      // Update the connection object with new token
      connection.accessToken = tokenResponse.accessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);

      // Mark connection as error state
      await db
        .update(bankConnections)
        .set({
          status: "error",
          updatedAt: new Date(),
        })
        .where(eq(bankConnections.id, connectionId));

      throw new Error("Failed to refresh access token");
    }
  }

  // If we're syncing a specific account, only sync that one
  if (specificAccountId) {
    const account = await db.query.bankAccounts.findFirst({
      where: eq(bankAccounts.id, specificAccountId),
    });

    if (!account || account.connectionId !== connectionId) {
      throw new Error("Account not found or doesn't belong to this connection");
    }

    await syncAccountTransactions(provider, connection, account);
    return;
  }

  // Otherwise, fetch and sync all accounts
  try {
    console.log("🔄 Fetching accounts from provider");
    const accounts = await provider.fetchAccounts(connection.accessToken);
    console.log(`🔄 Found ${accounts.length} accounts to sync`);

    // Process accounts
    for (const account of accounts) {
      console.log(
        `🔄 Processing account: ${account.id} - ${account.accountName}`,
      );

      // Check if account already exists
      const existingAccount = await db.query.bankAccounts.findFirst({
        where: eq(bankAccounts.id, account.id),
      });

      let accountId: string;

      if (existingAccount) {
        // Update existing account
        accountId = existingAccount.id;
        console.log(`🔄 Updating existing account: ${accountId}`);

        await db
          .update(bankAccounts)
          .set({
            accountName: account.accountName,
            balance: account.balance.toString(),
            lastUpdated: new Date(),
          })
          .where(eq(bankAccounts.id, accountId));
      } else {
        // Create new account
        accountId = account.id;
        console.log(`🔄 Creating new account: ${accountId}`);

        await db.insert(bankAccounts).values({
          id: accountId,
          connectionId,
          accountName: account.accountName,
          accountType: account.accountType,
          accountNumber: account.accountNumber,
          balance: account.balance.toString(),
          currency: account.currency,
          lastUpdated: new Date(),
        });
      }

      // Sync transactions for this account
      const dbAccount = await db.query.bankAccounts.findFirst({
        where: eq(bankAccounts.id, accountId),
      });

      if (dbAccount) {
        await syncAccountTransactions(provider, connection, dbAccount);
      }
    }

    // Update last sync time
    await db
      .update(bankConnections)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(bankConnections.id, connectionId));

    console.log(`✅ Sync completed for connection: ${connectionId}`);
  } catch (error) {
    console.error("Failed to sync accounts:", error);

    // Mark connection as error state
    await db
      .update(bankConnections)
      .set({
        status: "error",
        updatedAt: new Date(),
      })
      .where(eq(bankConnections.id, connectionId));

    throw new Error("Failed to sync bank accounts");
  }
}

/**
 * Sync transactions for a specific account
 */
async function syncAccountTransactions(
  provider: BankingProvider,
  connection: BankConnection,
  account: BankAccount,
) {
  try {
    console.log(
      `🔄 Syncing transactions for account: ${account.id} - ${account.accountName}`,
    );

    // Get last transaction date for this account
    const lastTransaction = await db.query.bankTransactions.findFirst({
      where: eq(bankTransactions.accountId, account.id),
      orderBy: (transactions, { desc }) => [desc(transactions.date)],
    });

    // Default to 90 days ago if no previous transactions
    const startDate = lastTransaction
      ? new Date(lastTransaction.date)
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    const endDate = new Date();

    // Fetch transactions from provider
    console.log(
      `🔄 Fetching transactions from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );
    const transactions = await provider.fetchTransactions(
      connection.accessToken,
      account.id,
      { startDate, endDate },
    );
    console.log(`🔄 Found ${transactions.length} transactions to process`);

    // Process and store transactions
    for (const transaction of transactions) {
      // Check if transaction already exists
      const existingTransaction = await db.query.bankTransactions.findFirst({
        where: eq(bankTransactions.id, transaction.id),
      });

      if (!existingTransaction) {
        console.log(`🔄 Adding new transaction: ${transaction.id}`);

        // Categorize the transaction
        const category = await categorizeTransaction(transaction);

        // Store the new transaction
        await db.insert(bankTransactions).values({
          id: transaction.id,
          accountId: account.id,
          amount: transaction.amount.toString(),
          date: transaction.date,
          description: transaction.description || "",
          merchantName: transaction.merchantName || "",
          category,
          pending: transaction.pending,
          synced: false,
        });
      } else if (existingTransaction.pending && !transaction.pending) {
        console.log(
          `🔄 Updating previously pending transaction: ${transaction.id}`,
        );

        // Update transaction if it was pending but now cleared
        await db
          .update(bankTransactions)
          .set({
            pending: false,
            amount: transaction.amount.toString(), // May have changed
            description:
              transaction.description || existingTransaction.description,
            merchantName:
              transaction.merchantName || existingTransaction.merchantName,
          })
          .where(eq(bankTransactions.id, transaction.id));
      }
    }

    // Update account balance and last updated
    await db
      .update(bankAccounts)
      .set({
        lastUpdated: new Date(),
      })
      .where(eq(bankAccounts.id, account.id));

    console.log(`✅ Transaction sync completed for account: ${account.id}`);

    return true;
  } catch (error) {
    console.error(
      `Failed to sync transactions for account ${account.id}:`,
      error,
    );
    throw error;
  }
}
