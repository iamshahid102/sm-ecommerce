import { createClient } from "@supabase/supabase-js";

import {
  env,
  isSupabaseConfigured,
  isTest,
} from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

let adminClient;

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured) {
    throw new ApiError(
      503,
      "Database is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      "DATABASE_NOT_CONFIGURED",
    );
  }

  if (!adminClient) {
    adminClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            "x-application-name": "sm-store-api",
          },
        },
      },
    );
  }

  return adminClient;
}

export { isSupabaseConfigured };

export async function pingDatabase() {
  if (!isSupabaseConfigured || isTest) {
    return "not_configured";
  }

  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  return error ? "unreachable" : "reachable";
}
