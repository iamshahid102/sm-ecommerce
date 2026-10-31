import Link from "next/link";
import { AlertTriangle, Search } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { CustomerBlockButton } from "@/components/admin/customer-block-button";
import { DownloadCsvButton } from "@/components/admin/download-csv-button";
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
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q || "";
  const role = ["all", "customer", "admin"].includes(
    Array.isArray(raw.role) ? raw.role[0] : raw.role,
  )
    ? Array.isArray(raw.role)
      ? raw.role[0]
      : raw.role
    : "all";
  const blocked = ["all", "true", "false"].includes(
    Array.isArray(raw.blocked) ? raw.blocked[0] : raw.blocked,
  )
    ? Array.isArray(raw.blocked)
      ? raw.blocked[0]
      : raw.blocked
    : "all";
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page || "1";

  let payload = null;
  let error = null;

  try {
    payload = await apiFetchServerFull(
      `/admin/customers?q=${encodeURIComponent(q)}&role=${role}&blocked=${blocked}&page=${page}&limit=20`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const customers = payload?.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="People"
        title="Customers"
        description="View registered customers, their order history, and account state."
      >
        <DownloadCsvButton
          path="/admin/reports/customers.csv"
          filename="customers.csv"
        />
      </AdminPageHeader>

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-4">
          <form
            className="flex flex-col gap-2 lg:flex-row"
            action="/admin/customers"
          >
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search name, email, or phone"
                className="pl-9"
              />
            </div>
            <select
              name="role"
              defaultValue={role}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
            >
              <option value="all">All roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>
            <select
              name="blocked"
              defaultValue={blocked}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
            >
              <option value="all">All accounts</option>
              <option value="false">Active</option>
              <option value="true">Blocked</option>
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
          <AlertTitle>Customers could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && customers.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <p className="font-heading text-lg font-semibold">
              No customers found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or filter.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {customers.length > 0 ? (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <p className="text-sm font-medium">
                      {customer.full_name || "Unnamed customer"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.email}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {customer.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        customer.is_blocked
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }
                    >
                      {customer.is_blocked ? "Blocked" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(customer.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/admin/customers/${customer.id}`}>
                          View
                        </Link>
                      </Button>
                      <CustomerBlockButton
                        customerId={customer.id}
                        isBlocked={customer.is_blocked}
                        disabled={customer.role === "admin"}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 pb-4">
            <AdminPagination
              meta={payload.meta}
              basePath="/admin/customers"
              params={{ q, role, blocked }}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
