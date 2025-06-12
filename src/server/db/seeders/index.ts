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
import { eq } from "drizzle-orm";

// Define a type for the subcategory used in seeding
interface ExpenseSubCategorySeed {
  name: string;
  iconFaName: string;
  expenseCategoryId: number;
  createdById: string;
}

/**
 * Seeds the database with default categories using smart individual checking
 * This approach is idempotent and handles partial seeding scenarios gracefully
 * @param userId - The user ID to assign as the creator of the categories (defaults to "system")
 */
export async function seedCategories(userId = "system") {
  console.log("🌱 Starting intelligent category seeding...");

  try {
    // Seed Income Categories
    console.log("🔍 Checking income categories...");
    let incomeCategoriesSeeded = 0;

    for (const category of defaultIncomeCategories) {
      const existingCategory = await db.query.incomeCategories.findFirst({
        where: eq(incomeCategories.name, category.name!),
      });

      if (!existingCategory) {
        console.log(`🌱 Seeding missing income category: ${category.name}`);
        await db.insert(incomeCategories).values({
          ...category,
          createdById: userId,
        });
        incomeCategoriesSeeded++;
      } else {
        console.log(`✅ Income category already exists: ${category.name}`);
      }
    }

    if (incomeCategoriesSeeded > 0) {
      console.log(`✅ Seeded ${incomeCategoriesSeeded} new income categories`);
    }

    // Seed Expense Categories
    console.log("🔍 Checking expense categories...");
    let expenseCategoriesSeeded = 0;
    const categoryMapping = new Map<string, number>(); // Track category name to ID mapping

    for (const category of defaultExpenseCategories) {
      const existingCategory = await db.query.expenseCategories.findFirst({
        where: eq(expenseCategories.name, category.name!),
      });

      if (!existingCategory) {
        console.log(`🌱 Seeding missing expense category: ${category.name}`);
        const insertResult = await db
          .insert(expenseCategories)
          .values({
            ...category,
            createdById: userId,
          })
          .returning({
            id: expenseCategories.id,
            name: expenseCategories.name,
          });

        if (insertResult[0]) {
          categoryMapping.set(category.name!, insertResult[0].id);
          expenseCategoriesSeeded++;
        }
      } else {
        console.log(`✅ Expense category already exists: ${category.name}`);
        categoryMapping.set(category.name!, existingCategory.id);
      }
    }

    if (expenseCategoriesSeeded > 0) {
      console.log(
        `✅ Seeded ${expenseCategoriesSeeded} new expense categories`,
      );
    }

    // Seed Expense Subcategories with smart parent ID resolution
    console.log("🔍 Checking expense subcategories...");
    let subcategoriesSeeded = 0;

    // Get all current expense categories to ensure we have complete mapping
    const allExpenseCategories = await db.select().from(expenseCategories);
    const completeMapping = new Map(
      allExpenseCategories.map((cat) => [cat.name!, cat.id]),
    );

    for (const subcat of defaultExpenseSubcategories) {
      // Get parent category name using the array index (subcat.expenseCategoryId - 1)
      const parentCategoryName =
        defaultExpenseCategories[subcat.expenseCategoryId - 1]?.name;

      if (!parentCategoryName) {
        console.warn(
          `⚠️ Invalid parent category index for subcategory: ${subcat.name}`,
        );
        continue;
      }

      const parentId = completeMapping.get(parentCategoryName);
      if (!parentId) {
        console.warn(
          `⚠️ Parent category not found for subcategory: ${subcat.name} (parent: ${parentCategoryName})`,
        );
        continue;
      }

      // Check if subcategory already exists
      const existingSubcategory = await db.query.expenseSubCategories.findFirst(
        {
          where: eq(expenseSubCategories.name, subcat.name),
        },
      );

      if (!existingSubcategory) {
        console.log(
          `🌱 Seeding missing expense subcategory: ${subcat.name} (parent: ${parentCategoryName})`,
        );
        await db.insert(expenseSubCategories).values({
          name: subcat.name,
          iconFaName: subcat.iconFaName,
          expenseCategoryId: parentId,
          createdById: userId,
        });
        subcategoriesSeeded++;
      } else {
        console.log(`✅ Expense subcategory already exists: ${subcat.name}`);
      }
    }

    if (subcategoriesSeeded > 0) {
      console.log(`✅ Seeded ${subcategoriesSeeded} new expense subcategories`);
    }

    // Seed Savings Categories
    console.log("🔍 Checking savings categories...");
    let savingsCategoriesSeeded = 0;

    for (const category of defaultSavingsCategories) {
      const existingCategory = await db.query.savingsCategories.findFirst({
        where: eq(savingsCategories.name, category.name!),
      });

      if (!existingCategory) {
        console.log(`🌱 Seeding missing savings category: ${category.name}`);
        await db.insert(savingsCategories).values({
          ...category,
          createdById: userId,
        });
        savingsCategoriesSeeded++;
      } else {
        console.log(`✅ Savings category already exists: ${category.name}`);
      }
    }

    if (savingsCategoriesSeeded > 0) {
      console.log(
        `✅ Seeded ${savingsCategoriesSeeded} new savings categories`,
      );
    }

    // Summary
    const totalSeeded =
      incomeCategoriesSeeded +
      expenseCategoriesSeeded +
      subcategoriesSeeded +
      savingsCategoriesSeeded;
    if (totalSeeded > 0) {
      console.log(
        `✅ Database seeding complete! Seeded ${totalSeeded} new items total.`,
      );
    } else {
      console.log(
        "✅ Database already fully seeded - no new categories needed.",
      );
    }

    // Validation: Verify all expected categories exist
    await validateSeeding();
  } catch (error) {
    console.error("❌ Error during intelligent category seeding:", error);
    throw error;
  }
}

