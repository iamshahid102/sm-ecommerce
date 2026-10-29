"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/store/cart-provider";
import { useWishlist } from "@/components/store/wishlist-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductPurchasePanel({ product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const {
    add: addWishlist,
    remove: removeWishlist,
    isSaved,
    isAuthenticated,
  } = useWishlist();
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);
  const saved = isSaved(product.id);

  const selectedVariant = useMemo(
    () => product.variants?.find((variant) => variant.id === variantId) ?? null,
    [product.variants, variantId],
  );

  const basePrice = Number(product.discount_price ?? product.price);
  const unitPrice = basePrice + Number(selectedVariant?.price_delta ?? 0);
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const inStock = stock > 0;

  function buildItem() {
    return {
      product_id: product.id,
      variant_id: selectedVariant?.id ?? null,
      product: {
        id: product.id,
        title: product.title,
        slug: product.slug,
      },
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            size: selectedVariant.size,
            color: selectedVariant.color,
          }
        : null,
      unit_price: unitPrice,
      image_url: product.primary_image,
      available_stock: stock,
    };
  }

  async function handleAdd() {
    setPending(true);
    await addItem(buildItem(), quantity);
    setPending(false);
  }

  async function handleBuyNow() {
    setPending(true);
    const added = await addItem(buildItem(), quantity);
    setPending(false);
    if (added) router.push("/checkout");
  }

  async function handleWishlist() {
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

  return (
    <div className="space-y-5">
      {product.variants?.length > 0 ? (
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Choose an option
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const label = [variant.size, variant.color]
                .filter(Boolean)
                .join(" / ");
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    setVariantId(variant.id);
                    setQuantity(1);
                  }}
                  disabled={variant.stock <= 0}
                  className={[
                    "rounded-full border px-4 py-2 text-sm transition-colors",
                    variant.id === variantId
                      ? "border-primary bg-secondary font-medium text-primary"
                      : "bg-background hover:bg-muted",
                    variant.stock <= 0
                      ? "cursor-not-allowed line-through opacity-50"
                      : "",
                  ].join(" ")}
                >
                  {label || "Default"}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div>
          <p className="text-xs text-slate-500">Total price</p>
          <p className="font-heading text-2xl font-semibold text-slate-950">
            {formatCurrency(unitPrice * quantity)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatCurrency(unitPrice)} each
          </p>
        </div>
        <div className="ml-auto">
          <p className="mb-1 text-right text-xs text-slate-500">Quantity</p>
          <div className="flex items-center rounded-full border border-slate-200 bg-white">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setQuantity((value) => Math.min(stock || 99, value + 1))
              }
              disabled={quantity >= (stock || 99)}
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          size="lg"
          className="h-12 flex-1 rounded-full bg-slate-950 text-sm font-semibold shadow-lg shadow-slate-950/10 hover:bg-primary"
          onClick={handleAdd}
          disabled={!inStock || pending}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ShoppingBag className="size-4" aria-hidden="true" />
          )}
          Add to cart
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 flex-1 rounded-full border-slate-300 text-sm font-semibold"
          onClick={handleBuyNow}
          disabled={!inStock || pending}
        >
          Buy now
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className={cn(
            "size-12 rounded-full border-slate-300 p-0",
            saved &&
              "border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-50 hover:text-rose-500",
          )}
          onClick={handleWishlist}
          disabled={wishlistPending}
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
        </Button>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        {inStock
          ? `${stock} in stock. Cash on Delivery is available at checkout.`
          : "This option is currently out of stock."}
      </p>
    </div>
  );
}
