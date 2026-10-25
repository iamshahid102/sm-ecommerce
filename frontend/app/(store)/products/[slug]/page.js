import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchasePanel } from "@/components/store/product-purchase-panel";
import { SectionHeading } from "@/components/store/section-heading";
import { StarRating } from "@/components/store/stars";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PublicApiError, apiFetchPublic } from "@/lib/api/public";
import { formatCurrency, formatDate } from "@/lib/format";
import { statusLabel } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const data = await apiFetchPublic(`/products/${slug}`);
    const product = data.product;
    return {
      title: product.meta_title || product.title,
      description:
        product.meta_description ||
        product.short_description ||
        `Buy ${product.title} at SM Store.`,
      openGraph: {
        images: product.primary_image ? [product.primary_image] : [],
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  let data = null;
  let loadError = null;

  try {
    data = await apiFetchPublic(`/products/${slug}`);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }
    loadError = error;
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Product is unavailable</AlertTitle>
          <AlertDescription>
            {loadError?.message || "The product could not be loaded."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { product, related, reviews } = data;
  const price = Number(product.price);
  const discountPrice = product.discount_price
    ? Number(product.discount_price)
    : null;
  const images = product.images?.length
    ? product.images
    : product.primary_image
      ? [{ url: product.primary_image, alt_text: product.title }]
      : [];
  const reviewItems = reviews?.items ?? [];
  const reviewSummary = reviews?.summary ?? {
    avg_rating: product.avg_rating,
    review_count: product.review_count,
  };
  const inStock = product.in_stock;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.short_description || product.description || undefined,
    image: images.map((image) => image.url),
    sku: product.sku || undefined,
    brand: product.brands?.name
      ? { "@type": "Brand", name: product.brands.name }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: discountPrice ?? price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      reviewSummary.review_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: Number(reviewSummary.avg_rating),
            reviewCount: Number(reviewSummary.review_count),
          }
        : undefined,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="size-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          {product.categories?.name ? (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="size-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/categories/${product.categories.slug}`}>
                  {product.categories.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : null}
          <BreadcrumbSeparator>
            <ChevronRight className="size-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">
              {product.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} title={product.title} />

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {product.categories?.name ? (
              <Badge variant="secondary">{product.categories.name}</Badge>
            ) : null}
            {product.brands?.name ? (
              <Badge variant="outline">{product.brands.name}</Badge>
            ) : null}
            <Badge
              variant="outline"
              className={
                inStock
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }
            >
              {inStock ? "In stock" : "Out of stock"}
            </Badge>
          </div>

          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.title}
            </h1>
            {product.short_description ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {product.short_description}
              </p>
            ) : null}
            <div className="mt-3">
              <StarRating
                value={reviewSummary.avg_rating}
                count={reviewSummary.review_count}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <p className="font-heading text-3xl font-semibold">
              {formatCurrency(discountPrice ?? price)}
            </p>
            {discountPrice ? (
              <>
                <p className="text-lg text-muted-foreground line-through">
                  {formatCurrency(price)}
                </p>
                <Badge className="bg-rose-600 text-white hover:bg-rose-600">
                  Save {Math.round(((price - discountPrice) / price) * 100)}%
                </Badge>
              </>
            ) : null}
          </div>

          {product.sku ? (
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          ) : null}

          <ProductPurchasePanel product={product} />

          <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Fast dispatch", text: "1–2 working days" },
              { icon: PackageCheck, title: "COD", text: "Pay on delivery" },
              { icon: ShieldCheck, title: "Support", text: "Helpful after-sales" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-2">
                <item.icon className="size-4 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {product.description ? (
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold">Product details</h2>
              <div className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {product.description}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {reviewItems.length > 0 ? (
        <section className="mt-16">
          <SectionHeading
            eyebrow="Reviews"
            title="What customers say"
            description={`${reviewSummary.review_count} verified review${reviewSummary.review_count === 1 ? "" : "s"} for this product.`}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviewItems.map((review) => (
              <Card key={review.id} className="rounded-2xl shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                        {review.customer_name.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{review.customer_name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    <StarRating value={review.rating} showCount={false} />
                  </div>
                  {review.title ? (
                    <p className="mt-3 text-sm font-semibold">{review.title}</p>
                  ) : null}
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Reviews can be submitted from a delivered order in your account.
          </p>
        </section>
      ) : (
        <section className="mt-16 rounded-2xl border border-dashed bg-card p-8 text-center">
          <BadgeCheck className="mx-auto size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-3 font-heading text-lg font-semibold">No reviews yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Verified reviews from delivered orders will appear here. Sign in and
            open a delivered order to share your experience.
          </p>
        </section>
      )}

      {related.length > 0 ? (
        <section className="mt-16">
          <SectionHeading
            eyebrow="You may also like"
            title="Related products"
            href="/products"
          />
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
