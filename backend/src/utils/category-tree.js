/**
 * Return a category id together with all of its descendant ids.
 *
 * Catalog filters are stored as a flat list on the client, but products can
 * live on any branch of the category tree. Using this helper means selecting
 * "Books" also returns products assigned to "Fiction", "Academic", and so on.
 */
export function collectDescendantCategoryIds(categories = [], rootId) {
  if (!rootId) return [];

  const childrenByParent = new Map();

  for (const category of categories) {
    if (!category?.id) continue;
    const parentId = category.parent_id || null;
    const children = childrenByParent.get(parentId) ?? [];
    children.push(category.id);
    childrenByParent.set(parentId, children);
  }

  const ids = new Set([rootId]);
  const queue = [rootId];

  while (queue.length > 0) {
    const current = queue.shift();
    for (const childId of childrenByParent.get(current) ?? []) {
      if (ids.has(childId)) continue;
      ids.add(childId);
      queue.push(childId);
    }
  }

  return [...ids];
}
