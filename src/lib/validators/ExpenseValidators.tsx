import { z } from "zod";

export const ExpenseValidator = z.object({
  amount: z.number().min(1),
  description: z.string().min(1, "Description is required"),
  expenseCategoryId: z.string().min(1),
  expenseSubCategoryId: z.string().min(1),
  endDate: z.date().optional(),
  recurring: z.boolean(),
  relatedDate: z.date(),
  relatedSavingId: z.string().optional(),
});

export type TExpenseValidator = z.infer<typeof ExpenseValidator>;
