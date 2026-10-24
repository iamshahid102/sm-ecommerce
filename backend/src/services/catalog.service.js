import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { paginationMeta } from "../utils/pagination.js";
import { slugify } from "../utils/slug.js";
import { throwSupabaseError } from "../utils/supabase-error.js";

const PRODUCT_SELECT = `
  id, title, slug, short_description, description, category_id, brand_id,
  price, discount_price, sku, stock, low_stock_threshold, is_published,
  is_featured, avg_rating, review_count, meta_title, meta_description,
  og_image_url, created_at, updated_at,
  categories ( id, name, slug ),
  brands ( id, name, slug ),
  product_images ( id, url, alt_text, sort_order, is_primary ),
  product_variants ( id, size, color, sku, price_delta, stock, is_active, sort_order )
`;

function cleanSearch(value) {
  return String(value ?? "")
    .replace(/[%,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sortProducts(query, sort) {
  if (sort === "price_asc") return query.order("price", { ascending: true });
  if (sort === "price_desc") return query.order("price", { ascending: false });
  if (sort === "rating") return query.order("avg_rating", { ascending: false });
  if (sort === "popular") return query.order("review_count", { ascending: false });
  return query.order("created_at", { ascending: false });
}

function normalizeProduct(product) {
  if (!product) return null;

  const images = [...(product.product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const variants = [...(product.product_variants ?? [])]
    .filter((variant) => variant.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    ...product,
    images,
    variants,
    primary_image: images[0]?.url ?? null,
    effective_price: Number(product.discount_price ?? product.price),
    in_stock: product.stock > 0 || variants.some((variant) => variant.stock > 0),
  };
}

async function resolveCatalogFilters({ category, brand }) {
  const admin = getSupabaseAdmin();
  const filters = {};

  if (category) {
    const { data, error } = await admin
      .from("categories")
      .select("id")
      .eq("slug", category)
      .eq("is_active", true)
      .maybeSingle();

    throwSupabaseError(error, "Category not found.", "CATEGORY_NOT_FOUND");
    if (!data) {
      throw new ApiError(404, "Category not found.", "CATEGORY_NOT_FOUND");
    }
    filters.category_id = data.id;
  }

  if (brand) {
    const { data, error } = await admin
      .from("brands")
      .select("id")
      .eq("slug", brand)
      .eq("is_active", true)
      .maybeSingle();

    throwSupabaseError(error, "Brand not found.", "BRAND_NOT_FOUND");
    if (!data) {
      throw new ApiError(404, "Brand not found.", "BRAND_NOT_FOUND");
    }
    filters.brand_id = data.id;
  }

  return filters;
}

export async function listProducts(filters) {
  const admin = getSupabaseAdmin();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_published", true)
    .is("deleted_at", null);

  const resolved = await resolveCatalogFilters(filters);
  if (resolved.category_id) query = query.eq("category_id", resolved.category_id);
  if (resolved.brand_id) query = query.eq("brand_id", resolved.brand_id);
  if (filters.featured === "true") query = query.eq("is_featured", true);
  if (filters.min_price !== undefined) query = query.gte("price", filters.min_price);
  if (filters.max_price !== undefined) query = query.lte("price", filters.max_price);

  const search = cleanSearch(filters.q);
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,short_description.ilike.%${search}%,description.ilike.%${search}%`,
    );
  }

  query = sortProducts(query, filters.sort).range(from, to);

  const { data, error, count } = await query;
  throwSupabaseError(error, "Could not load products.");

  return {
    items: (data ?? []).map(normalizeProduct),
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
  };
}

export async function getProductBySlug(slug) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .maybeSingle();

  throwSupabaseError(error, "Product not found.", "PRODUCT_NOT_FOUND");
  if (!data) {
    throw new ApiError(404, "Product not found.", "PRODUCT_NOT_FOUND");
  }

  return normalizeProduct(data);
}

export async function getRelatedProducts(productId, categoryId, limit = 4) {
  const admin = getSupabaseAdmin();
  let query = admin
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .is("deleted_at", null)
    .neq("id", productId)
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  throwSupabaseError(error, "Could not load related products.");

  return (data ?? []).map(normalizeProduct);
}

export async function listCategories({ activeOnly = true } = {}) {
  const admin = getSupabaseAdmin();
  let query = admin
    .from("categories")
    .select("id, name, slug, description, image_url, parent_id, is_active, sort_order, meta_title, meta_description")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  throwSupabaseError(error, "Could not load categories.");

  return data ?? [];
}

export async function listBrands({ activeOnly = true } = {}) {
  const admin = getSupabaseAdmin();
  let query = admin
    .from("brands")
    .select("id, name, slug, description, logo_url, is_active, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  throwSupabaseError(error, "Could not load brands.");

  return data ?? [];
}

async function uniqueSlug(table, desired, excludeId) {
  const admin = getSupabaseAdmin();
  const base = slugify(desired) || "item";
  let candidate = base;
  let suffix = 1;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    let query = admin.from(table).select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    throwSupabaseError(error, `Could not validate the ${table} slug.`);

    if (!data || data.length === 0) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now().toString(36)}`;
}

function productPayload(input) {
  return {
    title: input.title,
    short_description: input.short_description ?? null,
    description: input.description ?? null,
    category_id: input.category_id ?? null,
    brand_id: input.brand_id ?? null,
    price: input.price,
    discount_price: input.discount_price ?? null,
    sku: input.sku ?? null,
    stock: input.stock ?? 0,
    low_stock_threshold: input.low_stock_threshold ?? 5,
    is_published: input.is_published ?? false,
    is_featured: input.is_featured ?? false,
    meta_title: input.meta_title ?? null,
    meta_description: input.meta_description ?? null,
    og_image_url: input.og_image_url ?? null,
  };
}

async function replaceProductImages(productId, images) {
  const admin = getSupabaseAdmin();
  const { error: deleteError } = await admin
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  throwSupabaseError(deleteError, "Could not update product images.");

  if (!images?.length) return;

  const { error } = await admin.from("product_images").insert(
    images.map((image, index) => ({
      product_id: productId,
      url: image.url,
      alt_text: image.alt_text ?? null,
      sort_order: image.sort_order ?? index,
      is_primary: Boolean(image.is_primary),
    })),
  );
  throwSupabaseError(error, "Could not save product images.");
}

async function syncProductVariants(productId, variants = []) {
  const admin = getSupabaseAdmin();
  const { data: existing, error: existingError } = await admin
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);
  throwSupabaseError(existingError, "Could not load product variants.");

  const keepIds = new Set(
    variants.map((variant) => variant.id).filter(Boolean),
  );
  const removeIds = (existing ?? [])
    .map((variant) => variant.id)
    .filter((id) => !keepIds.has(id));

  if (removeIds.length > 0) {
    const { error } = await admin
      .from("product_variants")
      .delete()
      .in("id", removeIds);
    throwSupabaseError(error, "Could not remove product variants.");
  }

  for (const [index, variant] of variants.entries()) {
    const payload = {
      product_id: productId,
      size: variant.size ?? null,
      color: variant.color ?? null,
      sku: variant.sku ?? null,
      price_delta: variant.price_delta ?? 0,
      stock: variant.stock ?? 0,
      is_active: variant.is_active ?? true,
      sort_order: variant.sort_order ?? index,
    };

    const query = variant.id
      ? admin.from("product_variants").update(payload).eq("id", variant.id)
      : admin.from("product_variants").insert(payload);
    const { error } = await query;
    throwSupabaseError(error, "Could not save product variants.");
  }
}

export async function createProduct(input, actor) {
  const admin = getSupabaseAdmin();
  const slug = await uniqueSlug("products", input.slug || input.title);
  const payload = { ...productPayload(input), slug };

  const { data, error } = await admin
    .from("products")
    .insert(payload)
    .select("id, slug")
    .single();
  throwSupabaseError(error, "Could not create the product.");

  try {
    await replaceProductImages(data.id, input.images);
    await syncProductVariants(data.id, input.variants);
  } catch (error) {
    await admin.from("products").delete().eq("id", data.id);
    throw error;
  }

  return { ...data, actor };
}

export async function updateProduct(id, input) {
  const admin = getSupabaseAdmin();
  const { data: existing, error: existingError } = await admin
    .from("products")
    .select("id, slug, deleted_at")
    .eq("id", id)
    .maybeSingle();
  throwSupabaseError(existingError, "Product not found.", "PRODUCT_NOT_FOUND");

  if (!existing || existing.deleted_at) {
    throw new ApiError(404, "Product not found.", "PRODUCT_NOT_FOUND");
  }

  const payload = {};
  for (const key of [
    "title",
    "short_description",
    "description",
    "category_id",
    "brand_id",
    "price",
    "discount_price",
    "sku",
    "stock",
    "low_stock_threshold",
    "is_published",
    "is_featured",
    "meta_title",
    "meta_description",
    "og_image_url",
  ]) {
    if (input[key] !== undefined) {
      payload[key] =
        key === "category_id" || key === "brand_id" ? input[key] || null : input[key];
    }
  }

  if (input.slug || input.title) {
    payload.slug = await uniqueSlug(
      "products",
      input.slug || input.title || existing.slug,
      id,
    );
  }

  const { data, error } = await admin
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("id, slug")
    .single();
  throwSupabaseError(error, "Could not update the product.");

  if (input.images !== undefined) {
    await replaceProductImages(id, input.images);
  }
  if (input.variants !== undefined) {
    await syncProductVariants(id, input.variants);
  }

  return data;
}

export async function deleteProduct(id) {
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_published: false })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id, title, slug")
    .maybeSingle();
  throwSupabaseError(error, "Could not delete the product.");

  if (!data) {
    throw new ApiError(404, "Product not found.", "PRODUCT_NOT_FOUND");
  }

  return data;
}

export async function listAdminProducts(filters) {
  const admin = getSupabaseAdmin();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .is("deleted_at", null);

  if (filters.status === "published") query = query.eq("is_published", true);
  if (filters.status === "draft") query = query.eq("is_published", false);
  if (filters.status === "out_of_stock") query = query.eq("stock", 0);

  const resolved = await resolveCatalogFilters(filters);
  if (resolved.category_id) query = query.eq("category_id", resolved.category_id);
  if (resolved.brand_id) query = query.eq("brand_id", resolved.brand_id);

  const search = cleanSearch(filters.q);
  if (search) {
    query = query.or(`title.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  query = sortProducts(query, filters.sort).range(from, to);

  const { data, error, count } = await query;
  throwSupabaseError(error, "Could not load products.");

  let items = (data ?? []).map(normalizeProduct);
  if (filters.status === "low_stock") {
    items = items.filter(
      (product) => product.stock > 0 && product.stock <= product.low_stock_threshold,
    );
  }

  return {
    items,
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
  };
}

export async function getAdminProduct(id) {
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  throwSupabaseError(error, "Product not found.", "PRODUCT_NOT_FOUND");

  if (!data) {
    throw new ApiError(404, "Product not found.", "PRODUCT_NOT_FOUND");
  }

  return normalizeProduct(data);
}

export async function createCategory(input) {
  const admin = getSupabaseAdmin();
  const slug = await uniqueSlug("categories", input.slug || input.name);
  const { data, error } = await admin
    .from("categories")
    .insert({ ...input, slug, parent_id: input.parent_id ?? null })
    .select()
    .single();
  throwSupabaseError(error, "Could not create the category.");
  return data;
}

export async function updateCategory(id, input) {
  const admin = getSupabaseAdmin();
  const payload = { ...input, parent_id: input.parent_id ?? null };

  if (input.slug || input.name) {
    payload.slug = await uniqueSlug(
      "categories",
      input.slug || input.name,
      id,
    );
  }

  const { data, error } = await admin
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  throwSupabaseError(error, "Could not update the category.");
  return data;
}

export async function deleteCategory(id) {
  const { error } = await getSupabaseAdmin()
    .from("categories")
    .delete()
    .eq("id", id);
  throwSupabaseError(error, "Could not delete the category.");
  return { id };
}

export async function createBrand(input) {
  const admin = getSupabaseAdmin();
  const slug = await uniqueSlug("brands", input.slug || input.name);
  const { data, error } = await admin
    .from("brands")
    .insert({ ...input, slug })
    .select()
    .single();
  throwSupabaseError(error, "Could not create the brand.");
  return data;
}

export async function updateBrand(id, input) {
  const admin = getSupabaseAdmin();
  const payload = { ...input };

  if (input.slug || input.name) {
    payload.slug = await uniqueSlug("brands", input.slug || input.name, id);
  }

  const { data, error } = await admin
    .from("brands")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  throwSupabaseError(error, "Could not update the brand.");
  return data;
}

export async function deleteBrand(id) {
  const { error } = await getSupabaseAdmin().from("brands").delete().eq("id", id);
  throwSupabaseError(error, "Could not delete the brand.");
  return { id };
}
