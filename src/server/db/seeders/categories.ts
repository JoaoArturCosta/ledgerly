import { IncomeCategory, ExpenseCategory, SavingsCategory } from "../schema";

// Income category seed data
export const defaultIncomeCategories: Omit<
  IncomeCategory,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Salary",
    iconFaName: "wallet",
    createdById: "system", // This will be replaced with admin user ID
  },
  {
    name: "Freelance",
    iconFaName: "briefcase",
    createdById: "system",
  },
  {
    name: "Investments",
    iconFaName: "chart-line",
    createdById: "system",
  },
  {
    name: "Gifts",
    iconFaName: "gift",
    createdById: "system",
  },
  {
    name: "Other",
    iconFaName: "ellipsis-h",
    createdById: "system",
  },
];

// Expense category seed data
export const defaultExpenseCategories: Omit<
  ExpenseCategory,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Housing",
    iconFaName: "home",
    createdById: "system",
  },
  {
    name: "Transportation",
    iconFaName: "car",
    createdById: "system",
  },
  {
    name: "Food",
    iconFaName: "utensils",
    createdById: "system",
  },
  {
    name: "Utilities",
    iconFaName: "bolt",
    createdById: "system",
  },
  {
    name: "Health",
    iconFaName: "medkit",
    createdById: "system",
  },
  {
    name: "Entertainment",
    iconFaName: "film",
    createdById: "system",
  },
  {
    name: "Shopping",
    iconFaName: "shopping-cart",
    createdById: "system",
  },
  {
    name: "Personal",
    iconFaName: "user",
    createdById: "system",
  },
  {
    name: "Education",
    iconFaName: "graduation-cap",
    createdById: "system",
  },
  {
    name: "Savings & Investments",
    iconFaName: "piggy-bank",
    createdById: "system",
  },
  {
    name: "Other",
    iconFaName: "ellipsis-h",
    createdById: "system",
  },
];

// Expense subcategories seed data
export const defaultExpenseSubcategories = [
  // Housing subcategories
  {
    name: "Rent/Mortgage",
    iconFaName: "key",
    expenseCategoryId: 1,
    createdById: "system",
  },
  {
    name: "Home Insurance",
    iconFaName: "shield-alt",
    expenseCategoryId: 1,
    createdById: "system",
  },
  {
    name: "Property Tax",
    iconFaName: "file-invoice-dollar",
    expenseCategoryId: 1,
    createdById: "system",
  },
  {
    name: "Repairs",
    iconFaName: "tools",
    expenseCategoryId: 1,
    createdById: "system",
  },

  // Transportation subcategories
  {
    name: "Car Payment",
    iconFaName: "car",
    expenseCategoryId: 2,
    createdById: "system",
  },
  {
    name: "Gas",
    iconFaName: "gas-pump",
    expenseCategoryId: 2,
    createdById: "system",
  },
  {
    name: "Car Insurance",
    iconFaName: "shield-alt",
    expenseCategoryId: 2,
    createdById: "system",
  },
  {
    name: "Public Transit",
    iconFaName: "bus",
    expenseCategoryId: 2,
    createdById: "system",
  },
  {
    name: "Parking",
    iconFaName: "parking",
    expenseCategoryId: 2,
    createdById: "system",
  },

  // Food subcategories
  {
    name: "Groceries",
    iconFaName: "shopping-basket",
    expenseCategoryId: 3,
    createdById: "system",
  },
  {
    name: "Restaurants",
    iconFaName: "utensils",
    expenseCategoryId: 3,
    createdById: "system",
  },
  {
    name: "Coffee Shops",
    iconFaName: "coffee",
    expenseCategoryId: 3,
    createdById: "system",
  },

  // Utilities subcategories
  {
    name: "Electricity",
    iconFaName: "bolt",
    expenseCategoryId: 4,
    createdById: "system",
  },
  {
    name: "Water",
    iconFaName: "water",
    expenseCategoryId: 4,
    createdById: "system",
  },
  {
    name: "Internet",
    iconFaName: "wifi",
    expenseCategoryId: 4,
    createdById: "system",
  },
  {
    name: "Phone",
    iconFaName: "phone",
    expenseCategoryId: 4,
    createdById: "system",
  },

  // Health subcategories
  {
    name: "Health Insurance",
    iconFaName: "heart",
    expenseCategoryId: 5,
    createdById: "system",
  },
  {
    name: "Medicine",
    iconFaName: "pills",
    expenseCategoryId: 5,
    createdById: "system",
  },
  {
    name: "Doctor",
    iconFaName: "user-md",
    expenseCategoryId: 5,
    createdById: "system",
  },
  {
    name: "Gym",
    iconFaName: "dumbbell",
    expenseCategoryId: 5,
    createdById: "system",
  },

  // Entertainment subcategories
  {
    name: "Movies",
    iconFaName: "film",
    expenseCategoryId: 6,
    createdById: "system",
  },
  {
    name: "Music",
    iconFaName: "music",
    expenseCategoryId: 6,
    createdById: "system",
  },
  {
    name: "Subscription Services",
    iconFaName: "tv",
    expenseCategoryId: 6,
    createdById: "system",
  },
  {
    name: "Games",
    iconFaName: "gamepad",
    expenseCategoryId: 6,
    createdById: "system",
  },

  // Other subcategories for remaining categories
  {
    name: "Clothing",
    iconFaName: "tshirt",
    expenseCategoryId: 7,
    createdById: "system",
  },
  {
    name: "Electronics",
    iconFaName: "laptop",
    expenseCategoryId: 7,
    createdById: "system",
  },

  {
    name: "Haircut",
    iconFaName: "cut",
    expenseCategoryId: 8,
    createdById: "system",
  },
  {
    name: "Cosmetics",
    iconFaName: "spray-can",
    expenseCategoryId: 8,
    createdById: "system",
  },

  {
    name: "Tuition",
    iconFaName: "university",
    expenseCategoryId: 9,
    createdById: "system",
  },
  {
    name: "Books",
    iconFaName: "book",
    expenseCategoryId: 9,
    createdById: "system",
  },

  {
    name: "Miscellaneous",
    iconFaName: "question",
    expenseCategoryId: 10,
    createdById: "system",
  },
];

// Savings category seed data
export const defaultSavingsCategories: Omit<
  SavingsCategory,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Emergency Fund",
    iconFaName: "life-ring",
    requiresAmount: true,
    createdById: "system",
  },
  {
    name: "Retirement",
    iconFaName: "umbrella-beach",
    requiresAmount: true,
    createdById: "system",
  },
  {
    name: "Vacation",
    iconFaName: "plane",
    requiresAmount: true,
    createdById: "system",
  },
  {
    name: "House Down Payment",
    iconFaName: "home",
    requiresAmount: true,
    createdById: "system",
  },
  {
    name: "Vehicle",
    iconFaName: "car",
    requiresAmount: true,
    createdById: "system",
  },
  {
    name: "Education",
    iconFaName: "graduation-cap",
    requiresAmount: true,
    createdById: "system",
  },
  {
    name: "Other",
    iconFaName: "piggy-bank",
    requiresAmount: false,
    createdById: "system",
  },
];
