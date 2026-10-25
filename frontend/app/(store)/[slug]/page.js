import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { PublicApiError, apiFetchPublic } from "@/lib/api/public";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const page = await apiFetchPublic(`/pages/${slug}`);
    return {
      title: page.meta_title || page.title,
      description: page.meta_description || page.excerpt || undefined,
    };
  } catch {
    return { title: "Page" };
  }
}

export default async function CmsPage({ params }) {
  const { slug } = await params;
  let page = null;
  let loadError = null;

  try {
    page = await apiFetchPublic(`/pages/${slug}`);
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }
    loadError = error;
  }

  if (!page) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>Page could not load</AlertTitle>
          <AlertDescription>
            {loadError?.message || "Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="size-3.5" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{page.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {page.title}
        </h1>
        {page.excerpt ? (
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {page.excerpt}
          </p>
        ) : null}
        {page.published_at ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Published {formatDate(page.published_at)}
          </p>
        ) : null}
      </header>

      <div
        className="mt-8 space-y-4 text-sm leading-relaxed text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:leading-7 [&_strong]:font-semibold [&_ul]:space-y-1"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  );
}
