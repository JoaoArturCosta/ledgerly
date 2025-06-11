import { expenseRouter } from "@/server/api/routers/expense";
import { createTRPCRouter } from "@/server/api/trpc";
import { incomeRouter } from "@/server/api/routers/income";
import { savingsRouter } from "@/server/api/routers/savings";
import { bankingRouter } from "./routers/banking";
import { subscriptionRouter } from "./routers/subscription";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  income: incomeRouter,
  savings: savingsRouter,
  banking: bankingRouter,
  subscription: subscriptionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
