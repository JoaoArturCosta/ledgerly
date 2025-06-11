import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users, subscriptions, expenses, savings } from "@/server/db/schema";
import { stripe } from "@/lib/stripe";
import {
  PLAN_CONFIG,
  PLAN_LIMITS,
  canUseFeature,
  type SubscriptionPlan,
} from "@/lib/stripe-config";
import { env } from "@/env";

export const subscriptionRouter = createTRPCRouter({
  // Get current subscription info
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      with: {
        subscription: true,
      },
    });

    return {
      plan: (user?.subscriptionPlan ?? "free") as SubscriptionPlan,
      status: user?.subscriptionStatus ?? "active",
      stripeCustomerId: user?.stripeCustomerId,
      limits:
        PLAN_LIMITS[(user?.subscriptionPlan ?? "free") as SubscriptionPlan],
    };
  }),

  // Get usage statistics
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Get transaction count for current month
    const currentMonth = new Date();
    const startOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );

    const [transactionCount, savingsCount] = await Promise.all([
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(expenses)
        .where(eq(expenses.createdById, userId)),
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(savings)
        .where(eq(savings.createdById, userId)),
    ]);

    return {
      transactions: transactionCount[0]?.count ?? 0,
      savingsGoals: savingsCount[0]?.count ?? 0,
      bankConnections: 0, // TODO: Implement when bank connections are ready
    };
  }),

  // Check if user can perform an action
  canUseFeature: protectedProcedure
    .input(
      z.object({
        feature: z.enum([
          "transactions",
          "bankConnections",
          "savingsGoals",
          "historicalData",
          "aiInsights",
        ]),
        increment: z.boolean().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userPlan = (ctx.session.user.subscription.plan ??
        "free") as SubscriptionPlan;

      if (
        input.feature === "historicalData" ||
        input.feature === "aiInsights"
      ) {
        return { canUse: canUseFeature(userPlan, input.feature) };
      }

      // For countable features, check current usage
      const userId = ctx.session.user.id;
      const [transactionCount, savingsCount] = await Promise.all([
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(expenses)
          .where(eq(expenses.createdById, userId)),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(savings)
          .where(eq(savings.createdById, userId)),
      ]);

      const usage = {
        transactions: transactionCount[0]?.count ?? 0,
        savingsGoals: savingsCount[0]?.count ?? 0,
        bankConnections: 0,
      };

      const currentUsage = usage[input.feature as keyof typeof usage] ?? 0;
      const adjustedUsage = input.increment ? currentUsage + 1 : currentUsage;

      return {
        canUse: canUseFeature(userPlan, input.feature, adjustedUsage),
        currentUsage,
        limit: PLAN_LIMITS[userPlan][input.feature],
      };
    }),

  // Create Stripe checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["pro", "premium"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      let customerId = user.stripeCustomerId;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name ?? undefined,
          metadata: {
            userId: user.id,
          },
        });

        customerId = customer.id;

        // Update user with Stripe customer ID
        await ctx.db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, user.id));
      }

      const planConfig = PLAN_CONFIG[input.plan];

      if (!planConfig.priceId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid plan selected",
        });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: planConfig.priceId,
            quantity: 1,
          },
        ],
        success_url: `${env.NEXTAUTH_URL}/dashboard?success=true`,
        cancel_url: `${env.NEXTAUTH_URL}/pricing?canceled=true`,
        metadata: {
          userId: user.id,
          plan: input.plan,
        },
      });

      return {
        checkoutUrl: session.url,
      };
    }),

  // Create customer portal session
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
    });

    if (!user?.stripeCustomerId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No Stripe customer found",
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.NEXTAUTH_URL}/dashboard`,
    });

    return {
      portalUrl: session.url,
    };
  }),
});
