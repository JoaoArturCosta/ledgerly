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

interface SavingFormProps {
  form: UseFormReturn<TSavingsValidator>;
  onSubmit: (data: TSavingsValidator) => void;
  buttonLabel?: string;
}

export default function SavingsForm({ form, onSubmit }: SavingFormProps) {
  const { data: savingsCategories } = api.savings.getAllCategories.useQuery();

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
              <FormLabel htmlFor="savingsCategoryId">Category</FormLabel>
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
                <FormLabel htmlFor="finalAmount">Final Amount</FormLabel>
                <FormControl>
                  <Input
                    id="finalAmount"
                    {...field}
                    type="number"
                    required
                    onChange={(value) =>
                      field.onChange(value.target.valueAsNumber)
                    }
                  />
                </FormControl>
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
              <FormLabel htmlFor="startingAmount">Starting Amount</FormLabel>
              <FormControl>
                <Input
                  id="startingAmount"
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="name">Name</FormLabel>
              <FormControl>
                <Input id="name" {...field} />
              </FormControl>
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
            )}
          />
        )}

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="submit" variant="default">
              Create Saving
            </Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </Form>
  );
}
