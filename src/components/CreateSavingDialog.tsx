"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  SavingsValidator,
  type TSavingsValidator,
} from "@/lib/validators/SavingsValidator";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import SavingsForm from "@/components/SavingsForm";

interface CreateSavingDialogProps {
  refetchSavingsList: () => void;
}

export default function CreateSavingDialog({
  refetchSavingsList,
}: CreateSavingDialogProps) {
  const router = useRouter();

  const form = useForm<TSavingsValidator>({
    resolver: zodResolver(SavingsValidator),
    defaultValues: {
      name: "",
      finalAmount: 0,
      startingAmount: 0,
      savingsCategoryId: "",
      endDate: undefined,
    },
  });

  const { mutate: submit } = api.savings.create.useMutation({
    onSuccess: async ({ savingsCategory }) => {
      toast({
        description: `Created new ${savingsCategory?.name} savings.`,
      });
      router.refresh();
      form.reset();
      refetchSavingsList();
    },
    onError: () => {
      toast({
        description:
          "An error occurred while creating your savings. Please try again.",
      });
    },
  });

  const onSubmit = (data: TSavingsValidator) => {
    submit({
      ...data,
    });
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="items-left flex gap-2 ">
          Start New Saving <Plus className="h-3 w-3" />{" "}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start new Saving</DialogTitle>
          <DialogDescription>
            Create a new savings to save for retirement or a specific goal.
          </DialogDescription>
        </DialogHeader>
        <SavingsForm form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
