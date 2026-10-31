"use client";

import Link from "next/link";
import { ArrowRight, Loader2, ShoppingBag, Trash2, Truck } from "lucide-react";

import { useCart } from "@/components/store/cart-provider";
import { StoreImage } from "@/components/store/store-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const {
    items,
    summary,
    count,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    updateQuantity,
    removeItem,
    clear,
  } = useCart();

  if (isAdmin) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Alert>
          <AlertTitle>Administrator account</AlertTitle>
          <AlertDescription>
            Administrator accounts cannot place customer orders. Open the admin
            workspace to manage the store.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-5">
          <Link href="/admin">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2
          className="size-6 animate-spin text-primary"
          aria-label="Loading cart"
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="rounded-3xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <ShoppingBag className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-heading text-2xl font-semibold">
              Your cart is empty
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Browse the collection and add something you like. Your cart stays
              saved on this device, and syncs to your account after sign-in.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">
                Start shopping
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const threshold = Number(summary.free_shipping_threshold ?? 0);
  const remaining = Math.max(0, threshold - Number(summary.subtotal));
  const progress =
    threshold > 0 ? Math.min(100, (summary.subtotal / threshold) * 100) : 100;

  return (
    <div className="store-container py-9 sm:py-11">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
            Your bag
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-[-0.02em] text-slate-950">
            Shopping cart
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {count} item{count === 1 ? "" : "s"} ready for checkout.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full text-slate-500"
          onClick={() => {
            if (window.confirm("Remove every item from your cart?")) clear();
          }}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Clear cart
        </Button>
      </div>

      {error ? (
        <Alert className="mt-5" variant="destructive">
          <AlertTitle>Cart could not sync</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((line) => (
            <Card
              key={line.id}
              className="gap-0 overflow-hidden rounded-2xl border-slate-200/80 py-0 shadow-soft"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <Link
                  href={`/products/${line.product?.slug}`}
                  className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted"
                >
                  <StoreImage
                    src={line.image_url}
                    alt={line.product?.title || "Product"}
                    className="h-full w-full"
                    sizes="96px"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${line.product?.slug}`}
                    className="line-clamp-1 text-sm font-semibold hover:text-primary"
                  >
                    {line.product?.title || "Product"}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[line.variant?.size, line.variant?.color]
                      .filter(Boolean)
                      .join(" / ") || "Standard"}
                  </p>
                  <p className="mt-2 text-sm font-medium">
                    {formatCurrency(line.unit_price)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      each
                    </span>
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-full border border-slate-200 bg-white">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(line, line.quantity - 1)}
                      disabled={line.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => updateQuantity(line, line.quantity + 1)}
                      disabled={line.quantity >= (line.available_stock || 99)}
                      aria-label="Increase quantity"
                    >
                      +
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">
                      {formatCurrency(line.line_total)}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(line)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <aside>
          <Card className="sticky top-32 rounded-2xl border-slate-200/80 shadow-card">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(summary.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {Number(summary.shipping_fee) === 0
                    ? "Free"
                    : formatCurrency(summary.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">
                  {formatCurrency(summary.tax)}
                </span>
              </div>
              {Number(summary.discount) > 0 ? (
                <div className="flex justify-between text-sm text-emerald-700">
                  <span>Discount</span>
                  <span>−{formatCurrency(summary.discount)}</span>
                </div>
              ) : null}
              <Separator />
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="font-heading text-xl font-semibold">
                  {formatCurrency(summary.total)}
                </span>
              </div>

              {threshold > 0 ? (
                <div className="rounded-xl bg-secondary/60 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-secondary-foreground">
                    <Truck className="size-3.5" aria-hidden="true" />
                    {remaining > 0
                      ? `${formatCurrency(remaining)} away from free shipping`
                      : "Free shipping unlocked"}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-full bg-slate-950 hover:bg-primary"
              >
                <Link
                  href={isAuthenticated ? "/checkout" : "/login?next=/checkout"}
                >
                  {isAuthenticated
                    ? "Proceed to checkout"
                    : "Sign in to checkout"}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                Coupons can be applied on the checkout page. Cash on Delivery is
                available.
              </p>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/products">Continue shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
