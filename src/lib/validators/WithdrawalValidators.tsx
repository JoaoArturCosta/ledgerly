import { z } from "zod";

export const WithdrawalValidator = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .min(0.01, "Amount must be at least $0.01"),
  description: z.string().min(0),
  savingId: z.string().min(1),
});

export type TWithdrawalValidator = z.infer<typeof WithdrawalValidator>;
