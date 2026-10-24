import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).catch(1),
  limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
});

export function parsePagination(query = {}) {
  const parsed = paginationSchema.parse(query);
  const from = (parsed.page - 1) * parsed.limit;

  return {
    page: parsed.page,
    limit: parsed.limit,
    from,
    to: from + parsed.limit - 1,
  };
}

export function paginationMeta({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(Number(total ?? 0) / limit));

  return {
    page,
    limit,
    total: Number(total ?? 0),
    totalPages,
  };
}

export function applyRange(query, pagination) {
  return query.range(pagination.from, pagination.to);
}
