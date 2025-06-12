import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { users, subscriptions } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      with: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let stripeInfo = null;
    if (user.stripeCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
        });

        stripeInfo = {
          customer: customer,
          subscriptions: subscriptions.data,
        };
      } catch (error) {
        console.error("Error fetching Stripe data:", error);
        stripeInfo = { error: "Failed to fetch Stripe data" };
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId,
      },
      subscription: user.subscription,
      stripeInfo,
      sessionData: session.user.subscription,
    });
  } catch (error) {
    console.error("Debug subscription error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, plan, status } = body;

    if (action === "manual_fix") {
      // Manually update user subscription
      await db
        .update(users)
        .set({
          subscriptionPlan: plan || "pro",
          subscriptionStatus: status || "active",
        })
        .where(eq(users.id, session.user.id));

      return NextResponse.json({
        success: true,
        message: "Subscription manually updated",
      });
    }

    if (action === "sync_stripe") {
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
      });

      if (!user?.stripeCustomerId) {
        return NextResponse.json(
          { error: "No Stripe customer ID found" },
          { status: 400 },
        );
      }

      // Fetch latest subscription from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1,
        status: "active",
      });

      if (subscriptions.data.length > 0) {
        const subscription = subscriptions.data[0]!;
        const priceId = subscription.items.data[0]?.price.id;

        const planMapping: Record<string, string> = {
          price_1RYljLFMvCeHJDJsBVpX9hZc: "pro",
          price_1RYljqFMvCeHJDJsmi9BWJAi: "premium",
        };

        const plan = planMapping[priceId!] ?? "free";

        await db
          .update(users)
          .set({
            subscriptionPlan: plan,
            subscriptionStatus: subscription.status,
          })
          .where(eq(users.id, session.user.id));

        return NextResponse.json({
          success: true,
          message: "Synced from Stripe",
          plan,
          status: subscription.status,
        });
      }

      return NextResponse.json({
        success: false,
        message: "No active subscriptions found in Stripe",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Debug subscription POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
