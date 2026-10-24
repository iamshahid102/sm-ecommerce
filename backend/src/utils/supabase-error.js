import { ApiError } from "./api-error.js";

const MISSING_TABLE_CODES = new Set(["42P01", "PGRST205"]);

export function throwSupabaseError(error, fallback, code = "DATABASE_ERROR") {
  if (!error) {
    return;
  }

  if (error.code === "PGRST116") {
    throw new ApiError(404, fallback, "NOT_FOUND");
  }

  if (MISSING_TABLE_CODES.has(error.code)) {
    throw new ApiError(
      503,
      "The database schema is not ready. Apply the Supabase migrations first.",
      "SCHEMA_NOT_READY",
    );
  }

  if (error.code === "23505") {
    throw new ApiError(
      409,
      "A record with those details already exists.",
      "CONFLICT",
    );
  }

  if (error.code === "23503") {
    throw new ApiError(
      409,
      "This record is still referenced by other data.",
      "CONFLICT",
    );
  }

  throw new ApiError(500, fallback, code);
}
