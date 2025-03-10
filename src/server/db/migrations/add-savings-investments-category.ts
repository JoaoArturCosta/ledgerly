import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { expenseCategories, expenseSubCategories } from "@/server/db/schema";

/**
 * Adds the "Savings & Investments" category if it doesn't exist
 * Also adds a subcategory for it, as the UI only shows categories with subcategories
 *
 * This migration is crucial for the expense form to work with savings
 */
export async function migrateSavingsInvestmentsCategory() {
  console.log("🔄 Checking for Savings & Investments category...");

  // Maximum number of retries
  const MAX_RETRIES = 3;
  let retries = 0;
  let success = false;

  while (!success && retries < MAX_RETRIES) {
    try {
      // Check if the Savings & Investments category already exists
      const existingCategory = await db.query.expenseCategories.findFirst({
        where: (category) => eq(category.name, "Savings & Investments"),
      });

      console.log(
        `📊 [Attempt ${retries + 1}/${MAX_RETRIES}] Existing categories check result:`,
        existingCategory ? "Found" : "Not found",
      );

      let categoryId: number;

      if (existingCategory) {
        console.log(
          "✅ Savings & Investments category already exists with ID:",
          existingCategory.id,
        );
        categoryId = existingCategory.id;
      } else {
        console.log(
          `🆕 [Attempt ${retries + 1}/${MAX_RETRIES}] Adding Savings & Investments category...`,
        );

        // Add the category if it doesn't exist
        const insertResult = await db
          .insert(expenseCategories)
          .values({
            name: "Savings & Investments",
            iconFaName: "piggy-bank",
            createdById: "system", // Using system as the creator since this is a migration
          })
          .returning();

        console.log("📝 Insert result:", insertResult);

        if (!insertResult || insertResult.length === 0) {
          console.error(
            `❌ [Attempt ${retries + 1}/${MAX_RETRIES}] Failed to add category. No ID returned.`,
          );
          retries++;
          continue;
        }

        categoryId = insertResult[0]?.id ?? -1;
        if (categoryId === -1) {
          console.error(
            `❌ [Attempt ${retries + 1}/${MAX_RETRIES}] Invalid category ID returned.`,
          );
          retries++;
          continue;
        }
        console.log(
          "✅ Savings & Investments category added successfully with ID:",
          categoryId,
        );
      }

      // Now check if there's a subcategory for this category
      const existingSubCategory = await db.query.expenseSubCategories.findFirst(
        {
          where: (subCategory) => eq(subCategory.expenseCategoryId, categoryId),
        },
      );

      if (existingSubCategory) {
        console.log(
          "✅ Subcategory already exists for Savings & Investments with ID:",
          existingSubCategory.id,
        );
        success = true;
        return;
      }

      console.log(
        `🆕 [Attempt ${retries + 1}/${MAX_RETRIES}] Adding Savings subcategory...`,
      );

      // Add a subcategory - this is necessary for the category to appear in the UI
      const subCategoryResult = await db
        .insert(expenseSubCategories)
        .values({
          name: "Savings Contribution",
          iconFaName: "piggy-bank",
          expenseCategoryId: categoryId,
          createdById: "system",
        })
        .returning();

      console.log("📝 Subcategory insert result:", subCategoryResult);

      if (!subCategoryResult || subCategoryResult.length === 0) {
        console.error(
          `❌ [Attempt ${retries + 1}/${MAX_RETRIES}] Failed to add subcategory. No ID returned.`,
        );
        retries++;
        continue;
      }

      const subCategoryId = subCategoryResult[0]?.id ?? -1;
      if (subCategoryId === -1) {
        console.error(
          `❌ [Attempt ${retries + 1}/${MAX_RETRIES}] Invalid subcategory ID returned.`,
        );
        retries++;
        continue;
      }

      console.log(
        "✅ Savings subcategory added successfully with ID:",
        subCategoryId,
      );
      success = true;
      return;
    } catch (error) {
      console.error(
        `❌ [Attempt ${retries + 1}/${MAX_RETRIES}] Error migrating Savings & Investments category:`,
        error,
      );
      retries++;

      if (retries < MAX_RETRIES) {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, retries) * 1000;
        console.log(`⏳ Waiting ${waitTime}ms before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }

  if (!success) {
    throw new Error(
      `Failed to add Savings & Investments category after ${MAX_RETRIES} attempts.`,
    );
  }
}
