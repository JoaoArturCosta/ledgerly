import { savings } from "@/server/db/schema";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { format } from "date-fns";

export const savingsRouter = createTRPCRouter({
  getAllCategories: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.savingsCategories.findMany();
  }),
  getAllSavings: protectedProcedure.query(async ({ ctx }) => {
    const allSavings = await ctx.db.query.savings.findMany({
      where: (savings, { eq }) => eq(savings.createdById, ctx.session.user.id),
      with: {
        savingsCategory: true,
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
            savedAmount: totalSaved,
          };
        }),
      ),
    );

    return allSavingsWithTotal;
  }),
  getAllSavingsByMonth: protectedProcedure.query(async ({ ctx }) => {
    const currentDate = new Date();

    const savings = await ctx.db.query.expenses.findMany({
      where: (expenses, { and, eq, or, notBetween }) =>
        or(
          and(
            eq(expenses.createdById, ctx.session.user.id),
            eq(expenses.expenseCategoryId, 18),
          ),
          and(
            eq(expenses.isRecurring, true),
            eq(expenses.expenseCategoryId, 18),
            notBetween(
              expenses.endDate,
              new Date(1900, 1, 1),
              new Date(currentDate.getFullYear(), currentDate.getMonth(), 31),
            ),
          ),
        ),
      with: {
        saving: true,
      },
    });

    const expensesByMonth = savings.reduce(
      (acc, expense) => {
        const month = format(expense.relatedDate!, "MMMM");
        const year = expense.relatedDate!.getFullYear();
        const amount = expense.amount;

        if (expense.isRecurring) {
          for (let i = 0; i < 12; i++) {
            const date = new Date(year, i, 1);
            const month = format(date, "MMMM");
            if (!acc[month]) {
              acc[month] = {
                [expense.saving!.name!]: amount,
                Total: amount,
              };
            } else if (acc[month]) {
              if (!acc[month]![expense.saving!.name!]) {
                acc[month]![expense.saving!.name!] = amount;
              }
              acc[month]!.Total += amount;
            }
          }
          return acc;
        }

        if (!acc[month]) {
          acc[month] = {
            [expense.saving!.name!]: amount,
            Total: amount,
          };
        }

        if (acc[month]) {
          if (!acc[month]![expense.saving!.name!]) {
            acc[month]![expense.saving!.name!] = amount;
          } else {
            acc[month]![expense.saving!.name!] += amount;
          }
          acc[month]!.Total += amount;
        }

        return acc;
      },
      {} as Record<string, { Total: number; [key: string]: number }>,
    );

    return expensesByMonth;

    // const savingsCategory = await ctx.db.query.savingsCategories.findMany();

    // const savingsByCategory = savings.reduce(
    //   (acc, expense) => {
    //     const savingsCategoryName = savingsCategory.find(
    //       (category) => category.id === expense.saving?.savingsCategoryId,
    //     )?.name;

    //     if (!acc[savingsCategoryName!]) {
    //       acc[savingsCategoryName!] = 0;
    //     }
    //     acc[savingsCategoryName!] += expense.amount;
    //     return acc;
    //   },
    //   {} as Record<string, { Total: number; [key: string]: number }>,
    // );

    // return savingsByCategory;
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
  getSavingsForMonth: protectedProcedure
    .input(
      z.object({
        relatedDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const year = input.relatedDate.getFullYear();
      const month = input.relatedDate.getMonth();

      const savings = await ctx.db.query.expenses.findMany({
        where: (expenses, { and, eq, or, between }) =>
          or(
            and(
              eq(expenses.createdById, ctx.session.user.id),
              between(
                expenses.relatedDate,
                new Date(year, month, 1),
                new Date(year, month, 31),
              ),
              eq(expenses.expenseCategoryId, 18),
            ),
            and(
              eq(expenses.isRecurring, true),
              eq(expenses.expenseCategoryId, 18),
            ),
          ),
        with: {
          saving: true,
        },
      });

      const savingsCategory = await ctx.db.query.savingsCategories.findMany();

      const savingsByCategory = savings.reduce(
        (acc, expense) => {
          const savingsCategoryName = savingsCategory.find(
            (category) => category.id === expense.saving?.savingsCategoryId,
          )?.name;

          if (!acc[savingsCategoryName!]) {
            acc[savingsCategoryName!] = 0;
          }
          acc[savingsCategoryName!] += expense.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

      return savingsByCategory;
    }),
});
