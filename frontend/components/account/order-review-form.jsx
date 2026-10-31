"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function OrderReviewForm({ orderId, productId, productTitle }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);

    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: {
          order_id: orderId,
          product_id: productId,
          rating,
          title: title || null,
          comment,
        },
      });
      toast.success("Review submitted. Thank you!");
      setOpen(false);
      router.refresh();
    } catch (error) {
      const details = Array.isArray(error?.details)
        ? error.details.map((item) => item.message).join(" ")
        : "";
      toast.error(details || error.message);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Star className="size-4" aria-hidden="true" />
        Write a review
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-3 w-full rounded-xl border bg-card p-4"
    >
      <p className="text-sm font-medium">Review {productTitle}</p>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
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
        <span className="ml-2 text-xs text-muted-foreground">{rating}/5</span>
      </div>
      <div className="mt-3">
        <Label htmlFor={`review-title-${productId}`}>Title (optional)</Label>
        <Input
          id={`review-title-${productId}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          className="mt-1.5"
        />
      </div>
      <div className="mt-3">
        <Label htmlFor={`review-comment-${productId}`}>Your review</Label>
        <Textarea
          id={`review-comment-${productId}`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          minLength={10}
          maxLength={2000}
          rows={4}
          required
          className="mt-1.5"
        />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Submit review
        </Button>
      </div>
    </form>
  );
}
