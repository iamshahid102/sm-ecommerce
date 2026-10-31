import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { throwSupabaseError } from "../utils/supabase-error.js";

const WISHLIST_SELECT = `
  id, product_id, created_at,
  products (
    id, title, slug, price, discount_price, stock, avg_rating, review_count,
    is_published, deleted_at,
    product_images ( url, alt_text, is_primary, sort_order )
  )
`;

export async function listWishlist(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from("wishlist")
    .select(WISHLIST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  throwSupabaseError(error, "Could not load your wishlist.");

  return (data ?? [])
    .filter((item) => item.products?.is_published && !item.products?.deleted_at)
    .map((item) => {
      const images = [...(item.products.product_images ?? [])].sort((a, b) => {
        if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
        return a.sort_order - b.sort_order;
      });

      return {
        id: item.id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: {
          ...item.products,
          images: undefined,
          primary_image: images[0]?.url ?? null,
          effective_price: Number(
            item.products.discount_price ?? item.products.price,
          ),
        },
      };
    });
}

export async function addWishlist(userId, productId) {
  const admin = getSupabaseAdmin();
  const { data: product, error: productError } = await admin
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("is_published", true)
    .is("deleted_at", null)
    .maybeSingle();
  throwSupabaseError(productError, "Product not found.", "PRODUCT_NOT_FOUND");

  if (!product) {
    throw new ApiError(404, "Product not found.", "PRODUCT_NOT_FOUND");
  }

  const { error } = await admin.from("wishlist").insert({
    user_id: userId,
    product_id: productId,
  });

  if (error?.code === "23505") {
    return { product_id: productId, already_exists: true };
  }
  throwSupabaseError(error, "Could not add the product to your wishlist.");

  return { product_id: productId, already_exists: false };
}

export async function removeWishlist(userId, productId) {
  const { error, count } = await getSupabaseAdmin()
    .from("wishlist")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("product_id", productId);
  throwSupabaseError(error, "Could not remove the product from your wishlist.");

  if (!count) {
    throw new ApiError(404, "Wishlist item not found.", "NOT_FOUND");
  }

  return { product_id: productId };
}
