"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Income } from "@/server/db/schema";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  IncomeValidator,
  type TIncomeValidator,
} from "@/lib/validators/IncomeValidators";
import IncomeForm from "./IncomeForm";

interface EditIncomeDialogProps {
  income: Income;
}

export default function EditIncomeDialog({ income }: EditIncomeDialogProps) {
  const router = useRouter();
  const form = useForm<TIncomeValidator>({
    resolver: zodResolver(IncomeValidator),
    defaultValues: {
      amount: income.amount,
      incomeCategoryId: income.incomeCategoryId.toString(),
      recurring: income.isRecurring,
      relatedDate: income.relatedDate,
    },
  });

  const { mutate: submit } = api.income.update.useMutation({
    onSuccess: async ({ incomeCategory }) => {
      toast({
        description: `Updated ${incomeCategory?.name} in your expenses.`,
      });
      router.refresh();
    },
    onError: () => {
      toast({
        description: "Something went wrong. Please try again.",
      });
    },
  });

  const onSubmit = async (data: TIncomeValidator) => {
    submit({
      id: income.id,
      ...data,
    });
  };

  return (
    <>
      <DialogContent>
        <DialogHeader>Edit Income</DialogHeader>
        <DialogDescription>
          You can edit the income details here.
        </DialogDescription>
        <IncomeForm form={form} onSubmit={onSubmit} buttonLabel="Save Income" />
      </DialogContent>
    </>
  );
}
