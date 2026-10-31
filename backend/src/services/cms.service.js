import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { paginationMeta } from "../utils/pagination.js";
import { sanitizeCmsHtml } from "../utils/sanitize.js";
import { throwSupabaseError } from "../utils/supabase-error.js";

export async function getSettings() {
  const { data, error } = await getSupabaseAdmin()
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  throwSupabaseError(error, "Could not load store settings.");

  return (
    data ?? {
      store_name: "SM Store",
      store_tagline: "Everyday essentials, thoughtfully selected.",
      currency: "PKR",
      currency_symbol: "Rs",
      shipping_fee: 250,
      free_shipping_threshold: 5000,
      tax_percent: 0,
      cod_enabled: true,
      card_enabled: false,
      social_links: {},
      announcement_active: false,
    }
  );
}

export async function updateSettings(input, actor) {
  const payload = {
    ...input,
    id: 1,
    updated_by: actor?.id ?? null,
  };

  const { data, error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();
  throwSupabaseError(error, "Could not save store settings.");
  return data;
}

export async function listBanners({ activeOnly = true } = {}) {
  let query = getSupabaseAdmin()
    .from("banners")
    .select("*")
    .order("placement", { ascending: true })
    .order("sort_order", { ascending: true });

  if (activeOnly) {
    const now = new Date().toISOString();
    query = query
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`);
  }

  const { data, error } = await query;
  throwSupabaseError(error, "Could not load banners.");
  return data ?? [];
}

export async function createBanner(input) {
  const { data, error } = await getSupabaseAdmin()
    .from("banners")
    .insert(input)
    .select()
    .single();
  throwSupabaseError(error, "Could not create the banner.");
  return data;
}

export async function updateBanner(id, input) {
  const { data, error } = await getSupabaseAdmin()
    .from("banners")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  throwSupabaseError(error, "Could not update the banner.");
  return data;
}

export async function deleteBanner(id) {
  const { error } = await getSupabaseAdmin()
    .from("banners")
    .delete()
    .eq("id", id);
  throwSupabaseError(error, "Could not delete the banner.");
  return { id };
}

export async function listHomeSections({ activeOnly = true } = {}) {
  let query = getSupabaseAdmin()
    .from("home_sections")
    .select("*")
    .order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  throwSupabaseError(error, "Could not load home sections.");
  return data ?? [];
}

export async function createHomeSection(input) {
  const { data, error } = await getSupabaseAdmin()
    .from("home_sections")
    .insert(input)
    .select()
    .single();
  throwSupabaseError(error, "Could not create the home section.");
  return data;
}

export async function updateHomeSection(id, input) {
  const { data, error } = await getSupabaseAdmin()
    .from("home_sections")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  throwSupabaseError(error, "Could not update the home section.");
  return data;
}

export async function deleteHomeSection(id) {
  const { error } = await getSupabaseAdmin()
    .from("home_sections")
    .delete()
    .eq("id", id);
  throwSupabaseError(error, "Could not delete the home section.");
  return { id };
}

export async function getPageBySlug(slug, { publishedOnly = true } = {}) {
  let query = getSupabaseAdmin().from("cms_pages").select("*").eq("slug", slug);
  if (publishedOnly) query = query.eq("is_published", true);

  const { data, error } = await query.maybeSingle();
  throwSupabaseError(error, "Page not found.", "PAGE_NOT_FOUND");

  if (!data) {
    throw new ApiError(404, "Page not found.", "PAGE_NOT_FOUND");
  }

  return { ...data, content: sanitizeCmsHtml(data.content) };
}

export async function listPages({ publishedOnly = true } = {}) {
  let query = getSupabaseAdmin()
    .from("cms_pages")
    .select(
      "id, slug, title, excerpt, is_published, published_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false });
  if (publishedOnly) query = query.eq("is_published", true);

  const { data, error } = await query;
  throwSupabaseError(error, "Could not load pages.");
  return data ?? [];
}

export async function getPageById(id) {
  const { data, error } = await getSupabaseAdmin()
    .from("cms_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwSupabaseError(error, "Page not found.", "PAGE_NOT_FOUND");

  if (!data) {
    throw new ApiError(404, "Page not found.", "PAGE_NOT_FOUND");
  }

  return data;
}

export async function createPage(input) {
  const payload = {
    ...input,
    content: sanitizeCmsHtml(input.content),
    published_at: input.is_published ? new Date().toISOString() : null,
  };
  const { data, error } = await getSupabaseAdmin()
    .from("cms_pages")
    .insert(payload)
    .select()
    .single();
  throwSupabaseError(error, "Could not create the page.");
  return data;
}

export async function updatePage(id, input) {
  const payload = {
    ...input,
    content: sanitizeCmsHtml(input.content),
    published_at: input.is_published ? new Date().toISOString() : null,
  };
  const { data, error } = await getSupabaseAdmin()
    .from("cms_pages")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  throwSupabaseError(error, "Could not update the page.");
  return data;
}

export async function deletePage(id) {
  const { error } = await getSupabaseAdmin()
    .from("cms_pages")
    .delete()
    .eq("id", id);
  throwSupabaseError(error, "Could not delete the page.");
  return { id };
}

export async function listMenuItems({ activeOnly = true } = {}) {
  let query = getSupabaseAdmin()
    .from("menu_items")
    .select("*")
    .order("location", { ascending: true })
    .order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  throwSupabaseError(error, "Could not load the menu.");
  return data ?? [];
}

export async function createMenuItem(input) {
  const { data, error } = await getSupabaseAdmin()
    .from("menu_items")
    .insert(input)
    .select()
    .single();
  throwSupabaseError(error, "Could not create the menu item.");
  return data;
}

export async function updateMenuItem(id, input) {
  const { data, error } = await getSupabaseAdmin()
    .from("menu_items")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  throwSupabaseError(error, "Could not update the menu item.");
  return data;
}

export async function deleteMenuItem(id) {
  const { error } = await getSupabaseAdmin()
    .from("menu_items")
    .delete()
    .eq("id", id);
  throwSupabaseError(error, "Could not delete the menu item.");
  return { id };
}

export async function listContactMessages({ page = 1, limit = 20, q }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = getSupabaseAdmin()
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    const search = q.replace(/[%,()]/g, " ").trim();
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query.range(from, to);
  throwSupabaseError(error, "Could not load contact messages.");

  return {
    items: data ?? [],
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
  };
}

export async function markContactRead(id, isRead = true) {
  const { data, error } = await getSupabaseAdmin()
    .from("contact_messages")
    .update({ is_read: isRead })
    .eq("id", id)
    .select()
    .single();
  throwSupabaseError(error, "Could not update the message.");
  return data;
}

export async function deleteContactMessage(id) {
  const { error } = await getSupabaseAdmin()
    .from("contact_messages")
    .delete()
    .eq("id", id);
  throwSupabaseError(error, "Could not delete the message.");
  return { id };
}

export async function listSubscribers({
  page = 1,
  limit = 20,
  q,
  activeOnly = false,
}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = getSupabaseAdmin()
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("email", `%${q.replace(/[%,()]/g, " ").trim()}%`);
  }
  if (activeOnly === true || activeOnly === "true") {
    query = query.eq("is_active", true);
  }

  const { data, error, count } = await query.range(from, to);
  throwSupabaseError(error, "Could not load subscribers.");

  return {
    items: data ?? [],
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
  };
}

export async function unsubscribeNewsletter(token) {
  const { data, error } = await getSupabaseAdmin()
    .from("newsletter_subscribers")
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token)
    .select("email")
    .maybeSingle();
  throwSupabaseError(error, "Could not unsubscribe.");

  if (!data) {
    throw new ApiError(404, "Subscription not found.", "NOT_FOUND");
  }

  return data;
}
