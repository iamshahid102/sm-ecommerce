import test from "node:test";
import assert from "node:assert/strict";

import { flattenCategories } from "../lib/category-tree.js";

test("categories are grouped below their parent with readable paths", () => {
  const rows = flattenCategories([
    { id: "clothing", name: "Clothing", parent_id: null, sort_order: 2 },
    { id: "fiction", name: "Fiction", parent_id: "books", sort_order: 2 },
    { id: "books", name: "Books", parent_id: null, sort_order: 1 },
    { id: "classics", name: "Classics", parent_id: "fiction", sort_order: 1 },
    { id: "business", name: "Business", parent_id: "books", sort_order: 1 },
  ]);

  assert.deepEqual(
    rows.map((row) => row.label),
    [
      "Books",
      "Books / Business",
      "Books / Fiction",
      "Books / Fiction / Classics",
      "Clothing",
    ],
  );
});

test("orphaned categories stay visible and cycles terminate safely", () => {
  const rows = flattenCategories([
    { id: "orphan", name: "Orphan", parent_id: "missing", sort_order: 0 },
    { id: "a", name: "A", parent_id: "b", sort_order: 0 },
    { id: "b", name: "B", parent_id: "a", sort_order: 0 },
  ]);

  assert.ok(rows.some((row) => row.label === "Orphan"));
  assert.equal(rows.length, 3);
});

test("empty and invalid input returns an empty list", () => {
  assert.deepEqual(flattenCategories(), []);
  assert.deepEqual(flattenCategories(null), []);
});
