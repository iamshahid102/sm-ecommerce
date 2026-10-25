"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Menu, Pencil, Plus, Trash2 } from "lucide-react";
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
import { apiFetch } from "@/lib/api/client";

function toForm(item) {
  return {
    location: item?.location ?? "header",
    label: item?.label ?? "",
    url: item?.url ?? "",
    parent_id: item?.parent_id ?? "",
    sort_order: String(item?.sort_order ?? 0),
    is_active: item?.is_active !== false,
    opens_new_tab: Boolean(item?.opens_new_tab),
  };
}

export function MenuManager({ initialItems }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
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

  function startEdit(item) {
    setEditing(item);
    setValues(toForm(item));
    setOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    setPending(true);
    const body = {
      location: values.location,
      label: values.label,
      url: values.url,
      parent_id: values.parent_id || null,
      sort_order: values.sort_order,
      is_active: values.is_active,
      opens_new_tab: values.opens_new_tab,
    };

    try {
      if (editing) {
        const updated = await apiFetch(`/admin/cms/menu/${editing.id}`, {
          method: "PATCH",
          body,
        });
        setItems((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success("Menu item updated.");
      } else {
        const created = await apiFetch("/admin/cms/menu", {
          method: "POST",
          body,
        });
        setItems((current) => [...current, created]);
        toast.success("Menu item created.");
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

  async function remove(item) {
    if (!window.confirm(`Delete menu item "${item.label}"?`)) return;
    setDeletingId(item.id);
    try {
      await apiFetch(`/admin/cms/menu/${item.id}`, { method: "DELETE" });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success("Menu item deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  const parents = items.filter((item) => item.id !== editing?.id);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={startAdd}>
          <Plus className="size-4" aria-hidden="true" />
          Add menu item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-12 text-center shadow-none">
          <CardContent>
            <Menu className="mx-auto size-8 text-primary" aria-hidden="true" />
            <p className="mt-3 font-heading text-lg font-semibold">No menu items</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The storefront uses built-in navigation while the menu is empty.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-none">
          <div className="divide-y">
            {items.map((item) => {
              const parent = items.find((entry) => entry.id === item.parent_id);
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{item.label}</p>
                      <Badge variant="outline" className="capitalize">
                        {item.location}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          item.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        {item.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {item.url}
                      {parent ? ` · under ${parent.label}` : ""} · sort{" "}
                      {item.sort_order}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(item)}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(item)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit menu item" : "Add menu item"}
            </DialogTitle>
            <DialogDescription>
              Links must be internal paths such as /products.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="menu-location">Location</Label>
                <select
                  id="menu-location"
                  value={values.location}
                  onChange={(event) => update("location", event.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                >
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
              <div>
                <Label htmlFor="menu-label">Label</Label>
                <Input
                  id="menu-label"
                  value={values.label}
                  onChange={(event) => update("label", event.target.value)}
                  required
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="menu-url">URL</Label>
              <Input
                id="menu-url"
                value={values.url}
                onChange={(event) => update("url", event.target.value)}
                placeholder="/products"
                required
                className="mt-1.5 font-mono"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="menu-parent">Parent item</Label>
                <select
                  id="menu-parent"
                  value={values.parent_id}
                  onChange={(event) => update("parent_id", event.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                >
                  <option value="">No parent</option>
                  {parents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="menu-sort">Sort order</Label>
                <Input
                  id="menu-sort"
                  type="number"
                  min="0"
                  value={values.sort_order}
                  onChange={(event) => update("sort_order", event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 rounded-xl border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={values.is_active}
                  onChange={(event) => update("is_active", event.target.checked)}
                  className="size-4 rounded border-input"
                />
                Active
              </label>
              <label className="flex items-center gap-2 rounded-xl border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={values.opens_new_tab}
                  onChange={(event) =>
                    update("opens_new_tab", event.target.checked)
                  }
                  className="size-4 rounded border-input"
                />
                Open in a new tab
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Create item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
