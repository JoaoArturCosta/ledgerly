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

interface EditExpenseDialogProps {
  expense: Expense;
}

export default function EditExpenseDialog({ expense }: EditExpenseDialogProps) {
  const router = useRouter();
  const form = useForm<TExpenseValidator>({
    resolver: zodResolver(ExpenseValidator),
    defaultValues: {
      amount: expense.amount,
      description: expense.description!,
      expenseCategoryId: expense.expenseCategoryId.toString(),
      expenseSubCategoryId: expense.expenseSubCategoryId.toString(),
      recurring: expense.isRecurring,
      relatedDate: expense.relatedDate!,
    },
  });

  const { mutate: submit } = api.expense.update.useMutation({
    onSuccess: async ({ expenseSubCategory }) => {
      toast({
        description: `Updated ${expenseSubCategory?.name} in your expenses.`,
      });
      router.refresh();
    },
    onError: () => {
      toast({
        description: "Something went wrong. Please try again.",
      });
    },
  });

  const onSubmit = async (data: TExpenseValidator) => {
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
        />
      </DialogContent>
    </>
  );
}
