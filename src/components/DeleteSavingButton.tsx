"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { type TSavingOutput } from "@/trpc/shared";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface DeleteSavingButtonProps {
  relatedSaving: TSavingOutput;
}

export default function DeleteSavingButton({
  relatedSaving,
}: DeleteSavingButtonProps) {
  const router = useRouter();

  const { mutate: deleteSaving } = api.savings.delete.useMutation({
    onSuccess: async () => {
      toast({
        description: `Deleted ${relatedSaving?.name} from your savings.`,
      });
      router.refresh();
    },
    onError: () => {
      toast({
        description:
          "An error occurred while deleting your saving. Please try again.",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button
          variant="outline"
          className=" flex items-center gap-2 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            saving and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteSaving({ id: relatedSaving.id })}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
