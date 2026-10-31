import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Download,
  MapPin,
  Package,
  Truck,
} from "lucide-react";

import { OrderCancelButton } from "@/components/account/order-cancel-button";
import { OrderReviewForm } from "@/components/account/order-review-form";
import { StoreImage } from "@/components/store/store-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireCustomer } from "@/lib/auth/dal";
import {
  PAYMENT_STATUS_LABELS,
  paymentMethodLabel,
  statusLabel,
  statusStyle,
} from "@/lib/commerce";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata = {
  title: "Order details",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const placed = query.placed === "1";
  const { supabase } = await requireCustomer(`/account/orders/${id}`);
  const token = await getAccessToken(supabase);

  let order;
  let reviews = [];

  try {
    [order, reviews] = await Promise.all([
      apiFetchServer(`/orders/${id}`, { token }),
      apiFetchServer("/reviews", { token }).catch(() => []),
    ]);
  } catch (error) {
    if (error.status === 404) notFound();

    return (
      <Alert variant="destructive">
        <AlertTitle>Order could not load</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  const reviewedProducts = new Set(reviews.map((review) => review.product_id));
  const address = order.shipping_address || {};
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const history = [...(order.history ?? [])];

  return (
    <div className="space-y-6">
      {placed ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          <AlertTitle>Order placed successfully</AlertTitle>
          <AlertDescription>
            We have received your order. Keep your order number handy and pay
            cash when it arrives.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {order.order_number}
            </h1>
            <Badge variant="outline" className={statusStyle(order.status)}>
              {statusLabel(order.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {formatDate(order.created_at)} ·{" "}
            {paymentMethodLabel(order.payment_method)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a
              href={`/account/orders/${order.id}/invoice`}
              download
              aria-label={`Download invoice for ${order.order_number}`}
            >
              <Download className="size-4" aria-hidden="true" />
              Download invoice
            </a>
          </Button>
          {canCancel ? <OrderCancelButton orderId={order.id} /> : null}
          <Button asChild variant="outline">
            <Link href="/account/orders">Back to orders</Link>
          </Button>
        </div>
      </div>

      {order.tracking_number ? (
        <div className="flex items-center gap-2 rounded-xl border bg-card p-3 text-sm">
          <Truck className="size-4 text-primary" aria-hidden="true" />
          Tracking: <span className="font-medium">{order.tracking_number}</span>
          {order.courier ? (
            <span className="text-muted-foreground">via {order.courier}</span>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-4 text-primary" aria-hidden="true" />
                Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border bg-muted">
                    <StoreImage
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.variant_label ? `${item.variant_label} · ` : ""}
                      {item.sku ? `SKU ${item.sku} · ` : ""}
                      Qty {item.quantity}
                    </p>
                    {order.status === "delivered" &&
                    !reviewedProducts.has(item.product_id) ? (
                      <OrderReviewForm
                        orderId={order.id}
                        productId={item.product_id}
                        productTitle={item.title}
                      />
                    ) : null}
                    {order.status === "delivered" &&
                    reviewedProducts.has(item.product_id) ? (
                      <p className="mt-2 text-xs text-emerald-700">
                        Review submitted
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(item.line_total)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                Delivery address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">{address.full_name}</p>
              <p>{address.phone}</p>
              <p className="mt-1">
                {address.address_line1}
                {address.address_line2 ? `, ${address.address_line2}` : ""}
              </p>
              <p>
                {[address.city, address.state, address.postal_code]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p>{address.country || "PK"}</p>
            </CardContent>
          </Card>

          {order.customer_note ? (
            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Your note</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                {order.customer_note}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-6">
          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {Number(order.shipping_fee) === 0
                    ? "Free"
                    : formatCurrency(order.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              {Number(order.discount) > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span>
                    Discount {order.coupon_code ? `(${order.coupon_code})` : ""}
                  </span>
                  <span>−{formatCurrency(order.discount)}</span>
                </div>
              ) : null}
              <Separator />
              <div className="flex items-end justify-between pt-1">
                <span className="font-medium">Total</span>
                <span className="font-heading text-xl font-semibold">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
                Payment:{" "}
                <span className="font-medium text-foreground">
                  {PAYMENT_STATUS_LABELS[order.payment_status] ||
                    order.payment_status}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle>Order timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {history.map((entry, index) => (
                  <li key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 flex size-2.5 rounded-full bg-primary" />
                      {index < history.length - 1 ? (
                        <span className="my-1 w-px flex-1 bg-border" />
                      ) : null}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-medium">
                        {statusLabel(entry.status)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </p>
                      {entry.note ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.note}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full">
            <Link href="/contact">
              Need help with this order?
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
