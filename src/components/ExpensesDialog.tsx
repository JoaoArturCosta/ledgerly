"use client";

import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  ExpenseValidator,
  type TExpenseValidator,
} from "@/lib/validators/ExpenseValidators";
import ExpensesForm from "@/components/ExpensesForm";

export function ExpensesDialog() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [, setOpen] = useState(false);
  const [relatedSavingId, setRelatedSavingId] = useState<string>("");

  const relatedDate = useMemo(() => {
    if (searchParams.get("month")) {
      const date = new Date(format(searchParams.get("month")!, "yyyy-MM-dd"));
      return date;
    }
    return new Date();
  }, [searchParams]);

  const form = useForm<TExpenseValidator>({
    resolver: zodResolver(ExpenseValidator),
    defaultValues: {
      amount: 0,
      description: "",
      expenseCategoryId: "",
      expenseSubCategoryId: "",
      recurring: false,
      relatedDate: relatedDate,
      relatedSavingId: relatedSavingId,
    },
  });

  const handleRelatedSavingId = (id: string) => {
    setRelatedSavingId(id);
  };

  useEffect(() => {
    if (form.getValues().expenseCategoryId === "18") {
      form.setValue("relatedSavingId", relatedSavingId ?? "");
    }
  }, [relatedSavingId, form]);

  const { mutate: submit } = api.expense.create.useMutation({
    onSuccess: async ({ expenseSubCategory }) => {
      setOpen(false);
      toast({
        description: `Added ${expenseSubCategory?.name} to your expenses.`,
      });
      router.refresh();
      form.reset();
    },
    onError: () => {
      toast({
        description:
          "An error occurred while adding your expense. Please try again.",
      });
    },
  });

  const onSubmit = (data: TExpenseValidator) => {
    submit({
      ...data,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="items-left flex gap-2 ">
          Add Expense <Plus className="h-3 w-3" />{" "}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new Expense</DialogTitle>
          <DialogDescription>
            Any Expense that you make will be added to your total expense.
          </DialogDescription>
        </DialogHeader>
        <ExpensesForm
          form={form}
          onSubmit={onSubmit}
          handleRelatedSavingId={handleRelatedSavingId}
        />
      </DialogContent>
    </Dialog>
  );
}
