import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { savings } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const savingsRouter = createTRPCRouter({
  getAllCategories: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.savingsCategories.findMany();
  }),
  getAllSavings: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.savings.findMany({
      where: (savings, { eq }) => eq(savings.createdById, ctx.session.user.id),
      with: {
        savingsCategory: true,
      },
    });
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
      console.log(input);
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
});
