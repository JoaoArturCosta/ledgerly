import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { type Saving } from "@/server/db/schema";
import { FormControl } from "./ui/form";

// Extend the Saving type to include the computed savedAmount property
type SavingWithComputedProps = Saving & {
  savedAmount?: number;
};

interface SelectSavingsProps {
  savingsList?: SavingWithComputedProps[];
  label?: string;
  onValueChange: (value: string) => void;
  defaultValue: string;
  placeholder?: string;
}

const SelectSavings = ({
  savingsList,
  label = "saving",
  onValueChange,
  defaultValue,
  placeholder,
}: SelectSavingsProps) => {
  if (!savingsList) return null;

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder={placeholder ?? `Select ${label}`} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {savingsList.map((saving) => {
          // Try to get the amount - either from savedAmount or fallback to depositedAmount
          const displayAmount =
            saving.savedAmount ??
            (saving.depositedAmount ?? 0) + (saving.startingAmount ?? 0);

          return (
            <SelectItem key={saving.id} value={saving.id.toString()}>
              {saving.name} (${displayAmount.toLocaleString()})
              <span className="sr-only">{saving.name}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default SelectSavings;
