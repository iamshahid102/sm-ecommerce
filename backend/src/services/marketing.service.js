import { env } from "../config/env.js";
import { getSupabaseAdmin } from "../config/supabase.js";
import { toCsv } from "../utils/csv.js";
import { escapeHtml } from "../utils/html.js";
import { fetchAllRows } from "../utils/supabase-pagination.js";
import { throwSupabaseError } from "../utils/supabase-error.js";
import { sendEmail } from "./email.service.js";

function unsubscribeUrl(token) {
  const base = (env.FRONTEND_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
  return `${base}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

async function sendNewsletterWelcome(email, token) {
  const safeEmail = escapeHtml(email);
  const url = escapeHtml(unsubscribeUrl(token));

  try {
    await sendEmail({
      to: email,
      subject: "Welcome to the SM Store newsletter",
      html: `<p>Hi ${safeEmail},</p>
        <p>Thank you for subscribing to SM Store news and offers.</p>
        <p style="font-size:12px;color:#64748b">You can unsubscribe at any time: <a href="${url}">unsubscribe</a>.</p>`,
    });
  } catch {
    // The subscription is stored even if the welcome email fails.
  }
}

export async function createContactMessage(input) {
  if (input.website) {
    return { accepted: true };
  }

  const payload = {
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone ?? null,
    subject: input.subject,
    message: input.message,
  };

  const { data, error } = await getSupabaseAdmin()
    .from("contact_messages")
    .insert(payload)
    .select("id")
    .single();
  throwSupabaseError(error, "Could not send your message.");

  try {
    await sendEmail({
      to: input.email,
      subject: "We received your message — SM Store",
      html: `<p>Hi ${escapeHtml(input.name)},</p>
        <p>Thank you for contacting SM Store. Our team will reply soon.</p>
        <p><strong>Your message:</strong></p>
        <p>${escapeHtml(input.message).replaceAll("\n", "<br>")}</p>`,
    });
  } catch {
    // The message is stored even if the acknowledgement email fails.
  }

  return { id: data.id, accepted: true };
}

export async function subscribeNewsletter(input) {
  const admin = getSupabaseAdmin();
  const email = input.email.toLowerCase();

  const { data: existing, error } = await admin
    .from("newsletter_subscribers")
    .select("id, is_active, unsubscribe_token")
    .ilike("email", email)
    .maybeSingle();
  throwSupabaseError(error, "Could not subscribe.");

  if (existing) {
    if (!existing.is_active) {
      const { data: reactivated, error: updateError } = await admin
        .from("newsletter_subscribers")
        .update({
          is_active: true,
          unsubscribed_at: null,
          source: input.source,
        })
        .eq("id", existing.id)
        .select("unsubscribe_token")
        .single();
      throwSupabaseError(updateError, "Could not subscribe.");

      await sendNewsletterWelcome(email, reactivated.unsubscribe_token);
    }

    return { subscribed: true, already_subscribed: true };
  }

  const { data: created, error: insertError } = await admin
    .from("newsletter_subscribers")
    .insert({ email, source: input.source })
    .select("unsubscribe_token")
    .single();
  throwSupabaseError(insertError, "Could not subscribe.");

  await sendNewsletterWelcome(email, created.unsubscribe_token);

  return { subscribed: true, already_subscribed: false };
}

export async function exportSubscribersCsv() {
  const rows = await fetchAllRows(
    () =>
      getSupabaseAdmin()
        .from("newsletter_subscribers")
        .select("email, source, is_active, created_at, unsubscribed_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
    { errorMessage: "Could not export subscribers." },
  );

  return toCsv(rows, [
    { key: "email", label: "Email" },
    { key: "source", label: "Source" },
    { key: "created_at", label: "Subscribed" },
  ]);
}
