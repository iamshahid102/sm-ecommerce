import {
  AlertTriangle,
  ArrowUpRight,
  Package,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";
import { apiFetchServer } from "@/lib/api/server";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

const statusStyles = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  processing: "border-indigo-200 bg-indigo-50 text-indigo-700",
  shipped: "border-sky-200 bg-sky-50 text-sky-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  returned: "border-slate-200 bg-slate-100 text-slate-700",
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireAdmin();
  const token = await getAccessToken(supabase);

  let dashboard = null;
  let loadError = "";

  try {
    dashboard = await apiFetchServer("/admin/dashboard", { token });
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
              "The store API could not be reached. Start the backend and apply the database migrations."}
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

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>
              The newest orders will appear here as checkout goes live.
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
                  Orders will show up after the storefront and checkout phases.
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
                        {order.order_number}
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[order.status]}
                        >
                          {statusLabels[order.status] ?? order.status}
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
              {Object.entries(statusLabels).map(([key, label]) => {
                const count = orderStatusCounts[key] ?? 0;
                const percent =
                  stats.totalOrders > 0
                    ? Math.round((count / stats.totalOrders) * 100)
                    : 0;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{label}</span>
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
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-2xl border-primary/15 bg-secondary/40 shadow-none">
        <CardContent className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Catalog management is next</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add products, images, variants, and categories in the next phase.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
            Phase 2
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
