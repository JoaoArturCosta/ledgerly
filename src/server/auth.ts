import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/env";
import { db } from "@/server/db";
import { pgTable, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/lib/stripe-config";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      subscription: {
        plan: SubscriptionPlan;
        status: string;
        stripeCustomerId?: string;
        limits: typeof PLAN_LIMITS.free;
      };
    } & DefaultSession["user"];
  }

  interface User {
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    stripeCustomerId?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      // Get user subscription data from database
      const userWithSubscription = await db.query.users.findFirst({
        where: eq(users.id, user.id),
      });

      const plan = (userWithSubscription?.subscriptionPlan ??
        "free") as SubscriptionPlan;
      const status = userWithSubscription?.subscriptionStatus ?? "active";

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          subscription: {
            plan,
            status,
            stripeCustomerId: userWithSubscription?.stripeCustomerId,
            limits: PLAN_LIMITS[plan],
          },
        },
      };
    },
  },
  adapter: DrizzleAdapter(db, pgTable) as Adapter,
  providers: [
    // Only add Google provider if credentials are available
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Only add Discord provider if credentials are available
    ...(env.DISCORD_CLIENT_ID && env.DISCORD_CLIENT_SECRET
      ? [
          DiscordProvider({
            clientId: env.DISCORD_CLIENT_ID,
            clientSecret: env.DISCORD_CLIENT_SECRET,
          }),
        ]
      : []),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/auth/signin",
    // signOut: "/auth/signout",
    // error: "/auth/error",
    // verifyRequest: "/auth/verify-request",
    // newUser: "/auth/new-user",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
