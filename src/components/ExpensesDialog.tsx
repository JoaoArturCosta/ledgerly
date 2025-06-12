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
import { format, parse } from "date-fns";
import {
  ExpenseValidator,
  type TExpenseValidator,
} from "@/lib/validators/ExpenseValidators";
import ExpensesForm from "@/components/ExpensesForm";

interface ExpensesDialogProps {
  className?: string;
  triggerLabel?: string;
  savingId?: string;
}

export function ExpensesDialog({
  className,
  triggerLabel,
  savingId,
}: ExpensesDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Don't auto-open the dialog based on savingId
  const [open, setOpen] = useState(false);
  const [relatedSavingId, setRelatedSavingId] = useState<string>(
    savingId ?? "",
  );

  const { data: categories } = api.expense.getAllCategories.useQuery();

  // Find the Savings & Investments category ID and subcategory ID dynamically
  const { savingsInvestmentsCategoryId, defaultSavingsSubcategoryId } =
    useMemo(() => {
      if (!categories)
        return {
          savingsInvestmentsCategoryId: "",
          defaultSavingsSubcategoryId: "",
        };

      // Find a subcategory that belongs to the "Savings & Investments" category
      const savingsSubCategory = categories.find(
        (subCategory) =>
          subCategory.expenseCategory.name === "Savings & Investments",
      );

      return {
        savingsInvestmentsCategoryId:
          savingsSubCategory?.expenseCategory.id.toString() ?? "",
        defaultSavingsSubcategoryId: savingsSubCategory?.id.toString() ?? "",
      };
    }, [categories]);

  const relatedDate = useMemo(() => {
    if (searchParams.get("month")) {
      // Parse the "MMMM/yyyy" format from the DatePicker (e.g., "July/2025")
      const monthParam = searchParams.get("month")!;
      const parsedDate = parse(monthParam, "MMMM/yyyy", new Date());
      // Set to the first day of the month for consistency
      return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
    }
    return new Date();
  }, [searchParams]);

  const form = useForm<TExpenseValidator>({
    resolver: zodResolver(ExpenseValidator),
    defaultValues: {
      amount: 0,
      description: "",
      expenseCategoryId: "", // We'll set this in the useEffect
      expenseSubCategoryId: "",
      recurring: false,
      relatedDate: relatedDate,
      relatedSavingId: relatedSavingId,
    },
  });

  const handleRelatedSavingId = (id: string) => {
    setRelatedSavingId(id);
  };

  // Set the "Savings & Investments" category when the dialog mounts and savingId is provided
  useEffect(() => {
    if (savingsInvestmentsCategoryId && savingId && savingId !== "0") {
      // Set the category to "Savings & Investments"
      form.setValue("expenseCategoryId", savingsInvestmentsCategoryId);

      // Set the subcategory if available
      if (defaultSavingsSubcategoryId) {
        form.setValue("expenseSubCategoryId", defaultSavingsSubcategoryId);
      }

      // Set the description to a default value
      form.setValue("description", "Adding money to savings");
    }
  }, [
    savingsInvestmentsCategoryId,
    defaultSavingsSubcategoryId,
    savingId,
    form,
  ]);

  // Update the relatedSavingId when the category is "Savings & Investments"
  useEffect(() => {
    const selectedCategoryId = form.getValues().expenseCategoryId;

    // Use the dynamic savingsInvestmentsCategoryId instead of checking the name
    const isSavingsCategory =
      selectedCategoryId === savingsInvestmentsCategoryId &&
      savingsInvestmentsCategoryId !== "";

    if (isSavingsCategory) {
      form.setValue(
        "relatedSavingId",
        relatedSavingId && relatedSavingId !== "0" ? relatedSavingId : "0",
      );
    }
  }, [relatedSavingId, form, savingsInvestmentsCategoryId]);

  // Update the form's relatedDate when the URL changes
  useEffect(() => {
    form.setValue("relatedDate", relatedDate);
  }, [relatedDate, form]);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className} asChild>
        <Button variant="outline" className="items-left flex gap-2 ">
          {triggerLabel ?? `Add Expense`} <Plus className="h-3 w-3" />{" "}
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
          hasRelatedSaving={!!savingId}
        />
      </DialogContent>
    </Dialog>
  );
}
