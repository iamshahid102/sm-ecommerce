"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Banknote,
  Loader2,
  MapPin,
  Plus,
  Tag,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  AddressForm,
  apiErrorMessage,
} from "@/components/account/address-form";
import { useCart } from "@/components/store/cart-provider";
import { StoreImage } from "@/components/store/store-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";

function round(value) {
  return Number(Number(value).toFixed(2));
}

export function CheckoutForm({ initialAddresses, initialCart, profile }) {
  const router = useRouter();
  const { refresh } = useCart();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [addressId, setAddressId] = useState(
    initialAddresses.find((address) => address.is_default)?.id ??
      initialAddresses[0]?.id ??
      "",
  );
  const [addressDialog, setAddressDialog] = useState(
    initialAddresses.length === 0,
  );
  const [addressPending, setAddressPending] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponPending, setCouponPending] = useState(false);
  const [customerNote, setCustomerNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    const summary = initialCart.summary;
    const discount = Number(coupon?.discount ?? 0);
    const taxRate = Number(summary.tax_percent ?? 0) / 100;
    const tax = round(
      Math.max(0, Number(summary.subtotal) - discount) * taxRate,
    );

    return {
      subtotal: Number(summary.subtotal),
      shipping: Number(summary.shipping_fee),
      tax,
      discount,
      total: round(
        Number(summary.subtotal) -
          discount +
          Number(summary.shipping_fee) +
          tax,
      ),
    };
  }, [coupon, initialCart.summary]);

  async function createAddress(values) {
    setAddressPending(true);
    try {
      const address = await apiFetch("/addresses", {
        method: "POST",
        body: values,
      });
      setAddresses((current) => [
        address,
        ...current.map((item) =>
          address.is_default ? { ...item, is_default: false } : item,
        ),
      ]);
      setAddressId(address.id);
      setAddressDialog(false);
      toast.success("Address saved.");
    } catch (submitError) {
      toast.error(apiErrorMessage(submitError));
    } finally {
      setAddressPending(false);
    }
  }

  async function applyCoupon(event) {
    event.preventDefault();
    if (!couponCode.trim()) return;

    setCouponPending(true);
    setError("");
    try {
      const result = await apiFetch("/coupons/validate", {
        method: "POST",
        body: {
          code: couponCode.trim(),
          subtotal: Number(initialCart.summary.subtotal),
        },
      });
      setCoupon(result);
      setCouponCode(result.coupon.code);
      toast.success("Coupon applied.");
    } catch (couponError) {
      setCoupon(null);
      toast.error(apiErrorMessage(couponError));
    } finally {
      setCouponPending(false);
    }
  }

  async function placeOrder(event) {
    event.preventDefault();
    setError("");

    if (!addressId) {
      setError("Choose a delivery address before placing the order.");
      return;
    }

    setPending(true);
    try {
      const order = await apiFetch("/orders", {
        method: "POST",
        body: {
          address_id: addressId,
          shipping_method: "standard",
          payment_method: "cod",
          coupon_code: coupon?.coupon?.code ?? null,
          customer_note: customerNote || null,
        },
      });
      await refresh();
      toast.success("Order placed. Thank you!");
      router.push(`/account/orders/${order.id}?placed=1`);
      router.refresh();
    } catch (submitError) {
      setError(apiErrorMessage(submitError));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setPending(false);
    }
  }

  const selectedAddress = addresses.find((address) => address.id === addressId);

  return (
    <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Order could not be placed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="rounded-2xl shadow-none">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              Delivery address
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddressDialog(true)}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add new
            </Button>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="text-sm font-medium">No delivery address yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add an address to continue with checkout.
                </p>
                <Button
                  type="button"
                  className="mt-3"
                  onClick={() => setAddressDialog(true)}
                >
                  Add address
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={[
                      "cursor-pointer rounded-xl border p-4 transition-colors",
                      address.id === addressId
                        ? "border-primary bg-secondary/50 ring-1 ring-primary"
                        : "hover:bg-muted/50",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={address.id === addressId}
                        onChange={() => setAddressId(address.id)}
                        className="mt-1 size-4"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          {address.full_name}
                          {address.is_default ? (
                            <Badge variant="secondary" className="ml-2">
                              Default
                            </Badge>
                          ) : null}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {address.address_line1}
                          {address.address_line2
                            ? `, ${address.address_line2}`
                            : ""}
                          <br />
                          {address.city}, {address.state}
                          {address.postal_code ? ` ${address.postal_code}` : ""}
                          <br />
                          {address.phone}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-4 text-primary" aria-hidden="true" />
              Delivery method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary bg-secondary/40 p-4">
              <input
                type="radio"
                name="shipping_method"
                value="standard"
                defaultChecked
                className="mt-1 size-4"
              />
              <div>
                <p className="text-sm font-semibold">Standard delivery</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Dispatched within 1-2 working days. The delivery fee is
                  calculated in the order summary and is free above the store
                  threshold.
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="size-4 text-primary" aria-hidden="true" />
              Payment method
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary bg-secondary/40 p-4">
              <input
                type="radio"
                name="payment_method"
                value="cod"
                defaultChecked
                className="mt-1 size-4"
              />
              <div>
                <p className="text-sm font-semibold">Cash on Delivery</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Pay in cash when your order is delivered. Card payments are
                  intentionally disabled until a supported payment provider is
                  connected.
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-4 text-primary" aria-hidden="true" />
              Coupon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    {coupon.coupon.code}
                  </p>
                  <p className="text-xs text-emerald-700">
                    Saving {formatCurrency(coupon.discount)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setCoupon(null);
                    setCouponCode("");
                  }}
                  aria-label="Remove coupon"
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(event) =>
                    setCouponCode(event.target.value.toUpperCase())
                  }
                  placeholder="Enter coupon code"
                  maxLength={30}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={couponPending || !couponCode.trim()}
                >
                  {couponPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Apply
                </Button>
              </div>
            )}
            <div>
              <Label htmlFor="customer-note">Order note (optional)</Label>
              <Textarea
                id="customer-note"
                value={customerNote}
                onChange={(event) => setCustomerNote(event.target.value)}
                placeholder="Delivery instructions or anything we should know."
                maxLength={1000}
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <aside>
        <Card className="sticky top-32 rounded-2xl border-slate-200/80 shadow-card">
          <CardHeader>
            <CardTitle>Your order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {initialCart.items.map((line) => (
                <div key={line.id} className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <StoreImage
                      src={line.image_url}
                      alt={line.product?.title || "Product"}
                      className="h-full w-full"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-medium">
                      {line.product?.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Qty {line.quantity} × {formatCurrency(line.unit_price)}
                    </p>
                  </div>
                  <p className="text-xs font-semibold">
                    {formatCurrency(line.line_total)}
                  </p>
                </div>
              ))}
            </div>

            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {totals.shipping === 0
                    ? "Free"
                    : formatCurrency(totals.shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              {totals.discount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>−{formatCurrency(totals.discount)}</span>
                </div>
              ) : null}
            </div>
            <Separator />
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="font-heading text-xl font-semibold">
                {formatCurrency(totals.total)}
              </span>
            </div>

            {selectedAddress ? (
              <div className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Deliver to</p>
                <p className="mt-1">
                  {selectedAddress.full_name} · {selectedAddress.phone}
                </p>
                <p>
                  {selectedAddress.address_line1}, {selectedAddress.city}
                </p>
              </div>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-full bg-slate-950 hover:bg-primary"
              disabled={pending || addresses.length === 0}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <BadgeCheck className="size-4" aria-hidden="true" />
              )}
              Place order · {formatCurrency(totals.total)}
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              By placing the order you agree to the store&apos;s delivery and
              return policy. You will pay cash on delivery.
            </p>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/cart">Back to cart</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>

      <Dialog open={addressDialog} onOpenChange={setAddressDialog}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add a delivery address</DialogTitle>
            <DialogDescription>
              We only use this address to deliver your order.
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            initialValue={{
              full_name: profile?.full_name || "",
              phone: profile?.phone || "",
            }}
            onSubmit={createAddress}
            pending={addressPending}
            submitLabel="Save and use this address"
            onCancel={() => setAddressDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </form>
  );
}
