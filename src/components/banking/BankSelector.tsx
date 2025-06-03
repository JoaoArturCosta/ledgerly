"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface BankSelectorProps {
  banks: Array<{ id: string; name: string; logo?: string | null }>;
  selectedBankId: string;
  onSelectBank: (bankId: string) => void;
}

export default function BankSelector({
  banks,
  selectedBankId,
  onSelectBank,
}: BankSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-medium">Select your bank</h3>

        <RadioGroup
          value={selectedBankId}
          onValueChange={onSelectBank}
          className="space-y-2"
        >
          {banks.map((bank) => (
            <div key={bank.id} className="flex items-center space-x-2">
              <RadioGroupItem value={bank.id} id={`bank-${bank.id}`} />
              <Label
                htmlFor={`bank-${bank.id}`}
                className="flex cursor-pointer items-center"
              >
                {bank.logo ? (
                  <Image
                    src={bank.logo}
                    alt={bank.name}
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                ) : (
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
                    {bank.name.charAt(0)}
                  </div>
                )}
                <span>{bank.name}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="text-sm text-gray-600">
        <p className="mb-2">Next steps:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>You'll be redirected to your bank's website</li>
          <li>Log in to your bank account</li>
          <li>Authorize access to your transaction data</li>
          <li>Return to this app to complete the connection</li>
        </ol>
      </div>
    </div>
  );
}
