import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, UserRound } from "lucide-react";

import { AdminOrderPanel } from "@/components/admin/admin-order-panel";
import { StoreImage } from "@/components/store/store-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";
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

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let order;

  try {
    order = await apiFetchServer(`/admin/orders/${id}`, { token });
  } catch (error) {
    if (error.status === 404) notFound();

    return (
      <Alert variant="destructive">
        <AlertTitle>Order could not load</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  const address = order.shipping_address || {};

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 print:hidden">
          <Link href="/admin/orders">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to orders
          </Link>
        </Button>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold">
                {order.order_number}
              </h1>
              <Badge variant="outline" className={statusStyle(order.status)}>
                {statusLabel(order.status)}
              </Badge>
              <Badge variant="outline">
                {PAYMENT_STATUS_LABELS[order.payment_status] ||
                  order.payment_status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.created_at)} ·{" "}
              {paymentMethodLabel(order.payment_method)}
            </p>
          </div>
          {order.user_id ? (
            <Button asChild variant="outline" size="sm" className="print:hidden">
              <Link href={`/admin/customers/${order.user_id}`}>
                <UserRound className="size-4" aria-hidden="true" />
                View customer
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle>Items</CardTitle>
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
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.variant_label ? `${item.variant_label} · ` : ""}
                      {item.sku ? `SKU ${item.sku} · ` : ""}
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>
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
              <CardTitle>Customer and delivery</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <UserRound className="size-4 text-primary" aria-hidden="true" />
                  {order.customer_name}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" aria-hidden="true" />
                  {order.customer_email}
                </p>
                {address.phone ? (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" aria-hidden="true" />
                    {address.phone}
                  </p>
                ) : null}
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <MapPin className="size-4 text-primary" aria-hidden="true" />
                  Shipping address
                </p>
                <p className="mt-2">{address.address_line1}</p>
                {address.address_line2 ? <p>{address.address_line2}</p> : null}
                <p>
                  {[address.city, address.state, address.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p>{address.country || "PK"}</p>
              </div>
            </CardContent>
          </Card>

          {order.customer_note ? (
            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle className="text-base">Customer note</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {order.customer_note}
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle>Status history</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {(order.history ?? []).map((entry, index) => (
                  <li key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="mt-1.5 flex size-2.5 rounded-full bg-primary" />
                      {index < (order.history?.length ?? 0) - 1 ? (
                        <span className="my-1 w-px flex-1 bg-border" />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {statusLabel(entry.status)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)} · {entry.actor_role}
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
                <span>{formatCurrency(order.shipping_fee)}</span>
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
              <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                <p>
                  Payment:{" "}
                  <span className="font-medium text-foreground">
                    {paymentMethodLabel(order.payment_method)}
                  </span>
                </p>
                <p className="mt-1">
                  Status:{" "}
                  <span className="font-medium text-foreground">
                    {PAYMENT_STATUS_LABELS[order.payment_status] ||
                      order.payment_status}
                  </span>
                </p>
                {order.payment?.amount ? (
                  <p className="mt-1">Amount: {formatCurrency(order.payment.amount)}</p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="print:hidden">
            <AdminOrderPanel order={order} />
          </div>
        </aside>
      </div>
    </div>
  );
}