/**
 * Validates that all expected categories and subcategories exist in the database
 */
async function validateSeeding() {
  console.log("🔍 Validating seeding results...");

  try {
    // Check income categories
    const incomeCount = await db.select().from(incomeCategories);
    const expectedIncomeCount = defaultIncomeCategories.length;

    // Check expense categories
    const expenseCount = await db.select().from(expenseCategories);
    const expectedExpenseCount = defaultExpenseCategories.length;

    // Check expense subcategories
    const subcategoryCount = await db.select().from(expenseSubCategories);
    const expectedSubcategoryCount = defaultExpenseSubcategories.length;

    // Check savings categories
    const savingsCount = await db.select().from(savingsCategories);
    const expectedSavingsCount = defaultSavingsCategories.length;

    console.log(`📊 Validation Results:`);
    console.log(
      `   Income categories: ${incomeCount.length}/${expectedIncomeCount} expected`,
    );
    console.log(
      `   Expense categories: ${expenseCount.length}/${expectedExpenseCount} expected`,
    );
    console.log(
      `   Expense subcategories: ${subcategoryCount.length}/${expectedSubcategoryCount} expected`,
    );
    console.log(
      `   Savings categories: ${savingsCount.length}/${expectedSavingsCount} expected`,
    );

    // Check for any significant discrepancies
    if (expenseCount.length < expectedExpenseCount) {
      console.warn(
        `⚠️ Missing expense categories: expected ${expectedExpenseCount}, found ${expenseCount.length}`,
      );
    }

    if (subcategoryCount.length < expectedSubcategoryCount) {
      console.warn(
        `⚠️ Missing expense subcategories: expected ${expectedSubcategoryCount}, found ${subcategoryCount.length}`,
      );
    }

    console.log("✅ Seeding validation complete.");
  } catch (error) {
    console.error("❌ Error during seeding validation:", error);
    // Don't throw here - validation failure shouldn't break the app
  }
}

/**
 * Seeds the entire database with defaults
 */
export async function seedDatabase(userId = "system") {
  await seedCategories(userId);
  // Add other seeder functions here as needed
}

export default seedDatabase;
