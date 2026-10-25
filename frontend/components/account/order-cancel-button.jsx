"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

export function OrderCancelButton({ orderId }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function cancelOrder() {
    if (
      !window.confirm(
        "Cancel this order? Stock will be released and this action cannot be undone.",
      )
    ) {
      return;
    }

    setPending(true);
    try {
      await apiFetch(`/orders/${orderId}/cancel`, { method: "POST" });
      toast.success("Order cancelled.");
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
      variant="outline"
      className="text-destructive hover:text-destructive"
      onClick={cancelOrder}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <XCircle className="size-4" aria-hidden="true" />
      )}
      Cancel order
    </Button>
  );
}
