/**
 * NextAuth.js Authentication Configuration
 *
 * ARCHITECTURE OVERVIEW:
 * - Uses NextAuth v4.24.7 with Drizzle ORM adapter
 * - JWT strategy for credentials provider (email/password)
 * - Database adapter for OAuth providers (Google, Discord)
 * - Custom table mapping to handle 'kleero_' prefixed table names
 *
 * AUTHENTICATION FLOWS:
 * 1. Email/Password: Uses JWT tokens, no database sessions
 * 2. OAuth (Google/Discord): Uses database sessions with account linking
 *
 * TABLE MAPPING FIX:
 * - Database tables have 'kleero_' prefix (kleero_users, kleero_accounts, etc.)
 * - DrizzleAdapter expects base names (users, accounts, etc.)
 * - Custom table function maps NextAuth table names to actual Drizzle schema
 *
 * SESSION STRATEGY:
 * - JWT for credentials provider (faster, no DB queries)
 * - Database sessions for OAuth providers (required for account linking)
 */

import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
  type User,
  type Session,
} from "next-auth";
import { type JWT } from "next-auth/jwt";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  verificationTokens,
  users,
  accounts,
  sessions,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/lib/stripe-config";
import bcrypt from "bcrypt";
import { env } from "@/env";
import { db } from "@/server/db";
import { Resend } from "resend";

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
  session: {
    strategy: "jwt", // Use JWT for credentials provider
  },
  callbacks: {
    redirect: async ({ url, baseUrl }: { url: string; baseUrl: string }) => {
      // Handle successful signin redirect
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Handle callback URLs that contain error=Callback
      if (url.includes("error=Callback")) {
        return `${baseUrl}/dashboard`;
      }
      // Allow same origin URLs
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    jwt: async ({ token, user }: { token: JWT; user?: User }) => {
      // Persist user data to the token right after signin
      if (user?.id) {
        token.id = user.id;
        // Get user subscription data from database
        const userWithSubscription = await db.query.users.findFirst({
          where: eq(users.id, user.id),
        });
        token.subscriptionPlan =
          userWithSubscription?.subscriptionPlan ?? "free";
        token.subscriptionStatus =
          userWithSubscription?.subscriptionStatus ?? "active";
        token.stripeCustomerId = userWithSubscription?.stripeCustomerId;
      }
      return token;
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      // Send properties to the client
      const plan = (token.subscriptionPlan ?? "free") as SubscriptionPlan;

      return {
        ...session,
        user: {
          ...session.user,
          id: (token.id as string) ?? "",
          subscription: {
            plan,
            status: (token.subscriptionStatus as string) ?? "active",
            stripeCustomerId: (token.stripeCustomerId as string) ?? "",
            limits: PLAN_LIMITS[plan],
          },
        },
      };
    },
  },
  // @ts-expect-error - Temporary workaround for table mapping in v0.3.6
  adapter: DrizzleAdapter(db, (table: string) => {
    switch (table) {
      case "user":
        return users;
      case "account":
        return accounts;
      case "session":
        return sessions;
      case "verificationToken":
        return verificationTokens;
      default:
        throw new Error(`Table ${table} not found`);
    }
  }),
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

    // Credentials provider for email/password
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        const email = (credentials.email as string).toLowerCase();
        const password = credentials.password as string;

        // Rate limiting
        const now = Date.now();
        const rl = rateLimitMap.get(email) ?? { count: 0, lastAttempt: 0 };
        if (
          now - rl.lastAttempt < RATE_LIMIT_WINDOW &&
          rl.count >= RATE_LIMIT_MAX
        ) {
          throw new Error("Too many attempts. Please try again later.");
        }
        if (now - rl.lastAttempt > RATE_LIMIT_WINDOW) {
          rl.count = 0;
        }
        rl.count++;
        rl.lastAttempt = now;
        rateLimitMap.set(email, rl);

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (user) {
          // User exists: check password
          if (!user.password) {
            throw new Error("Account does not support password login.");
          }
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            throw new Error("Invalid email or password.");
          }
          // Check email verification
          if (!user.emailVerified) {
            // Resend verification email
            const token = generateToken();
            const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
            // Delete existing token and insert new one
            await db
              .delete(verificationTokens)
              .where(eq(verificationTokens.identifier, email));
            await db
              .insert(verificationTokens)
              .values({ identifier: email, token, expires });
            try {
              await sendVerificationEmail(email, token);
            } catch (emailError) {
              console.error("Failed to send verification email:", emailError);
              // Still throw the original error to inform user
            }
            throw new Error("Email not verified. Verification email resent.");
          }
          // Success
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } else {
          // Register new user
          const hashed = await bcrypt.hash(password, 10);
          const name = email.split("@")[0];
          // Insert user
          await db
            .insert(users)
            .values({
              id: crypto.randomUUID(),
              email,
              password: hashed,
              name,
              emailVerified: null,
            })
            .returning();
          // Generate and store verification token
          const token = generateToken();
          const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
          await db.insert(verificationTokens).values({
            identifier: email,
            token,
            expires,
          });
          try {
            await sendVerificationEmail(email, token);
          } catch (emailError) {
            console.error(
              "Failed to send verification email for new user:",
              emailError,
            );
            // Still throw the original error to inform user
          }
          throw new Error(
            "Account created. Please verify your email. Verification email sent.",
          );
        }
      },
    }),

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
export const getServerAuthSession = async (): Promise<Session | null> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return (await getServerSession(authOptions)) as Session | null;
};

// Helper to send verification email
async function sendVerificationEmail(email: string, token: string) {
  try {
    // Check if RESEND_API_KEY is available
    if (!env.RESEND_API_KEY) {
      throw new Error("Email service not configured");
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const verifyUrl = `${env.NEXTAUTH_URL}/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

    const result = await resend.emails.send({
      from: "no-reply@kleeru.app", // Use your verified sender
      to: email,
      subject: "Verify your email for Kleeru",
      html: `<p>Click the link below to verify your email address:</p><p><a href='${verifyUrl}'>Verify Email</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });

    return result;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw error;
  }
}

// In-memory rate limiter
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;

// Helper to generate a random token
function generateToken(length = 32) {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * 36).toString(36),
  ).join("");
}
