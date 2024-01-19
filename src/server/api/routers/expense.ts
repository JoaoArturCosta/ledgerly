import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { expenses } from "@/server/db/schema";

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

  getExpensesByMonth: protectedProcedure
    .input(
      z.object({
        relatedDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const expenses = await ctx.db.query.expenses.findMany({
        where: (expenses, { and, eq, or }) =>
          or(
            and(
              eq(expenses.createdById, ctx.session.user.id),
              eq(expenses.relatedDate, input.relatedDate),
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
});
