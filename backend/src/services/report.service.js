import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { toCsv } from "../utils/csv.js";
import { throwSupabaseError } from "../utils/supabase-error.js";

const PAKISTAN_OFFSET = "+05:00";
const DAY_MS = 24 * 60 * 60 * 1000;

function resolveRange({ from, to }) {
  const endDate = to ? new Date(`${to}T23:59:59.999${PAKISTAN_OFFSET}`) : new Date();
  const startDate = from
    ? new Date(`${from}T00:00:00.000${PAKISTAN_OFFSET}`)
    : new Date(endDate.getTime() - 29 * DAY_MS);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new ApiError(422, "Invalid report date range.", "INVALID_DATE_RANGE");
  }
  if (startDate > endDate) {
    throw new ApiError(422, "The start date must be before the end date.", "INVALID_DATE_RANGE");
  }
  if (endDate.getTime() - startDate.getTime() > 366 * DAY_MS) {
    throw new ApiError(422, "Reports are limited to 366 days.", "RANGE_TOO_LARGE");
  }

  return { startDate, endDate };
}

function pakistanDay(value) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function fillDays(startDate, endDate) {
  const days = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    days.push(pakistanDay(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export async function getSalesReport(query) {
  const { startDate, endDate } = resolveRange(query);
  const admin = getSupabaseAdmin();

  const { data: orders, error } = await admin
    .from("orders")
    .select(
      `id, order_number, user_id, customer_name, customer_email, status,
       payment_method, payment_status, subtotal, shipping_fee, discount, tax,
       total, coupon_code, created_at,
       order_items ( product_id, title, quantity, unit_price, line_total )`,
    )
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });
  throwSupabaseError(error, "Could not build the sales report.");

  const { count: newCustomers, error: customerError } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .eq("role", "customer");
  throwSupabaseError(customerError, "Could not count new customers.");

  const { data: lowStock, error: stockError } = await admin
    .from("products")
    .select("id, title, slug, stock, low_stock_threshold, is_published")
    .is("deleted_at", null)
    .order("stock", { ascending: true })
    .limit(10);
  throwSupabaseError(stockError, "Could not load inventory.");

  const validOrders = (orders ?? []).filter(
    (order) => !["cancelled", "returned"].includes(order.status),
  );
  const revenue = validOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const itemsSold = validOrders.reduce(
    (sum, order) =>
      sum +
      (order.order_items ?? []).reduce(
        (itemSum, item) => itemSum + item.quantity,
        0,
      ),
    0,
  );

  const dayMap = new Map(
    fillDays(startDate, endDate).map((day) => [
      day,
      { date: day, revenue: 0, orders: 0 },
    ]),
  );
  const productMap = new Map();
  const customerMap = new Map();
  const statusMap = {};

  for (const order of orders ?? []) {
    statusMap[order.status] = (statusMap[order.status] ?? 0) + 1;
  }

  for (const order of validOrders) {
    const day = pakistanDay(order.created_at);
    const entry = dayMap.get(day);
    if (entry) {
      entry.revenue = Number((entry.revenue + Number(order.total)).toFixed(2));
      entry.orders += 1;
    }

    for (const item of order.order_items ?? []) {
      const key = item.product_id ?? item.title;
      const product = productMap.get(key) ?? {
        product_id: item.product_id,
        title: item.title,
        quantity: 0,
        revenue: 0,
      };
      product.quantity += item.quantity;
      product.revenue = Number((product.revenue + Number(item.line_total)).toFixed(2));
      productMap.set(key, product);
    }

    if (order.user_id) {
      const customer = customerMap.get(order.user_id) ?? {
        user_id: order.user_id,
        name: order.customer_name,
        email: order.customer_email,
        orders: 0,
        spent: 0,
      };
      customer.orders += 1;
      customer.spent = Number((customer.spent + Number(order.total)).toFixed(2));
      customerMap.set(order.user_id, customer);
    }
  }

  return {
    range: {
      from: startDate.toISOString(),
      to: endDate.toISOString(),
    },
    summary: {
      revenue: Number(revenue.toFixed(2)),
      orders: validOrders.length,
      average_order_value: validOrders.length
        ? Number((revenue / validOrders.length).toFixed(2))
        : 0,
      items_sold: itemsSold,
      new_customers: newCustomers ?? 0,
      cancelled_orders: (orders ?? []).filter((order) => order.status === "cancelled").length,
      discounts: Number(
        validOrders.reduce((sum, order) => sum + Number(order.discount), 0).toFixed(2),
      ),
    },
    daily: [...dayMap.values()],
    status_breakdown: statusMap,
    top_products: [...productMap.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10),
    top_customers: [...customerMap.values()]
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10),
    low_stock: (lowStock ?? []).filter(
      (product) => product.stock <= product.low_stock_threshold,
    ),
  };
}

export async function exportOrdersCsv(query) {
  const { startDate, endDate } = resolveRange(query);
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select(
      "order_number, customer_name, customer_email, status, payment_method, payment_status, subtotal, shipping_fee, discount, tax, total, coupon_code, created_at",
    )
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: false });
  throwSupabaseError(error, "Could not export orders.");

  return toCsv(data ?? [], [
    { key: "order_number", label: "Order" },
    { key: "customer_name", label: "Customer" },
    { key: "customer_email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "payment_method", label: "Payment method" },
    { key: "payment_status", label: "Payment status" },
    { key: "subtotal", label: "Subtotal" },
    { key: "shipping_fee", label: "Shipping" },
    { key: "discount", label: "Discount" },
    { key: "tax", label: "Tax" },
    { key: "total", label: "Total" },
    { key: "coupon_code", label: "Coupon" },
    { key: "created_at", label: "Created" },
  ]);
}

export async function exportCustomersCsv() {
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .select("email, full_name, phone, role, is_blocked, created_at")
    .order("created_at", { ascending: false });
  throwSupabaseError(error, "Could not export customers.");

  return toCsv(data ?? [], [
    { key: "email", label: "Email" },
    { key: "full_name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "is_blocked", label: "Blocked" },
    { key: "created_at", label: "Joined" },
  ]);
}
