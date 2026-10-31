"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgePercent, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { formatCurrency, formatDate } from "@/lib/format";

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toForm(coupon) {
  return {
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    type: coupon?.type ?? "percent",
    value: coupon?.value != null ? String(coupon.value) : "",
    min_subtotal:
      coupon?.min_subtotal != null ? String(coupon.min_subtotal) : "0",
    max_discount:
      coupon?.max_discount != null ? String(coupon.max_discount) : "",
    starts_at: toLocalInput(coupon?.starts_at),
    expires_at: toLocalInput(coupon?.expires_at),
    usage_limit: coupon?.usage_limit != null ? String(coupon.usage_limit) : "",
    per_user_limit:
      coupon?.per_user_limit != null ? String(coupon.per_user_limit) : "1",
    is_active: coupon?.is_active !== false,
  };
}

export function CouponManager({ initialCoupons }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(toForm());
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function startAdd() {
    setEditing(null);
    setValues(toForm());
    setOpen(true);
  }

  function startEdit(coupon) {
    setEditing(coupon);
    setValues(toForm(coupon));
    setOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    setPending(true);

    const body = {
      code: values.code.trim().toUpperCase(),
      description: values.description,
      type: values.type,
      value: values.value,
      min_subtotal: values.min_subtotal,
      max_discount: values.max_discount || null,
      starts_at: values.starts_at
        ? new Date(values.starts_at).toISOString()
        : null,
      expires_at: values.expires_at
        ? new Date(values.expires_at).toISOString()
        : null,
      usage_limit: values.usage_limit || null,
      per_user_limit: values.per_user_limit,
      is_active: values.is_active,
    };

    try {
      if (editing) {
        const updated = await apiFetch(`/admin/coupons/${editing.id}`, {
          method: "PATCH",
          body,
        });
        setCoupons((current) =>
          current.map((coupon) =>
            coupon.id === updated.id ? updated : coupon,
          ),
        );
        toast.success("Coupon updated.");
      } else {
        const created = await apiFetch("/admin/coupons", {
          method: "POST",
          body,
        });
        setCoupons((current) => [created, ...current]);
        toast.success("Coupon created.");
      }
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

  async function remove(coupon) {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;

    setDeletingId(coupon.id);
    try {
      await apiFetch(`/admin/coupons/${coupon.id}`, { method: "DELETE" });
      setCoupons((current) => current.filter((item) => item.id !== coupon.id));
      toast.success("Coupon deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={startAdd}>
          <Plus className="size-4" aria-hidden="true" />
          Add coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-12 text-center shadow-none">
          <CardContent>
            <BadgePercent
              className="mx-auto size-8 text-primary"
              aria-hidden="true"
            />
            <p className="mt-3 font-heading text-lg font-semibold">
              No coupons yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a discount code to use at checkout.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-heading text-base font-semibold">
                        {coupon.code}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          coupon.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {coupon.type === "percent"
                        ? `${Number(coupon.value)}% off`
                        : `${formatCurrency(coupon.value)} off`}
                      {coupon.min_subtotal
                        ? ` · min ${formatCurrency(coupon.min_subtotal)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(coupon)}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(coupon)}
                      disabled={deletingId === coupon.id}
                    >
                      {deletingId === coupon.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
                {coupon.description ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {coupon.description}
                  </p>
                ) : null}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p>Total limit: {coupon.usage_limit ?? "Unlimited"}</p>
                  <p>Per user: {coupon.per_user_limit}</p>
                  <p>
                    Starts:{" "}
                    {coupon.starts_at
                      ? formatDate(coupon.starts_at)
                      : "Immediately"}
                  </p>
                  <p>
                    Expires:{" "}
                    {coupon.expires_at
                      ? formatDate(coupon.expires_at)
                      : "Never"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit coupon" : "Add coupon"}</DialogTitle>
            <DialogDescription>
              Coupons are validated again during checkout.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="coupon-code">Code</Label>
                <Input
                  id="coupon-code"
                  value={values.code}
                  onChange={(event) =>
                    update("code", event.target.value.toUpperCase())
                  }
                  required
                  minLength={3}
                  maxLength={30}
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label htmlFor="coupon-type">Type</Label>
                <select
                  id="coupon-type"
                  value={values.type}
                  onChange={(event) => update("type", event.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                >
                  <option value="percent">Percentage</option>
                  <option value="fixed">Fixed amount</option>
                </select>
              </div>
              <div>
                <Label htmlFor="coupon-value">
                  Value {values.type === "percent" ? "(%)" : "(PKR)"}
                </Label>
                <Input
                  id="coupon-value"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={values.value}
                  onChange={(event) => update("value", event.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="coupon-min">Minimum subtotal</Label>
                <Input
                  id="coupon-min"
                  type="number"
                  step="0.01"
                  min="0"
                  value={values.min_subtotal}
                  onChange={(event) =>
                    update("min_subtotal", event.target.value)
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="coupon-max">Maximum discount (optional)</Label>
                <Input
                  id="coupon-max"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={values.max_discount}
                  onChange={(event) =>
                    update("max_discount", event.target.value)
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="coupon-usage">
                  Total usage limit (optional)
                </Label>
                <Input
                  id="coupon-usage"
                  type="number"
                  min="1"
                  value={values.usage_limit}
                  onChange={(event) =>
                    update("usage_limit", event.target.value)
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="coupon-per-user">Per-user limit</Label>
                <Input
                  id="coupon-per-user"
                  type="number"
                  min="1"
                  value={values.per_user_limit}
                  onChange={(event) =>
                    update("per_user_limit", event.target.value)
                  }
                  className="mt-1.5"
                />
              </div>
              <label className="flex items-center gap-2 self-end rounded-xl border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={values.is_active}
                  onChange={(event) =>
                    update("is_active", event.target.checked)
                  }
                  className="size-4 rounded border-input"
                />
                Active
              </label>
              <div>
                <Label htmlFor="coupon-starts">Starts at (optional)</Label>
                <Input
                  id="coupon-starts"
                  type="datetime-local"
                  value={values.starts_at}
                  onChange={(event) => update("starts_at", event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="coupon-expires">Expires at (optional)</Label>
                <Input
                  id="coupon-expires"
                  type="datetime-local"
                  value={values.expires_at}
                  onChange={(event) => update("expires_at", event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="coupon-description">Description</Label>
              <Textarea
                id="coupon-description"
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                maxLength={300}
                rows={2}
                className="mt-1.5"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Create coupon"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
