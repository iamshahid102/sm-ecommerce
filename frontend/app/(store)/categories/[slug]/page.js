import { notFound } from "next/navigation";

import { CatalogPageView } from "@/components/store/catalog-page";
import { apiFetchPublic } from "@/lib/api/public";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    const categories = await apiFetchPublic("/categories");
    const category = categories.find((item) => item.slug === slug);
    if (!category) return { title: "Category" };
    return {
      title: category.meta_title || category.name,
      description:
        category.meta_description ||
        category.description ||
        `Shop ${category.name} at SM Store.`,
    };
  } catch {
    return { title: "Category" };
  }
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const categories = await apiFetchPublic("/categories").catch(() => []);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <CatalogPageView
      searchParams={searchParams}
      basePath={`/categories/${slug}`}
      fixedCategory={slug}
    />
  );
}
