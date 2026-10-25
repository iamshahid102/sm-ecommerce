import {
  brandSchema,
  categorySchema,
  createProductSchema,
  productListQuerySchema,
  updateProductSchema,
} from "../src/validators/catalog.validator.js";

describe("catalog validators", () => {
  test("creates a product with coerced defaults", () => {
    const result = createProductSchema.parse({
      title: "Everyday cotton shirt",
      price: "1500",
    });

    expect(result.price).toBe(1500);
    expect(result.stock).toBe(0);
    expect(result.low_stock_threshold).toBe(5);
    expect(result.images).toEqual([]);
    expect(result.variants).toEqual([]);
    expect(result.is_published).toBe(false);
  });

  test("rejects a discount that is not lower than the price", () => {
    const result = createProductSchema.safeParse({
      title: "Everyday cotton shirt",
      price: 1500,
      discount_price: 1500,
    });

    expect(result.success).toBe(false);
  });

  test("allows only one primary image", () => {
    const result = createProductSchema.safeParse({
      title: "Everyday cotton shirt",
      price: 1500,
      images: [
        { url: "https://example.com/a.jpg", is_primary: true },
        { url: "https://example.com/b.jpg", is_primary: true },
      ],
    });

    expect(result.success).toBe(false);
  });

  test("accepts empty optional values as null", () => {
    const result = categorySchema.parse({
      name: "Shirts",
      image_url: "",
      parent_id: "",
      description: "",
    });

    expect(result.image_url).toBeNull();
    expect(result.parent_id).toBeNull();
    expect(result.description).toBeNull();
  });

  test("brands cannot carry category-only fields", () => {
    expect(() =>
      brandSchema.parse({ name: "Acme", parent_id: null }),
    ).toThrow();
  });

  test("update products accept a single field", () => {
    const result = updateProductSchema.parse({ stock: "12" });
    expect(result.stock).toBe(12);
    expect(result.title).toBeUndefined();
  });

  test("product list query falls back to safe defaults", () => {
    const result = productListQuerySchema.parse({
      sort: "unknown",
      page: "-2",
      limit: "999",
    });

    expect(result.sort).toBe("newest");
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });
});
