"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldBan, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

export function CustomerBlockButton({
  customerId,
  isBlocked,
  disabled = false,
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !isBlocked;
    if (
      next &&
      !window.confirm(
        "Block this customer? They will not be able to sign in or place orders.",
      )
    ) {
      return;
    }

    setPending(true);
    try {
      await apiFetch(`/admin/customers/${customerId}/block`, {
        method: "PATCH",
        body: { is_blocked: next },
      });
      toast.success(next ? "Customer blocked." : "Customer unblocked.");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant={isBlocked ? "outline" : "ghost"}
      size="sm"
      className={isBlocked ? "" : "text-destructive hover:text-destructive"}
      onClick={toggle}
      disabled={pending || disabled}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : isBlocked ? (
        <ShieldCheck className="size-3.5" aria-hidden="true" />
      ) : (
        <ShieldBan className="size-3.5" aria-hidden="true" />
      )}
      {isBlocked ? "Unblock" : "Block"}
    </Button>
  );
}
