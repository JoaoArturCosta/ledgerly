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
import { useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IncomeValidator,
  type TIncomeValidator,
} from "@/lib/validators/IncomeValidators";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
import IncomeForm from "@/components/IncomeForm";

export function IncomeDialog() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [, setOpen] = useState(false);

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

  console.log(relatedDate);

  const form = useForm<TIncomeValidator>({
    resolver: zodResolver(IncomeValidator),
    defaultValues: {
      amount: 0,
      incomeCategoryId: "",
      recurring: false,
      relatedDate: relatedDate,
    },
  });

  const { mutate: submit } = api.income.create.useMutation({
    onSuccess: async ({ incomeCategory }) => {
      setOpen(false);
      toast({
        description: `Added ${incomeCategory?.name} to your income.`,
      });
      router.refresh();
      form.reset();
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
        <IncomeForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
