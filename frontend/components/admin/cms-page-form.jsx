"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";
import { startNavigation } from "@/lib/navigation-progress";

function toForm(page) {
  return {
    slug: page?.slug ?? "",
    title: page?.title ?? "",
    excerpt: page?.excerpt ?? "",
    content: page?.content ?? "",
    is_published: Boolean(page?.is_published),
    meta_title: page?.meta_title ?? "",
    meta_description: page?.meta_description ?? "",
    og_image_url: page?.og_image_url ?? "",
  };
}

export function CmsPageForm({ page }) {
  const router = useRouter();
  const [values, setValues] = useState(() => toForm(page));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setPending(true);

    const body = {
      slug: values.slug.trim().toLowerCase(),
      title: values.title,
      excerpt: values.excerpt,
      content: values.content,
      is_published: values.is_published,
      meta_title: values.meta_title,
      meta_description: values.meta_description,
      og_image_url: values.og_image_url,
    };

    try {
      if (page) {
        await apiFetch(`/admin/cms/pages/${page.id}`, {
          method: "PATCH",
          body,
        });
        toast.success("Page updated.");
      } else {
        await apiFetch("/admin/cms/pages", { method: "POST", body });
        toast.success("Page created.");
      }
      startNavigation();
      router.push("/admin/cms/pages");
      router.refresh();
    } catch (submitError) {
      const details = Array.isArray(submitError?.details)
        ? submitError.details.map((item) => item.message).join(" ")
        : "";
      setError(details || submitError.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/admin/cms/pages">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to pages
            </Link>
          </Button>
          <h1 className="mt-2 font-heading text-2xl font-semibold">
            {page ? "Edit page" : "Add page"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Content is sanitised on the server before it is stored.
          </p>
        </div>
        <div className="flex gap-2">
          {page?.is_published ? (
            <Button asChild variant="outline">
              <Link href={`/${page.slug}`} target="_blank">
                <ExternalLink className="size-4" aria-hidden="true" />
                View page
              </Link>
            </Button>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {page ? "Save changes" : "Create page"}
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Page could not be saved</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="page-title">Title</Label>
                <Input
                  id="page-title"
                  value={values.title}
                  onChange={(event) => update("title", event.target.value)}
                  required
                  minLength={2}
                  maxLength={150}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="page-slug">Slug</Label>
                <Input
                  id="page-slug"
                  value={values.slug}
                  onChange={(event) =>
                    update(
                      "slug",
                      event.target.value.toLowerCase().replace(/\s+/g, "-"),
                    )
                  }
                  required
                  placeholder="delivery-policy"
                  className="mt-1.5 font-mono"
                />
              </div>
              <div>
                <Label htmlFor="page-excerpt">Excerpt</Label>
                <Textarea
                  id="page-excerpt"
                  value={values.excerpt}
                  onChange={(event) => update("excerpt", event.target.value)}
                  maxLength={300}
                  rows={2}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Page content</Label>
                <div className="mt-1.5">
                  <RichTextEditor
                    value={values.content}
                    onChange={(html) => update("content", html)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-start gap-3 rounded-xl border p-3">
                <input
                  type="checkbox"
                  checked={values.is_published}
                  onChange={(event) =>
                    update("is_published", event.target.checked)
                  }
                  className="mt-0.5 size-4 rounded border-input"
                />
                <span>
                  <span className="block text-sm font-medium">Published</span>
                  <span className="block text-xs text-muted-foreground">
                    Make this page publicly available.
                  </span>
                </span>
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-none">
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="page-meta-title">Meta title</Label>
                <Input
                  id="page-meta-title"
                  value={values.meta_title}
                  onChange={(event) => update("meta_title", event.target.value)}
                  maxLength={70}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="page-meta-description">Meta description</Label>
                <Textarea
                  id="page-meta-description"
                  value={values.meta_description}
                  onChange={(event) =>
                    update("meta_description", event.target.value)
                  }
                  maxLength={180}
                  rows={3}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="page-og">Open Graph image URL</Label>
                <Input
                  id="page-og"
                  value={values.og_image_url}
                  onChange={(event) =>
                    update("og_image_url", event.target.value)
                  }
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            {page ? "Save changes" : "Create page"}
          </Button>
        </aside>
      </div>
    </form>
  );
}
