import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { env } from "@/env";
import { db } from "@/server/db";
import { users, subscriptions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const webhookSecret = env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  // Map price IDs to plan names
  const planMapping: Record<string, string> = {
    price_pro: "pro",
    price_premium: "premium",
  };

  const plan = planMapping[priceId!] ?? "free";

  // Update user subscription in database
  await db
    .update(users)
    .set({
      subscriptionPlan: plan,
      subscriptionStatus: subscription.status,
    })
    .where(eq(users.stripeCustomerId, customerId));

  // Upsert subscription record
  const existingSubscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, subscription.id),
  });

  if (existingSubscription) {
    await db
      .update(subscriptions)
      .set({
        plan,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  } else {
    // Get user ID from customer ID
    const user = await db.query.users.findFirst({
      where: eq(users.stripeCustomerId, customerId),
    });

    if (user) {
      await db.insert(subscriptions).values({
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2)}`,
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        plan,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  console.log(
    `✅ Subscription updated for customer ${customerId}: ${plan} (${subscription.status})`,
  );
}

async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;

  // Update user to free plan
  await db
    .update(users)
    .set({
      subscriptionPlan: "free",
      subscriptionStatus: "canceled",
    })
    .where(eq(users.stripeCustomerId, customerId));

  // Update subscription record
  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`🚫 Subscription canceled for customer ${customerId}`);
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (subscriptionId) {
    // Fetch the subscription to get the latest details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await handleSubscriptionUpdate(subscription);
  }

  console.log(`💳 Checkout completed for customer ${customerId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (subscriptionId) {
    // Ensure subscription is active after successful payment
    await db
      .update(users)
      .set({
        subscriptionStatus: "active",
      })
      .where(eq(users.stripeCustomerId, customerId));
  }

  console.log(`💰 Payment succeeded for customer ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Mark subscription as past due
  await db
    .update(users)
    .set({
      subscriptionStatus: "past_due",
    })
    .where(eq(users.stripeCustomerId, customerId));

  console.log(`⚠️ Payment failed for customer ${customerId}`);
}
