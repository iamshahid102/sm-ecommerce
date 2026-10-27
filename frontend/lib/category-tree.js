/**
 * Flatten a category list into display rows with a readable parent path.
 *
 * The API returns categories in a flat list. Selects and filters are easier to
 * scan when child categories sit directly below their parent, for example:
 * "Books / Fiction".
 */
export function flattenCategories(categories = []) {
  const items = Array.isArray(categories) ? categories : [];
  const childrenByParent = new Map();

  for (const category of items) {
    if (!category?.id) continue;
    const parentId = category.parent_id || "";
    const children = childrenByParent.get(parentId) ?? [];
    children.push(category);
    childrenByParent.set(parentId, children);
  }

  for (const children of childrenByParent.values()) {
    children.sort(
      (left, right) =>
        Number(left.sort_order ?? 0) - Number(right.sort_order ?? 0) ||
        String(left.name ?? "").localeCompare(String(right.name ?? "")),
    );
  }

  const rows = [];
  const seen = new Set();

  function walk(parentId, path) {
    for (const category of childrenByParent.get(parentId) ?? []) {
      if (seen.has(category.id)) continue;
      seen.add(category.id);

      const nextPath = [...path, category.name];
      rows.push({
        ...category,
        depth: path.length,
        label: nextPath.join(" / "),
        path: nextPath,
      });
      walk(category.id, nextPath);
    }
  }

  walk("", []);

  // Broken parent references or cycles should never make a category disappear
  // from the admin form or storefront filters.
  for (const category of items) {
    if (!category?.id || seen.has(category.id)) continue;
    seen.add(category.id);
    rows.push({
      ...category,
      depth: 0,
      label: category.name,
      path: [category.name],
    });
  }

  return rows;
}
