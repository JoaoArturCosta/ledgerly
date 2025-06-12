import { db } from "./index";
import { seedDatabase } from "./seeders";

let isInitialized = false;

/**
 * Initializes the database with smart seeding
 * This gets called whenever the application starts
 */
export async function initializeDatabase() {
  if (isInitialized) return;
  console.log("🔄 Initializing database...");

  try {
    // Always run the smart seeding function - it will check individual categories
    // and only seed what's missing, making it safe to run multiple times
    console.log("🌱 Running smart database seeding...");
    await seedDatabase();
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
    // Don't throw here to prevent app from crashing
  }

  isInitialized = true;
  console.log("✅ Database initialization complete.");
}

export default initializeDatabase;
