import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional().default("Kleero_dev_secret"),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url(),
    ),

    // OAuth Providers (optional but must be provided together)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),

    // Supabase configuration
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_ANON_KEY: z.string().optional(),

    // Banking provider secrets
    SIBS_CLIENT_ID: z.string().optional(),
    SIBS_CLIENT_SECRET: z.string().optional(),
    SIBS_REDIRECT_URI: z.string().optional(),
    SIBS_CERTIFICATE: z.string().optional(),
    SIBS_CERTIFICATE_KEY: z.string().optional(),

    TRUELAYER_CLIENT_ID: z.string().optional(),
    TRUELAYER_CLIENT_SECRET: z.string().optional(),
    TRUELAYER_REDIRECT_URI: z.string().optional(),

    // Stripe configuration
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    // Resend configuration (only required in production for email features)
    RESEND_API_KEY:
      process.env.NODE_ENV === "production"
        ? z.string().min(1, "RESEND_API_KEY is required in production")
        : z.string().optional().default("dev_mock_key"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    // OAuth Providers
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,

    // Supabase configuration
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,

    // Banking provider secrets
    SIBS_CLIENT_ID: process.env.SIBS_CLIENT_ID,
    SIBS_CLIENT_SECRET: process.env.SIBS_CLIENT_SECRET,
    SIBS_REDIRECT_URI: process.env.SIBS_REDIRECT_URI,
    SIBS_CERTIFICATE: process.env.SIBS_CERTIFICATE,
    SIBS_CERTIFICATE_KEY: process.env.SIBS_CERTIFICATE_KEY,

    TRUELAYER_CLIENT_ID: process.env.TRUELAYER_CLIENT_ID,
    TRUELAYER_CLIENT_SECRET: process.env.TRUELAYER_CLIENT_SECRET,
    TRUELAYER_REDIRECT_URI: process.env.TRUELAYER_REDIRECT_URI,

    // Stripe configuration
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    // Resend configuration
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
