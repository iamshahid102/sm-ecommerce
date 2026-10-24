const MISSING_SCHEMA_CODE = "PGRST205";

/**
 * Maps the results of the readiness probe queries to a health state.
 *
 * A normal PostgREST `select` returns PGRST205 when a table is missing. A HEAD
 * request does not, so readiness must never rely on `head: true`.
 *
 * @param {Array<{ error: { code?: string } | null }>} results
 * @returns {"reachable" | "schema_missing" | "unreachable"}
 */
export function classifyDatabaseProbe(results) {
  const errors = results.map((result) => result?.error).filter(Boolean);

  if (errors.length === 0) {
    return "reachable";
  }

  if (errors.some((error) => error.code === MISSING_SCHEMA_CODE)) {
    return "schema_missing";
  }

  return "unreachable";
}
