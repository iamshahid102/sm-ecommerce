import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function AuthAlert({ variant = "error", title, children, className }) {
  const isSuccess = variant === "success";

  return (
    <Alert
      variant={isSuccess ? "default" : "destructive"}
      className={cn(
        isSuccess &&
          "border-emerald-200 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600",
        className,
      )}
    >
      {isSuccess ? (
        <CheckCircle2 aria-hidden="true" />
      ) : (
        <AlertCircle aria-hidden="true" />
      )}
      <AlertTitle>{title}</AlertTitle>
      {children ? <AlertDescription>{children}</AlertDescription> : null}
    </Alert>
  );
}
