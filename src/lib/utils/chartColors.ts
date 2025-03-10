// Standardized color definitions using only indigo shades with better spacing

// Define a wide spectrum of indigo shades
const INDIGO = {
  50: "#F5F7FF", // Lightest
  100: "#E0E7FF",
  200: "#C7D2FE",
  300: "#A5B4FC",
  400: "#818CF8",
  500: "#6366F1",
  600: "#4F46E5",
  700: "#4338CA",
  800: "#3730A3",
  900: "#312E81",
  950: "#1E1B4B", // Darkest
};

// Primary colors for categories using widely spaced indigo shades
export const CATEGORY_COLORS: Record<string, string> = {
  // Key categories with distinct indigo shades
  Total: INDIGO[950], // Darkest indigo for Total
  Housing: INDIGO[800], // Dark indigo
  Food: INDIGO[400], // Medium light indigo
  Transportation: INDIGO[600], // Medium dark indigo
  Utilities: INDIGO[300], // Light indigo
  Health: INDIGO[700], // Dark indigo
  Entertainment: INDIGO[500], // Medium indigo
  Shopping: INDIGO[200], // Very light indigo
  Personal: INDIGO[600], // Medium dark indigo
  Education: INDIGO[400], // Medium light indigo
  "Savings & Investments": INDIGO[700], // Dark indigo
  Other: INDIGO[300], // Light indigo

  // Month names for time-series data using alternating shades
  January: INDIGO[800],
  February: INDIGO[600],
  March: INDIGO[400],
  April: INDIGO[800],
  May: INDIGO[600],
  June: INDIGO[400],
  July: INDIGO[800],
  August: INDIGO[600],
  September: INDIGO[400],
  October: INDIGO[800],
  November: INDIGO[600],
  December: INDIGO[400],

  default: INDIGO[500], // Default is a medium shade
};

// Fixed array of indigo shades with good spacing between them
export const FIXED_COLORS = [
  INDIGO[900], // Very dark indigo
  INDIGO[700], // Dark indigo
  INDIGO[500], // Medium indigo
  INDIGO[300], // Light indigo
  INDIGO[800], // Dark indigo (different shade)
  INDIGO[600], // Medium dark indigo
  INDIGO[400], // Medium light indigo
  INDIGO[200], // Very light indigo
];

/**
 * Get a color for a category
 * @param category The category name
 * @param index Optional index to use for fallback color
 * @returns A color string
 */
export function getCategoryColor(category?: string, index = 0): string {
  if (!category) {
    return FIXED_COLORS[index % FIXED_COLORS.length] ?? INDIGO[500];
  }

  // Always use the darkest indigo for Total
  if (category === "Total") {
    return INDIGO[950];
  }

  // Try to get from category map first
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }

  // Fallback to index-based color for unknown categories
  return FIXED_COLORS[index % FIXED_COLORS.length] ?? INDIGO[500];
}
