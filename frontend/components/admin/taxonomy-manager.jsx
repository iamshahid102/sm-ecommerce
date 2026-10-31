"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { StoreImage } from "@/components/store/store-image";
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

function initialValues(type, item) {
  return {
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    description: item?.description ?? "",
    image_url: item?.image_url ?? item?.logo_url ?? "",
    parent_id: item?.parent_id ?? "",
    is_active: item?.is_active !== false,
    sort_order: String(item?.sort_order ?? 0),
    meta_title: item?.meta_title ?? "",
    meta_description: item?.meta_description ?? "",
    _type: type,
  };
}

export function TaxonomyManager({ type, initialItems }) {
  const isCategory = type === "categories";
  const noun = isCategory ? "category" : "brand";
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues(type));
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function startAdd() {
    setEditing(null);
    setValues(initialValues(type));
    setOpen(true);
  }

  function startEdit(item) {
    setEditing(item);
    setValues(initialValues(type, item));
    setOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    setPending(true);

    const body = {
      name: values.name,
      ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
      description: values.description,
      is_active: values.is_active,
      sort_order: values.sort_order,
      meta_title: values.meta_title,
      meta_description: values.meta_description,
      ...(isCategory
        ? {
            image_url: values.image_url,
            parent_id: values.parent_id || null,
          }
        : { logo_url: values.image_url }),
    };

    try {
      if (editing) {
        const updated = await apiFetch(`/admin/${type}/${editing.id}`, {
          method: "PATCH",
          body,
        });
        setItems((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        toast.success(`${isCategory ? "Category" : "Brand"} updated.`);
      } else {
        const created = await apiFetch(`/admin/${type}`, {
          method: "POST",
          body,
        });
        setItems((current) => [...current, created]);
        toast.success(`${isCategory ? "Category" : "Brand"} created.`);
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
    if (!window.confirm(`Delete the ${noun} "${item.name}"?`)) return;

    setDeletingId(item.id);
    try {
      await apiFetch(`/admin/${type}/${item.id}`, { method: "DELETE" });
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success(`${isCategory ? "Category" : "Brand"} deleted.`);
      router.refresh();
    } catch (error) {
      toast.error(
        error.message ||
          `The ${noun} could not be deleted. It may be used by products.`,
      );
    } finally {
      setDeletingId(null);
    }
  }

  const parents = isCategory
    ? items.filter((item) => item.id !== editing?.id)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" onClick={startAdd}>
          <Plus className="size-4" aria-hidden="true" />
          Add {noun}
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-12 text-center shadow-none">
          <CardContent>
            <p className="font-heading text-lg font-semibold">No {noun}s yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first {noun} to organise the catalog.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="rounded-2xl shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border bg-muted">
                    <StoreImage
                      src={item.image_url || item.logo_url}
                      alt={item.name}
                      className="h-full w-full"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {item.name}
                      </p>
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
                    <p className="truncate text-xs text-muted-foreground">
                      /{item.slug}
                    </p>
                    {item.description ? (
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-1">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${noun}` : `Add ${noun}`}
            </DialogTitle>
            <DialogDescription>
              {isCategory
                ? "Categories group products in navigation and filters."
                : "Brands help customers recognise products."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${type}-name`}>Name</Label>
                <Input
                  id={`${type}-name`}
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor={`${type}-slug`}>Slug (optional)</Label>
                <Input
                  id={`${type}-slug`}
                  value={values.slug}
                  onChange={(event) => update("slug", event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            {isCategory ? (
              <div>
                <Label htmlFor="category-parent">Parent category</Label>
                <select
                  id="category-parent"
                  value={values.parent_id}
                  onChange={(event) => update("parent_id", event.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">No parent</option>
                  {parents.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div>
              <Label htmlFor={`${type}-image`}>
                {isCategory ? "Image URL" : "Logo URL"} (optional)
              </Label>
              <Input
                id={`${type}-image`}
                value={values.image_url}
                onChange={(event) => update("image_url", event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={`${type}-description`}>Description</Label>
              <Textarea
                id={`${type}-description`}
                value={values.description}
                onChange={(event) => update("description", event.target.value)}
                maxLength={2000}
                rows={3}
                className="mt-1.5"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${type}-sort`}>Sort order</Label>
                <Input
                  id={`${type}-sort`}
                  type="number"
                  min="0"
                  value={values.sort_order}
                  onChange={(event) => update("sort_order", event.target.value)}
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
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${type}-meta-title`}>Meta title</Label>
                <Input
                  id={`${type}-meta-title`}
                  value={values.meta_title}
                  onChange={(event) => update("meta_title", event.target.value)}
                  maxLength={70}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor={`${type}-meta-description`}>
                  Meta description
                </Label>
                <Input
                  id={`${type}-meta-description`}
                  value={values.meta_description}
                  onChange={(event) =>
                    update("meta_description", event.target.value)
                  }
                  maxLength={180}
                  className="mt-1.5"
                />
              </div>
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
                {editing ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
