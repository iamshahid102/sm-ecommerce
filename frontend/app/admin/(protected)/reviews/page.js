import Link from "next/link";
import { AlertTriangle, Search } from "lucide-react";

import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ReviewVisibilityButton } from "@/components/admin/review-visibility-button";
import { StarRating } from "@/components/store/stars";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiFetchServerFull } from "@/lib/api/server";
import { getAccessToken, requireAdmin } from "@/lib/auth/dal";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Reviews",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage({ searchParams }) {
  const { supabase } = await requireAdmin();
  const token = await getAccessToken(supabase);
  const raw = await searchParams;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q || "";
  const rawVisible = Array.isArray(raw.visible) ? raw.visible[0] : raw.visible;
  const visible = ["all", "true", "false"].includes(rawVisible)
    ? rawVisible
    : "all";
  const page = Array.isArray(raw.page) ? raw.page[0] : raw.page || "1";

  let payload = null;
  let error = null;

  try {
    payload = await apiFetchServerFull(
      `/admin/reviews?q=${encodeURIComponent(q)}&visible=${visible}&page=${page}&limit=20`,
      { token },
    );
  } catch (loadError) {
    error = loadError;
  }

  const reviews = payload?.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Feedback"
        title="Reviews"
        description="Moderate customer reviews. Hidden reviews no longer appear on product pages."
      />

      <Card className="rounded-2xl shadow-none">
        <CardContent className="p-4">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            action="/admin/reviews"
          >
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search review text"
                className="pl-9"
              />
            </div>
            <select
              name="visible"
              defaultValue={visible}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
            >
              <option value="all">All reviews</option>
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
            <Button type="submit" variant="outline">
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>Reviews could not load</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      {!error && reviews.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-14 text-center shadow-none">
          <CardContent>
            <p className="font-heading text-lg font-semibold">
              No reviews found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Reviews will appear after customers rate delivered products.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="rounded-2xl shadow-none">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/products/${review.products?.slug}`}
                    className="text-sm font-semibold hover:text-primary"
                  >
                    {review.products?.title || "Product"}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {review.customer_name} · {formatDate(review.created_at)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating value={review.rating} showCount={false} />
                    <Badge
                      variant="outline"
                      className={
                        review.is_visible
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {review.is_visible ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <ReviewVisibilityButton
                    reviewId={review.id}
                    isVisible={review.is_visible}
                  />
                  <AdminDeleteButton
                    endpoint={`/admin/reviews/${review.id}`}
                    label="Delete"
                    confirmText="Permanently delete this review? This cannot be undone."
                  />
                </div>
              </div>
              {review.title ? (
                <p className="mt-3 text-sm font-medium">{review.title}</p>
              ) : null}
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {review.comment}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length > 0 ? (
        <AdminPagination
          meta={payload.meta}
          basePath="/admin/reviews"
          params={{ q, visible }}
        />
      ) : null}
    </div>
  );
}
