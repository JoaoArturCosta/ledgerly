"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  ExpenseValidator,
  type TExpenseValidator,
} from "@/lib/validators/ExpenseValidators";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Expense } from "@/server/db/schema";
import ExpensesForm from "./ExpensesForm";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EditExpenseDialogProps {
  expense: Expense;
}

export default function EditExpenseDialog({ expense }: EditExpenseDialogProps) {
  const router = useRouter();

  const [relatedSavingId, setRelatedSavingId] = useState<string>("");

  const endDate = expense.endDate ?? undefined;

  const form = useForm<TExpenseValidator>({
    resolver: zodResolver(ExpenseValidator),
    defaultValues: {
      amount: expense.amount,
      description: expense.description!,
      expenseCategoryId: expense.expenseCategoryId.toString(),
      expenseSubCategoryId: expense.expenseSubCategoryId.toString(),
      recurring: expense.isRecurring,
      relatedDate: expense.relatedDate!,
      relatedSavingId: expense.relatedSavingId?.toString(),
      endDate: endDate,
    },
  });

  useEffect(() => {
    if (form.getValues().expenseCategoryId === "18") {
      form.setValue("relatedSavingId", relatedSavingId.toString() ?? "");
    }
  }, [relatedSavingId, form]);

  const handleRelatedSavingId = (id: string) => {
    setRelatedSavingId(id);
  };

  const { mutate: submit } = api.expense.update.useMutation({
    onSuccess: async ({ expenseSubCategory }) => {
      toast({
        description: `Updated ${expenseSubCategory?.name} in your expenses.`,
      });
      router.refresh();
      // setDialogOpen(false);
    },
    onError: () => {
      toast({
        description: "Something went wrong. Please try again.",
      });
    },
  });

  const onSubmit = async (data: TExpenseValidator) => {
    console.log(data);
    submit({
      id: expense.id,
      ...data,
    });
  };

  return (
    <>
      <DialogContent>
        <DialogHeader>Edit Expense</DialogHeader>
        <DialogDescription>
          You can edit the expense details here.
        </DialogDescription>
        <ExpensesForm
          form={form}
          onSubmit={onSubmit}
          buttonLabel="Save Expense"
          handleRelatedSavingId={handleRelatedSavingId}
        />
      </DialogContent>
    </>
  );
}
