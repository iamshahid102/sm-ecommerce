import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { StarRating } from "@/components/store/stars";
import { StoreImage } from "@/components/store/store-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";

export function ProductCard({ product, priority = false }) {
  const price = Number(product.price);
  const discountPrice = product.discount_price
    ? Number(product.discount_price)
    : null;
  const effectivePrice = discountPrice ?? price;
  const discountPercent = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;
  const inStock = product.in_stock ?? product.stock > 0;

  return (
    <Card className="group gap-0 overflow-hidden rounded-2xl border-border/80 py-0 shadow-none transition-shadow hover:shadow-card">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-muted"
      >
        <StoreImage
          src={product.primary_image || product.images?.[0]?.url}
          alt={product.title}
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discountPercent > 0 ? (
            <Badge className="bg-rose-600 text-white hover:bg-rose-600">
              -{discountPercent}%
            </Badge>
          ) : null}
          {product.is_featured ? (
            <Badge className="bg-slate-950/90 text-white hover:bg-slate-950/90">
              Featured
            </Badge>
          ) : null}
        </div>
        {!inStock ? (
          <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 px-3 py-2 text-center text-xs font-medium text-white">
            Out of stock
          </div>
        ) : null}
      </Link>

      <CardContent className="space-y-2 p-4">
        {product.categories?.name ? (
          <p className="text-[11px] font-medium tracking-wide text-primary uppercase">
            {product.categories.name}
          </p>
        ) : null}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm leading-snug font-semibold transition-colors group-hover:text-primary">
            {product.title}
          </h3>
        </Link>
        <StarRating
          value={product.avg_rating}
          count={product.review_count}
          showCount={false}
        />
        <div className="flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="font-heading text-base font-semibold">
              {formatCurrency(effectivePrice)}
            </p>
            {discountPrice ? (
              <p className="text-xs text-muted-foreground line-through">
                {formatCurrency(price)}
              </p>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
