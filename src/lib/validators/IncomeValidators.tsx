import { z } from "zod";

export const IncomeValidator = z.object({
  amount: z.number().min(1),
  incomeCategoryId: z.string().min(1),
  recurring: z.boolean(),
  relatedDate: z.date(),
});

export type TIncomeValidator = z.infer<typeof IncomeValidator>;
