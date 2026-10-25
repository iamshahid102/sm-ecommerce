"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Printer, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";
import { NEXT_ORDER_STATUSES, statusLabel } from "@/lib/commerce";

export function AdminOrderPanel({ order }) {
  const router = useRouter();
  const nextStatuses = NEXT_ORDER_STATUSES[order.status] ?? [];
  const [status, setStatus] = useState(nextStatuses[0] ?? "");
  const [note, setNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState(
    order.tracking_number ?? "",
  );
  const [courier, setCourier] = useState(order.courier ?? "");
  const [adminNote, setAdminNote] = useState(order.admin_note ?? "");
  const [statusPending, setStatusPending] = useState(false);
  const [notePending, setNotePending] = useState(false);

  async function saveStatus(event) {
    event.preventDefault();
    if (!status) return;

    setStatusPending(true);
    try {
      await apiFetch(`/admin/orders/${order.id}/status`, {
        method: "PATCH",
        body: {
          status,
          note: note || null,
          tracking_number: trackingNumber || null,
          courier: courier || null,
          admin_note: adminNote || null,
        },
      });
      toast.success(`Order moved to ${statusLabel(status)}.`);
      setNote("");
      router.refresh();
    } catch (error) {
      const details = Array.isArray(error?.details)
        ? error.details.map((item) => item.message).join(" ")
        : "";
      toast.error(details || error.message);
    } finally {
      setStatusPending(false);
    }
  }

  async function saveNote() {
    setNotePending(true);
    try {
      await apiFetch(`/admin/orders/${order.id}/note`, {
        method: "PATCH",
        body: { admin_note: adminNote || null },
      });
      toast.success("Internal note saved.");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setNotePending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl shadow-none">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Fulfilment</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="size-4" aria-hidden="true" />
            Print invoice
          </Button>
        </CardHeader>
        <CardContent>
          {nextStatuses.length === 0 ? (
            <p className="rounded-xl border border-dashed bg-muted/30 px-4 py-5 text-center text-sm text-muted-foreground">
              This order is {statusLabel(order.status).toLowerCase()} and cannot
              move to another status.
            </p>
          ) : (
            <form onSubmit={saveStatus} className="space-y-4">
              <div>
                <Label htmlFor="order-status">Move to status</Label>
                <select
                  id="order-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {nextStatuses.map((next) => (
                    <option key={next} value={next}>
                      {statusLabel(next)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="order-tracking">Tracking number</Label>
                  <Input
                    id="order-tracking"
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="order-courier">Courier</Label>
                  <Input
                    id="order-courier"
                    value={courier}
                    onChange={(event) => setCourier(event.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="order-note">Customer-visible status note</Label>
                <Textarea
                  id="order-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Optional note saved in order history."
                  className="mt-1.5"
                />
              </div>
              <Button type="submit" disabled={statusPending}>
                {statusPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" aria-hidden="true" />
                )}
                Update status
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-none">
        <CardHeader>
          <CardTitle>Internal note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Visible to admins only."
          />
          <Button type="button" variant="outline" onClick={saveNote} disabled={notePending}>
            {notePending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            Save internal note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
