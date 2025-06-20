"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { addMonths, format, parse } from "date-fns";

import { cn } from "@/lib/utils";
import {
  createTimezoneNeutralDate,
  getCurrentMonthTimezoneNeutralDate,
} from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DatePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [month, setMonth] = useState<Date>(() => {
    if (searchParams.has("month")) {
      // Parse the "MMMM/yyyy" format properly
      const monthParam = searchParams.get("month")!;
      const parsedDate = parse(monthParam, "MMMM/yyyy", new Date());
      // Set to noon to avoid timezone issues
      return createTimezoneNeutralDate(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        1,
      );
    }
    // Set to noon to avoid timezone issues
    return getCurrentMonthTimezoneNeutralDate();
  });

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
          className="month-picker"
          classNames={{
            table: "hidden", // Hide the days table
            caption:
              "flex justify-center pt-4 pb-4 relative items-center px-12",
            nav_button_previous: "absolute left-2",
            nav_button_next: "absolute right-2",
            caption_label: "text-sm font-medium mx-4",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
