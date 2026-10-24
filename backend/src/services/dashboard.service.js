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

  const [
    customers,
    products,
    paidOrders,
    lowStockProducts,
    recentOrders,
    ...statusResults
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "customer"),
    admin
      .from("products")
      .select("id, stock, low_stock_threshold", { count: "exact" })
      .is("deleted_at", null),
    admin.from("orders").select("total").eq("payment_status", "paid"),
    admin
      .from("products")
      .select("id, title, slug, stock, low_stock_threshold")
      .is("deleted_at", null)
      .order("stock", { ascending: true })
      .limit(50),
    admin
      .from("orders")
      .select(
        "id, order_number, customer_name, total, status, payment_status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(8),
    ...ORDER_STATUSES.map((status) =>
      admin
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  ]);

  assertResult(customers, "the customer count");
  assertResult(products, "the product count");
  assertResult(paidOrders, "revenue");
  assertResult(lowStockProducts, "low-stock products");
  assertResult(recentOrders, "recent orders");

  const orderStatusCounts = {};
  let totalOrders = 0;

  ORDER_STATUSES.forEach((status, index) => {
    const result = assertResult(statusResults[index], `${status} orders`);
    const count = result.count ?? 0;
    orderStatusCounts[status] = count;
    totalOrders += count;
  });

  const revenue = (paidOrders.data ?? []).reduce(
    (sum, order) => sum + Number(order.total ?? 0),
    0,
  );

  const lowStock = (lowStockProducts.data ?? []).filter(
    (product) => product.stock <= product.low_stock_threshold,
  );

  const lowStockCount = (products.data ?? []).filter(
    (product) => product.stock <= product.low_stock_threshold,
  ).length;

  return {
    stats: {
      totalRevenue: Number(revenue.toFixed(2)),
      totalOrders,
      totalCustomers: customers.count ?? 0,
      totalProducts: products.count ?? 0,
      lowStockCount,
      pendingOrders: orderStatusCounts.pending,
    },
    orderStatusCounts,
    lowStockProducts: lowStock.slice(0, 5),
    recentOrders: recentOrders.data ?? [],
    generatedAt: new Date().toISOString(),
  };
}
