"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type TWithdrawalValidator } from "@/lib/validators/WithdrawalValidators";

interface WithdrawalFormProps {
  form: UseFormReturn<TWithdrawalValidator>;
  onSubmit: (data: TWithdrawalValidator) => void;
  buttonLabel?: string;
}

export default function WithdrawalForm({
  form,
  onSubmit,
}: WithdrawalFormProps) {
  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
                  value={
                    field.value === undefined || isNaN(field.value)
                      ? ""
                      : field.value
                  }
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input id="description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="submit" variant="default">
              Withdraw
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </Form>
  );
}
