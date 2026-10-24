import { isSupabaseConfigured, pingDatabase } from "../config/supabase.js";
import { env } from "../config/env.js";

const startedAt = Date.now();

export async function getHealth() {
  return {
    status: "ok",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    services: {
      api: "ok",
      database: isSupabaseConfigured ? "configured" : "not_configured",
    },
  };
}

export async function getReadiness() {
  const database = await pingDatabase();

  return {
    ready: database === "reachable",
    timestamp: new Date().toISOString(),
    services: {
      database,
    },
  };
}
