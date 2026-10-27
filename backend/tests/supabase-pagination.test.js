import { fetchAllRows } from "../src/utils/supabase-pagination.js";

function pagedBuilder(pages, calls = []) {
  let index = 0;

  return () => ({
    async range(from, to) {
      calls.push([from, to]);
      const data = pages[index] ?? [];
      index += 1;
      return { data, error: null };
    },
  });
}

describe("fetchAllRows", () => {
  test("loads every batch until a short page is returned", async () => {
    const calls = [];
    const rows = await fetchAllRows(
      pagedBuilder([[1, 2], [3, 4], [5]], calls),
      { batchSize: 2 },
    );

    expect(rows).toEqual([1, 2, 3, 4, 5]);
    expect(calls).toEqual([
      [0, 1],
      [2, 3],
      [4, 5],
    ]);
  });

  test("stops after one empty batch when the count is an exact multiple", async () => {
    const calls = [];
    const rows = await fetchAllRows(
      pagedBuilder(
        [
          [1, 2],
          [3, 4],
        ],
        calls,
      ),
      { batchSize: 2 },
    );

    expect(rows).toEqual([1, 2, 3, 4]);
    expect(calls).toEqual([
      [0, 1],
      [2, 3],
      [4, 5],
    ]);
  });
});
