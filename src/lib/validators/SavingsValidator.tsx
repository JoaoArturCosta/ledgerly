import { z } from "zod";

export const SavingsValidator = z.object({
  name: z.string().min(1),
  finalAmount: z.number().min(1),
  startingAmount: z.number().min(0),
  savingsCategoryId: z.string().min(1),
  endDate: z.date(),
});

export type TSavingsValidator = z.infer<typeof SavingsValidator>;
