import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const PROFILE_COLUMNS =
  "id, email, full_name, phone, avatar_url, role, is_blocked, created_at";

export const getSessionProfile = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = error ? null : (data?.claims ?? null);

  if (!claims?.sub) {
    return { supabase, claims: null, profile: null, profileError: false };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    supabase,
    claims,
    profile: profile ?? null,
    profileError: Boolean(profileError),
  };
});

export async function requireCustomer(nextPath = "/account") {
  const session = await getSessionProfile();
  const loginUrl = `/login?next=${encodeURIComponent(nextPath)}`;

  if (!session.claims) {
    redirect(loginUrl);
  }

  if (session.profileError) {
    redirect("/login?error=profile_unavailable");
  }

  if (!session.profile) {
    redirect("/login?error=profile_missing");
  }

  if (session.profile.is_blocked) {
    redirect("/login?error=blocked");
  }

  if (session.profile.role === "admin") {
    redirect("/admin");
  }

  return session;
}

export async function requireAdmin() {
  const session = await getSessionProfile();

  if (!session.claims) {
    redirect("/admin/login?next=/admin");
  }

  if (session.profileError) {
    redirect("/admin/login?error=profile_unavailable");
  }

  if (!session.profile) {
    redirect("/admin/login?error=profile_missing");
  }

  if (session.profile.is_blocked) {
    redirect("/admin/login?error=blocked");
  }

  if (session.profile.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  return session;
}

export async function getAccessToken(supabase) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}
