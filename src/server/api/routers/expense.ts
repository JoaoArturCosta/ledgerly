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
});
