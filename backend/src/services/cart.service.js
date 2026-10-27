import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { money } from "../utils/money.js";
import { throwSupabaseError } from "../utils/supabase-error.js";
import { getSettings } from "./cms.service.js";

const CART_SELECT = `
  id, quantity, product_id, variant_id, created_at, updated_at,
  products (
    id, title, slug, price, discount_price, stock, is_published, deleted_at,
    product_images ( url, alt_text, is_primary, sort_order ),
    product_variants ( id, size, color, price_delta, stock, is_active )
  )
`;

function normalizeLine(line) {
  const product = line.products;
  if (!product || product.deleted_at || !product.is_published) return null;

  const variant = line.variant_id
    ? (product.product_variants ?? []).find(
        (item) => item.id === line.variant_id,
      )
    : null;

  if (line.variant_id && (!variant || !variant.is_active)) return null;

  const images = [...(product.product_images ?? [])].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const unitPrice = money(
    Number(product.discount_price ?? product.price) +
      Number(variant?.price_delta ?? 0),
  );
  const availableStock = variant ? variant.stock : product.stock;

  return {
    id: line.id,
    product_id: line.product_id,
    variant_id: line.variant_id,
    quantity: line.quantity,
    product: {
      id: product.id,
      title: product.title,
      slug: product.slug,
    },
    variant: variant
      ? { id: variant.id, size: variant.size, color: variant.color }
      : null,
    unit_price: unitPrice,
    line_total: money(unitPrice * line.quantity),
    image_url: images[0]?.url ?? null,
    available_stock: availableStock,
  };
}

export async function getCart(userId) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("cart_items")
    .select(CART_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  throwSupabaseError(error, "Could not load your cart.");

  const items = (data ?? []).map(normalizeLine).filter(Boolean);
  const settings = await getSettings();
  const subtotal = money(items.reduce((sum, item) => sum + item.line_total, 0));
  const shippingFee =
    settings.free_shipping_threshold !== null &&
    subtotal >= Number(settings.free_shipping_threshold)
      ? 0
      : Number(settings.shipping_fee ?? 0);
  const tax = money((subtotal * Number(settings.tax_percent ?? 0)) / 100);

  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    summary: {
      subtotal,
      shipping_fee: shippingFee,
      tax,
      tax_percent: Number(settings.tax_percent ?? 0),
      discount: 0,
      total: money(subtotal + shippingFee + tax),
      currency: settings.currency,
      free_shipping_threshold: settings.free_shipping_threshold,
    },
  };
}

async function loadPurchasable(productId, variantId) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("products")
    .select(
      "id, is_published, deleted_at, stock, product_variants ( id, stock, is_active )",
    )
    .eq("id", productId)
    .maybeSingle();
  throwSupabaseError(error, "Could not validate the product.");

  if (!data || !data.is_published || data.deleted_at) {
    throw new ApiError(404, "Product not found.", "PRODUCT_NOT_FOUND");
  }

  let stock = data.stock;
  if (variantId) {
    const variant = (data.product_variants ?? []).find(
      (item) => item.id === variantId,
    );
    if (!variant || !variant.is_active) {
      throw new ApiError(404, "Product option not found.", "VARIANT_NOT_FOUND");
    }
    stock = variant.stock;
  }

  return { ...data, availableStock: stock };
}

export async function addCartItem(userId, input) {
  const admin = getSupabaseAdmin();
  const product = await loadPurchasable(input.product_id, input.variant_id);
  if (product.availableStock <= 0) {
    throw new ApiError(409, "This product is out of stock.", "OUT_OF_STOCK");
  }

  let existingQuery = admin
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", input.product_id);

  existingQuery = input.variant_id
    ? existingQuery.eq("variant_id", input.variant_id)
    : existingQuery.is("variant_id", null);

  const { data: existing, error: existingError } =
    await existingQuery.maybeSingle();
  throwSupabaseError(existingError, "Could not load your cart.");

  const quantity = Math.min(
    99,
    product.availableStock,
    (existing?.quantity ?? 0) + input.quantity,
  );

  if (existing) {
    const { error } = await admin
      .from("cart_items")
      .update({ quantity })
      .eq("id", existing.id);
    throwSupabaseError(error, "Could not update your cart.");
  } else {
    const { error } = await admin.from("cart_items").insert({
      user_id: userId,
      product_id: input.product_id,
      variant_id: input.variant_id ?? null,
      quantity,
    });
    throwSupabaseError(error, "Could not add the item to your cart.");
  }

  return getCart(userId);
}

export async function updateCartItem(userId, id, quantity) {
  const admin = getSupabaseAdmin();
  const { data: line, error: lineError } = await admin
    .from("cart_items")
    .select("id, product_id, variant_id, quantity")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  throwSupabaseError(lineError, "Could not load your cart.");

  if (!line) {
    throw new ApiError(404, "Cart item not found.", "NOT_FOUND");
  }

  const product = await loadPurchasable(line.product_id, line.variant_id);
  if (quantity > product.availableStock) {
    throw new ApiError(
      409,
      `Only ${product.availableStock} item(s) are available.`,
      "INSUFFICIENT_STOCK",
    );
  }

  const { error } = await admin
    .from("cart_items")
    .update({ quantity })
    .eq("id", id)
    .eq("user_id", userId);
  throwSupabaseError(error, "Could not update your cart.");

  return getCart(userId);
}

export async function removeCartItem(userId, id) {
  const { error, count } = await getSupabaseAdmin()
    .from("cart_items")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);
  throwSupabaseError(error, "Could not remove the item from your cart.");

  if (!count) {
    throw new ApiError(404, "Cart item not found.", "NOT_FOUND");
  }

  return getCart(userId);
}

export async function clearCart(userId) {
  const { error } = await getSupabaseAdmin()
    .from("cart_items")
    .delete()
    .eq("user_id", userId);
  throwSupabaseError(error, "Could not clear your cart.");
  return getCart(userId);
}

export async function mergeCart(userId, items) {
  for (const item of items) {
    try {
      await addCartItem(userId, item);
    } catch (error) {
      if (!(error instanceof ApiError) || error.statusCode >= 500) {
        throw error;
      }
    }
  }

  return getCart(userId);
}
