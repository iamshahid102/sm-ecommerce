export function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function uniqueSlug(base, suffix) {
  const slug = slugify(base) || "item";
  return suffix ? `${slug}-${suffix}` : slug;
}
