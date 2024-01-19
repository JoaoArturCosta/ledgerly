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
import { type IncomeCategory } from "@/server/db/schema";
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

import { Switch } from "./ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IncomeValidator,
  type TIncomeValidator,
} from "@/lib/validators/IncomeValidators";
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

export function IncomeDialog() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [, setOpen] = useState(false);

  const relatedDate = useMemo(() => {
    if (searchParams.get("month")) {
      const date = new Date(format(searchParams.get("month")!, "yyyy-MM-dd"));
      return date;
    }
    return new Date();
  }, [searchParams]);

  const form = useForm<TIncomeValidator>({
    resolver: zodResolver(IncomeValidator),
    defaultValues: {
      amount: 0,
      incomeCategoryId: "",
      recurring: false,
      relatedDate: relatedDate,
    },
  });

  const { data: incomeCategories } = api.income.getAllCategories.useQuery();

  const { mutate: submit } = api.income.create.useMutation({
    onSuccess: async () => {
      setOpen(false);
      toast({
        description: `Added ${
          incomeCategories?.find(
            (category) =>
              category.id === parseInt(form.getValues().incomeCategoryId),
          )?.name
        } to your income.`,
      });
    },
    onError: () => {
      toast({
        description:
          "An error occurred while adding your income. Please try again.",
      });
    },
  });

  const onSubmit = (data: TIncomeValidator) => {
    submit({
      ...data,
    });
    router.refresh();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="items-left flex gap-2 ">
          Add Income <Plus className="h-3 w-3" />{" "}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new income</DialogTitle>
          <DialogDescription>
            Any income that you make will be added to your total income.
          </DialogDescription>
        </DialogHeader>
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
              name="recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Income</FormLabel>
                    <FormDescription>
                      This income will happen every month, like salaries or
                      wages.
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
                  Add Income
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
