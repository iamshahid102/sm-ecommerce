import {
  couponSchema,
  orderStatusSchema,
  placeOrderSchema,
  reviewSchema,
} from "../src/validators/commerce.validator.js";

describe("commerce validators", () => {
  test("normalises a coupon code and defaults", () => {
    const result = couponSchema.parse({
      code: "save10",
      type: "percent",
      value: "10",
    });

    expect(result.code).toBe("SAVE10");
    expect(result.value).toBe(10);
    expect(result.is_active).toBe(true);
    expect(result.per_user_limit).toBe(1);
  });

  test("rejects percentages above 100", () => {
    const result = couponSchema.safeParse({
      code: "TOO-MUCH",
      type: "percent",
      value: 101,
    });

    expect(result.success).toBe(false);
  });

  test("rejects a coupon that expires before it starts", () => {
    const result = couponSchema.safeParse({
      code: "BAD-DATES",
      type: "fixed",
      value: 250,
      starts_at: "2026-10-25T10:00:00.000Z",
      expires_at: "2026-10-24T10:00:00.000Z",
    });

    expect(result.success).toBe(false);
  });

  test("checkout only accepts Cash on Delivery", () => {
    const valid = placeOrderSchema.safeParse({
      address_id: "11111111-1111-4111-8111-111111111111",
      payment_method: "cod",
    });
    const card = placeOrderSchema.safeParse({
      address_id: "11111111-1111-4111-8111-111111111111",
      payment_method: "card",
    });

    expect(valid.success).toBe(true);
    expect(card.success).toBe(false);
  });

  test("order status updates normalise blank fields to null", () => {
    const result = orderStatusSchema.parse({
      status: "shipped",
      note: "",
      tracking_number: "",
      courier: "",
      admin_note: "",
    });

    expect(result.note).toBeNull();
    expect(result.tracking_number).toBeNull();
    expect(result.courier).toBeNull();
    expect(result.admin_note).toBeNull();
  });

  test("unknown order statuses are rejected", () => {
    expect(() => orderStatusSchema.parse({ status: "archived" })).toThrow();
  });

  test("reviews require a rating from one to five", () => {
    const base = {
      product_id: "11111111-1111-4111-8111-111111111111",
      order_id: "22222222-2222-4222-8222-222222222222",
      title: "",
      comment: "This product works exactly as described.",
    };

    expect(reviewSchema.parse({ ...base, rating: "5" }).rating).toBe(5);
    expect(reviewSchema.parse({ ...base, rating: 1, title: "" }).title).toBeNull();
    expect(reviewSchema.safeParse({ ...base, rating: 6 }).success).toBe(false);
  });
});
