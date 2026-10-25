"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutList, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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

function toForm(section) {
  return {
    section_key: section?.section_key ?? "",
    title: section?.title ?? "",
    subtitle: section?.subtitle ?? "",
    config: JSON.stringify(section?.config ?? {}, null, 2),
    sort_order: String(section?.sort_order ?? 0),
    is_active: section?.is_active !== false,
  };
}

export function HomeSectionManager({ initialSections }) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
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

  function startEdit(section) {
    setEditing(section);
    setValues(toForm(section));
    setOpen(true);
  }

  async function save(event) {
    event.preventDefault();
    let config;
    try {
      config = values.config.trim() ? JSON.parse(values.config) : {};
    } catch {
      toast.error("Config must be valid JSON.");
      return;
    }

    setPending(true);
    const body = {
      section_key: values.section_key,
      title: values.title,
      subtitle: values.subtitle,
      config,
      sort_order: values.sort_order,
      is_active: values.is_active,
    };

    try {
      if (editing) {
        const updated = await apiFetch(
          `/admin/cms/home-sections/${editing.id}`,
          { method: "PATCH", body },
        );
        setSections((current) =>
          current.map((section) =>
            section.id === updated.id ? updated : section,
          ),
        );
        toast.success("Section updated.");
      } else {
        const created = await apiFetch("/admin/cms/home-sections", {
          method: "POST",
          body,
        });
        setSections((current) => [...current, created]);
        toast.success("Section created.");
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

  async function remove(section) {
    if (!window.confirm(`Delete section "${section.section_key}"?`)) return;
    setDeletingId(section.id);
    try {
      await apiFetch(`/admin/cms/home-sections/${section.id}`, {
        method: "DELETE",
      });
      setSections((current) =>
        current.filter((item) => item.id !== section.id),
      );
      toast.success("Section deleted.");
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
          Add section
        </Button>
      </div>

      {sections.length === 0 ? (
        <Card className="rounded-2xl border-dashed py-12 text-center shadow-none">
          <CardContent>
            <LayoutList className="mx-auto size-8 text-primary" aria-hidden="true" />
            <p className="mt-3 font-heading text-lg font-semibold">
              No sections configured
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              The homepage falls back to its built-in sections.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {sections.map((section) => (
            <Card key={section.id} className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold">
                        {section.section_key}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          section.is_active
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      >
                        {section.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm">
                      {section.title || "Untitled section"}
                    </p>
                    {section.subtitle ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {section.subtitle}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sort: {section.sort_order}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(section)}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(section)}
                      disabled={deletingId === section.id}
                    >
                      {deletingId === section.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
                <pre className="mt-3 max-h-24 overflow-auto rounded-lg bg-muted/60 p-2 text-[11px] text-muted-foreground">
                  {JSON.stringify(section.config ?? {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit home section" : "Add home section"}
            </DialogTitle>
            <DialogDescription>
              Section keys like featured_products or new_arrivals control homepage blocks.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="section-key">Section key</Label>
                <Input
                  id="section-key"
                  value={values.section_key}
                  onChange={(event) => update("section_key", event.target.value)}
                  placeholder="featured_products"
                  required
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label htmlFor="section-sort">Sort order</Label>
                <Input
                  id="section-sort"
                  type="number"
                  min="0"
                  value={values.sort_order}
                  onChange={(event) => update("sort_order", event.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="section-title">Title</Label>
              <Input
                id="section-title"
                value={values.title}
                onChange={(event) => update("title", event.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="section-subtitle">Subtitle</Label>
              <Textarea
                id="section-subtitle"
                value={values.subtitle}
                onChange={(event) => update("subtitle", event.target.value)}
                rows={2}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="section-config">Config (JSON object)</Label>
              <Textarea
                id="section-config"
                value={values.config}
                onChange={(event) => update("config", event.target.value)}
                rows={6}
                className="mt-1.5 font-mono text-xs"
              />
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : null}
                {editing ? "Save changes" : "Create section"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
