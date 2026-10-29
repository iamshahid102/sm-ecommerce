import { LoaderCircle, ShoppingBag } from "lucide-react";

import { cn } from "@/lib/utils";

export function RouteLoading({
  label = "Loading the page...",
  fullScreen = false,
  className,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex w-full items-center justify-center px-4 py-16",
        fullScreen ? "min-h-svh" : "min-h-[58vh]",
        className,
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
          <ShoppingBag className="size-7" aria-hidden="true" />
          <span className="absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
            <LoaderCircle
              className="size-4 animate-spin text-primary"
              aria-hidden="true"
            />
          </span>
        </div>

        <p className="mt-5 font-heading text-lg font-semibold tracking-tight text-slate-950">
          Loading...
        </p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>

        <div className="mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-slate-200">
          <div className="sm-loading-bar h-full w-1/2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
