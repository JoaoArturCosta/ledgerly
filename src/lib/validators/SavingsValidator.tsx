import { z } from "zod";

export const SavingsValidator = z.object({
  name: z.string().min(1),
  finalAmount: z.number().min(0.01).optional(),
  startingAmount: z.number().min(0),
  savingsCategoryId: z.string().min(1),
  endDate: z.date().optional(),
});

export type TSavingsValidator = z.infer<typeof SavingsValidator>;

// Helper function for category-aware validation
export const validateSavingsForCategory = (
  data: TSavingsValidator,
  requiresAmount = true,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (requiresAmount) {
    if (!data.finalAmount || data.finalAmount <= 0) {
      errors.push("Final amount is required for this category");
    }
    if (!data.endDate) {
      errors.push("End date is required for this category");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Create a dynamic validator based on category
export const createCategoryAwareValidator = (requiresAmount: boolean) => {
  if (requiresAmount) {
    return z.object({
      name: z.string().min(1),
      finalAmount: z.number().min(0.01, "Final amount must be greater than 0"),
      startingAmount: z.number().min(0),
      savingsCategoryId: z.string().min(1),
      endDate: z.date({ required_error: "End date is required" }),
    });
  } else {
    return z.object({
      name: z.string().min(1),
      finalAmount: z.number().min(0.01).optional(),
      startingAmount: z.number().min(0),
      savingsCategoryId: z.string().min(1),
      endDate: z.date().optional(),
    });
  }
};
