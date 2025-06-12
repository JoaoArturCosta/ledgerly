import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { incomes } from "@/server/db/schema";
import { format } from "date-fns";
import { eq } from "drizzle-orm";

export const incomeRouter = createTRPCRouter({
  getAllCategories: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.incomeCategories.findMany();
  }),

  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        incomeCategoryId: z.string().min(1),
        recurring: z.boolean(),
        relatedDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(incomes).values({
        amount: input.amount.toFixed(2),
        incomeCategoryId: parseInt(input.incomeCategoryId),
        isRecurring: input.recurring,
        relatedDate: input.relatedDate,
        createdById: ctx.session.user.id,
      });

      const category = await ctx.db.query.incomeCategories.findFirst({
        where: (category) => eq(category.id, parseInt(input.incomeCategoryId)),
      });

      return { success: true, incomeCategory: category };
    }),

  getIncomesForMonth: protectedProcedure
    .input(
      z.object({
        relatedDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const year = input.relatedDate.getFullYear();
      const month = input.relatedDate.getMonth();

      const incomes = await ctx.db.query.incomes.findMany({
        where: (incomes, { and, eq, or, between }) =>
          or(
            and(
              eq(incomes.createdById, ctx.session.user.id),
              between(
                incomes.relatedDate,
                new Date(year, month, 1),
                new Date(year, month + 1, 0), // Last day of the month
              ),
            ),
            and(
              eq(incomes.createdById, ctx.session.user.id),
              eq(incomes.isRecurring, true),
            ),
          ),
        with: {
          incomeCategory: true,
        },
      });

      return incomes;
    }),

  getIncomesByYear: protectedProcedure
    .input(
      z.object({
        relatedDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const year = input.relatedDate.getFullYear();

      const incomes = await ctx.db.query.incomes.findMany({
        where: (incomes, { and, eq, or, between }) =>
          or(
            and(
              eq(incomes.createdById, ctx.session.user.id),
              between(
                incomes.relatedDate,
                new Date(year, 0, 1),
                new Date(year, 11, 31),
              ),
            ),
            eq(incomes.isRecurring, true),
          ),
        with: {
          incomeCategory: true,
        },
      });

      const incomesByMonth = incomes.reduce(
        (acc, income) => {
          const month = format(income.relatedDate, "MMMM yyyy");
          const amount = parseFloat(income.amount);

          if (income.isRecurring) {
            for (let i = 0; i < 12; i++) {
              const date = new Date(year, i, 1);
              const month = format(date, "MMMM yyyy");
              if (!acc[month]) {
                acc[month] = {
                  [income.incomeCategory.name!]: amount,
                  Total: amount,
                };
              } else if (acc[month]) {
                if (!acc[month]![income.incomeCategory.name!]) {
                  acc[month]![income.incomeCategory.name!] = amount;
                }
                acc[month]!.Total += amount;
              }
            }
            return acc;
          }

          if (!acc[month]) {
            acc[month] = {
              [income.incomeCategory.name!]: amount,
              Total: amount,
            };
          }

          if (acc[month]) {
            if (!acc[month]![income.incomeCategory.name!]) {
              acc[month]![income.incomeCategory.name!] = amount;
            } else {
              acc[month]![income.incomeCategory.name!] += amount;
            }
            acc[month]!.Total += amount;
          }

          return acc;
        },
        {} as Record<string, { Total: number; [key: string]: number }>,
      );

      return incomesByMonth;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(incomes).where(eq(incomes.id, input.id));

      return { success: true };
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().min(1),
        amount: z.number().min(1),
        incomeCategoryId: z.string().min(1),
        recurring: z.boolean(),
        relatedDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(incomes)
        .set({
          amount: input.amount.toFixed(2),
          incomeCategoryId: parseInt(input.incomeCategoryId),
          isRecurring: input.recurring,
          relatedDate: input.relatedDate,
        })
        .where(eq(incomes.id, input.id));

      const category = await ctx.db.query.incomeCategories.findFirst({
        where: (category) => eq(category.id, parseInt(input.incomeCategoryId)),
      });

      return { success: true, incomeCategory: category };
    }),

  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),

  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     await ctx.db.insert(posts).values({
  //       name: input.name,
  //       createdById: ctx.session.user.id,
  //     });
  //   }),

  // getLatest: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.query.posts.findFirst({
  //     orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  //   });
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
