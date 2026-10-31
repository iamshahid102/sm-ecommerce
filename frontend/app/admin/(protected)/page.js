import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Package,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

import { SalesChart } from "@/components/admin/sales-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ORDER_STATUSES, statusLabel, statusStyle } from "@/lib/commerce";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdmin();
  const token = await getAccessToken(supabase);

  let dashboard = null;
  let loadError = "";
  let salesReport = null;

  try {
    [dashboard, salesReport] = await Promise.all([
      apiFetchServer("/admin/dashboard", { token }),
      apiFetchServer("/admin/reports/sales", { token }).catch(() => null),
    ]);
  } catch (error) {
    loadError = error.message;
  }

  if (!dashboard) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {profile.email}.
          </p>
        </div>
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Dashboard data is unavailable</AlertTitle>
          <AlertDescription>
            {loadError ||
              "The store API could not be reached. Please try again shortly."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { stats, orderStatusCounts, lowStockProducts, recentOrders } =
    dashboard;
  const statCards = [
    {
      label: "Paid revenue",
      value: formatCurrency(stats.totalRevenue),
      description: "Orders marked paid",
      icon: Wallet,
    },
    {
      label: "Orders",
      value: stats.totalOrders.toLocaleString("en-PK"),
      description: `${stats.pendingOrders} pending`,
      icon: ShoppingBag,
    },
    {
      label: "Customers",
      value: stats.totalCustomers.toLocaleString("en-PK"),
      description: "Registered customer accounts",
      icon: Users,
    },
    {
      label: "Products",
      value: stats.totalProducts.toLocaleString("en-PK"),
      description: `${stats.lowStockCount} low on stock`,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Overview
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold sm:text-3xl">
            Welcome back, {profile.full_name?.split(" ")[0] || "Admin"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is the latest snapshot of your store.
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          Updated {formatDate(dashboard.generatedAt)}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="gap-0 rounded-2xl py-5 shadow-card">
            <CardContent className="px-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                  <card.icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 font-heading text-2xl font-semibold tracking-tight">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {salesReport?.daily?.length ? (
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Revenue, last 30 days</CardTitle>
            <CardDescription>
              Daily order revenue, excluding cancelled orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesReport.daily} />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              The most recent orders placed in your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/40 px-5 py-10 text-center">
                <ShoppingBag
                  className="mx-auto size-6 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-3 text-sm font-medium">No orders yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Orders appear here as soon as customers check out.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Placed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="hover:text-primary"
                        >
                          {order.order_number}
                        </Link>
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyle(order.status)}
                        >
                          {statusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(order.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle>Order pipeline</CardTitle>
              <CardDescription>Orders by current status.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ORDER_STATUSES.map((key) => {
                const count = orderStatusCounts[key] ?? 0;
                const percent =
                  stats.totalOrders > 0
                    ? Math.round((count / stats.totalOrders) * 100)
                    : 0;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{statusLabel(key)}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle>Low stock</CardTitle>
              <CardDescription>
                Products at or below their stock threshold.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <p className="rounded-xl border border-dashed bg-muted/40 px-4 py-6 text-center text-xs text-muted-foreground">
                  Nothing needs restocking right now.
                </p>
              ) : (
                <ul className="divide-y">
                  {lowStockProducts.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <span className="min-w-0 truncate text-sm">
                        {product.title}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-amber-700"
                      >
                        {product.stock} left
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-3 w-full"
              >
                <Link href="/admin/products?status=low_stock">
                  Review inventory
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-2xl border-primary/15 bg-secondary/40 shadow-none">
        <CardContent className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Store health</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.lowStockCount} product(s) need restocking and{" "}
              {stats.pendingOrders} order(s) are awaiting confirmation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders?status=pending">
                Pending orders
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products?status=low_stock">
                Low stock
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/products/new">Add product</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
