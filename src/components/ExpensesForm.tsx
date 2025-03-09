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
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SavingsDrawer from "@/components/SavingsDrawer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { data: expenseSubCategories, isLoading } =
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-[250px]" />
        </div>
        <Button type="submit" variant="default" disabled>
          {buttonLabel ?? `Add Expense`}
        </Button>
      </div>
    );
  }

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
              <FormLabel htmlFor="expenseCategoryId" className="flex">
                Category <span className="ml-1 text-red-500">*</span>
              </FormLabel>
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
                <FormLabel htmlFor="expenseSubCategoryId" className="flex">
                  Type <span className="ml-1 text-red-500">*</span>
                </FormLabel>
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
              <FormLabel htmlFor="description" className="flex">
                Description <span className="ml-1 text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input id="description" placeholder="Required" {...field} />
              </FormControl>
              <FormDescription>
                A brief description of your expense is required.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="amount" className="flex">
                Amount <span className="ml-1 text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id="amount"
                  {...field}
                  type="number"
                  placeholder="Required"
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
                  This expense will happen every month, like rent or a
                  membership.
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
                    <div className="flex items-center gap-1">
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
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => field.onChange(undefined)}
                        disabled={!field.value}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      The date you expect this expense to end.
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
          {/* <DialogClose asChild> */}
          <Button
            type="submit"
            variant="default"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {buttonLabel ?? `Add Expense`}
          </Button>
          {/* </DialogClose> */}
        </DialogFooter>
      </form>
    </Form>
  );
}
