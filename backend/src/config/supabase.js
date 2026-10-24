import { createClient } from "@supabase/supabase-js";

import {
  env,
  isSupabaseAuthConfigured,
  isSupabaseConfigured,
  isTest,
} from "../config/env.js";
import { ApiError } from "../utils/api-error.js";
import { classifyDatabaseProbe } from "../utils/database-readiness.js";

let adminClient;
let authClient;

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

export function getSupabaseAuth() {
  if (!isSupabaseAuthConfigured) {
    throw new ApiError(
      503,
      "Authentication is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY.",
      "AUTH_NOT_CONFIGURED",
    );
  }

  if (!authClient) {
    authClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          "x-application-name": "sm-store-api-auth",
        },
      },
    });
  }

  return authClient;
}

export { isSupabaseAuthConfigured, isSupabaseConfigured };

export async function pingDatabase() {
  if (!isSupabaseConfigured || isTest) {
    return "not_configured";
  }

  try {
    // Do not use a HEAD request here. PostgREST can answer HEAD requests with
    // 204 before validating that the table exists, which made readiness report
    // "reachable" on a project where the migrations had never been applied.
    // Check one table from each core migration to catch partially applied sets.
    const admin = getSupabaseAdmin();
    const results = await Promise.all([
      admin.from("profiles").select("id").limit(1),
      admin.from("orders").select("id").limit(1),
      admin.from("site_settings").select("id").limit(1),
      admin.from("audit_logs").select("id").limit(1),
    ]);

    return classifyDatabaseProbe(results);
  } catch {
    return "unreachable";
  }
}
