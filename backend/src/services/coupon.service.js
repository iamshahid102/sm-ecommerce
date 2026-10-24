import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { clampDiscount, money, percentDiscount } from "../utils/money.js";
import { throwSupabaseError } from "../utils/supabase-error.js";

export async function listCoupons({ page = 1, limit = 20, q, activeOnly = false } = {}) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = getSupabaseAdmin()
    .from("coupons")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("code", `%${q.replace(/[%,()]/g, " ").trim()}%`);
  if (activeOnly) query = query.eq("is_active", true);

  const { data, error, count } = await query.range(from, to);
  throwSupabaseError(error, "Could not load coupons.");

  return {
    items: data ?? [],
    meta: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
    },
  };
}

export async function createCoupon(input) {
  const { data, error } = await getSupabaseAdmin()
    .from("coupons")
    .insert(input)
    .select()
    .single();
  throwSupabaseError(error, "Could not create the coupon.");
  return data;
}

export async function updateCoupon(id, input) {
  const { data, error } = await getSupabaseAdmin()
    .from("coupons")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  throwSupabaseError(error, "Could not update the coupon.");
  return data;
}

export async function deleteCoupon(id) {
  const { error } = await getSupabaseAdmin().from("coupons").delete().eq("id", id);
  throwSupabaseError(error, "Could not delete the coupon.");
  return { id };
}

export async function validateCoupon({ code, subtotal, userId }) {
  const admin = getSupabaseAdmin();
  const { data: coupon, error } = await admin
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .maybeSingle();
  throwSupabaseError(error, "Could not validate the coupon.");

  if (!coupon) {
    throw new ApiError(422, "This coupon code is not valid.", "COUPON_INVALID");
  }

  const now = Date.now();
  if (!coupon.is_active) {
    throw new ApiError(422, "This coupon is no longer active.", "COUPON_INACTIVE");
  }
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    throw new ApiError(422, "This coupon is not active yet.", "COUPON_NOT_STARTED");
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    throw new ApiError(422, "This coupon has expired.", "COUPON_EXPIRED");
  }
  if (Number(subtotal) < Number(coupon.min_subtotal)) {
    throw new ApiError(
      422,
      `This coupon requires a minimum subtotal of ${coupon.min_subtotal}.`,
      "COUPON_MIN_SUBTOTAL",
    );
  }

  if (coupon.usage_limit !== null) {
    const { count, error: countError } = await admin
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon.id);
    throwSupabaseError(countError, "Could not validate the coupon.");

    if ((count ?? 0) >= coupon.usage_limit) {
      throw new ApiError(
        422,
        "This coupon has reached its usage limit.",
        "COUPON_USAGE_LIMIT",
      );
    }
  }

  if (userId) {
    const { count, error: countError } = await admin
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("user_id", userId);
    throwSupabaseError(countError, "Could not validate the coupon.");

    if ((count ?? 0) >= coupon.per_user_limit) {
      throw new ApiError(
        422,
        "You have already used this coupon.",
        "COUPON_PER_USER_LIMIT",
      );
    }
  }

  const rawDiscount =
    coupon.type === "percent"
      ? percentDiscount(subtotal, coupon.value)
      : Number(coupon.value);
  const capped =
    coupon.max_discount !== null
      ? Math.min(rawDiscount, Number(coupon.max_discount))
      : rawDiscount;
  const discount = clampDiscount(capped, subtotal);

  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      min_subtotal: coupon.min_subtotal,
      max_discount: coupon.max_discount,
    },
    discount: money(discount),
  };
}
