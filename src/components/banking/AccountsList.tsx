"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/formatters";
import { CreditCard, ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";

interface Account {
  id: string;
  accountName: string;
  accountType?: string;
  balance?: number | null;
  currency: string;
  connectionId: string;
}

interface AccountsListProps {
  accounts: Account[];
}

export default function AccountsList({ accounts }: AccountsListProps) {
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(
    null,
  );

  const toggleAccount = (accountId: string) => {
    setExpandedAccountId(expandedAccountId === accountId ? null : accountId);
  };

  if (accounts.length === 0) {
    return <p className="italic text-gray-500">No accounts found</p>;
  }

  return (
    <div className="space-y-3">
      {accounts.map((account) => (
        <div key={account.id} className="overflow-hidden rounded-lg border">
          {/* Account summary */}
          <div
            className="flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50"
            onClick={() => toggleAccount(account.id)}
          >
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0 rounded-full bg-indigo-100 p-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">{account.accountName}</p>
                <p className="text-xs text-gray-500">
                  {account.accountType || "Account"}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-2 text-right">
                <p className="font-medium">
                  {account.balance != null
                    ? formatCurrency(account.balance, account.currency)
                    : "—"}
                </p>
                <p className="text-xs text-gray-500">Balance</p>
              </div>
              {expandedAccountId === account.id ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Expanded details */}
          {expandedAccountId === account.id && (
            <div className="border-t bg-gray-50 p-3">
              <Link
                href={`/banking/transactions/${account.id}`}
                className="block text-sm font-medium text-indigo-600 hover:underline"
              >
                View Transactions
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
