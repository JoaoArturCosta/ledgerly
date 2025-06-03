"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Tag, FileText, Link2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  date: string | Date;
  description: string;
  merchantName?: string;
  category?: string;
  pending: boolean;
  synced: boolean;
  expenseId?: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onCategorize: (transactionId: string, category: string) => void;
  onCreateExpense: (
    transactionId: string,
    categoryId: string,
    notes?: string,
  ) => void;
  onLinkToExpense: (transactionId: string, expenseId: string) => void;
}

export default function TransactionsTable({
  transactions,
  isLoading = false,
  onCategorize,
  onCreateExpense,
  onLinkToExpense,
}: TransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              className={transaction.pending ? "bg-gray-50" : ""}
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {typeof transaction.date === "string"
                      ? format(new Date(transaction.date), "MMM d, yyyy")
                      : format(transaction.date, "MMM d, yyyy")}
                  </span>
                  {transaction.pending && (
                    <span className="text-xs text-amber-600">Pending</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{transaction.description}</div>
                {transaction.merchantName && (
                  <div className="text-sm text-gray-500">
                    {transaction.merchantName}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {transaction.category ? (
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                    {transaction.category}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Uncategorized</span>
                )}
              </TableCell>
              <TableCell className="text-right font-medium">
                <span
                  className={
                    transaction.amount < 0 ? "text-red-600" : "text-green-600"
                  }
                >
                  {formatCurrency(transaction.amount, "USD")}
                </span>
              </TableCell>
              <TableCell>
                <TransactionActions
                  transaction={transaction}
                  onCategorize={onCategorize}
                  onCreateExpense={onCreateExpense}
                  onLinkToExpense={onLinkToExpense}
                />
              </TableCell>
            </TableRow>
          ))}

          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface TransactionActionsProps {
  transaction: Transaction;
  onCategorize: (transactionId: string, category: string) => void;
  onCreateExpense: (
    transactionId: string,
    categoryId: string,
    notes?: string,
  ) => void;
  onLinkToExpense: (transactionId: string, expenseId: string) => void;
}

function TransactionActions({
  transaction,
  onCategorize,
  onCreateExpense,
  onLinkToExpense,
}: TransactionActionsProps) {
  // Mock function to simulate category selection
  // In a real app, you would open a modal with category selection
  const handleCategorize = () => {
    // Example - in a real app you would show a dialog to select category
    const categoryOptions = [
      "Food",
      "Housing",
      "Transportation",
      "Utilities",
      "Health",
      "Entertainment",
      "Shopping",
      "Personal",
    ];
    const randomCategory =
      categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
    onCategorize(transaction.id, randomCategory);
  };

  // Mock function to simulate creating expense
  // In a real app, you would open a modal with expense form
  const handleCreateExpense = () => {
    // Example - in a real app you would show a dialog to select category and add notes
    const categoryId = "mock-category-id"; // This would come from your category selection UI
    const notes = "Created from bank transaction"; // This would come from a form
    onCreateExpense(transaction.id, categoryId, notes);
  };

  // Mock function to simulate linking to expense
  // In a real app, you would open a modal with expense selection
  const handleLinkToExpense = () => {
    // Example - in a real app you would show a dialog to select an existing expense
    const expenseId = "mock-expense-id"; // This would come from your expense selection UI
    onLinkToExpense(transaction.id, expenseId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCategorize}>
          <Tag className="mr-2 h-4 w-4" />
          Categorize
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCreateExpense}
          disabled={transaction.synced}
        >
          <FileText className="mr-2 h-4 w-4" />
          Create Expense
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLinkToExpense}
          disabled={transaction.synced}
        >
          <Link2 className="mr-2 h-4 w-4" />
          Link to Expense
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
