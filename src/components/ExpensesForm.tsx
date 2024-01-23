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
import { useMemo } from "react";
import {
  type ExpenseCategory,
  type ExpenseSubCategory,
} from "@/server/db/schema";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SavingsDrawer from "@/components/SavingsDrawer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";

interface ExpensesFormProps {
  form: UseFormReturn<TExpenseValidator>;
  onSubmit: (data: TExpenseValidator) => void;
  buttonLabel?: string;
  handleRelatedSavingId: (id: string) => void;
  hasRelatedSaving?: boolean;
}

type ExpenseCategoryWithSubCategories = ExpenseCategory & {
  subCategories: ExpenseSubCategory[];
};

export default function ExpensesForm({
  form,
  onSubmit,
  buttonLabel,
  handleRelatedSavingId,
  hasRelatedSaving,
}: ExpensesFormProps) {
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
  const watchIsRecurring = form.watch("recurring");

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

        {watchCategory && selectedCategoryId === "18" && !hasRelatedSaving && (
          <SavingsDrawer handleRelatedSavingId={handleRelatedSavingId} />
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

        {watchIsRecurring && (
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormControl>
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The date you want to reach your goal.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
