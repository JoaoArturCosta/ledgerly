import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { expenses } from "@/server/db/schema";
import { format } from "date-fns";
import { eq } from "drizzle-orm";

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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(expenses).values({
        amount: input.amount,
        description: input.description,
        expenseCategoryId: parseInt(input.expenseCategoryId),
        expenseSubCategoryId: parseInt(input.expenseSubCategoryId),
        isRecurring: input.recurring,
        relatedDate: input.relatedDate,
        createdById: ctx.session.user.id,
      });

      return { success: true };
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
          const amount = expense.amount;

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
});
