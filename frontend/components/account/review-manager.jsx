"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StarRating } from "@/components/store/stars";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function ReviewEditor({ review, onSaved }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [title, setTitle] = useState(review.title || "");
  const [comment, setComment] = useState(review.comment);
  const [pending, setPending] = useState(false);

  async function save(event) {
    event.preventDefault();
    setPending(true);
    try {
      const updated = await apiFetch(`/reviews/${review.id}`, {
        method: "PATCH",
        body: { rating, title: title || null, comment },
      });
      onSaved(updated);
      setOpen(false);
      toast.success("Review updated.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Pencil className="size-3.5" aria-hidden="true" />
        Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit your review</DialogTitle>
            <DialogDescription>
              {review.products?.title || "Product review"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`${star} stars`}
                >
                  <Star
                    className={cn(
                      "size-6",
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-slate-300",
                    )}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
            <div>
              <Label htmlFor={`edit-title-${review.id}`}>Title (optional)</Label>
              <Input
                id={`edit-title-${review.id}`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={`edit-comment-${review.id}`}>Review</Label>
              <Textarea
                id={`edit-comment-${review.id}`}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                minLength={10}
                maxLength={2000}
                rows={5}
                required
                className="mt-1.5"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                Save review
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ReviewManager({ initialReviews }) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [pendingId, setPendingId] = useState(null);

  async function remove(review) {
    if (!window.confirm("Delete this review?")) return;

    setPendingId(review.id);
    try {
      await apiFetch(`/reviews/${review.id}`, { method: "DELETE" });
      setReviews((current) => current.filter((item) => item.id !== review.id));
      toast.success("Review deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPendingId(null);
    }
  }

  function handleSaved(updated) {
    setReviews((current) =>
      current.map((review) => (review.id === updated.id ? updated : review)),
    );
    router.refresh();
  }

  if (reviews.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed py-12 text-center shadow-none">
        <CardContent>
          <Star className="mx-auto size-8 text-primary" aria-hidden="true" />
          <h2 className="mt-4 font-heading text-lg font-semibold">
            No reviews yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            After an order is delivered, open its details to review the products
            you received.
          </p>
          <Button asChild className="mt-4">
            <Link href="/account/orders">View orders</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <StarRating value={review.rating} showCount={false} />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ReviewEditor review={review} onSaved={handleSaved} />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(review)}
                  disabled={pendingId === review.id}
                >
                  {pendingId === review.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
            {review.title ? (
              <p className="mt-3 text-sm font-medium">{review.title}</p>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
            {!review.is_visible ? (
              <p className="mt-2 text-xs text-amber-700">
                This review is awaiting moderation and is not public yet.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
