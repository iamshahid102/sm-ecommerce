export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const ORDER_STATUS_STYLES = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  processing: "border-indigo-200 bg-indigo-50 text-indigo-700",
  shipped: "border-sky-200 bg-sky-50 text-sky-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
  returned: "border-slate-200 bg-slate-100 text-slate-700",
};

export const PAYMENT_STATUS_LABELS = {
  unpaid: "Unpaid",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

export const PAYMENT_METHOD_LABELS = {
  cod: "Cash on Delivery",
  card: "Card",
};

export const NEXT_ORDER_STATUSES = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export function statusLabel(status) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function statusStyle(status) {
  return ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.returned;
}

export function paymentMethodLabel(method) {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export function productVariantLabel(variant) {
  if (!variant) return "";
  return [variant.size, variant.color].filter(Boolean).join(" / ");
}
