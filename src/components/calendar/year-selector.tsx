"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YearSelectorProps {
  currentYear: number;
}

export function YearSelector({ currentYear }: YearSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function navigateToYear(year: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(year));
    router.push(`/calendar?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateToYear(currentYear - 1)}
        aria-label="Previous year"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-xl font-semibold min-w-[4ch] text-center">
        {currentYear}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateToYear(currentYear + 1)}
        aria-label="Next year"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
