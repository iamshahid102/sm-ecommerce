import Link from "next/link";
import { Package } from "lucide-react";

import { StoreImage } from "@/components/store/store-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetchServerFull } from "@/lib/api/server";
import { getAccessToken, requireCustomer } from "@/lib/auth/dal";
import { statusLabel, statusStyle } from "@/lib/commerce";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata = {
  title: "My orders",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

export default async function AccountOrdersPage({ searchParams }) {
  const { supabase } = await requireCustomer("/account/orders");
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const status = Array.isArray(raw.status) ? raw.status[0] : raw.status || "all";
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page || "1";

  let payload = null;
  let error = null;

  try {
    payload = await apiFetchServerFull(
      `/orders?status=${encodeURIComponent(status)}&page=${encodeURIComponent(page)}&limit=10`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const orders = payload?.data ?? [];
  const meta = payload?.meta;
  const activeStatus = FILTERS.some((filter) => filter.value === status)
    ? status
    : "all";

  function hrefFor(nextStatus, nextPage = 1) {
    return `/account/orders?status=${nextStatus}&page=${nextPage}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            History
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
            My orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View every order, its delivery status, and available actions.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.value}
            asChild
            size="sm"
            variant={activeStatus === filter.value ? "default" : "outline"}
          >
            <Link href={hrefFor(filter.value)}>{filter.label}</Link>
          </Button>
        ))}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Orders could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && orders.length === 0 ? (
        <Card className="rounded-3xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <Package className="mx-auto size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-xl font-semibold">
              No orders found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Orders matching this filter will appear here.
            </p>
            <Button asChild className="mt-5">
              <Link href="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="gap-0 rounded-2xl py-0 shadow-none">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-base font-semibold">
                      {order.order_number}
                    </p>
                    <Badge variant="outline" className={statusStyle(order.status)}>
                      {statusLabel(order.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Placed {formatDate(order.created_at)} · {order.items?.length ?? 0}{" "}
                    item{(order.items?.length ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-semibold">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {order.payment_method === "cod"
                      ? "Cash on Delivery"
                      : order.payment_method}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {(order.items ?? []).slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="relative size-12 overflow-hidden rounded-lg border bg-muted"
                  >
                    <StoreImage
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full"
                      sizes="48px"
                    />
                  </div>
                ))}
                <div className="ml-auto">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/account/orders/${order.id}`}>
                      View details
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {meta && meta.totalPages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {meta.page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={hrefFor(activeStatus, meta.page - 1)}>Previous</Link>
            </Button>
          ) : null}
          <span className="text-xs text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          {meta.page < meta.totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={hrefFor(activeStatus, meta.page + 1)}>Next</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
