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
import { type UseFormReturn } from "react-hook-form";
import SelectCategories from "@/components/SelectCategories";
import { Input } from "@/components/ui/input";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { type SavingsCategory } from "@/server/db/schema";
import { type TSavingsValidator } from "@/lib/validators/SavingsValidator";
import { useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

interface SavingFormProps {
  form: UseFormReturn<TSavingsValidator>;
  onSubmit: (data: TSavingsValidator) => void;
  buttonLabel?: string;
}

export default function SavingsForm({
  form,
  onSubmit,
  buttonLabel,
}: SavingFormProps) {
  const { data: savingsCategories, isLoading } =
    api.savings.getAllCategories.useQuery();

  const selectedCategoryId = form.getValues().savingsCategoryId;

  const selectedCategory = useMemo(() => {
    if (selectedCategoryId) {
      return savingsCategories?.find(
        (category) => category.id === parseInt(selectedCategoryId),
      );
    }
    return undefined;
  }, [selectedCategoryId, savingsCategories]);

  const watchCategory = form.watch("savingsCategoryId");

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
        <Button type="submit" variant="default" disabled>
          {buttonLabel ?? `Create Saving`}
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
          name="savingsCategoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="savingsCategoryId" className="flex">
                Category <span className="ml-1 text-red-500">*</span>
              </FormLabel>
              <SelectCategories
                categoriesList={savingsCategories as SavingsCategory[]}
                onValueChange={field.onChange}
                defaultValue={field.value.toString()}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {watchCategory && selectedCategory?.requiresAmount && (
          <FormField
            control={form.control}
            name="finalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="finalAmount" className="flex">
                  Final Amount <span className="ml-1 text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="finalAmount"
                    type="number"
                    placeholder="Enter your goal amount"
                    value={
                      !field.value || isNaN(field.value) ? "" : field.value
                    }
                    onChange={(e) => {
                      const value = e.target.valueAsNumber;
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The amount you want to save for this goal.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="startingAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="startingAmount" className="flex">
                Starting Amount <span className="ml-1 text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id="startingAmount"
                  type="number"
                  placeholder="Enter starting amount"
                  value={isNaN(field.value) ? "" : field.value}
                  onChange={(e) => {
                    const value = e.target.valueAsNumber;
                    field.onChange(isNaN(value) ? 0 : value);
                  }}
                />
              </FormControl>
              <FormDescription>
                The initial amount you&apos;re putting into this saving.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name" className="flex">
                Name <span className="ml-1 text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  id="name"
                  {...field}
                  placeholder="Enter a name for your saving"
                />
              </FormControl>
              <FormDescription>
                Give your saving a descriptive name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchCategory && selectedCategory?.requiresAmount && (
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  End Date <span className="ml-1 text-red-500">*</span>
                </FormLabel>
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
            )}
          />
        )}

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="submit"
              variant="default"
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              {buttonLabel ?? `Create Saving`}
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </Form>
  );
}
