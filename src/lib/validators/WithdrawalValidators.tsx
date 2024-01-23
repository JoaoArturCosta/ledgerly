import { z } from "zod";

export const WithdrawalValidator = z.object({
  amount: z.number().min(1),
  description: z.string().min(0),
  savingId: z.string().min(1),
});

export type TWithdrawalValidator = z.infer<typeof WithdrawalValidator>;
