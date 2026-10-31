export function paginationMeta({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(Number(total ?? 0) / limit));

  return {
    page,
    limit,
    total: Number(total ?? 0),
    totalPages,
  };
}
