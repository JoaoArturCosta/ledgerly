import { z } from "zod";

export const IncomeValidator = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .min(0.01, "Amount must be at least $0.01"),
  incomeCategoryId: z.string().min(1),
  recurring: z.boolean(),
  relatedDate: z.date(),
});

export type TIncomeValidator = z.infer<typeof IncomeValidator>;
