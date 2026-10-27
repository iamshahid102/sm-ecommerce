import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { logger } from "../utils/logger.js";
import { paginationMeta } from "../utils/pagination.js";
import { throwSupabaseError } from "../utils/supabase-error.js";
import {
  sendAdminNewOrder,
  sendOrderConfirmation,
  sendOrderStatusEmail,
} from "./email.service.js";

const ORDER_DETAIL_SELECT = `
  *,
  order_items (*),
  order_status_history (*),
  payments (*)
`;

const RPC_MESSAGES = {
  PROFILE_NOT_FOUND: [404, "Profile not found."],
  ADMIN_CANNOT_SHOP: [403, "Administrators cannot place customer orders."],
  ACCOUNT_BLOCKED: [403, "Your account is blocked. Contact the store."],
  PAYMENT_METHOD_UNAVAILABLE: [422, "That payment method is not available."],
  COD_DISABLED: [422, "Cash on Delivery is currently disabled."],
  ADDRESS_NOT_FOUND: [404, "Delivery address not found."],
  CART_EMPTY: [422, "Your cart is empty."],
  PRODUCT_UNAVAILABLE: [409, "A product in your cart is no longer available."],
  VARIANT_UNAVAILABLE: [409, "A selected product option is no longer available."],
  OUT_OF_STOCK: [409, "One or more items are out of stock."],
  INVALID_PRICE: [422, "A product price is invalid."],
  COUPON_INVALID: [422, "The coupon code is not valid."],
  COUPON_NOT_STARTED: [422, "The coupon is not active yet."],
  COUPON_EXPIRED: [422, "The coupon has expired."],
  COUPON_MIN_SUBTOTAL: [422, "Your cart does not meet the coupon minimum."],
  COUPON_USAGE_LIMIT: [422, "The coupon has reached its usage limit."],
  COUPON_PER_USER_LIMIT: [422, "You have already used this coupon."],
};

function mapRpcError(error) {
  const message = String(error?.message ?? "");
  const key = Object.keys(RPC_MESSAGES).find((code) => message.includes(code));

  if (key) {
    const [status, text] = RPC_MESSAGES[key];
    return new ApiError(status, text, key);
  }

  return new ApiError(500, "Could not place the order.", "ORDER_FAILED");
}

function normalizeOrder(order) {
  if (!order) return null;

  return {
    ...order,
    items: order.order_items ?? [],
    history: [...(order.order_status_history ?? [])].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at),
    ),
    payment: (order.payments ?? [])[0] ?? null,
  };
}

export async function placeOrder(userId, input) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc("place_order", {
    p_user_id: userId,
    p_address_id: input.address_id,
    p_payment_method: input.payment_method,
    p_coupon_code: input.coupon_code ?? null,
    p_customer_note: input.customer_note ?? null,
  });

  if (error) throw mapRpcError(error);

  const order = await getOrderForUser(userId, data.id);

  try {
    await sendOrderConfirmation(order);
  } catch (error) {
    // The order is already committed. Email delivery must never roll it back.
    logger.warn({ err: error, orderId: order.id }, "Order confirmation email failed");
  }

  try {
    await sendAdminNewOrder(order);
  } catch (error) {
    logger.warn({ err: error, orderId: order.id }, "Admin order alert failed");
  }

  return order;
}

export async function listOrdersForUser(userId, filters) {
  const admin = getSupabaseAdmin();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("orders")
    .select(
      `id, order_number, status, payment_method, payment_status, subtotal,
       shipping_fee, discount, tax, total, coupon_code, created_at,
       order_items ( id, title, quantity, image_url, line_total )`,
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error, count } = await query.range(from, to);
  throwSupabaseError(error, "Could not load your orders.");

  return {
    items: (data ?? []).map((order) => ({
      ...order,
      items: order.order_items ?? [],
    })),
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
  };
}

export async function getOrderForUser(userId, orderId) {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  throwSupabaseError(error, "Order not found.", "ORDER_NOT_FOUND");

  if (!data) {
    throw new ApiError(404, "Order not found.", "ORDER_NOT_FOUND");
  }

  return normalizeOrder(data);
}

export async function getOrderForAdmin(orderId) {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .eq("id", orderId)
    .maybeSingle();
  throwSupabaseError(error, "Order not found.", "ORDER_NOT_FOUND");

  if (!data) {
    throw new ApiError(404, "Order not found.", "ORDER_NOT_FOUND");
  }

  return normalizeOrder(data);
}

