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
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Audit logs",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q || "";
  const entityType = Array.isArray(raw.entityType)
    ? raw.entityType[0]
    : raw.entityType || "";
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page || "1";

  let payload = null;
  let error = null;

  try {
    payload = await apiFetchServerFull(
      `/admin/audit-logs?q=${encodeURIComponent(q)}&entityType=${encodeURIComponent(entityType)}&page=${page}&limit=20`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const logs = payload?.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Security"
        title="Audit logs"
        description="A record of administrative writes, including actors and changed data."
      />

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-4">
          <form className="flex flex-col gap-2 sm:flex-row" action="/admin/audit-logs">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search action or actor email"
                className="pl-9"
              />
            </div>
            <Input
              name="entityType"
              defaultValue={entityType}
              placeholder="Entity type e.g. product"
              className="sm:max-w-52"
            />
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Audit logs could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && logs.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <p className="font-heading text-lg font-semibold">No audit entries</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin actions will be recorded here.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {logs.length > 0 ? (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {log.actor_email || "System"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.entity_type}
                    {log.entity_id ? (
                      <span className="block max-w-40 truncate font-mono text-[10px]">
                        {log.entity_id}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <pre className="max-w-72 max-h-24 overflow-auto rounded bg-muted/60 p-1.5 text-[10px] text-muted-foreground">
                      {JSON.stringify(log.changes ?? {}, null, 2)}
                    </pre>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.ip || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-4 pb-4">
            <AdminPagination
              meta={payload.meta}
              basePath="/admin/audit-logs"
              params={{ q, entityType }}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
