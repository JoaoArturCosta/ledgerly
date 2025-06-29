import { savings, savingsWithdrawals } from "@/server/db/schema";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { and, eq } from "drizzle-orm";
import { format, startOfMonth, subMonths } from "date-fns";
import { TRPCError } from "@trpc/server";

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
            return total + parseFloat(expense.amount);
          }, 0);

          return {
            ...saving,
            savedAmount: (
              parseFloat(saving.startingAmount ?? "0") +
              totalSaved -
              parseFloat(saving.withdrawnAmount ?? "0")
            ).toString(),
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

          // For now, we'll collect all savings from all months up to the current one
          // in order to show a proper cumulative chart
          let cumulativeDepositsToDate = 0;
          let cumulativeWithdrawalsToDate = 0;

          // Calculate all deposits made up to this month point
          saving.expenses.forEach((expense) => {
            if (expense.relatedDate && expense.relatedDate <= date) {
              cumulativeDepositsToDate += parseFloat(expense.amount);
            }
          });

          // Calculate all withdrawals made up to this month point
          saving.savingWithdrawals.forEach((withdrawal) => {
            if (withdrawal.createdAt && withdrawal.createdAt <= date) {
              cumulativeWithdrawalsToDate += parseFloat(withdrawal.amount);
            }
          });

          const depositsForMonth = saving.expenses
            .filter((expense) => {
              // Calculate month offset - for i=5 (oldest), we want current month - 5
              // For i=0 (current), we want current month - 0
              const targetMonthIndex = (currentDate.getMonth() + 12 - i) % 12; // Ensure it wraps around properly

              const matchesMonth =
                expense.relatedDate?.getMonth() === targetMonthIndex;
              const matchesYear =
                expense.relatedDate?.getFullYear() ===
                (targetMonthIndex > currentDate.getMonth()
                  ? currentDate.getFullYear() - 1
                  : currentDate.getFullYear());

              return matchesMonth && matchesYear;
            })
            .reduce((total, expense) => {
              return total + parseFloat(expense.amount);
            }, 0);

          const withdrawalsForMonth = saving.savingWithdrawals
            .filter((withdrawal) => {
              // Calculate month offset - for i=5 (oldest), we want current month - 5
              // For i=0 (current), we want current month - 0
              const targetMonthIndex = (currentDate.getMonth() + 12 - i) % 12; // Ensure it wraps around properly

              const matchesMonth =
                withdrawal.createdAt?.getMonth() === targetMonthIndex;
              const matchesYear =
                withdrawal.createdAt?.getFullYear() ===
                (targetMonthIndex > currentDate.getMonth()
                  ? currentDate.getFullYear() - 1
                  : currentDate.getFullYear());

              return matchesMonth && matchesYear;
            })
            .reduce((total, withdrawal) => {
              return total + parseFloat(withdrawal.amount);
            }, 0);

          if (!acc[month]) {
            const newMonthValue = {
              [saving.name!]:
                parseFloat(saving.startingAmount!) +
                depositsForMonth -
                withdrawalsForMonth,
              Total:
                parseFloat(saving.startingAmount!) +
                depositsForMonth -
                withdrawalsForMonth,
            };

            acc[month] = newMonthValue;
          } else if (acc[month]) {
            if (!acc[month]![saving.name!]) {
              const savingValue =
                parseFloat(saving.startingAmount!) +
                depositsForMonth -
                withdrawalsForMonth;

              acc[month]![saving.name!] = savingValue;
            }

            const addToTotal =
              parseFloat(saving.startingAmount!) +
              depositsForMonth -
              withdrawalsForMonth;
            console.log(`  Adding to Total for ${month}: $${addToTotal}`);
            acc[month]!.Total += addToTotal;
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
        finalAmount: z.number().min(0.01).optional(),
        startingAmount: z.number().min(0),
        savingsCategoryId: z.string().min(1),
        endDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch category to determine requirements
      const category = await ctx.db.query.savingsCategories.findFirst({
        where: (category) => eq(category.id, parseInt(input.savingsCategoryId)),
      });

      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Savings category not found",
        });
      }

      // Validate required fields based on category
      if (category.requiresAmount) {
        if (!input.finalAmount || input.finalAmount <= 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Final amount is required for this savings category",
          });
        }
        if (!input.endDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "End date is required for this savings category",
          });
        }
      }

      await ctx.db.insert(savings).values({
        name: input.name,
        finalAmount: input.finalAmount?.toString() ?? null,
        startingAmount: input.startingAmount.toString(),
        savingsCategoryId: parseInt(input.savingsCategoryId),
        endDate: input.endDate ?? null,
        createdById: ctx.session.user.id,
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
          and(
            eq(expenses.createdById, ctx.session.user.id),
            eq(expenses.expenseCategoryId, savingsInvestmentsCategory.id),
            or(
              and(
                between(
                  expenses.relatedDate,
                  new Date(year, month, 1),
                  new Date(year, month, 31),
                ),
                eq(expenses.isRecurring, false),
              ),
              eq(expenses.isRecurring, true),
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
          acc[categoryName] += parseFloat(expense.amount);
          return acc;
        },
        {} as Record<string, number>,
      );

      return savingsByCategory;
    }),

  createSavingWithdrawal: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0.01),
        description: z.string().min(0),
        savingId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(savingsWithdrawals).values({
        amount: input.amount.toString(),
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
          withdrawnAmount: (
            parseFloat(relatedSaving?.withdrawnAmount ?? "0") + input.amount
          ).toString(),
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
              [withdrawal.saving.name!]: parseFloat(withdrawal.amount),
              Total: parseFloat(withdrawal.amount),
            };
          } else if (acc[month]) {
            if (!acc[month]![withdrawal.saving.name!]) {
              acc[month]![withdrawal.saving.name!] = parseFloat(
                withdrawal.amount,
              );
            }

            acc[month]!.Total += parseFloat(withdrawal.amount);
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
            gt(savings.depositedAmount, "0"),
          ),
          and(
            eq(savings.createdById, ctx.session.user.id),
            gt(savings.startingAmount, "0"),
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

        const category = acc[savingsCategoryName!]!;
        category.Total +=
          parseFloat(saving.startingAmount ?? "0") +
          parseFloat(saving.depositedAmount ?? "0") -
          parseFloat(saving.withdrawnAmount?.toString() ?? "0");
        category.Deposited += parseFloat(saving.depositedAmount ?? "0");
        category.Withdrawn += parseFloat(
          saving.withdrawnAmount?.toString() ?? "0",
        );

        return acc;
      },
      {} as Record<
        string,
        { Total: number; Deposited: number; Withdrawn: number }
      >,
    );

    return savingsByCategory;
  }),
});
