import { runMigrations } from "@/server/db";

/**
 * This script runs when the application starts up on the server-side
 * It's imported by the root layout.ts file to ensure it runs on application initialization
 */
export async function runStartupTasks() {
  if (typeof window === "undefined") {
    console.log("📋 Running startup tasks...");

    // Run database migrations
    try {
      await runMigrations();
    } catch (error) {
      console.error("❌ Error running startup migrations:", error);
      // Don't throw here to prevent app from crashing
    }

    console.log("✅ Startup tasks completed");
  }
}

// Immediately invoke in the server context
if (typeof window === "undefined") {
  void runStartupTasks();
}
