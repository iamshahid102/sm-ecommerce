import Link from "next/link";
import { AlertTriangle, Pencil, Plus, Search } from "lucide-react";

import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { StoreImage } from "@/components/store/store-image";
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
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_OPTIONS = [
  { value: "all", label: "All products" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "low_stock", label: "Low stock" },
  { value: "out_of_stock", label: "Out of stock" },
];

export default async function AdminProductsPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q || "";
  const status = STATUS_OPTIONS.some(
    (option) => option.value === (Array.isArray(raw.status) ? raw.status[0] : raw.status),
  )
    ? Array.isArray(raw.status)
      ? raw.status[0]
      : raw.status
    : "all";
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page || "1";

  let payload = null;
  let error = null;

  try {
    payload = await apiFetchServerFull(
      `/admin/products?q=${encodeURIComponent(q)}&status=${status}&page=${page}&limit=20`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const products = payload?.data ?? [];
  const meta = payload?.meta;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Create products, manage pricing and stock, and control what appears in the storefront."
      >
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" aria-hidden="true" />
            Add product
          </Link>
        </Button>
      </AdminPageHeader>

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-4">
          <form className="flex flex-col gap-2 sm:flex-row" action="/admin/products">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search by title or SKU"
                className="pl-9"
              />
            </div>
            <select
              name="status"
              defaultValue={status}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Filter
            </Button>
            {q || status !== "all" ? (
              <Button asChild variant="ghost">
                <Link href="/admin/products">Reset</Link>
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Products could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && products.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <p className="font-heading text-lg font-semibold">No products found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different filter or add your first product.
            </p>
            <Button asChild className="mt-4">
              <Link href="/admin/products/new">Add product</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {products.length > 0 ? (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-none">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const lowStock =
                  product.stock > 0 &&
                  product.stock <= product.low_stock_threshold;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          <StoreImage
                            src={product.primary_image}
                            alt={product.title}
                            className="h-full w-full"
                            sizes="44px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-56 truncate text-sm font-medium">
                            {product.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.sku || product.slug}
                          </p>
                          {product.is_featured ? (
                            <Badge variant="secondary" className="mt-1 text-[10px]">
                              Featured
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.categories?.name || "Uncategorised"}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {formatCurrency(product.effective_price)}
                      </p>
                      {product.discount_price ? (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.price)}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-sm",
                          product.stock === 0 && "font-medium text-destructive",
                          lowStock && "font-medium text-amber-700",
                        )}
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          variant="outline"
                          className={
                            product.is_published
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-50 text-slate-600"
                          }
                        >
                          {product.is_published ? "Published" : "Draft"}
                        </Badge>
                        {product.stock === 0 ? (
                          <Badge
                            variant="outline"
                            className="border-rose-200 bg-rose-50 text-rose-700"
                          >
                            Out
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/products/${product.id}`}>
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Edit
                          </Link>
                        </Button>
                        <AdminDeleteButton
                          endpoint={`/admin/products/${product.id}`}
                          label="Delete"
                          confirmText={`Delete "${product.title}"? It will be hidden from the storefront.`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="px-4 pb-4">
            <AdminPagination
              meta={meta}
              basePath="/admin/products"
              params={{ q, status }}
            />
          </div>
        </Card>
      ) : null}
    </div>
  );
}
