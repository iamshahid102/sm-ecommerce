import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdminPagination({ meta, basePath, params = {} }) {
  if (!meta || meta.totalPages <= 1) return null;

  function hrefFor(page) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        search.set(key, String(value));
      }
    }
    search.set("page", String(page));
    return `${basePath}?${search.toString()}`;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-xs text-muted-foreground">
        Page {meta.page} of {meta.totalPages} · {meta.total} record
        {meta.total === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        {meta.page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor(meta.page - 1)}>Previous</Link>
          </Button>
        ) : null}
        {meta.page < meta.totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link href={hrefFor(meta.page + 1)}>Next</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
