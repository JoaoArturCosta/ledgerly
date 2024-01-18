"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { addMonths, format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function DatePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const [month, setMonth] = useState<Date>(addMonths(new Date(), 0));

  const handleMonthChange = (month: Date) => {
    router.push(`${pathname}?month=${format(month, "MMMM/yyyy")}`);
    setMonth(month);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !month && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {month ? format(month, "MMMM yyyy") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={handleMonthChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
