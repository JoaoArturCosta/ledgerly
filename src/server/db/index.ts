import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";
import * as schema from "./schema";

// Create PostgreSQL connection
const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

// Export Supabase client for additional functionality
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Import migrations here to avoid circular dependencies
import { migrateSavingsInvestmentsCategory } from "./migrations/add-savings-investments-category";

// Flag to track if migrations have been run to avoid duplicate execution
let migrationsRun = false;

// Function to run migrations
export async function runMigrations() {
  // Prevent running migrations multiple times
  if (migrationsRun) {
    console.log("⏭️ Migrations already run, skipping...");
    return;
  }

  console.log("🚀 Running database migrations...");

  try {
    // Run all migrations in sequence
    await migrateSavingsInvestmentsCategory();

    console.log("✅ All migrations completed successfully.");
    migrationsRun = true;
  } catch (error) {
    console.error("❌ Error running migrations:", error);
    // Don't throw the error here to prevent app startup failure
  }
}

// Run migrations on startup - but only on server side
if (typeof window === "undefined") {
  console.log("⏳ Scheduling migrations to run...");

  // Run migrations immediately for more reliable execution
  void runMigrations();

  // Also use a timeout as a fallback to ensure DB connection is ready if needed
  setTimeout(() => {
    if (!migrationsRun) {
      console.log("🔄 Retrying migrations with timeout...");
      void runMigrations();
    }
  }, 3000);
}
