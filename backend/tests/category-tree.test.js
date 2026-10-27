import { collectDescendantCategoryIds } from "../src/utils/category-tree.js";

describe("category tree helper", () => {
  const categories = [
    { id: "books", parent_id: null },
    { id: "fiction", parent_id: "books" },
    { id: "classics", parent_id: "fiction" },
    { id: "business", parent_id: "books" },
    { id: "clothing", parent_id: null },
    { id: "mens", parent_id: "clothing" },
  ];

  test("includes the selected category and every nested child", () => {
    const result = collectDescendantCategoryIds(categories, "books").sort();

    expect(result).toEqual(["books", "business", "classics", "fiction"]);
  });

  test("does not include a sibling department", () => {
    const result = collectDescendantCategoryIds(categories, "clothing");

    expect(result.sort()).toEqual(["clothing", "mens"]);
  });

  test("handles a leaf category and a missing root", () => {
    expect(collectDescendantCategoryIds(categories, "classics")).toEqual([
      "classics",
    ]);
    expect(collectDescendantCategoryIds(categories, null)).toEqual([]);
  });

  test("terminates safely when bad data contains a cycle", () => {
    const cyclic = [
      { id: "a", parent_id: "b" },
      { id: "b", parent_id: "a" },
    ];

    expect(collectDescendantCategoryIds(cyclic, "a").sort()).toEqual([
      "a",
      "b",
    ]);
  });
});
