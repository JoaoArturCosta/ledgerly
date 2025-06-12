"use client";

import { type Income, type IncomeCategory } from "@/server/db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DynamicFaIcon } from "./DynamicFaIcon";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import EditIncomeDialog from "@/components/EditIncomeDialog";

type IncomeWithCategory = Income & {
  incomeCategory: IncomeCategory;
};

interface IncomeTableProps {
  data: IncomeWithCategory[];
}

export default function IncomeTable({ data }: IncomeTableProps) {
  const router = useRouter();

  const totalIncome = data.reduce((acc, income) => {
    return acc + parseFloat(income.amount.toString());
  }, 0);

  const { mutate: deleteIncome } = api.income.delete.useMutation({
    onSuccess: () => {
      toast({
        description: "Income deleted",
      });
      router.refresh();
    },
    onError: () => {
      toast({
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Actions</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((income) => (
          <TableRow key={income.id}>
            <TableCell className=" w-10 justify-start">
              <Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        deleteIncome({
                          id: income.id,
                        });
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DialogTrigger asChild>
                      <DropdownMenuItem>View Income Details</DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <EditIncomeDialog income={income} />
              </Dialog>
            </TableCell>
            <TableCell>
              <span className="flex items-center gap-2">
                <DynamicFaIcon
                  name={income.incomeCategory.iconFaName}
                  className="h-4 w-4"
                />
                {income.incomeCategory.name}
              </span>
            </TableCell>
            <TableCell className=" text-right">
              ${parseFloat(income.amount.toString()).toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="sr-only">Actions</TableCell>
          <TableCell>Total</TableCell>
          <TableCell className="text-right">
            ${totalIncome.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
