"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { useWishlist } from "@/components/store/wishlist-provider";
import { Button } from "@/components/ui/button";

export function WishlistRemoveButton({ productId }) {
  const router = useRouter();
  const { remove } = useWishlist();
  const [pending, setPending] = useState(false);

  async function removeItem() {
    setPending(true);
    try {
      await remove(productId);
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
      onClick={removeItem}
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
