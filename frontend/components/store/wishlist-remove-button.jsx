"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

export function WishlistRemoveButton({ productId }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    try {
      await apiFetch(`/wishlist/${productId}`, { method: "DELETE" });
      toast.success("Removed from wishlist.");
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
      variant="ghost"
      size="icon-sm"
      className="absolute top-2 right-2 bg-background/90 text-muted-foreground shadow-sm hover:text-destructive"
      onClick={remove}
      disabled={pending}
      aria-label="Remove from wishlist"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <X className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
