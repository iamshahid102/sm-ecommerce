"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/store/cart-provider";
import { useWishlist } from "@/components/store/wishlist-provider";
import { cn } from "@/lib/utils";

function buildCartItem(product, variant) {
  const variantPrice = Number(variant?.price_delta ?? 0);
  const unitPrice = Number(
    product.effective_price ?? product.discount_price ?? product.price ?? 0,
  );

  return {
    product_id: product.id,
    variant_id: variant?.id ?? null,
    product: {
      id: product.id,
      title: product.title,
      slug: product.slug,
    },
    variant: variant
      ? {
          id: variant.id,
          size: variant.size,
          color: variant.color,
        }
      : null,
    unit_price: unitPrice + variantPrice,
    image_url: product.primary_image || product.images?.[0]?.url || null,
    available_stock: variant?.stock ?? product.stock ?? 0,
  };
}

export function ProductCardActions({ product }) {
  const { addItem } = useCart();
  const {
    add: addWishlist,
    remove: removeWishlist,
    isSaved,
    isAuthenticated,
  } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const saved = isSaved(product.id);

  const variants = product.variants ?? [];
  const variant =
    variants.find((item) => item.is_active !== false && item.stock > 0) ??
    variants[0] ??
    null;
  const requiresChoice = variants.length > 1;
  const inStock = product.in_stock ?? (variant?.stock ?? product.stock) > 0;

  async function quickAdd() {
    if (!inStock || requiresChoice) return;

    setAdding(true);
    await addItem(buildCartItem(product, variant), 1);
    setAdding(false);
  }

  async function toggleWishlist() {
    if (!isAuthenticated) {
      toast.info("Sign in to save products to your wishlist.");
      return;
    }

    setWishlistPending(true);

    try {
      if (saved) {
        await removeWishlist(product.id);
        toast.success("Removed from wishlist.");
        return;
      }

      await addWishlist(product.id);
      toast.success("Saved to your wishlist.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWishlistPending(false);
    }
  }

  const quickAddClasses =
    "absolute right-3 bottom-3 flex size-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg shadow-slate-950/20 transition-all hover:bg-primary hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <button
        type="button"
        onClick={toggleWishlist}
        disabled={wishlistPending}
        className={cn(
          "absolute top-3 right-3 flex size-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-500 shadow-sm backdrop-blur transition-all hover:border-rose-200 hover:bg-white hover:text-rose-500",
          saved && "border-rose-200 text-rose-500",
        )}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={saved}
      >
        {wishlistPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Heart
            className={cn("size-4", saved && "fill-current")}
            aria-hidden="true"
          />
        )}
      </button>

      {requiresChoice ? (
        <Link
          href={`/products/${product.slug}`}
          className={quickAddClasses}
          aria-label={`Choose options for ${product.title}`}
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={quickAdd}
          disabled={!inStock || adding}
          className={quickAddClasses}
          aria-label={inStock ? `Add ${product.title} to cart` : "Out of stock"}
        >
          {adding ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ShoppingBag className="size-4" aria-hidden="true" />
          )}
        </button>
      )}
    </>
  );
}
