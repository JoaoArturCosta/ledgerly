import Stripe from "stripe";
import { env } from "@/env";

// Re-export client-safe configuration
export * from "./stripe-config";

// Server-side Stripe instance - only for server use
export const stripe = new Stripe(
  env.STRIPE_SECRET_KEY ?? "sk_test_fake_key_for_development",
  {
    apiVersion: "2023-10-16",
    typescript: true,
  },
);

// Plan configuration
export const PLAN_LIMITS = {
  free: {
    transactions: 50,
    bankConnections: 0,
    savingsGoals: 3,
    historicalData: false,
    aiInsights: false,
  },
  pro: {
    transactions: -1, // unlimited
    bankConnections: 2,
    savingsGoals: -1,
    historicalData: true,
    aiInsights: false,
  },
  premium: {
    transactions: -1,
    bankConnections: -1,
    savingsGoals: -1,
    historicalData: true,
    aiInsights: true,
  },
} as const;

export type SubscriptionPlan = keyof typeof PLAN_LIMITS;

// Plan pricing configuration
export const PLAN_CONFIG = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    description: "Perfect for getting started",
    features: [
      "50 transactions per month",
      "3 savings goals",
      "Basic expense tracking",
      "Current month analytics",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: 6.99,
    priceId: "price_1RYljLFMvCeHJDJsBVpX9hZc", // Replace with actual Stripe price ID
    description: "For serious money management",
    features: [
      "Unlimited transactions",
      "Unlimited savings goals",
      "2 bank account connections",
      "Annual analytics and trends",
      "Data export",
      "Priority support",
    ],
  },
  premium: {
    name: "Premium",
    price: 12.99,
    priceId: "price_1RYljqFMvCeHJDJsmi9BWJAi", // Replace with actual Stripe price ID
    description: "Advanced insights and automation",
    features: [
      "Everything in Pro",
      "Unlimited bank connections",
      "AI insights and recommendations",
      "Advanced forecasting",
      "API access",
      "Phone support",
    ],
  },
} as const;

// Helper functions
export function hasAccess(
  userPlan: SubscriptionPlan,
  requiredPlan: SubscriptionPlan,
): boolean {
  const planHierarchy = { free: 0, pro: 1, premium: 2 };
  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
}

export function canUseFeature(
  userPlan: SubscriptionPlan,
  feature: keyof typeof PLAN_LIMITS.free,
  currentUsage = 0,
): boolean {
  const limit = PLAN_LIMITS[userPlan][feature];

  if (typeof limit === "boolean") {
    return limit;
  }

  if (limit === -1) {
    return true; // unlimited
  }

  return currentUsage < limit;
}
