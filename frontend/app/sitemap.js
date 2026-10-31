import { apiFetchPublicFull } from "@/lib/api/public";
import { siteUrl } from "@/lib/site";

const BASE = siteUrl();

async function safeList(path) {
  try {
    return await apiFetchPublicFull(path);
  } catch {
    return { data: [], meta: { totalPages: 1 } };
  }
}

export default async function sitemap() {
  const staticRoutes = [
    "",
    "/products",
    "/contact",
    "/cart",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/products" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.5,
  }));

  const [categoriesPayload, pagesPayload, firstProducts] = await Promise.all([
    safeList("/categories"),
    safeList("/pages"),
    safeList("/products?page=1&limit=60"),
  ]);

  const products = [...(firstProducts.data ?? [])];
  const totalPages = firstProducts.meta?.totalPages ?? 1;

  if (totalPages > 1) {
    const remainingPages = Array.from(
      { length: Math.min(totalPages - 1, 9) },
      (_, index) => index + 2,
    );
    const rest = await Promise.all(
      remainingPages.map((page) => safeList(`/products?page=${page}&limit=60`)),
    );
    for (const payload of rest) products.push(...(payload.data ?? []));
  }

  return [
    ...staticRoutes,
    ...(categoriesPayload.data ?? []).map((category) => ({
      url: `${BASE}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${BASE}/products/${product.slug}`,
      lastModified: product.updated_at
        ? new Date(product.updated_at)
        : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...(pagesPayload.data ?? []).map((page) => ({
      url: `${BASE}/${page.slug}`,
      lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    })),
  ];
}
