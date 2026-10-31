import Link from "next/link";
import { AlertTriangle, Search } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetchServerFull } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";
import { statusLabel, statusStyle } from "@/lib/commerce";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUSES = [
  "all",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export default async function AdminOrdersPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q || "";
  const rawStatus = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const status = STATUSES.includes(rawStatus) ? rawStatus : "all";
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page || "1";

  let payload = null;
  let error = null;

  try {
    payload = await apiFetchServerFull(
      `/admin/orders?q=${encodeURIComponent(q)}&status=${status}&page=${page}&limit=20`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const orders = payload?.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Review new orders, move them through fulfilment, and update tracking."
      >
        <Button asChild variant="outline">
          <Link href="/admin/reports">Sales reports</Link>
        </Button>
      </AdminPageHeader>

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-4">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            action="/admin/orders"
          >
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search order number, customer, email"
                className="pl-9"
              />
            </div>
            <select
              name="status"
              defaultValue={status}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value === "all" ? "All statuses" : statusLabel(value)}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Orders could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && orders.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <p className="font-heading text-lg font-semibold">
              No orders found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Orders will appear here after customers check out.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {orders.length > 0 ? (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Placed</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer_email}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusStyle(order.status)}
                    >
                      {statusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">
                      {order.payment_method === "cod"
                        ? "COD"
                        : order.payment_method}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {order.payment_status}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.items?.length ?? 0}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 pb-4">
            <AdminPagination
              meta={payload.meta}
              basePath="/admin/orders"
              params={{ q, status }}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
