import { expenseRouter } from "./routers/expense";
import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { incomeRouter } from "@/server/api/routers/income";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  expense: expenseRouter,
  income: incomeRouter,
  post: postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
