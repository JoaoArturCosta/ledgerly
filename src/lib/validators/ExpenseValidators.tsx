import { z } from "zod";

export const ExpenseValidator = z.object({
  amount: z.number().min(1),
  description: z.string().min(1),
  expenseCategoryId: z.string().min(1),
  expenseSubCategoryId: z.string().min(1),
  recurring: z.boolean(),
  relatedDate: z.date(),
});

export type TExpenseValidator = z.infer<typeof ExpenseValidator>;
