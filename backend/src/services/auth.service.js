import { createClient } from "@supabase/supabase-js";

import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";
import { getSupabaseAdmin, getSupabaseAuth } from "../config/supabase.js";

const PROFILE_COLUMNS = [
  "id",
  "email",
  "full_name",
  "phone",
  "avatar_url",
  "role",
  "is_blocked",
  "created_at",
  "updated_at",
].join(",");

function unavailable(message) {
  return new ApiError(503, message, "AUTH_SERVICE_UNAVAILABLE");
}

export async function resolveCurrentUser(accessToken) {
  const auth = getSupabaseAuth();
  const { data: authData, error: authError } = await auth.auth.getUser(
    accessToken,
  );

  if (authError || !authData?.user) {
    throw new ApiError(
      401,
      "Your session is invalid or has expired. Please sign in again.",
      "UNAUTHORIZED",
    );
  }

  const { data: profile, error: profileError } = await getSupabaseAdmin()
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    throw unavailable(
      "Could not load your profile. Check that the database migrations have been applied.",
    );
  }

  if (!profile) {
    throw new ApiError(
      401,
      "Your profile could not be found. Please sign in again.",
      "UNAUTHORIZED",
    );
  }

  if (profile.is_blocked) {
    throw new ApiError(
      403,
      "Your account has been blocked. Contact the store for help.",
      "ACCOUNT_BLOCKED",
    );
  }

  return {
    ...profile,
    email: authData.user.email ?? profile.email,
    email_confirmed_at: authData.user.email_confirmed_at ?? null,
  };
}

export async function updateProfile(userId, input) {
  const { data, error } = await getSupabaseAdmin()
    .from("profiles")
    .update({
      full_name: input.full_name,
      phone: input.phone ?? null,
    })
    .eq("id", userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error || !data) {
    throw new ApiError(
      500,
      "Could not update your profile.",
      "PROFILE_UPDATE_FAILED",
    );
  }

  return data;
}

export async function changePassword({
  userId,
  email,
  currentPassword,
  newPassword,
}) {
  if (!email) {
    throw new ApiError(
      400,
      "This account does not support password sign-in.",
      "PASSWORD_NOT_AVAILABLE",
    );
  }

  const verifier = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { error: verifyError } = await verifier.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (verifyError) {
    throw new ApiError(
      401,
      "Your current password is incorrect.",
      "INVALID_CURRENT_PASSWORD",
    );
  }

  const { error: updateError } =
    await getSupabaseAdmin().auth.admin.updateUserById(userId, {
      password: newPassword,
    });

  await verifier.auth.signOut({ scope: "local" });

  if (updateError) {
    throw new ApiError(
      500,
      "Could not update your password.",
      "PASSWORD_UPDATE_FAILED",
    );
  }

  return true;
}
