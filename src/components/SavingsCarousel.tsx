"use client";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { DynamicFaIcon } from "@/components/DynamicFaIcon";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { ArrowLeft, ArrowRight, PiggyBank } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Saving } from "@/server/db/schema";

interface SavingsWithCategory extends Saving {
  savingsCategory: {
    name: string | null;
    iconFaName: string | null;
  };
  savedAmount: number;
}

interface SavingsCarouselProps {
  savings: SavingsWithCategory[];
}

export default function SavingsCarousel({ savings }: SavingsCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();

  const handleNext = () => {
    api?.scrollNext();
  };

  const handlePrevious = () => {
    api?.scrollPrev();
  };

  return (
    <div className="relative w-full overflow-y-visible ">
      <Carousel
        className="relative w-full overflow-y-visible pt-6"
        setApi={setApi}
      >
        <button
          className="absolute right-5 top-0  transform"
          onClick={handlePrevious}
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          className="absolute right-0 top-0  transform"
          onClick={handleNext}
        >
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>
        <CarouselContent>
          {savings.map((saving) => (
            <CarouselItem key={saving.id} className="basis-1/4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-end justify-between">
                    <span className="">
                      <DynamicFaIcon name={saving.savingsCategory.iconFaName} />{" "}
                    </span>

                    {saving.finalAmount! > 0 && (
                      <span className="flex gap-1 text-muted-foreground">
                        <PiggyBank className="h-4 w-4" />
                        {`$${saving.finalAmount?.toLocaleString()}`}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="pt-4">
                    <span className="font-bold text-foreground ">
                      {saving.name}
                    </span>{" "}
                    &#x2022; {saving.savingsCategory.name}
                  </CardDescription>
                  <CardContent className="p-0">
                    <div className="flex justify-start text-3xl font-bold">
                      ${saving.savedAmount.toLocaleString()}
                    </div>

                    <div
                      className={cn(
                        "flex justify-between gap-2 ",
                        saving.finalAmount! <= 0 && "invisible",
                      )}
                    >
                      <Progress
                        className="mt-2"
                        value={Math.round(
                          (saving.savedAmount / saving.finalAmount!) * 100,
                        )}
                      />
                      <span className="text-muted-foreground">
                        {Math.round(
                          (saving.savedAmount / saving.finalAmount!) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
