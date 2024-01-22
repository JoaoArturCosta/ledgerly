"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { DynamicFaIcon } from "@/components/DynamicFaIcon";
import CreateSavingDialog from "@/components/CreateSavingDialog";
import { useState } from "react";
import { toast } from "./ui/use-toast";

interface SavingsDrawerProps {
  handleRelatedSavingId: (id: string) => void;
}

export default function SavingsDrawer({
  handleRelatedSavingId,
}: SavingsDrawerProps) {
  const { data: savings, refetch } = api.savings.getAllSavings.useQuery();

  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Add to Savings or Goal</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add to Savings or Goal</DrawerTitle>
            <DrawerDescription>
              Add this expense to one of your savings or goal.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex items-center gap-6 px-4">
            <CreateSavingDialog refetchSavingsList={refetch} />
          </div>
          <div className="flex flex-col gap-2 p-4">
            {savings?.map((saving) => (
              <div
                key={saving.id}
                className="flex items-center justify-between rounded-lg bg-primary  p-4"
                role="presentation"
                onClick={() => {
                  handleRelatedSavingId(saving.id.toString());
                  setOpen(false);
                  toast({
                    description: `${saving.name} selected`,
                  });
                }}
              >
                <div className="flex items-center gap-6 text-secondary">
                  <DynamicFaIcon name={saving.savingsCategory.iconFaName} />
                  <span className=" font-bold ">{saving.name}</span>
                </div>
                <span className="text-secondary">
                  ${saving.finalAmount?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
