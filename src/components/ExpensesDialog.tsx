"use client";

import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import SelectCategories from "./SelectCategories";
import {
  type ExpenseCategory,
  type ExpenseSubCategory,
} from "@/server/db/schema";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

import { Switch } from "./ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  ExpenseValidator,
  type TExpenseValidator,
} from "@/lib/validators/ExpenseValidators";

type ExpenseCategoryWithSubCategories = ExpenseCategory & {
  subCategories: ExpenseSubCategory[];
};

export function ExpensesDialog() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [, setOpen] = useState(false);

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
    },
  });

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

  const { mutate: submit } = api.expense.create.useMutation({
    onSuccess: async () => {
      setOpen(false);
      toast({
        description: `Added ${
          expenseSubCategories?.find(
            (category) =>
              category.id === parseInt(form.getValues().expenseSubCategoryId),
          )?.name
        } to your income.`,
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

            <FormField
              control={form.control}
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Expense</FormLabel>
                    <FormDescription>
                      This expense will happen every month, like rent or
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
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="submit" variant="default">
                  Add Expense
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
