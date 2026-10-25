"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

export function AdminDeleteButton({
  endpoint,
  label = "Delete",
  confirmText = "Delete this record? This cannot be undone.",
  redirectTo,
  size = "sm",
  variant = "ghost",
  className = "text-destructive hover:text-destructive",
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!window.confirm(confirmText)) return;

    setPending(true);
    try {
      await apiFetch(endpoint, { method: "DELETE" });
      toast.success("Deleted successfully.");
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (error) {
      const details = Array.isArray(error?.details)
        ? error.details.map((item) => item.message).join(" ")
        : "";
      toast.error(details || error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={remove}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Trash2 className="size-3.5" aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}
