import Link from "next/link";
import { Heart } from "lucide-react";

import { StarRating } from "@/components/store/stars";
import { StoreImage } from "@/components/store/store-image";
import { WishlistRemoveButton } from "@/components/store/wishlist-remove-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetchServer } from "@/lib/api/server";
import { getAccessToken, requireCustomer } from "@/lib/auth/dal";
import { formatCurrency } from "@/lib/format";

export const metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const { supabase } = await requireCustomer("/wishlist");
  const token = await getAccessToken(supabase);
  let items = [];
  let error = null;

  try {
    items = await apiFetchServer("/wishlist", { token });
  } catch (loadError) {
    error = loadError;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
          Saved for later
        </p>
        <h1 className="mt-1 font-heading text-3xl font-semibold tracking-[-0.02em] text-slate-950">
          Your wishlist
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Products you love, kept in one place.
        </p>
      </div>

      {error ? (
        <Alert className="mt-6" variant="destructive">
          <AlertTitle>Wishlist could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && items.length === 0 ? (
        <Card className="mt-8 rounded-3xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <Heart className="mx-auto size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-xl font-semibold">
              Nothing saved yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Tap the heart on a product page to keep it here for later.
            </p>
            <Button asChild className="mt-5">
              <Link href="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {items.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {items.map((item) => {
            const product = item.product;
            return (
              <Card
                key={item.id}
                className="group relative gap-0 overflow-hidden rounded-2xl py-0 shadow-none transition-shadow hover:shadow-card"
              >
                <WishlistRemoveButton productId={item.product_id} />
                <Link
                  href={`/products/${product.slug}`}
                  className="relative block aspect-[4/5] overflow-hidden bg-muted"
                >
                  <StoreImage
                    src={product.primary_image}
                    alt={product.title}
                    className="transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </Link>
                <CardContent className="space-y-2 p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h2 className="line-clamp-2 text-sm font-semibold group-hover:text-primary">
                      {product.title}
                    </h2>
                  </Link>
                  <StarRating
                    value={product.avg_rating}
                    count={product.review_count}
                    showCount={false}
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="font-heading text-base font-semibold">
                      {formatCurrency(product.effective_price)}
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/products/${product.slug}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
