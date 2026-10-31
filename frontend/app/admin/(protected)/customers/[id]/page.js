import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, ShieldCheck, ShoppingBag } from "lucide-react";

import { CustomerBlockButton } from "@/components/admin/customer-block-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { statusLabel, statusStyle } from "@/lib/commerce";
import { formatCurrency, formatDate, initials } from "@/lib/format";

export const metadata = {
  title: "Customer details",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCustomerDetailPage({ params }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let customer;

  try {
    customer = await apiFetchServer(`/admin/customers/${id}`, { token });
  } catch (error) {
    if (error.status === 404) notFound();

    return (
      <Alert variant="destructive">
        <AlertTitle>Customer could not load</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/admin/customers">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to customers
          </Link>
        </Button>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="bg-secondary text-base font-semibold text-primary">
                {initials(customer.full_name, customer.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-semibold">
                  {customer.full_name || "Unnamed customer"}
                </h1>
                <Badge variant="outline" className="capitalize">
                  {customer.role}
                </Badge>
                {customer.is_blocked ? (
                  <Badge
                    variant="outline"
                    className="border-rose-200 bg-rose-50 text-rose-700"
                  >
                    Blocked
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Joined {formatDate(customer.created_at)}
              </p>
            </div>
          </div>
          <CustomerBlockButton
            customerId={customer.id}
            isBlocked={customer.is_blocked}
            disabled={customer.role === "admin"}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl shadow-none">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Total orders</p>
            <p className="mt-2 font-heading text-2xl font-semibold">
              {customer.stats?.order_count ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Lifetime spend</p>
            <p className="mt-2 font-heading text-2xl font-semibold">
              {formatCurrency(customer.stats?.total_spent ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-none">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Account status</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              {customer.is_blocked ? "Blocked" : "Active"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <p className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-4 text-primary" aria-hidden="true" />
            <a
              href={`mailto:${customer.email}`}
              className="hover:text-foreground"
            >
              {customer.email}
            </a>
          </p>
          <p className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4 text-primary" aria-hidden="true" />
            {customer.phone || "No phone saved"}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-primary" aria-hidden="true" />
            Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {(customer.orders ?? []).length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              This customer has not placed any orders yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyle(order.status)}
                      >
                        {statusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/orders/${order.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
