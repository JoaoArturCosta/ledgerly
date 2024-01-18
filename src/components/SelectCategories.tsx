import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { type IncomeCategory } from "@/server/db/schema";
import { FormControl } from "./ui/form";

interface SelectCategoriesProps {
  categoriesList?: IncomeCategory[];
  label?: string;
  onValueChange: (value: string) => void;
  defaultValue: string;
}

const SelectCategories = ({
  categoriesList,
  label = "category",
  onValueChange,
  defaultValue,
}: SelectCategoriesProps) => {
  if (!categoriesList) return null;

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {categoriesList?.map((category) => (
          <SelectItem key={category.id} value={category.id.toString()}>
            {category.name}
            <span className="sr-only">{category.name}</span>
            <span className="sr-only">category</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectCategories;
