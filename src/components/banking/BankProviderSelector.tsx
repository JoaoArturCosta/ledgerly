"use client";

import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BankProviderSelectorProps {
  providers: Array<{ id: string; name: string }>;
  selectedProvider: string;
  onSelectProvider: (providerId: string) => void;
  isLoading?: boolean;
}

export default function BankProviderSelector({
  providers,
  selectedProvider,
  onSelectProvider,
  isLoading = false,
}: BankProviderSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="provider-select"
          className="mb-2 block text-sm font-medium"
        >
          Select your banking provider
        </label>
        <Select value={selectedProvider} onValueChange={onSelectProvider}>
          <SelectTrigger id="provider-select" className="w-full">
            <SelectValue placeholder="Select a provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-gray-600">
        <p className="mb-2">By connecting your bank account:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>We'll import your transactions for expense tracking</li>
          <li>We can only read your transaction data</li>
          <li>We cannot move money or make changes to your account</li>
          <li>You can disconnect at any time</li>
        </ul>
      </div>
    </div>
  );
}
