import { AlertTriangle, Search } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
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
  title: "Subscribers",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSubscribersPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q || "";
  const activeOnly = raw.activeOnly === "true" ? "true" : "false";
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page || "1";

  let payload = null;
  let error = null;

  try {
    payload = await apiFetchServerFull(
      `/admin/subscribers?q=${encodeURIComponent(q)}&activeOnly=${activeOnly}&page=${page}&limit=50`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const subscribers = payload?.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Marketing"
        title="Newsletter subscribers"
        description="View people who opted in to store emails and export the list."
      >
        <DownloadCsvButton
          path="/admin/subscribers/export"
          filename="newsletter-subscribers.csv"
        />
      </AdminPageHeader>

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-4">
          <form className="flex flex-col gap-2 sm:flex-row" action="/admin/subscribers">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search email"
                className="pl-9"
              />
            </div>
            <label className="flex items-center gap-2 rounded-md border px-3 text-sm">
              <input
                type="checkbox"
                name="activeOnly"
                value="true"
                defaultChecked={activeOnly === "true"}
                className="size-4 rounded border-input"
              />
              Active only
            </label>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Subscribers could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && subscribers.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <p className="font-heading text-lg font-semibold">No subscribers yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Newsletter signups from the storefront will appear here.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {subscribers.length > 0 ? (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Subscribed</TableHead>
                <TableHead>Unsubscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="text-sm font-medium">
                    {subscriber.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        subscriber.is_active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }
                    >
                      {subscriber.is_active ? "Subscribed" : "Unsubscribed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {subscriber.source || "website"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(subscriber.created_at)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {subscriber.unsubscribed_at
                      ? formatDate(subscriber.unsubscribed_at)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 pb-4">
            <AdminPagination
              meta={payload.meta}
              basePath="/admin/subscribers"
              params={{ q, activeOnly }}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
