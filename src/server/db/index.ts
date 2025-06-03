import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import fs from "fs";
import path from "path";

import { env } from "@/env";
import * as schema from "./schema";

// Create PostgreSQL connections - one for migrations (no transaction) and one for normal operations
const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

// Export Supabase client for additional functionality
export const supabase = createClient(
  env.SUPABASE_URL || "",
  env.SUPABASE_ANON_KEY || "",
);

// Import migrations here to avoid circular dependencies
import { migrateSavingsInvestmentsCategory } from "./migrations/add-savings-investments-category";

// Flag to track if migrations have been run to avoid duplicate execution
let migrationsRun = false;

// Function to check if a table exists
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const result = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = ${tableName}
      );
    `;
    return result[0]?.exists || false;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

// Function to generate and execute schema creation SQL from schema.ts
async function createSchemaFromDefinitions() {
  console.log("🏗️ Creating schema tables from definitions...");
  try {
    // Create tables using raw SQL from current schema
    const migrationDb = drizzle(migrationClient);

    // Create essential tables directly
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS "ledgerly_user" (
        "id" VARCHAR(255) NOT NULL PRIMARY KEY,
        "name" VARCHAR(255),
        "email" VARCHAR(255) NOT NULL,
        "emailVerified" TIMESTAMP,
        "image" VARCHAR(255)
      );
      
      CREATE TABLE IF NOT EXISTS "ledgerly_expense" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(256),
        "amount" INTEGER NOT NULL,
        "description" TEXT,
        "expenseCategoryId" INTEGER NOT NULL,
        "expenseSubCategoryId" INTEGER NOT NULL,
        "isRecurring" BOOLEAN NOT NULL,
        "endDate" TIMESTAMP,
        "relatedSavingId" INTEGER,
        "relatedDate" TIMESTAMP,
        "createdById" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await migrationDb.execute(sql.raw(createTablesSQL));
    console.log("✅ Schema tables created successfully");
    return true;
  } catch (error) {
    console.error("❌ Error creating schema tables:", error);
    return false;
  }
}

// Function to execute a raw SQL file migration
async function executeSqlMigration(filePath: string): Promise<boolean> {
  console.log(`📄 Running SQL migration: ${path.basename(filePath)}`);
  try {
    let sql = fs.readFileSync(filePath, "utf8");

    // Execute the SQL as a single statement
    await migrationClient.unsafe(sql);
    console.log(`✅ Completed SQL migration: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Error executing SQL migration ${path.basename(filePath)}:`,
      error,
    );

    // Check which tables already exist
    try {
      const tables = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      console.log(
        "📋 Existing tables:",
        tables.map((t) => t.table_name).join(", "),
      );
    } catch (err) {
      console.error("❌ Could not retrieve table list:", err);
    }

    return false;
  }
}

// Function to run SQL migrations from files
async function runSqlMigrations() {
  console.log("🔄 Running SQL migrations...");

  try {
    // First check if any base tables exist
    const userTableExists = await tableExists("ledgerly_user");

    // If base tables don't exist, initialize the database schema from definitions
    if (!userTableExists) {
      console.log("🔄 No base tables found, initializing schema...");
      const success = await createSchemaFromDefinitions();

      if (!success) {
        throw new Error("Failed to create base schema tables");
      }
    }

    // Get SQL migration files
    const migrationsDir = path.join(
      process.cwd(),
      "src",
      "server",
      "db",
      "migrations",
    );
    const sqlFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort(); // Ensure migrations run in alphabetical order

    // Run each SQL migration file
    for (const file of sqlFiles) {
      const filePath = path.join(migrationsDir, file);
      const success = await executeSqlMigration(filePath);

      if (!success) {
        console.warn(
          `⚠️ SQL migration ${file} failed, continuing with next migration`,
        );
      }
    }

    console.log("✅ All SQL migrations completed.");
  } catch (error) {
    console.error("❌ Error running SQL migrations:", error);
    throw error; // Re-throw to be caught by the parent
  }
}

// Function to run migrations
export async function runMigrations() {
  // Prevent running migrations multiple times
  if (migrationsRun) {
    console.log("⏭️ Migrations already run, skipping...");
    return;
  }

  console.log("🚀 Running database migrations...");

  try {
    // First run SQL migrations
    await runSqlMigrations();

    // Then run TypeScript migrations
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
