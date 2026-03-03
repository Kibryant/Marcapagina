"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({ value, onChange, readOnly = false, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const display = hovered ?? value ?? 0;
  const iconSize = sizeMap[size];

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => !readOnly && setHovered(null)}
      aria-label={`Nota: ${value ?? "sem avaliação"}`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHovered(star)}
            className={cn(
              "transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95",
            )}
            aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                iconSize,
                "transition-colors duration-100",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
