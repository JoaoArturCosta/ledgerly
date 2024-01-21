"use client";

import { type TExpenseValidator } from "@/lib/validators/ExpenseValidators";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type UseFormReturn } from "react-hook-form";
import SelectCategories from "./SelectCategories";
import { api } from "@/trpc/react";
import { useEffect, useMemo, useState } from "react";
import {
  type ExpenseCategory,
  type ExpenseSubCategory,
} from "@/server/db/schema";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SavingsDrawer from "@/components/SavingsDrawer";

interface ExpensesFormProps {
  form: UseFormReturn<TExpenseValidator>;
  onSubmit: (data: TExpenseValidator) => void;
  buttonLabel?: string;
}

type ExpenseCategoryWithSubCategories = ExpenseCategory & {
  subCategories: ExpenseSubCategory[];
};

export default function ExpensesForm({
  form,
  onSubmit,
  buttonLabel,
}: ExpensesFormProps) {
  const [relatedSavingId, setRelatedSavingId] = useState<string | undefined>();

  useEffect(() => {
    if (form.getValues().expenseCategoryId === "18") {
      form.setValue("relatedSavingId", relatedSavingId ?? "");
    }
  }, [relatedSavingId, form]);

  const { data: expenseSubCategories } =
    api.expense.getAllCategories.useQuery();

  const expenseCategoriesList = expenseSubCategories?.reduce(
    (acc, subCategory) => {
      if (subCategory.expenseCategory) {
        const parentCategory = acc.find(
          (category) => category.id === subCategory.expenseCategory.id,
        );
        if (parentCategory) {
          parentCategory.subCategories.push(subCategory);
        } else {
          acc.push({
            ...subCategory.expenseCategory,
            subCategories: [subCategory],
          });
        }
      }
      return acc;
    },
    [] as ExpenseCategoryWithSubCategories[],
  );

  const selectedCategoryId = form.getValues().expenseCategoryId;

  const selectedCategory = useMemo(
    () =>
      expenseCategoriesList?.find(
        (category) => category.id === parseInt(selectedCategoryId),
      ),
    [selectedCategoryId, expenseCategoriesList],
  );

  const watchCategory = form.watch("expenseCategoryId");

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="expenseCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="expenseCategoryId">Category</FormLabel>
              <SelectCategories
                categoriesList={expenseCategoriesList as ExpenseCategory[]}
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {watchCategory && (
          <FormField
            control={form.control}
            name="expenseSubCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="expenseSubCategoryId">Type</FormLabel>
                <SelectCategories
                  categoriesList={
                    selectedCategory?.subCategories ??
                    ([] as ExpenseSubCategory[])
                  }
                  label="type"
                  onValueChange={field.onChange}
                  defaultValue={field.value.toString()}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="description">Description</FormLabel>
              <FormControl>
                <Input id="description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="amount">Amount</FormLabel>
              <FormControl>
                <Input
                  id="amount"
                  {...field}
                  type="number"
                  onChange={(value) =>
                    field.onChange(value.target.valueAsNumber)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchCategory && selectedCategoryId === "18" && (
          <SavingsDrawer setRelatedSavingId={setRelatedSavingId} />
        )}

        <FormField
          control={form.control}
          name="recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Recurring Expense</FormLabel>
                <FormDescription>
                  This expense will happen every month, like rent or membership.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  id="recurring"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="submit" variant="default">
              {buttonLabel ?? `Add Expense`}
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </Form>
  );
}
