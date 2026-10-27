import {
  BRAND_SEED,
  CATEGORY_SEED,
  PRODUCT_SEED,
} from "../scripts/data/catalog-seed.js";

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();

  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }

  return [...repeated];
}

describe("catalog seed data", () => {
  test("category and brand slugs are unique", () => {
    expect(duplicates(CATEGORY_SEED.map((item) => item.slug))).toEqual([]);
    expect(duplicates(BRAND_SEED.map((item) => item.slug))).toEqual([]);
  });

  test("every category parent exists and is not the category itself", () => {
    const categorySlugs = new Set(CATEGORY_SEED.map((item) => item.slug));

    for (const category of CATEGORY_SEED) {
      if (!category.parent) continue;
      expect(categorySlugs.has(category.parent)).toBe(true);
      expect(category.parent).not.toBe(category.slug);
    }
  });

  test("every product points at a seeded category and brand", () => {
    const categorySlugs = new Set(CATEGORY_SEED.map((item) => item.slug));
    const brandSlugs = new Set(BRAND_SEED.map((item) => item.slug));

    for (const product of PRODUCT_SEED) {
      expect(categorySlugs.has(product.category)).toBe(true);
      expect(brandSlugs.has(product.brand)).toBe(true);
    }
  });

  test("product slugs, product SKUs, and variant SKUs are unique", () => {
    expect(duplicates(PRODUCT_SEED.map((item) => item.slug))).toEqual([]);
    expect(duplicates(PRODUCT_SEED.map((item) => item.sku))).toEqual([]);

    const variantSkus = PRODUCT_SEED.flatMap((item) =>
      item.variants.map((variant) => variant.sku),
    );

    expect(duplicates(variantSkus)).toEqual([]);
  });

  test("prices, discounts, and stock are internally consistent", () => {
    for (const product of PRODUCT_SEED) {
      expect(product.price).toBeGreaterThan(0);
      expect(product.discount_price).toBeGreaterThan(0);
      expect(product.discount_price).toBeLessThan(product.price);
      expect(product.title.length).toBeGreaterThanOrEqual(3);
      expect(product.title.length).toBeLessThanOrEqual(200);

      if (product.variants.length > 0) {
        const variantStock = product.variants.reduce(
          (total, variant) => total + variant.stock,
          0,
        );
        expect(product.stock).toBe(variantStock);
        expect(
          duplicates(
            product.variants.map((variant) =>
              `${variant.size ?? ""}|${variant.color ?? ""}`.toLowerCase(),
            ),
          ),
        ).toEqual([]);
      } else {
        expect(product.stock).toBeGreaterThan(0);
      }
    }
  });

  test("both departments have a useful product mix", () => {
    const categoryBySlug = new Map(
      CATEGORY_SEED.map((category) => [category.slug, category]),
    );
    const topLevelCounts = {};

    for (const product of PRODUCT_SEED) {
      const category = categoryBySlug.get(product.category);
      const parent = category.parent || category.slug;
      topLevelCounts[parent] = (topLevelCounts[parent] ?? 0) + 1;
    }

    expect(topLevelCounts.books).toBeGreaterThanOrEqual(10);
    expect(topLevelCounts.clothing).toBeGreaterThanOrEqual(10);
    expect(PRODUCT_SEED.filter((product) => product.is_featured).length).toBe(
      8,
    );
  });
});
