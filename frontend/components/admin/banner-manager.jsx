"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
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
import { apiFetch, apiUpload } from "@/lib/api/client";

function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toForm(banner) {
  return {
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    image_url: banner?.image_url ?? "",
    mobile_image_url: banner?.mobile_image_url ?? "",
    button_text: banner?.button_text ?? "",
    button_link: banner?.button_link ?? "",
    placement: banner?.placement ?? "home_hero",
    sort_order: String(banner?.sort_order ?? 0),
    is_active: banner?.is_active !== false,
    starts_at: toLocalInput(banner?.starts_at),
    ends_at: toLocalInput(banner?.ends_at),
  };
}

export function BannerManager({ initialBanners }) {
  const router = useRouter();
  const fileRef = useRef(null);
  const [banners, setBanners] = useState(initialBanners);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [values, setValues] = useState(toForm());
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function startAdd() {
    setEditing(null);
    setValues(toForm());
    setOpen(true);
  }

  function startEdit(banner) {
    setEditing(banner);
    setValues(toForm(banner));
    setOpen(true);
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("bucket", "cms");
      formData.append("folder", "banners");
      formData.append("images", file);
      const result = await apiUpload("/admin/uploads", formData);
      const url = result.images?.[0]?.url;
      if (url) {
        update("image_url", url);
        toast.success("Banner image uploaded.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save(event) {
    event.preventDefault();
    setPending(true);

    const body = {
      title: values.title,
      subtitle: values.subtitle,
      image_url: values.image_url,
      mobile_image_url: values.mobile_image_url,
      button_text: values.button_text,
      button_link: values.button_link,
      placement: values.placement,
      sort_order: values.sort_order,
      is_active: values.is_active,
      starts_at: values.starts_at
        ? new Date(values.starts_at).toISOString()
        : null,
      ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : null,
    };

    try {
      if (editing) {
        const updated = await apiFetch(`/admin/cms/banners/${editing.id}`, {
          method: "PATCH",
          body,
        });
        setBanners((current) =>
          current.map((banner) =>
            banner.id === updated.id ? updated : banner,
          ),
        );
        toast.success("Banner updated.");
      } else {
        const created = await apiFetch("/admin/cms/banners", {
          method: "POST",
          body,
        });
        setBanners((current) => [created, ...current]);
        toast.success("Banner created.");
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

  async function remove(banner) {
    if (!window.confirm(`Delete banner "${banner.title}"?`)) return;
    setDeletingId(banner.id);
    try {
      await apiFetch(`/admin/cms/banners/${banner.id}`, { method: "DELETE" });
      setBanners((current) => current.filter((item) => item.id !== banner.id));
      toast.success("Banner deleted.");
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
          Add banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-12 text-center shadow-none">
          <CardContent>
            <ImagePlus
              className="mx-auto size-8 text-primary"
              aria-hidden="true"
            />
            <p className="mt-3 font-heading text-lg font-semibold">
              No banners yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a hero banner or home promotion.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {banners.map((banner) => (
            <Card key={banner.id} className="rounded-2xl shadow-none">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <StoreImage
                      src={banner.image_url}
                      alt={banner.title}
                      className="h-full w-full"
                      sizes="144px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {banner.title}
                      </p>
                      <Badge variant="outline" className="capitalize">
                        {banner.placement.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          banner.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        {banner.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                    {banner.subtitle ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {banner.subtitle}
                      </p>
                    ) : null}
                    {banner.button_text ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Button: {banner.button_text} → {banner.button_link}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sort: {banner.sort_order}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(banner)}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(banner)}
                    disabled={deletingId === banner.id}
                  >
                    {deletingId === banner.id ? (
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
            <DialogTitle>{editing ? "Edit banner" : "Add banner"}</DialogTitle>
            <DialogDescription>
              Banners appear on the homepage according to placement and sort
              order.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label htmlFor="banner-title">Title</Label>
              <Input
                id="banner-title"
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="banner-subtitle">Subtitle</Label>
              <Textarea
                id="banner-subtitle"
                value={values.subtitle}
                onChange={(event) => update("subtitle", event.target.value)}
                maxLength={300}
                rows={2}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="banner-image">Image URL</Label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  id="banner-image"
                  value={values.image_url}
                  onChange={(event) => update("image_url", event.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" aria-hidden="true" />
                  )}
                  Upload
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={upload}
                />
              </div>
              {values.image_url ? (
                <div className="relative mt-2 aspect-[3/1] overflow-hidden rounded-lg border bg-muted">
                  <StoreImage
                    src={values.image_url}
                    alt="Banner preview"
                    className="h-full w-full"
                    sizes="500px"
                  />
                </div>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="banner-placement">Placement</Label>
                <select
                  id="banner-placement"
                  value={values.placement}
                  onChange={(event) => update("placement", event.target.value)}
                  className="mt-1.5 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none"
                >
                  <option value="home_hero">Home hero</option>
                  <option value="home_promo">Home promo</option>
                </select>
              </div>
              <div>
                <Label htmlFor="banner-sort">Sort order</Label>
                <Input
                  id="banner-sort"
                  type="number"
                  min="0"
                  value={values.sort_order}
                  onChange={(event) => update("sort_order", event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="banner-button-text">Button text</Label>
                <Input
                  id="banner-button-text"
                  value={values.button_text}
                  onChange={(event) =>
                    update("button_text", event.target.value)
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="banner-button-link">Button link</Label>
                <Input
                  id="banner-button-link"
                  value={values.button_link}
                  onChange={(event) =>
                    update("button_link", event.target.value)
                  }
                  placeholder="/products"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="banner-starts">Starts at (optional)</Label>
                <Input
                  id="banner-starts"
                  type="datetime-local"
                  value={values.starts_at}
                  onChange={(event) => update("starts_at", event.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="banner-ends">Ends at (optional)</Label>
                <Input
                  id="banner-ends"
                  type="datetime-local"
                  value={values.ends_at}
                  onChange={(event) => update("ends_at", event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 rounded-xl border p-3 text-sm">
              <input
                type="checkbox"
                checked={values.is_active}
                onChange={(event) => update("is_active", event.target.checked)}
                className="size-4 rounded border-input"
              />
              Active
            </label>
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
                {editing ? "Save changes" : "Create banner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
