import { getSupabaseAdmin, isSupabaseConfigured } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

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
