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
import { Settings2 } from "lucide-react";
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
import { type Saving } from "@/server/db/schema";

interface EditSavingDialogProps {
  className?: string;
  saving: Saving;
}

export default function EditSavingDialog({
  className,
  saving,
}: EditSavingDialogProps) {
  const router = useRouter();

  const form = useForm<TSavingsValidator>({
    resolver: zodResolver(SavingsValidator),
    defaultValues: {
      name: saving.name ?? "",
      finalAmount: saving.finalAmount
        ? parseFloat(saving.finalAmount.toString())
        : undefined,
      startingAmount: parseFloat(saving.startingAmount?.toString() ?? "0"),
      savingsCategoryId: saving.savingsCategoryId.toString(),
      endDate: saving.endDate ?? undefined,
    },
  });

  const { mutate: submit } = api.savings.create.useMutation({
    onSuccess: async ({ savingsCategory }) => {
      toast({
        description: `Updated ${savingsCategory?.name} .`,
      });
      router.refresh();
      form.reset();
    },
    onError: () => {
      toast({
        description:
          "An error occurred while updating your savings. Please try again.",
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
      <DialogTrigger className={className} asChild>
        <Button variant="outline" className="items-left flex gap-2 ">
          <Settings2 className="h-3 w-3" /> Manage
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {saving.name}</DialogTitle>
          <DialogDescription>Update your savings details</DialogDescription>
        </DialogHeader>
        <SavingsForm buttonLabel="Save" form={form} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
}
