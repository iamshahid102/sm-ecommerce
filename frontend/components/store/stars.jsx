import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRating({ value = 0, count, className, showCount = true }) {
  const rounded = Math.round(Number(value) || 0);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "size-3.5",
              star <= rounded
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300",
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      {showCount ? (
        <span className="text-xs text-muted-foreground">
          {Number(value || 0).toFixed(1)}
          {typeof count === "number" ? ` (${count})` : ""}
        </span>
      ) : null}
    </div>
  );
}
