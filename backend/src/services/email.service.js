import { env, isProduction } from "../config/env.js";
import { escapeHtml } from "../utils/html.js";
import { logger } from "../utils/logger.js";

const RESEND_URL = "https://api.resend.com/emails";

export async function sendEmail({ to, subject, html, text }) {
  if (!env.RESEND_API_KEY) {
    logger.info({ to, subject }, "Email skipped: RESEND_API_KEY is not set");
    return { skipped: true };
  }

  const from = env.EMAIL_FROM || "SM Store <onboarding@resend.dev>";
  const response = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(text ? { text } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const error = new Error(
      `Resend email failed with status ${response.status}: ${body.slice(0, 200)}`,
    );

    if (isProduction) {
      logger.error({ err: error, to, subject }, "Transactional email failed");
    }

    throw error;
  }

  return response.json();
}

function layout(title, body) {
  return `<!doctype html>
<html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0b0f1a">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;padding:32px">
    <p style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#2563eb;margin:0 0 8px">SM Store</p>
    <h1 style="font-size:24px;margin:0 0 16px">${title}</h1>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#64748b">This is an automated message from SM Store.</p>
  </div>
</body></html>`;
}

export async function sendOrderConfirmation(order) {
  return sendEmail({
    to: order.customer_email,
    subject: `Order ${order.order_number} confirmed`,
    html: layout(
      "Thank you for your order",
      `<p>Hi ${escapeHtml(order.customer_name)},</p>
       <p>We received your order <strong>${escapeHtml(order.order_number)}</strong>.</p>
       <p>Total: <strong>PKR ${escapeHtml(order.total)}</strong></p>
       <p>Payment method: ${order.payment_method === "cod" ? "Cash on Delivery" : "Card"}</p>
       <p>We will email you again when the status changes.</p>`,
    ),
  });
}

export async function sendAdminNewOrder(order) {
  if (!env.ADMIN_EMAIL) {
    return { skipped: true };
  }

  const itemLines = (order.items ?? [])
    .map(
      (item) =>
        `${escapeHtml(item.quantity)} × ${escapeHtml(item.title)} — ${escapeHtml(item.line_total)}`,
    )
    .join("<br>");

  return sendEmail({
    to: env.ADMIN_EMAIL,
    subject: `New order ${order.order_number}`,
    html: layout(
      "New order received",
      `<p>Order <strong>${escapeHtml(order.order_number)}</strong> was placed by ${escapeHtml(order.customer_name)}.</p>
       <p>Total: <strong>PKR ${escapeHtml(order.total)}</strong></p>
       <p>${itemLines}</p>
       <p>Open the admin order page to confirm and fulfil it.</p>`,
    ),
  });
}

export async function sendOrderStatusEmail(order, status, note) {
  const noteHtml = note
    ? `<p><strong>Note:</strong> ${escapeHtml(note).replaceAll("\n", "<br>")}</p>`
    : "";

  return sendEmail({
    to: order.customer_email,
    subject: `Order ${order.order_number} is now ${status}`,
    html: layout(
      `Your order is ${status}`,
      `<p>Hi ${escapeHtml(order.customer_name)},</p>
       <p>Order <strong>${escapeHtml(order.order_number)}</strong> status is now <strong>${escapeHtml(status)}</strong>.</p>
       ${order.tracking_number ? `<p>Tracking number: <strong>${escapeHtml(order.tracking_number)}</strong></p>` : ""}
       ${noteHtml}`,
    ),
  });
}
