import { db } from "./index";
import { seedDatabase } from "./seeders";
import { count } from "drizzle-orm";
import {
  incomeCategories,
  expenseCategories,
  savingsCategories,
} from "./schema";

let isInitialized = false;

/**
 * Initializes the database, checking if it needs to be seeded
 * This gets called whenever the application starts
 */
export async function initializeDatabase() {
  if (isInitialized) return;
  console.log("🔄 Initializing database...");

  // Check if we need to seed by looking at the categories tables
  const incomeCategoriesCount = await db
    .select({ count: count() })
    .from(incomeCategories);
  const expenseCategoriesCount = await db
    .select({ count: count() })
    .from(expenseCategories);
  const savingsCategoriesCount = await db
    .select({ count: count() })
    .from(savingsCategories);

  const needsSeeding =
    (incomeCategoriesCount[0]?.count ?? 0) === 0 ||
    (expenseCategoriesCount[0]?.count ?? 0) === 0 ||
    (savingsCategoriesCount[0]?.count ?? 0) === 0;

  if (needsSeeding) {
    console.log("🌱 Database needs seeding, running seeder...");
    try {
      // You could get the first user ID here if available,
      // or use "system" as a placeholder that will be used
      // until a real admin user takes ownership
      await seedDatabase();
    } catch (error) {
      console.error("❌ Error seeding database:", error);
    }
  } else {
    console.log("✅ Database already seeded.");
  }

  isInitialized = true;
  console.log("✅ Database initialization complete.");
}

export default initializeDatabase;
