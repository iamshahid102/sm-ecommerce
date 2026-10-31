import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";

import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "CMS pages",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCmsPagesPage() {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  let pages = [];
  let error = null;

  try {
    pages = await apiFetchServer("/admin/cms/pages", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Content"
        title="CMS pages"
        description="Create policy, information, and campaign pages for the storefront."
      >
        <Button asChild>
          <Link href="/admin/cms/pages/new">
            <Plus className="size-4" aria-hidden="true" />
            Add page
          </Link>
        </Button>
      </AdminPageHeader>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Pages could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && pages.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <p className="font-heading text-lg font-semibold">No pages yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a shipping, returns, or about page to get started.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/cms/pages/new">Add page</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {pages.length > 0 ? (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{page.title}</p>
                    {page.excerpt ? (
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {page.excerpt}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    /{page.slug}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        page.is_published
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }
                    >
                      {page.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(page.updated_at || page.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {page.is_published ? (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/${page.slug}`} target="_blank">
                            <ExternalLink
                              className="size-3.5"
                              aria-hidden="true"
                            />
                            View
                          </Link>
                        </Button>
                      ) : null}
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/cms/pages/${page.id}`}>Edit</Link>
                      </Button>
                      <AdminDeleteButton
                        endpoint={`/admin/cms/pages/${page.id}`}
                        confirmText={`Delete the page "${page.title}"?`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}
    </div>
  );
}