export async function cancelOrderForUser(userId, orderId) {
  const admin = getSupabaseAdmin();
  const { data: order, error } = await admin
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();
  throwSupabaseError(error, "Order not found.", "ORDER_NOT_FOUND");

  if (!order) {
    throw new ApiError(404, "Order not found.", "ORDER_NOT_FOUND");
  }
  if (!["pending", "confirmed"].includes(order.status)) {
    throw new ApiError(
      409,
      "This order can no longer be cancelled online. Please contact support.",
      "ORDER_NOT_CANCELLABLE",
    );
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("user_id", userId);
  throwSupabaseError(updateError, "Could not cancel the order.");

  const updated = await getOrderForUser(userId, orderId);

  try {
    await sendOrderStatusEmail(updated, "cancelled", "Cancelled by the customer.");
  } catch (error) {
    logger.warn(
      { err: error, orderId },
      "Order cancellation email failed",
    );
  }

  return updated;
}

export async function listOrdersForAdmin(filters) {
  const admin = getSupabaseAdmin();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = admin
    .from("orders")
    .select(
      `id, order_number, user_id, customer_name, customer_email, status,
       payment_method, payment_status, subtotal, total, created_at,
       order_items ( id, title, quantity, line_total )`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const search = filters.q?.replace(/[%,()]/g, " ").trim();
  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query.range(from, to);
  throwSupabaseError(error, "Could not load orders.");

  return {
    items: (data ?? []).map((order) => ({
      ...order,
      items: order.order_items ?? [],
    })),
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
  };
}

export async function updateOrderStatus(orderId, input) {
  const admin = getSupabaseAdmin();
  const { data: current, error } = await admin
    .from("orders")
    .select("id, status, payment_method, customer_email, customer_name, order_number")
    .eq("id", orderId)
    .maybeSingle();
  throwSupabaseError(error, "Order not found.", "ORDER_NOT_FOUND");

  if (!current) {
    throw new ApiError(404, "Order not found.", "ORDER_NOT_FOUND");
  }

  if (current.status === input.status) {
    throw new ApiError(
      409,
      "The order is already in that status.",
      "STATUS_UNCHANGED",
    );
  }

  const payload = { status: input.status };
  if (input.tracking_number !== undefined) {
    payload.tracking_number = input.tracking_number;
  }
  if (input.courier !== undefined) payload.courier = input.courier;
  if (input.admin_note !== undefined) payload.admin_note = input.admin_note;

  if (input.status === "delivered" && current.payment_method === "cod") {
    payload.payment_status = "paid";
  }

  const { data, error: updateError } = await admin
    .from("orders")
    .update(payload)
    .eq("id", orderId)
    .select("id")
    .single();
  throwSupabaseError(updateError, "Could not update the order.");

  if (payload.payment_status === "paid") {
    const { error: paymentError } = await admin
      .from("payments")
      .update({ status: "paid" })
      .eq("order_id", orderId)
      .eq("provider", "cod");
    throwSupabaseError(paymentError, "Could not update the payment.");
  }

  if (input.note) {
    // The database trigger writes the history row; attach the customer-facing
    // note to that row so it appears on the order timeline.
    const { data: history, error: historyError } = await admin
      .from("order_status_history")
      .select("id")
      .eq("order_id", orderId)
      .eq("status", input.status)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    throwSupabaseError(historyError, "Could not load the order timeline.");

    if (history) {
      const { error: noteError } = await admin
        .from("order_status_history")
        .update({ note: input.note })
        .eq("id", history.id);
      throwSupabaseError(noteError, "Could not save the status note.");
    }
  }

  const updated = await getOrderForAdmin(data.id);

  try {
    await sendOrderStatusEmail(updated, input.status, input.note);
  } catch (error) {
    // Email failures do not invalidate a committed status change.
    logger.warn(
      { err: error, orderId, status: input.status },
      "Order status email failed",
    );
  }

  return updated;
}

export async function updateOrderPaymentStatus(orderId, paymentStatus) {
  const admin = getSupabaseAdmin();
  const { data: current, error } = await admin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();
  throwSupabaseError(error, "Order not found.", "ORDER_NOT_FOUND");

  if (!current) {
    throw new ApiError(404, "Order not found.", "ORDER_NOT_FOUND");
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId);
  throwSupabaseError(updateError, "Could not update the payment status.");

  const { error: paymentError } = await admin
    .from("payments")
    .update({ status: paymentStatus })
    .eq("order_id", orderId);
  throwSupabaseError(paymentError, "Could not update the payment record.");

  return getOrderForAdmin(orderId);
}

export async function addOrderNote(orderId, note) {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .update({ admin_note: note })
    .eq("id", orderId)
    .select("id, admin_note")
    .single();
  throwSupabaseError(error, "Could not save the order note.");
  return data;
}
