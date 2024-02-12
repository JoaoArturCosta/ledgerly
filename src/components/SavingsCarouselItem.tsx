import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CarouselItem } from "@/components/ui/carousel";
import { DynamicFaIcon } from "@/components/DynamicFaIcon";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MoreVertical, PiggyBank } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ExpensesDialog } from "@/components/ExpensesDialog";
import EditSavingDialog from "@/components/EditSavingDialog";
import { SavingsWithdrawalDialog } from "@/components/SavingsWithdrawalDialog";
import { ExpensesTable } from "./DataTable/ExpensesTable";
import { SavingsColumns } from "@/components/DataTable/Definitions/SavingsColumns";
import { type TSavingOutput } from "@/trpc/shared";
import DeleteSavingButton from "@/components/DeleteSavingButton";

interface SavingsCarouselItemProps {
  saving: TSavingOutput;
}

export default function SavingsCarouselItem({
  saving,
}: SavingsCarouselItemProps) {
  const transactions = [...saving.savingWithdrawals, ...saving.expenses];

  return (
    <CarouselItem key={saving.id} className="basis-1/4">
      <Dialog>
        <DialogTrigger asChild>
          <Card className=" cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-end justify-between">
                <span className="">
                  <DynamicFaIcon name={saving.savingsCategory.iconFaName} />{" "}
                </span>
                <span className="flex gap-1 ">
                  {saving.finalAmount! > 0 && (
                    <span className="flex gap-1 text-muted-foreground">
                      <PiggyBank className="h-4 w-4" />
                      {`$${saving.finalAmount?.toLocaleString()}`}
                    </span>
                  )}
                  <span className="sr-ony">
                    <MoreVertical className="h-4 w-4" />
                  </span>
                </span>
              </CardTitle>
              <CardDescription className="pt-4">
                <span className="font-bold text-foreground ">
                  {saving.name}
                </span>{" "}
                &#x2022; {saving.savingsCategory.name}
              </CardDescription>
              <CardContent className="p-0">
                <div className="flex justify-start text-3xl font-bold">
                  ${saving.savedAmount.toLocaleString()}
                </div>

                <div
                  className={cn(
                    "flex justify-between gap-2 ",
                    saving.finalAmount! <= 0 && "invisible",
                  )}
                >
                  <Progress
                    className="mt-2"
                    value={Math.round(
                      (saving.savedAmount / saving.finalAmount!) * 100,
                    )}
                  />
                  <span className="text-muted-foreground">
                    {Math.round(
                      (saving.savedAmount / saving.finalAmount!) * 100,
                    )}
                    %
                  </span>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <div className="flex flex-col gap-2 pt-3">
            <div className="flex flex-col">
              <div className="m flex items-center justify-between gap-2">
                <span className="font-bold">{saving.name}</span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <PiggyBank className="h-4 w-4 text-primary" />$
                  {saving.finalAmount?.toLocaleString()}
                </span>
              </div>
              <span className="pt-3 text-2xl text-foreground">
                ${saving.savedAmount?.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                Current Balance
              </span>
            </div>
            <div className="flex justify-evenly pt-4">
              <ExpensesDialog
                triggerLabel="Add Money"
                savingId={saving.id.toString()}
              />
              <SavingsWithdrawalDialog relatedSaving={saving} />
              <EditSavingDialog saving={saving} />
              <DeleteSavingButton relatedSaving={saving} />
            </div>
            <ExpensesTable columns={SavingsColumns} data={transactions} />
          </div>
        </DialogContent>
      </Dialog>
    </CarouselItem>
  );
}
