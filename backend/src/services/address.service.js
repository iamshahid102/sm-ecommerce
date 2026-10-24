import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";
import { throwSupabaseError } from "../utils/supabase-error.js";

export async function listAddresses(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  throwSupabaseError(error, "Could not load your addresses.");
  return data ?? [];
}

async function clearOtherDefaults(userId, keepId) {
  const admin = getSupabaseAdmin();
  let query = admin
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId)
    .eq("is_default", true);

  if (keepId) query = query.neq("id", keepId);
  const { error } = await query;
  throwSupabaseError(error, "Could not update the default address.");
}

export async function createAddress(userId, input) {
  const admin = getSupabaseAdmin();
  const { count, error: countError } = await admin
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  throwSupabaseError(countError, "Could not load your addresses.");

  const shouldDefault = input.is_default || (count ?? 0) === 0;
  const payload = {
    ...input,
    user_id: userId,
    is_default: Boolean(shouldDefault),
  };

  const { data, error } = await admin
    .from("addresses")
    .insert(payload)
    .select()
    .single();
  throwSupabaseError(error, "Could not save the address.");

  if (data.is_default) {
    await clearOtherDefaults(userId, data.id);
  }

  return data;
}

export async function updateAddress(userId, id, input) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("addresses")
    .update(input)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .maybeSingle();
  throwSupabaseError(error, "Could not update the address.");

  if (!data) {
    throw new ApiError(404, "Address not found.", "NOT_FOUND");
  }

  if (data.is_default) {
    await clearOtherDefaults(userId, data.id);
  }

  return data;
}

export async function deleteAddress(userId, id) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, is_default")
    .maybeSingle();
  throwSupabaseError(error, "Could not delete the address.");

  if (!data) {
    throw new ApiError(404, "Address not found.", "NOT_FOUND");
  }

  if (data.is_default) {
    const { data: next } = await admin
      .from("addresses")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (next) {
      const { error: updateError } = await admin
        .from("addresses")
        .update({ is_default: true })
        .eq("id", next.id);
      throwSupabaseError(updateError, "Could not update the default address.");
    }
  }

  return { id };
}
