import { getSupabaseAdmin } from "../config/supabase.js";
import { toCsv } from "../utils/csv.js";
import { throwSupabaseError } from "../utils/supabase-error.js";
import { sendEmail } from "./email.service.js";

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
      html: `<p>Hi ${input.name},</p><p>Thank you for contacting SM Store. Our team will reply soon.</p><p><strong>Your message:</strong></p><p>${input.message.replaceAll("<", "&lt;")}</p>`,
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
    .select("id, is_active")
    .ilike("email", email)
    .maybeSingle();
  throwSupabaseError(error, "Could not subscribe.");

  if (existing) {
    if (!existing.is_active) {
      const { error: updateError } = await admin
        .from("newsletter_subscribers")
        .update({
          is_active: true,
          unsubscribed_at: null,
          source: input.source,
        })
        .eq("id", existing.id);
      throwSupabaseError(updateError, "Could not subscribe.");
    }

    return { subscribed: true, already_subscribed: true };
  }

  const { error: insertError } = await admin
    .from("newsletter_subscribers")
    .insert({ email, source: input.source });
  throwSupabaseError(insertError, "Could not subscribe.");

  return { subscribed: true, already_subscribed: false };
}

export async function exportSubscribersCsv() {
  const { data, error } = await getSupabaseAdmin()
    .from("newsletter_subscribers")
    .select("email, source, is_active, created_at, unsubscribed_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  throwSupabaseError(error, "Could not export subscribers.");
  return toCsv(data ?? [], [
    { key: "email", label: "Email" },
    { key: "source", label: "Source" },
    { key: "created_at", label: "Subscribed" },
  ]);
}
