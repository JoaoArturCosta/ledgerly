import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { expenseCategories } from "@/server/db/schema";
import { Transaction } from "./types";

/**
 * Categorize a bank transaction based on its details
 *
 * @param transaction The transaction to categorize
 * @returns Category ID
 */
export async function categorizeTransaction(
  transaction: Transaction,
): Promise<string> {
  // Get all available expense categories
  const categories = await db.query.expenseCategories.findMany();

  // First check if the merchant name or description match any category keywords
  const matchedCategory = await matchTransactionToCategory(
    transaction,
    categories,
  );

  if (matchedCategory) {
    return matchedCategory;
  }

  // If no match, default to "Other" category
  const otherCategory = categories.find(
    (cat) => cat.name.toLowerCase() === "other",
  );

  return otherCategory?.id || "unknown";
}

/**
 * Try to match a transaction to an expense category based on keywords
 *
 * @param transaction The transaction to categorize
 * @param categories Available expense categories
 * @returns Category ID if found, null otherwise
 */
async function matchTransactionToCategory(
  transaction: Transaction,
  categories: Array<{ id: string; name: string }>,
): Promise<string | null> {
  // Text to search in (combine merchant name and description)
  const searchText = [transaction.merchantName, transaction.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Common keywords for different categories
  const categoryKeywords: Record<string, string[]> = {
    Food: [
      "grocery",
      "groceries",
      "supermarket",
      "food",
      "restaurant",
      "cafe",
      "coffee",
      "pizza",
      "takeaway",
      "delivery",
      "uber eats",
      "deliveroo",
      "continente",
      "pingo doce",
      "lidl",
      "aldi",
      "auchan",
      "mini preco",
      "bakery",
      "pastelaria",
      "meal",
      "dinner",
      "lunch",
      "breakfast",
      "snack",
      "mercado",
      "market",
      "burger",
      "mcdonald",
      "starbucks",
    ],
    Housing: [
      "rent",
      "mortgage",
      "home",
      "house",
      "apartment",
      "landlord",
      "realty",
      "renda",
      "imobiliaria",
      "building",
      "property",
      "lease",
      "condominio",
    ],
    Utilities: [
      "utility",
      "electric",
      "electricity",
      "water",
      "gas",
      "sewage",
      "waste",
      "edp",
      "galp",
      "internet",
      "phone",
      "mobile",
      "broadband",
      "cable",
      "tv",
      "television",
      "meo",
      "nos",
      "vodafone",
      "bill",
      "telecom",
    ],
    Transportation: [
      "transport",
      "transit",
      "train",
      "bus",
      "subway",
      "metro",
      "taxi",
      "uber",
      "fuel",
      "gas",
      "petrol",
      "diesel",
      "parking",
      "toll",
      "car",
      "auto",
      "maintenance",
      "repair",
      "cp",
      "comboios",
      "carris",
      "bolt",
      "rental",
    ],
    Health: [
      "health",
      "doctor",
      "hospital",
      "pharmacy",
      "medical",
      "medication",
      "dentist",
      "healthcare",
      "clinic",
      "therapy",
      "farmacia",
      "drug",
      "lab",
      "test",
      "check-up",
      "wellness",
      "fitness",
      "gym",
      "insurance",
    ],
    Entertainment: [
      "entertainment",
      "movie",
      "cinema",
      "theater",
      "theatre",
      "concert",
      "show",
      "ticket",
      "netflix",
      "spotify",
      "streaming",
      "game",
      "gaming",
      "book",
      "sport",
      "event",
      "music",
      "subscription",
      "leisure",
    ],
    Shopping: [
      "shopping",
      "retail",
      "store",
      "shop",
      "mall",
      "clothing",
      "clothes",
      "apparel",
      "shoes",
      "electronics",
      "gadget",
      "amazon",
      "worten",
      "fnac",
      "primark",
      "zara",
      "h&m",
      "decathlon",
      "ikea",
      "furniture",
    ],
    Education: [
      "education",
      "school",
      "university",
      "college",
      "course",
      "class",
      "tuition",
      "student",
      "training",
      "book",
      "learning",
      "academia",
      "workshop",
      "faculdade",
      "escola",
      "universidade",
      "formation",
    ],
    Personal: [
      "personal",
      "beauty",
      "haircut",
      "salon",
      "spa",
      "manicure",
      "pedicure",
      "cosmetics",
      "hygiene",
      "gift",
      "present",
      "donation",
      "charity",
    ],
    "Savings & Investments": [
      "saving",
      "investment",
      "bank",
      "deposit",
      "withdraw",
      "transfer",
      "stock",
      "bond",
      "fund",
      "etf",
      "crypto",
      "bitcoin",
      "dividend",
      "interest",
      "wealth",
      "portfolio",
      "asset",
      "financial",
      "retirement",
    ],
  };

  // Try to match transaction text against category keywords
  for (const category of categories) {
    const categoryName = category.name;

    // Skip non-standard categories
    if (!categoryKeywords[categoryName]) {
      continue;
    }

    // Check if any keywords match
    const keywords = categoryKeywords[categoryName];
    if (keywords.some((keyword) => searchText.includes(keyword))) {
      return category.id;
    }
  }

  // If no specific category matched, check for general patterns

  // Subscriptions (monthly costs)
  if (
    searchText.includes("subscription") ||
    searchText.includes("monthly") ||
    searchText.includes("recurring")
  ) {
    // Find entertainment or utilities category
    const entertainment = categories.find(
      (cat) => cat.name === "Entertainment",
    );
    if (entertainment) return entertainment.id;

    const utilities = categories.find((cat) => cat.name === "Utilities");
    if (utilities) return utilities.id;
  }

  // Large amounts might be housing
  if (transaction.amount < 0 && Math.abs(transaction.amount) > 500) {
    const housing = categories.find((cat) => cat.name === "Housing");
    if (housing) return housing.id;
  }

  // Small amounts are often food
  if (transaction.amount < 0 && Math.abs(transaction.amount) < 20) {
    const food = categories.find((cat) => cat.name === "Food");
    if (food) return food.id;
  }

  // No match found
  return null;
}

/**
 * Learn from user categorization to improve future automatic categorization
 *
 * @param transactionId Transaction ID
 * @param categoryId Category ID chosen by user
 */
export async function learnFromUserCategorization(
  transactionId: string,
  categoryId: string,
): Promise<void> {
  // In a real implementation, this would store the user's categorization
  // to improve the algorithm over time, possibly using machine learning

  // For now, we'll just log it
  console.log(
    `Learning: Transaction ${transactionId} categorized as ${categoryId}`,
  );
}
