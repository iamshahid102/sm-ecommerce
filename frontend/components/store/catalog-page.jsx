import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetchPublicFull, buildQuery } from "@/lib/api/public";
import { flattenCategories } from "@/lib/category-tree";
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
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {meta.page > 1 ? (
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={hrefFor(meta.page - 1)}>Previous</Link>
        </Button>
      ) : null}
      {pages.map((page) => (
        <Button
          key={page}
          asChild
          variant={page === meta.page ? "default" : "outline"}
          size="sm"
          className="size-9 rounded-full p-0"
        >
          <Link
            href={hrefFor(page)}
            aria-current={page === meta.page ? "page" : undefined}
          >
            {page}
          </Link>
        </Button>
      ))}
      {meta.page < meta.totalPages ? (
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={hrefFor(meta.page + 1)}>Next</Link>
        </Button>
      ) : null}
    </nav>
  );
}

function FilterFields({ params, categories, brands, fixedCategory, idPrefix }) {
  const categoryRows = flattenCategories(categories);

  return (
    <form
      action={fixedCategory ? undefined : "/products"}
      method="get"
      className="space-y-4"
    >
      {fixedCategory ? (
        <input type="hidden" name="category" value={fixedCategory} />
      ) : null}
      {params.featured ? (
        <input type="hidden" name="featured" value={params.featured} />
      ) : null}
      <div>
        <label
          htmlFor={`${idPrefix}-q`}
          className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase"
        >
          Search
        </label>
        <Input
          id={`${idPrefix}-q`}
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Product name or keyword"
          className="mt-1.5 rounded-xl border-slate-200 bg-slate-50 shadow-none"
        />
      </div>
      {!fixedCategory ? (
        <div>
          <label
            htmlFor={`${idPrefix}-category`}
            className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase"
          >
            Category
          </label>
          <select
            id={`${idPrefix}-category`}
            name="category"
            defaultValue={params.category ?? ""}
            className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
          >
            <option value="">All categories</option>
            {categoryRows.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div>
        <label
          htmlFor={`${idPrefix}-brand`}
          className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase"
        >
          Brand
        </label>
        <select
          id={`${idPrefix}-brand`}
          name="brand"
          defaultValue={params.brand ?? ""}
          className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label
            htmlFor={`${idPrefix}-min`}
            className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase"
          >
            Min price
          </label>
          <Input
            id={`${idPrefix}-min`}
            name="min_price"
            type="number"
            min="0"
            step="1"
            defaultValue={params.min_price ?? ""}
            className="mt-1.5 rounded-xl border-slate-200 bg-slate-50 shadow-none"
          />
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-max`}
            className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase"
          >
            Max price
          </label>
          <Input
            id={`${idPrefix}-max`}
            name="max_price"
            type="number"
            min="0"
            step="1"
            defaultValue={params.max_price ?? ""}
            className="mt-1.5 rounded-xl border-slate-200 bg-slate-50 shadow-none"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor={`${idPrefix}-sort`}
          className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase"
        >
          Sort by
        </label>
        <select
          id={`${idPrefix}-sort`}
          name="sort"
          defaultValue={params.sort}
          className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="popular">Most reviewed</option>
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" className="flex-1 rounded-full">
          Apply filters
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link
            href={fixedCategory ? `/categories/${fixedCategory}` : "/products"}
          >
            Reset
          </Link>
        </Button>
      </div>
    </form>
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
    featured: cleanValue(raw.featured),
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
        <Alert variant="destructive" className="rounded-2xl">
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
    : params.featured === "true"
      ? "Featured products"
      : "All products";
  const description =
    activeCategory?.description ||
    (params.featured === "true"
      ? "A considered edit of products our customers and team love."
      : "Browse the full collection with transparent pricing and Cash on Delivery.");
  const total = meta?.total ?? products.length;

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-slate-200 bg-hero-soft">
        <div
          aria-hidden="true"
          className="absolute -top-24 right-0 size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative store-container py-10 sm:py-12">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-700">Shop</span>
            {activeCategory ? (
              <>
                <span aria-hidden="true">/</span>
                <span className="text-slate-700">{activeCategory.name}</span>
              </>
            ) : null}
          </nav>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
            {fixedCategory ? "Collection" : "The full collection"}
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </section>

      <div className="store-container py-8 lg:py-10">
        <details className="group mb-6 rounded-2xl border border-slate-200 bg-white shadow-soft lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal
                className="size-4 text-primary"
                aria-hidden="true"
              />
              Filters and sorting
            </span>
            <ChevronDown
              className="size-4 text-slate-400 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <div className="border-t border-slate-100 p-4">
            <FilterFields
              params={params}
              categories={categories}
              brands={brands}
              fixedCategory={fixedCategory}
              idPrefix="mobile"
            />
          </div>
        </details>

        <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          <aside className="hidden lg:block">
            <Card
              className="store-filters-scroll sticky top-32 max-h-[calc(100dvh-9rem)] gap-0 overflow-y-auto overscroll-contain rounded-2xl border-slate-200/80 py-0 shadow-soft"
              role="region"
              aria-label="Product filters"
            >
              <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-100 bg-card px-5 py-4">
                <SlidersHorizontal
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                <h2 className="text-sm font-semibold text-slate-900">
                  Filters
                </h2>
              </div>
              <CardContent className="p-5">
                <FilterFields
                  params={params}
                  categories={categories}
                  brands={brands}
                  fixedCategory={fixedCategory}
                  idPrefix="desktop"
                />
              </CardContent>
            </Card>
          </aside>

          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-900">{total}</span>{" "}
                product{total === 1 ? "" : "s"}
              </p>
              <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
                <span>Sorted by</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                  {params.sort === "price_asc"
                    ? "Price: low to high"
                    : params.sort === "price_desc"
                      ? "Price: high to low"
                      : params.sort === "rating"
                        ? "Top rated"
                        : params.sort === "popular"
                          ? "Most reviewed"
                          : "Newest"}
                </span>
              </div>
            </div>

            {products.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-slate-300 py-16 text-center shadow-none">
                <CardContent>
                  <p className="font-heading text-xl font-semibold text-slate-950">
                    No products found
                  </p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Try a different search or clear your filters to see the full
                    collection.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-5 rounded-full"
                  >
                    <Link href={basePath}>Clear filters</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 xl:grid-cols-3">
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
    </div>
  );
}
