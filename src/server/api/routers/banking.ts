import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, desc, inArray } from "drizzle-orm";
import {
  getBankingProvider,
  getAllBankingProviders,
} from "@/server/services/banking/providerFactory";
import {
  bankConnections,
  bankAccounts,
  bankTransactions,
  expenses,
} from "@/server/db/schema";
import { syncBankingData } from "@/server/services/banking/syncService";
// Use CommonJS style import for uuid
const { v4: uuidv4 } = require("uuid");

export const bankingRouter = createTRPCRouter({
  // ==================
  // Provider Management
  // ==================
  getProviders: protectedProcedure.query(async () => {
    return getAllBankingProviders();
  }),

  // ==================
  // Connection Management
  // ==================
  getConnections: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.bankConnections.findMany({
      where: eq(bankConnections.userId, ctx.session.user.id),
      orderBy: [desc(bankConnections.createdAt)],
    });
  }),

  initiateConnection: protectedProcedure
    .input(
      z.object({
        providerName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const provider = getBankingProvider(input.providerName);
        const authSession = await provider.initiateAuth(ctx.session.user.id);

        // If the provider returns banks (e.g., SIBS), include them in the response
        return {
          sessionId: authSession.sessionId,
          authUrl: authSession.authUrl,
          banks: authSession.banks,
          requiresBankSelection: !authSession.authUrl,
        };
      } catch (error) {
        console.error("Failed to initiate banking connection", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initiate banking connection",
          cause: error,
        });
      }
    }),

  selectBank: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        bankId: z.string(),
        providerName: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const provider = getBankingProvider(input.providerName);

        // Check if this provider has the completeAuth method (SIBS-specific)
        if (
          "completeAuth" in provider &&
          typeof provider.completeAuth === "function"
        ) {
          // Type assertion for provider with completeAuth method
          const authSession = await provider.completeAuth(
            input.sessionId,
            input.bankId,
          );

          return {
            authUrl: authSession.authUrl,
          };
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This provider does not support bank selection",
          });
        }
      } catch (error) {
        console.error("Failed to select bank", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to select bank",
          cause: error,
        });
      }
    }),

  completeConnection: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        state: z.string(), // Contains sessionId
        providerName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const sessionId = input.state;
        const provider = getBankingProvider(input.providerName);

        // Exchange the code for tokens
        const tokenResponse = await provider.exchangeToken(
          input.code,
          sessionId,
        );

        // Store the connection in the database
        const connectionId = uuidv4();
        await ctx.db.insert(bankConnections).values({
          id: connectionId,
          userId: ctx.session.user.id,
          providerName: input.providerName,
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
        await syncBankingData(connectionId);

        return { success: true, connectionId };
      } catch (error) {
        console.error("Failed to complete banking connection", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to complete banking connection",
          cause: error,
        });
      }
    }),

  disconnectBank: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the connection
        const connection = await ctx.db.query.bankConnections.findFirst({
          where: and(
            eq(bankConnections.id, input.connectionId),
            eq(bankConnections.userId, ctx.session.user.id),
          ),
        });

        if (!connection) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Banking connection not found",
          });
        }

        // Revoke access with the provider
        const provider = getBankingProvider(connection.providerName);
        await provider.revokeAccess(
          connection.accessToken,
          connection.consentId || undefined,
        );

        // Update the connection status
        await ctx.db
          .update(bankConnections)
          .set({
            status: "disconnected",
            updatedAt: new Date(),
          })
          .where(eq(bankConnections.id, input.connectionId));

        return { success: true };
      } catch (error) {
        console.error("Failed to disconnect banking connection", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disconnect banking connection",
          cause: error,
        });
      }
    }),

  // ==================
  // Account & Transaction Management
  // ==================
  getAccounts: protectedProcedure.query(async ({ ctx }) => {
    // Get all accounts for the user's bank connections
    const connections = await ctx.db.query.bankConnections.findMany({
      where: and(
        eq(bankConnections.userId, ctx.session.user.id),
        eq(bankConnections.status, "active"),
      ),
    });

    const connectionIds = connections.map((conn) => conn.id);

    return await ctx.db.query.bankAccounts.findMany({
      where:
        connectionIds.length > 0
          ? inArray(bankAccounts.connectionId, connectionIds)
          : undefined,
      orderBy: [desc(bankAccounts.lastUpdated)],
    });
  }),

  getTransactions: protectedProcedure
    .input(
      z.object({
        accountId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.number().nullish(), // For pagination
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get the account to ensure it belongs to the user
      const account = await ctx.db.query.bankAccounts.findFirst({
        where: eq(bankAccounts.id, input.accountId),
        with: {
          connection: true,
        },
      });

      if (!account || account.connection.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bank account not found or not authorized",
        });
      }

      // Get transactions for the account
      const transactions = await ctx.db.query.bankTransactions.findMany({
        where: eq(bankTransactions.accountId, input.accountId),
        orderBy: [desc(bankTransactions.date)],
        limit: input.limit,
        offset: input.cursor || 0,
      });

      const nextCursor =
        transactions.length === input.limit
          ? (input.cursor || 0) + input.limit
          : null;

      return {
        transactions,
        nextCursor,
      };
    }),

  syncAccount: protectedProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get the account to ensure it belongs to the user
      const account = await ctx.db.query.bankAccounts.findFirst({
        where: eq(bankAccounts.id, input.accountId),
        with: {
          connection: true,
        },
      });

      if (!account || account.connection.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bank account not found or not authorized",
        });
      }

      // Sync the account
      await syncBankingData(account.connection.id, input.accountId);

      return { success: true };
    }),

  // ==================
  // Transaction Categorization & Expense Integration
  // ==================
  categorizeTransaction: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        category: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the transaction to ensure it belongs to the user
      const transaction = await ctx.db.query.bankTransactions.findFirst({
        where: eq(bankTransactions.id, input.transactionId),
        with: {
          account: {
            with: {
              connection: true,
            },
          },
        },
      });

      if (
        !transaction ||
        transaction.account.connection.userId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found or not authorized",
        });
      }

      // Update the transaction category
      await ctx.db
        .update(bankTransactions)
        .set({ category: input.category })
        .where(eq(bankTransactions.id, input.transactionId));

      return { success: true };
    }),

  linkTransactionToExpense: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        expenseId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the transaction to ensure it belongs to the user
        const transaction = await ctx.db.query.bankTransactions.findFirst({
          where: eq(bankTransactions.id, input.transactionId),
          with: {
            account: {
              with: {
                connection: true,
              },
            },
          },
        });

        if (
          !transaction ||
          transaction.account.connection.userId !== ctx.session.user.id
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transaction not found or not authorized",
          });
        }

        // Link the transaction to the expense
        await ctx.db
          .update(bankTransactions)
          .set({
            expenseId: input.expenseId,
            synced: true,
          })
          .where(eq(bankTransactions.id, input.transactionId));

        return { success: true };
      } catch (error) {
        console.error("Failed to link transaction to expense", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to link transaction to expense",
          cause: error,
        });
      }
    }),

  createExpenseFromTransaction: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        categoryId: z.number(),
        subCategoryId: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the transaction with its related account and connection
      const transaction = await ctx.db.query.bankTransactions.findFirst({
        where: eq(bankTransactions.id, input.transactionId),
        with: {
          account: {
            with: {
              connection: true,
            },
          },
        },
      });

      if (
        !transaction ||
        !transaction.account?.connection?.userId ||
        transaction.account.connection.userId !== ctx.session.user.id
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found or not authorized",
        });
      }

      // Create a new expense from the transaction
      const amount = parseInt(transaction.amount.toString(), 10);
      const subCategoryId = input.subCategoryId || 1;

      try {
        const result = await ctx.db.transaction(async (tx) => {
          // Insert the expense
          const insertResult = await tx
            .insert(expenses)
            .values({
              amount: amount,
              createdById: ctx.session.user.id,
              description:
                transaction.description ||
                transaction.merchantName ||
                "Bank transaction",
              expenseCategoryId: input.categoryId,
              expenseSubCategoryId: subCategoryId,
              isRecurring: false,
              name: transaction.merchantName || "Bank Transaction",
              relatedDate: transaction.date,
            })
            .returning({ id: expenses.id });

          const expenseId = insertResult[0]?.id;

          if (!expenseId) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create expense",
            });
          }

          // Link the transaction to the expense
          await tx
            .update(bankTransactions)
            .set({
              expenseId: expenseId,
              synced: true,
            })
            .where(eq(bankTransactions.id, input.transactionId));

          return { expenseId };
        });

        return { success: true, expenseId: result.expenseId };
      } catch (error) {
        console.error("Failed to create expense from transaction", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create expense from transaction",
          cause: error,
        });
      }
    }),
});
