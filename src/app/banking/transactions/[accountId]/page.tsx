"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import TransactionsTable from "@/components/banking/TransactionsTable";

export default function BankTransactionsPage() {
  const router = useRouter();
  const params = useParams<{ accountId: string }>();
  const accountId = params.accountId;

  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Get account details
  const { data: accounts, isLoading: isLoadingAccounts } =
    api.banking.getAccounts.useQuery();
  const account = accounts?.find((acc) => acc.id === accountId);

  // Get transactions
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = api.banking.getTransactions.useInfiniteQuery(
    {
      accountId,
      limit: pageSize,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!accountId,
    },
  );

  // Sync account
  const syncMutation = api.banking.syncAccount.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Categorize transaction
  const categorizeMutation = api.banking.categorizeTransaction.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Link transaction to expense
  const linkToExpenseMutation =
    api.banking.linkTransactionToExpense.useMutation({
      onSuccess: () => {
        refetch();
      },
    });

  // Create expense from transaction
  const createExpenseMutation =
    api.banking.createExpenseFromTransaction.useMutation({
      onSuccess: () => {
        refetch();
      },
    });

  // Flatten transactions from all pages
  const transactions =
    transactionsData?.pages.flatMap((page) => page.transactions) || [];

  // Handle categorize transaction
  const handleCategorizeTransaction = (
    transactionId: string,
    category: string,
  ) => {
    categorizeMutation.mutate({ transactionId, category });
  };

  // Handle create expense
  const handleCreateExpense = (
    transactionId: string,
    categoryId: string,
    notes?: string,
  ) => {
    createExpenseMutation.mutate({ transactionId, categoryId, notes });
  };

  // Handle link to expense
  const handleLinkToExpense = (transactionId: string, expenseId: string) => {
    linkToExpenseMutation.mutate({ transactionId, expenseId });
  };

  // Handle sync account
  const handleSyncAccount = () => {
    if (accountId) {
      syncMutation.mutate({ accountId });
    }
  };

  // Handle back button
  const handleBack = () => {
    router.push("/banking");
  };

  // Loading state
  if (isLoadingAccounts) {
    return (
      <div className="container mx-auto flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  // Account not found
  if (!account) {
    return (
      <div className="container mx-auto py-10">
        <Button variant="outline" onClick={handleBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Banking
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Account Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The requested bank account was not found or you don't have access
              to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Banking
        </Button>

        <Button
          variant="outline"
          onClick={handleSyncAccount}
          disabled={syncMutation.isLoading}
        >
          {syncMutation.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Transactions
            </>
          )}
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{account.accountName}</h1>
        <p className="text-lg text-gray-600">
          {account.accountType || "Account"} · Balance:{" "}
          {account.balance != null
            ? formatCurrency(account.balance, account.currency)
            : "—"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={transactions}
            isLoading={isLoadingTransactions}
            onCategorize={handleCategorizeTransaction}
            onCreateExpense={handleCreateExpense}
            onLinkToExpense={handleLinkToExpense}
          />

          {hasNextPage && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Transactions"
                )}
              </Button>
            </div>
          )}

          {!isLoadingTransactions && transactions.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <p>No transactions found for this account.</p>
              <p className="mt-2 text-sm">
                Try syncing the account to fetch recent transactions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
