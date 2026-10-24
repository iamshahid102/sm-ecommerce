import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

function assertResult(result, label) {
  if (result.error) {
    throw new ApiError(
      500,
      `Could not load ${label}. Check that the database migrations have been applied.`,
      "DASHBOARD_UNAVAILABLE",
    );
  }

  return result;
}

export async function getDashboardSummary() {
  const admin = getSupabaseAdmin();

  const [metricsResult, recentOrders] = await Promise.all([
    admin.rpc("admin_dashboard_metrics"),
    admin
      .from("orders")
      .select(
        "id, order_number, customer_name, total, status, payment_status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  assertResult(metricsResult, "dashboard metrics");
  assertResult(recentOrders, "recent orders");

  const metrics = metricsResult.data ?? {};
  const orderStatusCounts = {};

  for (const status of ORDER_STATUSES) {
    orderStatusCounts[status] = Number(
      metrics.order_status_counts?.[status] ?? 0,
    );
  }

  const lowStockProducts = Array.isArray(metrics.low_stock_products)
    ? metrics.low_stock_products
    : [];

  return {
    stats: {
      totalRevenue: Number(Number(metrics.total_revenue ?? 0).toFixed(2)),
      totalOrders: Number(metrics.total_orders ?? 0),
      totalCustomers: Number(metrics.total_customers ?? 0),
      totalProducts: Number(metrics.total_products ?? 0),
      lowStockCount: Number(metrics.low_stock_count ?? 0),
      pendingOrders: orderStatusCounts.pending,
    },
    orderStatusCounts,
    lowStockProducts,
    recentOrders: recentOrders.data ?? [],
    generatedAt: new Date().toISOString(),
  };
}
