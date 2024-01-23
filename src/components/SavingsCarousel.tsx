"use client";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
} from "@/components/ui/carousel";
import { useState } from "react";

import { ArrowLeft, ArrowRight } from "lucide-react";
import SavingsCarouselItem from "./SavingsCarouselItem";
import { type TSavingsOutput } from "@/trpc/shared";

interface SavingsCarouselProps {
  savings: TSavingsOutput;
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
            <SavingsCarouselItem key={saving.id} saving={saving} />
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
