"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

export function ReviewVisibilityButton({ reviewId, isVisible }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      await apiFetch(`/admin/reviews/${reviewId}`, {
        method: "PATCH",
        body: { is_visible: !isVisible },
      });
      toast.success(isVisible ? "Review hidden." : "Review published.");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : isVisible ? (
        <EyeOff className="size-3.5" aria-hidden="true" />
      ) : (
        <Eye className="size-3.5" aria-hidden="true" />
      )}
      {isVisible ? "Hide" : "Publish"}
    </Button>
  );
}
