"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type TIncomeValidator } from "@/lib/validators/IncomeValidators";
import { type UseFormReturn } from "react-hook-form";
import SelectCategories from "@/components/SelectCategories";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { type IncomeCategory } from "@/server/db/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface IncomeFormProps {
  form: UseFormReturn<TIncomeValidator>;
  onSubmit: (data: TIncomeValidator) => void;
  buttonLabel?: string;
}

export default function IncomeForm({ form, onSubmit }: IncomeFormProps) {
  const { data: incomeCategories, isLoading } =
    api.income.getAllCategories.useQuery();

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
          <Skeleton className="h-12 w-[250px]" />
        </div>
        <Button type="submit" variant="default" disabled>
          Add Income
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
          name="incomeCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="incomeCategoryId">Category</FormLabel>
              <SelectCategories
                categoriesList={incomeCategories as IncomeCategory[]}
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              />
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
                  type="number"
                  step="0.01"
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value = e.target.valueAsNumber;
                    field.onChange(isNaN(value) ? undefined : value);
                  }}
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
                <FormLabel>Recurring Income</FormLabel>
                <FormDescription>
                  This income will happen every month, like salaries or wages.
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
              Update Income
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </Form>
  );
}
