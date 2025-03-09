import { db } from "../index";
import {
  defaultIncomeCategories,
  defaultExpenseCategories,
  defaultExpenseSubcategories,
  defaultSavingsCategories,
} from "./categories";
import {
  IncomeCategory,
  ExpenseCategory,
  ExpenseSubCategory,
  SavingsCategory,
  incomeCategories,
  expenseCategories,
  expenseSubCategories,
  savingsCategories,
} from "../schema";
import { count, eq } from "drizzle-orm";

// Define a type for the subcategory used in seeding
interface ExpenseSubCategorySeed {
  name: string;
  iconFaName: string;
  expenseCategoryId: number;
  createdById: string;
}

/**
 * Seeds the database with default categories
 * @param userId - The user ID to assign as the creator of the categories (defaults to "system")
 */
export async function seedCategories(userId = "system") {
  console.log("🌱 Checking if database needs seeding...");

  // Replace "system" with the actual userId in the default data
  const updateIncomeCategories = (
    categories: Omit<IncomeCategory, "id" | "createdAt" | "updatedAt">[],
  ) => {
    return categories.map((category) => ({
      ...category,
      createdById: userId,
    }));
  };

  const updateExpenseCategories = (
    categories: Omit<ExpenseCategory, "id" | "createdAt" | "updatedAt">[],
  ) => {
    return categories.map((category) => ({
      ...category,
      createdById: userId,
    }));
  };

  const updateSavingsCategories = (
    categories: Omit<SavingsCategory, "id" | "createdAt" | "updatedAt">[],
  ) => {
    return categories.map((category) => ({
      ...category,
      createdById: userId,
    }));
  };

  // Check and seed income categories
  const incomeCategoriesCount = await db
    .select({ count: count() })
    .from(incomeCategories);
  if (incomeCategoriesCount[0]?.count === 0) {
    console.log("🌱 Seeding income categories...");
    await db
      .insert(incomeCategories)
      .values(updateIncomeCategories(defaultIncomeCategories));
  }

  // Check and seed expense categories
  const expenseCategoriesCount = await db
    .select({ count: count() })
    .from(expenseCategories);
  if (expenseCategoriesCount[0]?.count === 0) {
    console.log("🌱 Seeding expense categories...");
    await db
      .insert(expenseCategories)
      .values(updateExpenseCategories(defaultExpenseCategories));

    // After inserting expense categories, we need to get their IDs to update the subcategories
    if (defaultExpenseSubcategories.length > 0) {
      console.log("🌱 Seeding expense subcategories...");

      // Get all inserted expense categories to map names to IDs
      const insertedCategories = await db.select().from(expenseCategories);
      const categoryNameToId = new Map(
        insertedCategories.map((cat) => [cat.name, cat.id] as [string, number]),
      );

      // Group subcategories by parent category name
      const subcategoriesByParentId: Record<number, ExpenseSubCategorySeed[]> =
        {};

      defaultExpenseSubcategories.forEach((subcat) => {
        // Using the subcategory's expenseCategoryId as an index into the defaultExpenseCategories array
        const parentCategoryName =
          defaultExpenseCategories[subcat.expenseCategoryId - 1]?.name;
        if (parentCategoryName && categoryNameToId.has(parentCategoryName)) {
          const parentId = categoryNameToId.get(parentCategoryName);
          if (parentId) {
            if (!subcategoriesByParentId[parentId]) {
              subcategoriesByParentId[parentId] = [];
            }

            subcategoriesByParentId[parentId].push({
              name: subcat.name,
              iconFaName: subcat.iconFaName,
              expenseCategoryId: parentId,
              createdById: userId,
            });
          }
        }
      });

      // Insert subcategories for each parent category
      for (const [parentId, subcats] of Object.entries(
        subcategoriesByParentId,
      )) {
        await db.insert(expenseSubCategories).values(subcats);
      }
    }
  }

  // Check and seed savings categories
  const savingsCategoriesCount = await db
    .select({ count: count() })
    .from(savingsCategories);
  if (savingsCategoriesCount[0]?.count === 0) {
    console.log("🌱 Seeding savings categories...");
    await db
      .insert(savingsCategories)
      .values(updateSavingsCategories(defaultSavingsCategories));
  }

  console.log("✅ Database seeding complete!");
}

/**
 * Seeds the entire database with defaults
 */
export async function seedDatabase(userId = "system") {
  await seedCategories(userId);
  // Add other seeder functions here as needed
}

export default seedDatabase;
