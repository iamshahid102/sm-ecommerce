import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { paginationMeta } from "../utils/pagination.js";
import { throwSupabaseError } from "../utils/supabase-error.js";

export async function listCustomers({
  page = 1,
  limit = 20,
  q,
  role,
  blocked,
}) {
  const admin = getSupabaseAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("profiles")
    .select(
      "id, email, full_name, phone, avatar_url, role, is_blocked, created_at, updated_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (role === "customer" || role === "admin") query = query.eq("role", role);
  if (blocked === "true") query = query.eq("is_blocked", true);
  if (blocked === "false") query = query.eq("is_blocked", false);
  if (q) {
    const search = q.replace(/[%,()]/g, " ").trim();
    query = query.or(
      `email.ilike.%${search}%,full_name.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query.range(from, to);
  throwSupabaseError(error, "Could not load customers.");

  return {
    items: data ?? [],
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
  };
}

export async function getCustomer(id) {
  const admin = getSupabaseAdmin();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwSupabaseError(error, "Customer not found.", "NOT_FOUND");

  if (!profile) {
    throw new ApiError(404, "Customer not found.", "NOT_FOUND");
  }

  const { data: orders, error: ordersError } = await admin
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(50);
  throwSupabaseError(ordersError, "Could not load customer orders.");

  const spent = (orders ?? [])
    .filter((order) => !["cancelled", "returned"].includes(order.status))
    .reduce((sum, order) => sum + Number(order.total), 0);

  return {
    ...profile,
    orders: orders ?? [],
    stats: {
      order_count: orders?.length ?? 0,
      total_spent: Number(spent.toFixed(2)),
    },
  };
}

export async function setCustomerBlocked(id, isBlocked) {
  const admin = getSupabaseAdmin();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", id)
    .maybeSingle();
  throwSupabaseError(error, "Customer not found.", "NOT_FOUND");

  if (!profile) {
    throw new ApiError(404, "Customer not found.", "NOT_FOUND");
  }
  if (profile.role === "admin" && isBlocked) {
    throw new ApiError(
      403,
      "The administrator cannot be blocked.",
      "FORBIDDEN",
    );
  }

  const { data, error: updateError } = await admin
    .from("profiles")
    .update({ is_blocked: isBlocked })
    .eq("id", id)
    .select("id, email, full_name, is_blocked")
    .single();
  throwSupabaseError(updateError, "Could not update the customer.");

  return data;
}
