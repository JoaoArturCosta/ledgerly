"use client";

import { Button } from "@/components/ui/button";
import { type SavingsWithdrawal, type Expense } from "@/server/db/schema";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const SavingsColumns: ColumnDef<SavingsWithdrawal | Expense>[] = [
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
      }).format(date);

      return <div className="pr-4">{formatted}</div>;
    },
  },

  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          className="flex w-[100%] items-center justify-end"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="pr-4 text-right font-medium">{formatted}</div>;
    },
  },
];
