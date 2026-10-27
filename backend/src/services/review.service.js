import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { paginationMeta } from "../utils/pagination.js";
import { throwSupabaseError } from "../utils/supabase-error.js";

const REVIEW_SELECT = `
  id, product_id, user_id, order_id, rating, title, comment, is_visible,
  created_at, updated_at,
  profiles ( full_name ),
  products ( id, title, slug )
`;

function normalizeReview(review) {
  return {
    ...review,
    customer_name: review.profiles?.full_name || "Verified customer",
    profiles: undefined,
  };
}

export async function listProductReviews(productId, { page = 1, limit = 10 }) {
  const admin = getSupabaseAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await admin
    .from("reviews")
    .select(REVIEW_SELECT, { count: "exact" })
    .eq("product_id", productId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .range(from, to);
  throwSupabaseError(error, "Could not load reviews.");

  const { data: product } = await admin
    .from("products")
    .select("avg_rating, review_count")
    .eq("id", productId)
    .maybeSingle();

  return {
    items: (data ?? []).map(normalizeReview),
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
    summary: {
      avg_rating: Number(product?.avg_rating ?? 0),
      review_count: Number(product?.review_count ?? 0),
    },
  };
}

export async function listMyReviews(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from("reviews")
    .select(REVIEW_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  throwSupabaseError(error, "Could not load your reviews.");
  return (data ?? []).map(normalizeReview);
}

async function assertReviewAllowed(userId, productId, orderId) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("orders")
    .select("id, status, order_items ( product_id )")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  throwSupabaseError(error, "Could not validate your order.");

  if (!data) {
    throw new ApiError(404, "Order not found.", "ORDER_NOT_FOUND");
  }
  if (data.status !== "delivered") {
    throw new ApiError(
      422,
      "You can review a product only after delivery.",
      "REVIEW_NOT_ALLOWED",
    );
  }
  if (
    !(data.order_items ?? []).some((item) => item.product_id === productId)
  ) {
    throw new ApiError(
      422,
      "This product is not part of that order.",
      "REVIEW_NOT_ALLOWED",
    );
  }
}

export async function createReview(userId, input) {
  await assertReviewAllowed(userId, input.product_id, input.order_id);

  const { data, error } = await getSupabaseAdmin()
    .from("reviews")
    .insert({
      product_id: input.product_id,
      order_id: input.order_id,
      user_id: userId,
      rating: input.rating,
      title: input.title ?? null,
      comment: input.comment,
    })
    .select(REVIEW_SELECT)
    .single();

  if (error?.code === "23505") {
    throw new ApiError(
      409,
      "You have already reviewed this product.",
      "REVIEW_EXISTS",
    );
  }
  throwSupabaseError(error, "Could not save your review.");

  return normalizeReview(data);
}

export async function updateReview(userId, id, input) {
  const { data, error } = await getSupabaseAdmin()
    .from("reviews")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select(REVIEW_SELECT)
    .maybeSingle();
  throwSupabaseError(error, "Could not update your review.");

  if (!data) {
    throw new ApiError(404, "Review not found.", "NOT_FOUND");
  }

  return normalizeReview(data);
}

export async function deleteReview(userId, id) {
  const { data, error } = await getSupabaseAdmin()
    .from("reviews")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();
  throwSupabaseError(error, "Could not delete your review.");

  if (!data) {
    throw new ApiError(404, "Review not found.", "NOT_FOUND");
  }

  return { id };
}

export async function deleteReviewAsAdmin(id) {
  const { data, error } = await getSupabaseAdmin()
    .from("reviews")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  throwSupabaseError(error, "Could not delete the review.");

  if (!data) {
    throw new ApiError(404, "Review not found.", "NOT_FOUND");
  }

  return { id };
}

export async function listAdminReviews({ page = 1, limit = 20, q, visible }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = getSupabaseAdmin()
    .from("reviews")
    .select(REVIEW_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (visible === "true") query = query.eq("is_visible", true);
  if (visible === "false") query = query.eq("is_visible", false);
  if (q) {
    const search = q.replace(/[%,()]/g, " ").trim();
    query = query.or(`title.ilike.%${search}%,comment.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);
  throwSupabaseError(error, "Could not load reviews.");

  return {
    items: (data ?? []).map(normalizeReview),
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
  };
}

export async function moderateReview(id, isVisible) {
  const { data, error } = await getSupabaseAdmin()
    .from("reviews")
    .update({ is_visible: isVisible })
    .eq("id", id)
    .select(REVIEW_SELECT)
    .single();
  throwSupabaseError(error, "Could not update the review.");
  return normalizeReview(data);
}
