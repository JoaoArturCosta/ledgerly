import { savings, savingsWithdrawals } from "@/server/db/schema";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { and, eq } from "drizzle-orm";
import { format, startOfMonth, subMonths } from "date-fns";

export const savingsRouter = createTRPCRouter({
  getAllCategories: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.savingsCategories.findMany();
  }),
  getAllSavings: protectedProcedure.query(async ({ ctx }) => {
    const allSavings = await ctx.db.query.savings.findMany({
      where: (savings, { eq, and }) =>
        and(
          eq(savings.enabled, true),
          eq(savings.createdById, ctx.session.user.id),
        ),
      with: {
        savingsCategory: true,
        savingWithdrawals: true,
        expenses: true,
      },
    });

    const allSavingsWithTotal = Promise.resolve(
      Promise.all(
        allSavings.map(async (saving) => {
          const relatedExpenses = await ctx.db.query.expenses.findMany({
            where: (expense, { and, eq }) =>
              and(
                eq(expense.createdById, ctx.session.user.id),
                eq(expense.relatedSavingId, saving.id),
              ),
          });

          const totalSaved = relatedExpenses.reduce((total, expense) => {
            return total + expense.amount;
          }, 0);

          return {
            ...saving,
            savedAmount:
              (saving.startingAmount ?? 0) +
              totalSaved -
              (saving.withdrawnAmount ?? 0),
          };
        }),
      ),
    );

    return allSavingsWithTotal;
  }),
  getAllSavingsByMonth: protectedProcedure.query(async ({ ctx }) => {
    const currentDate = new Date();

    const savings = await ctx.db.query.savings.findMany({
      where: (saving, { and, eq, notBetween, or }) =>
        or(
          and(
            eq(saving.createdById, ctx.session.user.id),
            notBetween(
              saving.endDate,
              new Date(1900, 1, 1),
              new Date(currentDate.getFullYear(), currentDate.getMonth(), 31),
            ),
          ),
          and(eq(saving.createdById, ctx.session.user.id)),
        ),
      with: {
        expenses: true,
        savingWithdrawals: true,
      },
    });

    const savingsByMonth = savings.reduce(
      (acc, saving) => {
        for (let i = 5; i >= 0; i--) {
          const date = subMonths(startOfMonth(currentDate), i);
          date.setDate(currentDate.getDate() + 1);
          const month = format(date, "MMMM yyyy");

          if (
            Date.parse(saving.createdAt.toString()) >
            Date.parse(date.toString())
          ) {
            continue;
          }

          const depositsForMonth = saving.expenses
            .filter(
              (expense) =>
                expense.relatedDate?.getMonth() === i &&
                expense.relatedDate?.getFullYear() ===
                  currentDate.getFullYear(),
            )
            .reduce((total, expense) => {
              return total + expense.amount;
            }, 0);

          const withdrawalsForMonth = saving.savingWithdrawals
            .filter(
              (withdrawal) =>
                withdrawal.createdAt?.getMonth() === i &&
                withdrawal.createdAt?.getFullYear() ===
                  currentDate.getFullYear(),
            )
            .reduce((total, withdrawal) => {
              return total + withdrawal.amount;
            }, 0);

          if (!acc[month]) {
            acc[month] = {
              [saving.name!]:
                saving.startingAmount! + depositsForMonth - withdrawalsForMonth,
              Total:
                saving.startingAmount! + depositsForMonth - withdrawalsForMonth,
            };
          } else if (acc[month]) {
            if (!acc[month]![saving.name!]) {
              acc[month]![saving.name!] =
                saving.startingAmount! + depositsForMonth - withdrawalsForMonth;
            }

            acc[month]!.Total +=
              saving.startingAmount! + depositsForMonth - withdrawalsForMonth;
          }
        }

        return acc;
      },
      {} as Record<string, { Total: number; [key: string]: number }>,
    );

    return savingsByMonth;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        finalAmount: z.number().min(1),
        startingAmount: z.number().min(0),
        savingsCategoryId: z.string().min(1),
        endDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(savings).values({
        name: input.name,
        finalAmount: input.finalAmount,
        startingAmount: input.startingAmount,
        savingsCategoryId: parseInt(input.savingsCategoryId),
        endDate: input.endDate,
        createdById: ctx.session.user.id,
      });

      const category = await ctx.db.query.savingsCategories.findFirst({
        where: (category) => eq(category.id, parseInt(input.savingsCategoryId)),
      });

      return { success: true, savingsCategory: category };
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(savings)
        .set({ enabled: false })
        .where(eq(savings.id, input.id));

      return { success: true };
    }),

  getSavingsForMonth: protectedProcedure
    .input(
      z.object({
        relatedDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const year = input.relatedDate.getFullYear();
      const month = input.relatedDate.getMonth();

      // First, find the Savings & Investments category by name
      const savingsInvestmentsCategory =
        await ctx.db.query.expenseCategories.findFirst({
          where: (category) => eq(category.name, "Savings & Investments"),
        });

      if (!savingsInvestmentsCategory) {
        return {}; // Return empty object if category doesn't exist
      }

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
              eq(expenses.expenseCategoryId, savingsInvestmentsCategory.id),
            ),
            and(
              eq(expenses.isRecurring, true),
              eq(expenses.expenseCategoryId, savingsInvestmentsCategory.id),
            ),
          ),
        with: {
          saving: true,
        },
      });

      // Get savings categories for grouping expenses
      const savingsCategories = await ctx.db.query.savingsCategories.findMany();

      const savingsByCategory = expenses.reduce(
        (acc, expense) => {
          if (!expense.saving) {
            return acc; // Skip if no related saving
          }

          // Find the category for this saving, default to "Uncategorized" if not found
          const savingCategoryId = expense.saving.savingsCategoryId ?? 0;
          const savingCategory = savingsCategories.find(
            (category) => category.id === savingCategoryId,
          );

          const categoryName = savingCategory?.name ?? "Uncategorized";

          // Initialize if not exists
          if (!acc[categoryName]) {
            acc[categoryName] = 0;
          }

          // Add the expense amount to the category total
          acc[categoryName] += expense.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      return savingsByCategory;
    }),

  createSavingWithdrawal: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        description: z.string().min(0),
        savingId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(savingsWithdrawals).values({
        amount: input.amount,
        description: input.description,
        savingId: parseInt(input.savingId),
        createdById: ctx.session.user.id,
      });

      const relatedSaving = await ctx.db.query.savings.findFirst({
        where: (saving, { and, eq }) =>
          and(
            eq(saving.createdById, ctx.session.user.id),
            eq(saving.id, parseInt(input.savingId)),
          ),
      });

      await ctx.db
        .update(savings)
        .set({
          withdrawnAmount: (relatedSaving?.withdrawnAmount ?? 0) + input.amount,
        })
        .where(and(eq(savings.id, parseInt(input.savingId))));

      return { success: true, savingWithdrawal: input };
    }),

  getSavingsWithdrawalsForYearByMonth: protectedProcedure
    .input(
      z.object({
        relatedDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const year = input.relatedDate.getFullYear();

      const savingsWithdrawals = await ctx.db.query.savingsWithdrawals.findMany(
        {
          where: (withdrawals, { and, eq, between }) =>
            and(
              eq(withdrawals.createdById, ctx.session.user.id),
              between(
                withdrawals.createdAt,
                new Date(year, 0, 1),
                new Date(year, 11, 31),
              ),
            ),

          with: {
            saving: true,
          },
        },
      );

      const savingsWithdrawalsByMonth = savingsWithdrawals.reduce(
        (acc, withdrawal) => {
          const month = format(withdrawal.createdAt, "MMMM yyyy");

          if (!acc[month]) {
            acc[month] = {
              [withdrawal.saving.name!]: withdrawal.amount,
              Total: withdrawal.amount,
            };
          } else if (acc[month]) {
            if (!acc[month]![withdrawal.saving.name!]) {
              acc[month]![withdrawal.saving.name!] = withdrawal.amount;
            }

            acc[month]!.Total += withdrawal.amount;
          }

          return acc;
        },
        {} as Record<string, { Total: number; [key: string]: number }>,
      );

      return savingsWithdrawalsByMonth;
    }),

  getSavingsByCategory: protectedProcedure.query(async ({ ctx }) => {
    const savings = await ctx.db.query.savings.findMany({
      where: (savings, { and, eq, gt, or }) =>
        or(
          and(
            eq(savings.createdById, ctx.session.user.id),
            gt(savings.depositedAmount, 0),
          ),
          and(
            eq(savings.createdById, ctx.session.user.id),
            gt(savings.startingAmount, 0),
          ),
        ),
      with: {
        expenses: true,
        savingWithdrawals: true,
        savingsCategory: true,
      },
    });

    const savingsByCategory = savings.reduce(
      (acc, saving) => {
        const savingsCategoryName = saving.savingsCategory?.name;

        if (!acc[savingsCategoryName!]) {
          acc[savingsCategoryName!] = {
            Total: 0,
            Deposited: 0,
            Withdrawn: 0,
          };
        }
        acc[savingsCategoryName!]!.Total +=
          (saving.startingAmount ?? 0) +
          (saving.depositedAmount ?? 0) -
          (saving.withdrawnAmount ?? 0);
        acc[savingsCategoryName!]!.Deposited += saving.depositedAmount ?? 0;
        acc[savingsCategoryName!]!.Withdrawn += saving.withdrawnAmount ?? 0;

        return acc;
      },
      {} as Record<string, { Total: number; [key: string]: number }>,
    );

    return savingsByCategory;
  }),
});
