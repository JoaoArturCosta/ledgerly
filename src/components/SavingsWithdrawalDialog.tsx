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
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  type TWithdrawalValidator,
  WithdrawalValidator,
} from "@/lib/validators/WithdrawalValidators";
import WithdrawalForm from "@/components/WithdrawalForm";
import { type SavingsWithCategory } from "@/types";

interface SavingsWithdrawalDialogProps {
  className?: string;
  relatedSaving: SavingsWithCategory;
}

export function SavingsWithdrawalDialog({
  relatedSaving,
}: SavingsWithdrawalDialogProps) {
  const { toast } = useToast();
  const router = useRouter();

  const [, setOpen] = useState(false);

  const form = useForm<TWithdrawalValidator>({
    resolver: zodResolver(WithdrawalValidator),
    defaultValues: {
      amount: 0,
      description: "",
      savingId: relatedSaving.id.toString(),
    },
  });

  const { mutate: submit } = api.savings.createSavingWithdrawal.useMutation({
    onSuccess: async ({ savingWithdrawal }) => {
      setOpen(false);
      toast({
        description: `Created ${savingWithdrawal?.description}.`,
      });
      router.refresh();
      form.reset();
    },
    onError: () => {
      toast({
        description:
          "An error occurred while creating your transaction. Please try again.",
      });
    },
  });

  const onSubmit = (data: TWithdrawalValidator) => {
    submit({
      ...data,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="items-left flex gap-2 ">
          Withdraw Money <Plus className="h-3 w-3" />{" "}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw money</DialogTitle>
          <DialogDescription>
            Withdraw money from {relatedSaving.name} .
          </DialogDescription>
        </DialogHeader>
        <WithdrawalForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
