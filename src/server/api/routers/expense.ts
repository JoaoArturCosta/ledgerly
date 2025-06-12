import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { expenses, savings } from "@/server/db/schema";
import { format } from "date-fns";
import { eq, sql } from "drizzle-orm";
import { canUseFeature, type SubscriptionPlan } from "@/lib/stripe-config";

export const expenseRouter = createTRPCRouter({
  getAllCategories: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.expenseSubCategories.findMany({
      with: {
        expenseCategory: true,
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        description: z.string().min(1),
        expenseCategoryId: z.string().min(1),
        expenseSubCategoryId: z.string().min(1),
        recurring: z.boolean(),
        relatedDate: z.date(),
        relatedSavingId: z.string().optional().nullable(),
        endDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check subscription limits for transactions
      const userPlan = (ctx.session.user.subscription?.plan ??
        "free") as SubscriptionPlan;

      // Get current transaction count
      const transactionCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(expenses)
        .where(eq(expenses.createdById, ctx.session.user.id));

      const currentCount = transactionCount[0]?.count ?? 0;

      // Check if user can create another transaction
      if (!canUseFeature(userPlan, "transactions", currentCount + 1)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Transaction limit reached. Please upgrade your plan to add more transactions.",
        });
      }

      const expenseData = {
        amount: input.amount.toString(),
        description: input.description,
        expenseCategoryId: parseInt(input.expenseCategoryId),
        expenseSubCategoryId: parseInt(input.expenseSubCategoryId),
        isRecurring: input.recurring,
        relatedDate: input.relatedDate,
        createdById: ctx.session.user.id,
        relatedSavingId:
          input.relatedSavingId && input.relatedSavingId !== ""
            ? parseInt(input.relatedSavingId)
            : null,
        endDate: input.endDate,
      };

      await ctx.db.insert(expenses).values(expenseData);

      // Only process saving-related logic if relatedSavingId is present and valid
      if (input.relatedSavingId && input.relatedSavingId !== "") {
        const savingId = parseInt(input.relatedSavingId);
        const relatedSaving = await ctx.db.query.savings.findFirst({
          where: (saving) => eq(saving.id, savingId),
        });

        // Only proceed if we found the saving
        if (relatedSaving) {
          let depositAmount = input.amount;

          if (input.recurring) {
            const currentMonth = new Date().getMonth();

            let endMonth = 12;

            if (input.endDate) {
              endMonth = input.endDate.getMonth();
            }

            const months = endMonth - currentMonth;

            depositAmount = input.amount * months;
          }

          const currentDepositedAmount = parseFloat(
            relatedSaving.depositedAmount ?? "0",
          );

          await ctx.db
            .update(savings)
            .set({
              depositedAmount: (
                currentDepositedAmount + depositAmount
              ).toString(),
            })
            .where(eq(savings.id, savingId));
        }
      }

      const subCategory = await ctx.db.query.expenseSubCategories.findFirst({
        where: (subCategory) =>
          eq(subCategory.id, parseInt(input.expenseSubCategoryId)),
      });

      return { success: true, expenseSubCategory: subCategory };
    }),

  getExpensesForMonth: protectedProcedure
    .input(
      z.object({
        relatedDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const year = input.relatedDate.getFullYear();
      const month = input.relatedDate.getMonth();

      const expenses = await ctx.db.query.expenses.findMany({
        where: (expenses, { and, eq, or, between }) =>
          or(
            and(
              eq(expenses.createdById, ctx.session.user.id),
              between(
                expenses.relatedDate,
                new Date(year, month, 1),
                new Date(year, month, 31),
              ),
              eq(expenses.isRecurring, false),
            ),
            eq(expenses.isRecurring, true),
          ),
        with: {
          expenseCategory: true,
          expenseSubCategory: true,
        },
        orderBy: (expenses, { asc }) => [asc(expenses.createdAt)],
      });

      return expenses;
    }),
  getExpensesForYearByMonth: protectedProcedure
    .input(
      z.object({
        relatedDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const year = input.relatedDate.getFullYear();

      const expenses = await ctx.db.query.expenses.findMany({
        where: (expenses, { and, eq, or, between }) =>
          or(
            and(
              eq(expenses.createdById, ctx.session.user.id),
              between(
                expenses.relatedDate,
                new Date(year, 0, 1),
                new Date(year, 11, 31),
              ),
              eq(expenses.isRecurring, false),
            ),
            eq(expenses.isRecurring, true),
          ),
        with: {
          expenseCategory: true,
          expenseSubCategory: true,
        },
      });

      const expensesByMonth = expenses.reduce(
        (
          acc: Record<string, { Total: number; [key: string]: number }>,
          expense,
        ) => {
          const month = format(expense.relatedDate!, "MMMM");
          const amount = parseFloat(expense.amount);

          if (expense.isRecurring) {
            for (let i = 0; i < 12; i++) {
              const date = new Date(year, i, 1);
              const month = format(date, "MMMM");
              if (!acc[month]) {
                acc[month] = {
                  [expense.expenseCategory.name!]: amount,
                  Total: amount,
                };
              } else if (acc[month]) {
                if (!acc[month]![expense.expenseCategory.name!]) {
                  acc[month]![expense.expenseCategory.name!] = amount;
                }
                acc[month]!.Total += amount;
              }
            }
            return acc;
          }

          if (!acc[month]) {
            acc[month] = {
              [expense.expenseCategory.name!]: amount,
              Total: amount,
            };
          }

          if (acc[month]) {
            if (!acc[month]![expense.expenseCategory.name!]) {
              acc[month]![expense.expenseCategory.name!] = amount;
            } else {
              acc[month]![expense.expenseCategory.name!] += amount;
            }
            acc[month]!.Total += amount;
          }

          return acc;
        },
        {
          January: {
            Total: 0,
          },
        },
      );

      return expensesByMonth;
    }),
  getExpensesForYearByCategory: protectedProcedure
    .input(
      z.object({
        relatedDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const year = input.relatedDate.getFullYear();

      const expenses = await ctx.db.query.expenses.findMany({
        where: (expenses, { and, eq, or, between }) =>
          or(
            and(
              eq(expenses.createdById, ctx.session.user.id),
              between(
                expenses.relatedDate,
                new Date(year, 0, 1),
                new Date(year, 11, 31),
              ),
              eq(expenses.isRecurring, false),
            ),
            eq(expenses.isRecurring, true),
          ),
        with: {
          expenseCategory: true,
          expenseSubCategory: true,
        },
      });

      const expensesByCategory = expenses.reduce(
        (acc, expense) => {
          const month = format(expense.relatedDate!, "MMMM");
          const amount = parseFloat(expense.amount);

          if (expense.isRecurring) {
            for (let i = 0; i < 12; i++) {
              const date = new Date(year, i, 1);
              const month = format(date, "MMMM");
              if (!acc[expense.expenseCategory.name!]) {
                acc[expense.expenseCategory.name!] = {
                  [month]: amount,
                  Total: amount,
                };
              } else if (acc[expense.expenseCategory.name!]) {
                if (!acc[expense.expenseCategory.name!]![month]) {
                  acc[expense.expenseCategory.name!]![month] = amount;
                }
                acc[expense.expenseCategory.name!]!.Total += amount;
              }
            }
            return acc;
          }

          if (!acc[expense.expenseCategory.name!]) {
            acc[expense.expenseCategory.name!] = {
              [month]: amount,
              Total: amount,
            };
          }

          if (acc[expense.expenseCategory.name!]) {
            if (!acc[expense.expenseCategory.name!]![month]) {
              acc[expense.expenseCategory.name!]![month] = amount;
            } else {
              acc[expense.expenseCategory.name!]![month] += amount;
            }
            acc[expense.expenseCategory.name!]!.Total += amount;
          }

          return acc;
        },
        {} as Record<string, { Total: number; [key: string]: number }>,
      );

      return expensesByCategory;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(expenses).where(eq(expenses.id, input.id));

      return { success: true };
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        amount: z.number().min(1),
        description: z.string().min(1),
        expenseCategoryId: z.string().min(1),
        expenseSubCategoryId: z.string().min(1),
        endDate: z.date().optional().nullable(),
        recurring: z.boolean(),
        relatedDate: z.date(),
        relatedSavingId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(expenses)
        .set({
          amount: input.amount.toString(),
          description: input.description,
          expenseCategoryId: parseInt(input.expenseCategoryId),
          expenseSubCategoryId: parseInt(input.expenseSubCategoryId),
          endDate: input.endDate,
          isRecurring: input.recurring,
          relatedDate: input.relatedDate,
          relatedSavingId: !!input.relatedSavingId
            ? parseInt(input.relatedSavingId)
            : null,
        })
        .where(eq(expenses.id, input.id));

      const subCategory = await ctx.db.query.expenseSubCategories.findFirst({
        where: (subCategory) =>
          eq(subCategory.id, parseInt(input.expenseSubCategoryId)),
      });

      return { success: true, expenseSubCategory: subCategory };
    }),
});
