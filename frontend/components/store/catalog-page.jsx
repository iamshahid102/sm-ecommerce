import Link from "next/link";
import { notFound } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetchPublicFull, buildQuery } from "@/lib/api/public";
import { cn } from "@/lib/utils";

function cleanValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function PaginationLinks({ meta, params, basePath }) {
  if (!meta || meta.totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, meta.page - 2);
  const end = Math.min(meta.totalPages, meta.page + 2);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  function hrefFor(page) {
    const query = buildQuery({ ...params, page });
    return `${basePath}${query}`;
  }

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {meta.page > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(meta.page - 1)}>Previous</Link>
        </Button>
      ) : null}
      {pages.map((page) => (
        <Button
          key={page}
          asChild
          variant={page === meta.page ? "default" : "outline"}
          size="sm"
        >
          <Link href={hrefFor(page)} aria-current={page === meta.page ? "page" : undefined}>
            {page}
          </Link>
        </Button>
      ))}
      {meta.page < meta.totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(meta.page + 1)}>Next</Link>
        </Button>
      ) : null}
    </nav>
  );
}

export async function CatalogPageView({
  searchParams,
  basePath = "/products",
  fixedCategory = null,
}) {
  const raw = await searchParams;
  const params = {
    q: cleanValue(raw.q),
    category: fixedCategory || cleanValue(raw.category),
    brand: cleanValue(raw.brand),
    sort: cleanValue(raw.sort) || "newest",
    min_price: cleanValue(raw.min_price),
    max_price: cleanValue(raw.max_price),
    page: cleanValue(raw.page) || "1",
  };

  const [productsResult, categoriesResult, brandsResult] = await Promise.all([
    apiFetchPublicFull(`/products${buildQuery(params)}`).catch((error) => ({
      error,
    })),
    apiFetchPublicFull("/categories").catch(() => ({ data: [] })),
    apiFetchPublicFull("/brands").catch(() => ({ data: [] })),
  ]);

  if (productsResult.error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Products are unavailable</AlertTitle>
          <AlertDescription>{productsResult.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const products = productsResult.data ?? [];
  const meta = productsResult.meta;
  const categories = categoriesResult.data ?? [];
  const brands = brandsResult.data ?? [];
  const activeCategory = categories.find(
    (category) => category.slug === params.category,
  );

  if (fixedCategory && !activeCategory) {
    notFound();
  }

  const title = fixedCategory
    ? activeCategory?.name || "Category"
    : "All products";
  const description =
    activeCategory?.description ||
    "Browse the full collection with transparent pricing and Cash on Delivery.";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Shop
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <Card className="rounded-2xl shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 border-b pb-3">
                <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
                <h2 className="text-sm font-semibold">Filters</h2>
              </div>
              <form action={basePath} method="get" className="mt-4 space-y-4">
                {fixedCategory ? (
                  <input type="hidden" name="category" value={fixedCategory} />
                ) : null}
                <div>
                  <label htmlFor="catalog-q" className="text-xs font-medium">
                    Search
                  </label>
                  <Input
                    id="catalog-q"
                    name="q"
                    defaultValue={params.q ?? ""}
                    placeholder="Product name or keyword"
                    className="mt-1.5"
                  />
                </div>
                {!fixedCategory ? (
                  <div>
                    <label htmlFor="catalog-category" className="text-xs font-medium">
                      Category
                    </label>
                    <select
                      id="catalog-category"
                      name="category"
                      defaultValue={params.category ?? ""}
                      className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="">All categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <div>
                  <label htmlFor="catalog-brand" className="text-xs font-medium">
                    Brand
                  </label>
                  <select
                    id="catalog-brand"
                    name="brand"
                    defaultValue={params.brand ?? ""}
                    className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">All brands</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.slug}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="catalog-min" className="text-xs font-medium">
                      Min price
                    </label>
                    <Input
                      id="catalog-min"
                      name="min_price"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={params.min_price ?? ""}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="catalog-max" className="text-xs font-medium">
                      Max price
                    </label>
                    <Input
                      id="catalog-max"
                      name="max_price"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={params.max_price ?? ""}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="catalog-sort" className="text-xs font-medium">
                    Sort by
                  </label>
                  <select
                    id="catalog-sort"
                    name="sort"
                    defaultValue={params.sort}
                    className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                    <option value="rating">Top rated</option>
                    <option value="popular">Most reviewed</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Apply
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={basePath}>Reset</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {meta?.total ?? products.length} product
              {(meta?.total ?? products.length) === 1 ? "" : "s"}
            </p>
            <p className="text-xs text-muted-foreground">
              Page {meta?.page ?? 1} of {meta?.totalPages ?? 1}
            </p>
          </div>

          {products.length === 0 ? (
            <Card className="rounded-2xl border-dashed py-16 text-center shadow-none">
              <CardContent>
                <p className="font-heading text-lg font-semibold">
                  No products found
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different search or clear your filters.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/products">Clear filters</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                "grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
              )}
            >
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          )}

          <PaginationLinks meta={meta} params={params} basePath={basePath} />
        </div>
      </div>
    </div>
  );
}
