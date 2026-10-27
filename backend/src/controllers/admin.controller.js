import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
} from "../services/coupon.service.js";
import {
  getCustomer,
  listCustomers,
  setCustomerBlocked,
} from "../services/customer.service.js";
import {
  addOrderNote,
  getOrderForAdmin,
  listOrdersForAdmin,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "../services/order.service.js";
import {
  deleteReviewAsAdmin,
  listAdminReviews,
  moderateReview,
} from "../services/review.service.js";
import {
  exportCustomersCsv,
  exportOrdersCsv,
  getSalesReport,
} from "../services/report.service.js";
import { recordAudit } from "../services/audit.service.js";
import { sendSuccess } from "../utils/http.js";

function sendCsv(res, filename, csv) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename.replace(/[^a-z0-9._-]/gi, "-")}"`,
  );
  return res.status(200).send(`\uFEFF${csv}`);
}

export async function adminListOrders(req, res) {
  const result = await listOrdersForAdmin(req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Orders loaded.",
    meta: result.meta,
  });
}

export async function adminGetOrder(req, res) {
  const order = await getOrderForAdmin(req.validated.params.id);
  return sendSuccess(res, order, { message: "Order loaded." });
}

export async function adminUpdateOrderStatus(req, res) {
  const order = await updateOrderStatus(
    req.validated.params.id,
    req.validated.body,
  );
  await recordAudit({
    actor: req.user,
    action: "order.status",
    entityType: "order",
    entityId: order.id,
    changes: {
      status: req.validated.body.status,
      tracking_number: req.validated.body.tracking_number,
      courier: req.validated.body.courier,
    },
    req,
  });
  return sendSuccess(res, order, { message: "Order updated." });
}

export async function adminUpdateOrderPayment(req, res) {
  const order = await updateOrderPaymentStatus(
    req.validated.params.id,
    req.validated.body.payment_status,
  );
  await recordAudit({
    actor: req.user,
    action: "order.payment_status",
    entityType: "order",
    entityId: order.id,
    changes: { payment_status: req.validated.body.payment_status },
    req,
  });
  return sendSuccess(res, order, { message: "Payment status updated." });
}

export async function adminAddOrderNote(req, res) {
  const order = await addOrderNote(
    req.validated.params.id,
    req.validated.body.admin_note,
  );
  await recordAudit({
    actor: req.user,
    action: "order.note",
    entityType: "order",
    entityId: order.id,
    changes: { admin_note: order.admin_note },
    req,
  });
  return sendSuccess(res, order, { message: "Note saved." });
}

export async function adminListReviews(req, res) {
  const result = await listAdminReviews(req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Reviews loaded.",
    meta: result.meta,
  });
}

export async function adminModerateReview(req, res) {
  const review = await moderateReview(
    req.validated.params.id,
    req.validated.body.is_visible,
  );
  await recordAudit({
    actor: req.user,
    action: "review.moderate",
    entityType: "review",
    entityId: review.id,
    changes: { is_visible: review.is_visible },
    req,
  });
  return sendSuccess(res, review, { message: "Review updated." });
}

export async function adminDeleteReview(req, res) {
  const review = await deleteReviewAsAdmin(req.validated.params.id);
  await recordAudit({
    actor: req.user,
    action: "review.delete",
    entityType: "review",
    entityId: review.id,
    req,
  });
  return sendSuccess(res, review, { message: "Review deleted." });
}

export async function adminListCustomers(req, res) {
  const result = await listCustomers(req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Customers loaded.",
    meta: result.meta,
  });
}

export async function adminGetCustomer(req, res) {
  const customer = await getCustomer(req.validated.params.id);
  return sendSuccess(res, customer, { message: "Customer loaded." });
}

export async function adminBlockCustomer(req, res) {
  const customer = await setCustomerBlocked(
    req.validated.params.id,
    req.validated.body.is_blocked,
  );
  await recordAudit({
    actor: req.user,
    action: "customer.block",
    entityType: "profile",
    entityId: customer.id,
    changes: { is_blocked: customer.is_blocked },
    req,
  });
  return sendSuccess(res, customer, { message: "Customer updated." });
}

export async function adminListCoupons(req, res) {
  const result = await listCoupons(req.validated.query);
  return sendSuccess(res, result.items, {
    message: "Coupons loaded.",
    meta: result.meta,
  });
}

export async function adminCreateCoupon(req, res) {
  const coupon = await createCoupon(req.validated.body);
  await recordAudit({
    actor: req.user,
    action: "coupon.create",
    entityType: "coupon",
    entityId: coupon.id,
    changes: { code: coupon.code },
    req,
  });
  return sendSuccess(res, coupon, { status: 201, message: "Coupon created." });
}

export async function adminUpdateCoupon(req, res) {
  const coupon = await updateCoupon(
    req.validated.params.id,
    req.validated.body,
  );
  await recordAudit({
    actor: req.user,
    action: "coupon.update",
    entityType: "coupon",
    entityId: coupon.id,
    changes: req.validated.body,
    req,
  });
  return sendSuccess(res, coupon, { message: "Coupon updated." });
}

export async function adminDeleteCoupon(req, res) {
  await deleteCoupon(req.validated.params.id);
  await recordAudit({
    actor: req.user,
    action: "coupon.delete",
    entityType: "coupon",
    entityId: req.validated.params.id,
    req,
  });
  return sendSuccess(
    res,
    { id: req.validated.params.id },
    {
      message: "Coupon deleted.",
    },
  );
}

export async function adminSalesReport(req, res) {
  const report = await getSalesReport(req.validated.query);
  return sendSuccess(res, report, { message: "Report loaded." });
}

export async function adminExportOrders(req, res) {
  const csv = await exportOrdersCsv(req.validated.query);
  return sendCsv(res, "orders.csv", csv);
}

export async function adminExportCustomers(req, res) {
  const csv = await exportCustomersCsv();
  return sendCsv(res, "customers.csv", csv);
}
