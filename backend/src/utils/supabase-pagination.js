import { throwSupabaseError } from "./supabase-error.js";

const DEFAULT_BATCH_SIZE = 1000;

/**
 * PostgREST returns at most 1000 rows for an unpaginated select. Reports and
 * CSV exports must not silently stop at that limit, so query builders are
 * recreated for each batch and the batches are concatenated.
 */
export async function fetchAllRows(
  buildQuery,
  { batchSize = DEFAULT_BATCH_SIZE, errorMessage = "Could not load records." } = {},
) {
  const rows = [];

  for (let from = 0; ; from += batchSize) {
    const { data, error } = await buildQuery().range(
      from,
      from + batchSize - 1,
    );
    throwSupabaseError(error, errorMessage);

    const batch = data ?? [];
    rows.push(...batch);

    if (batch.length < batchSize) {
      return rows;
    }
  }
}
