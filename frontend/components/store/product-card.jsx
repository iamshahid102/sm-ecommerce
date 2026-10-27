import Link from "next/link";

import { ProductCardActions } from "@/components/store/product-card-actions";
import { StarRating } from "@/components/store/stars";
import { StoreImage } from "@/components/store/store-image";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

export function ProductCard({ product, priority = false }) {
  const price = Number(product.price);
  const discountPrice = product.discount_price
    ? Number(product.discount_price)
    : null;
  const effectivePrice = discountPrice ?? price;
  const discountPercent =
    discountPrice && price > 0
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;
  const inStock = product.in_stock ?? product.stock > 0;
  const reviewCount = Number(product.review_count ?? 0);

  return (
    <article className="group flex min-w-0 flex-col">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
        <Link
          href={`/products/${product.slug}`}
          className="block h-full w-full"
          aria-label={product.title}
        >
          <StoreImage
            src={product.primary_image || product.images?.[0]?.url}
            alt={product.title}
            priority={priority}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {discountPercent > 0 ? (
            <Badge className="rounded-full border-0 bg-rose-600 px-2.5 text-[10px] font-semibold text-white hover:bg-rose-600">
              -{discountPercent}%
            </Badge>
          ) : null}
          {product.is_featured ? (
            <Badge className="rounded-full border-0 bg-white/95 px-2.5 text-[10px] font-semibold text-slate-800 shadow-sm backdrop-blur hover:bg-white">
              Featured
            </Badge>
          ) : null}
        </div>

        <ProductCardActions product={product} />

        {!inStock ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-slate-950/90 px-3.5 py-1.5 text-[11px] font-semibold text-white">
              Out of stock
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-3.5">
        {product.categories?.name ? (
          <p className="mb-1 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            {product.categories.name}
          </p>
        ) : null}
        <Link href={`/products/${product.slug}`} className="group/title">
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-slate-900 transition-colors group-hover/title:text-primary sm:text-[15px]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-heading text-base font-semibold text-slate-950">
            {formatCurrency(effectivePrice)}
          </p>
          {discountPrice ? (
            <p className="text-xs text-slate-400 line-through">
              {formatCurrency(price)}
            </p>
          ) : null}
        </div>

        {reviewCount > 0 ? (
          <div className="mt-1.5">
            <StarRating
              value={product.avg_rating}
              count={reviewCount}
              showCount
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
