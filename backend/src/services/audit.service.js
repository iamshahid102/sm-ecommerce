import { getSupabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import { paginationMeta } from "../utils/pagination.js";
import { throwSupabaseError } from "../utils/supabase-error.js";

export async function recordAudit({
  actor,
  action,
  entityType,
  entityId,
  changes = {},
  req,
}) {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await getSupabaseAdmin()
      .from("audit_logs")
      .insert({
        actor_id: actor?.id ?? null,
        actor_email: actor?.email ?? null,
        action,
        entity_type: entityType,
        entity_id: entityId ? String(entityId) : null,
        changes,
        ip: req?.ip ?? null,
        user_agent: req?.get?.("user-agent")?.slice(0, 500) ?? null,
      });

    if (error) {
      logger.warn({ err: error, action, entityType }, "Audit log write failed");
    }
  } catch (error) {
    logger.warn({ err: error, action, entityType }, "Audit log write failed");
  }
}

export async function listAuditLogs({ page = 1, limit = 20, q, entityType }) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = getSupabaseAdmin()
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (entityType) query = query.eq("entity_type", entityType);
  if (q) {
    const search = q.replace(/[%,()]/g, " ").trim();
    query = query.or(`action.ilike.%${search}%,actor_email.ilike.%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);
  throwSupabaseError(error, "Could not load audit logs.");

  return {
    items: data ?? [],
    meta: paginationMeta({ page, limit, total: count ?? 0 }),
  };
}
