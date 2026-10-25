import {
  Activity,
  AlertTriangle,
  Package,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DownloadCsvButton } from "@/components/admin/download-csv-button";
import { SalesChart } from "@/components/admin/sales-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";
import { statusLabel } from "@/lib/commerce";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata = {
  title: "Reports",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const from = Array.isArray(raw.from) ? raw.from[0] : raw.from;
  const to = Array.isArray(raw.to) ? raw.to[0] : raw.to;

  const rangeFrom = from || "";
  const rangeTo = to || "";
  const query = new URLSearchParams();
  if (rangeFrom) query.set("from", rangeFrom);
  if (rangeTo) query.set("to", rangeTo);
  const reportQuery = query.toString();

  let report = null;
  let error = null;

  try {
    report = await apiFetchServer(
      `/admin/reports/sales${reportQuery ? `?${reportQuery}` : ""}`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const csvPath = `/admin/reports/orders.csv${reportQuery ? `?${reportQuery}` : ""}`;
  const summary = report?.summary;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Insights"
        title="Sales reports"
        description="Revenue, orders, and customer trends for the selected date range."
      >
        <DownloadCsvButton path={csvPath} filename="orders.csv" />
      </AdminPageHeader>

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-4">
          <form className="flex flex-col gap-2 sm:flex-row sm:items-end" action="/admin/reports">
            <div>
              <label htmlFor="report-from" className="text-xs text-muted-foreground">
                From
              </label>
              <Input
                id="report-from"
                type="date"
                name="from"
                defaultValue={rangeFrom}
                className="mt-1"
              />            </div>
            <div>
              <label htmlFor="report-to" className="text-xs text-muted-foreground">
                To
              </label>
              <Input
                id="report-to"
                type="date"
                name="to"
                defaultValue={rangeTo}
                className="mt-1"
              />
            </div>
            <Button type="submit" variant="outline">
              Apply range
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Report could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {report ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Revenue",
                value: formatCurrency(summary.revenue),
                icon: Wallet,
              },
              {
                label: "Orders",
                value: summary.orders.toLocaleString("en-PK"),
                icon: ShoppingBag,
              },
              {
                label: "Average order",
                value: formatCurrency(summary.average_order_value),
                icon: Activity,
              },
              {
                label: "Items sold",
                value: summary.items_sold.toLocaleString("en-PK"),
                icon: Package,
              },
            ].map((card) => (
              <Card key={card.label} className="rounded-2xl shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <card.icon className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-heading text-2xl font-semibold">
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">New customers</p>
                <p className="mt-2 font-heading text-xl font-semibold">
                  {summary.new_customers}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Discounts given</p>
                <p className="mt-2 font-heading text-xl font-semibold">
                  {formatCurrency(summary.discounts)}
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Cancelled orders</p>
                <p className="mt-2 font-heading text-xl font-semibold">
                  {summary.cancelled_orders}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle>Daily revenue</CardTitle>
              <CardDescription>
                {formatDate(report.range.from)} to {formatDate(report.range.to)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesChart data={report.daily} />
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle>Top products</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {report.top_products.length === 0 ? (
                  <p className="px-6 pb-6 text-sm text-muted-foreground">
                    No products sold in this range.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.top_products.map((product) => (
                        <TableRow key={product.product_id || product.title}>
                          <TableCell className="max-w-60 truncate text-sm">
                            {product.title}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {product.quantity}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(product.revenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle>Top customers</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {report.top_customers.length === 0 ? (
                  <p className="px-6 pb-6 text-sm text-muted-foreground">
                    No customer orders in this range.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Spent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.top_customers.map((customer) => (
                        <TableRow key={customer.user_id}>
                          <TableCell>
                            <p className="text-sm">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {customer.email}
                            </p>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {customer.orders}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {formatCurrency(customer.spent)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle>Orders by status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(report.status_breakdown).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No orders in this range.
                  </p>
                ) : (
                  Object.entries(report.status_breakdown).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <span>{statusLabel(status)}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-4 text-primary" aria-hidden="true" />
                  Low stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.low_stock.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    All products are above their low-stock threshold.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {report.low_stock.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <span className="truncate">{product.title}</span>
                        <span className="ml-3 shrink-0 font-medium text-amber-700">
                          {product.stock} left
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
