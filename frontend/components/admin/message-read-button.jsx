"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, MailOpen } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";

export function MessageReadButton({ messageId, isRead }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    try {
      await apiFetch(`/admin/messages/${messageId}`, {
        method: "PATCH",
        body: { is_read: !isRead },
      });
      toast.success(isRead ? "Marked as unread." : "Marked as read.");
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
      ) : isRead ? (
        <Mail className="size-3.5" aria-hidden="true" />
      ) : (
        <MailOpen className="size-3.5" aria-hidden="true" />
      )}
      {isRead ? "Mark unread" : "Mark read"}
    </Button>
  );
}
