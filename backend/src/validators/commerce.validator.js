import { z } from "zod";

export const uuidSchema = z.string().uuid("Enter a valid identifier.");

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^\+?[0-9][0-9 ()-]{6,19}$/,
    "Enter a valid phone number, for example 03001234567.",
  );

export const addressSchema = z
  .object({
    label: z.string().trim().min(1).max(40).default("Home"),
    full_name: z.string().trim().min(2).max(100),
    phone: phoneSchema,
    address_line1: z.string().trim().min(5).max(200),
    address_line2: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(200).nullable(),
    ).optional(),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    postal_code: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(20).nullable(),
    ).optional(),
    country: z.string().trim().length(2).toUpperCase().default("PK"),
    is_default: z.coerce.boolean().default(false),
  })
  .strict();

export const cartItemSchema = z
  .object({
    product_id: uuidSchema,
    variant_id: z.preprocess(
      (value) => (value === "" ? null : value),
      z.string().uuid().nullable(),
    ).optional(),
    quantity: z.coerce.number().int().min(1).max(99),
  })
  .strict();

export const cartMergeSchema = z
  .object({
    items: z.array(cartItemSchema).max(100).default([]),
  })
  .strict();

export const wishlistSchema = z
  .object({ product_id: uuidSchema })
  .strict();

export const couponValidateSchema = z
  .object({
    code: z.string().trim().toUpperCase().min(3).max(30),
    subtotal: z.coerce.number().min(0),
  })
  .strict();

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,30}$/, "Use 3-30 uppercase letters, numbers, _ or -."),
    description: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(300).nullable(),
    ).optional(),
    type: z.enum(["percent", "fixed"]),
    value: z.coerce.number().positive(),
    min_subtotal: z.coerce.number().min(0).default(0),
    max_discount: z.preprocess(
      (value) => (value === "" ? null : value),
      z.coerce.number().positive().nullable(),
    ).optional(),
    starts_at: z.preprocess(
      (value) => (value === "" ? null : value),
      z.string().datetime({ offset: true }).nullable(),
    ).optional(),
    expires_at: z.preprocess(
      (value) => (value === "" ? null : value),
      z.string().datetime({ offset: true }).nullable(),
    ).optional(),
    usage_limit: z.preprocess(
      (value) => (value === "" ? null : value),
      z.coerce.number().int().positive().nullable(),
    ).optional(),
    per_user_limit: z.coerce.number().int().positive().default(1),
    is_active: z.coerce.boolean().default(true),
  })
  .strict()
  .refine((value) => value.type !== "percent" || value.value <= 100, {
    message: "A percentage coupon cannot exceed 100%.",
    path: ["value"],
  })
  .refine(
    (value) =>
      !value.starts_at ||
      !value.expires_at ||
      new Date(value.expires_at) > new Date(value.starts_at),
    "Expiry must be after the start date.",
  );

export const orderItemInputSchema = z
  .object({
    product_id: uuidSchema,
    variant_id: z.preprocess(
      (value) => (value === "" ? null : value),
      z.string().uuid().nullable(),
    ).optional(),
    quantity: z.coerce.number().int().min(1).max(99),
  })
  .strict();

export const placeOrderSchema = z
  .object({
    address_id: uuidSchema,
    payment_method: z.enum(["cod"], {
      message: "Cash on Delivery is the only available payment method.",
    }),
    coupon_code: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === ""
          ? null
          : value,
      z.string().trim().toUpperCase().max(30).nullable(),
    ).optional(),
    customer_note: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(1000).nullable(),
    ).optional(),
  })
  .strict();

export const orderListQuerySchema = z
  .object({
    status: z
      .enum([
        "all",
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ])
      .default("all")
      .catch("all"),
    q: z.string().trim().max(120).optional().catch(undefined),
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
  })
  .strip();

export const orderStatusSchema = z
  .object({
    status: z.enum([
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ]),
    note: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(500).nullable(),
    ).optional(),
    tracking_number: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(100).nullable(),
    ).optional(),
    courier: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(100).nullable(),
    ).optional(),
    admin_note: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(2000).nullable(),
    ).optional(),
  })
  .strict();

export const reviewSchema = z
  .object({
    product_id: uuidSchema,
    order_id: uuidSchema,
    rating: z.coerce.number().int().min(1).max(5),
    title: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().min(2).max(120).nullable(),
    ).optional(),
    comment: z.string().trim().min(10).max(2000),
  })
  .strict();

export const reviewUpdateSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    title: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().min(2).max(120).nullable(),
    ).optional(),
    comment: z.string().trim().min(10).max(2000).optional(),
  })
  .strict();

export const reviewModerationSchema = z
  .object({ is_visible: z.coerce.boolean() })
  .strict();

export const customerAdminSchema = z
  .object({ is_blocked: z.coerce.boolean() })
  .strict();

export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.email("Enter a valid email address."),
    phone: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? undefined : value,
      phoneSchema.optional(),
    ),
    subject: z.string().trim().min(3).max(150),
    message: z.string().trim().min(10).max(5000),
    website: z.string().max(0).optional(),
  })
  .strict();

export const newsletterSchema = z
  .object({
    email: z.email("Enter a valid email address."),
    source: z.string().trim().max(40).default("website"),
  })
  .strict();

export const newsletterUnsubscribeSchema = z
  .object({ token: z.string().uuid() })
  .strict();

export const reportQuerySchema = z
  .object({
    from: z.string().date().optional().catch(undefined),
    to: z.string().date().optional().catch(undefined),
  })
  .strip();

export const reviewListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(50).default(10).catch(10),
  })
  .strip();

export const adminCustomerQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional().catch(undefined),
    role: z.enum(["all", "customer", "admin"]).default("all").catch("all"),
    blocked: z.enum(["all", "true", "false"]).default("all").catch("all"),
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
  })
  .strip();

export const adminReviewQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional().catch(undefined),
    visible: z.enum(["all", "true", "false"]).default("all").catch("all"),
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
  })
  .strip();

export const adminMessageQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional().catch(undefined),
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
  })
  .strip();

export const adminSubscriberQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional().catch(undefined),
    activeOnly: z.enum(["true", "false"]).default("false").catch("false"),
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
  })
  .strip();

export const adminAuditQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional().catch(undefined),
    entityType: z.string().trim().max(80).optional().catch(undefined),
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
  })
  .strip();

export const adminCouponQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional().catch(undefined),
    activeOnly: z.enum(["true", "false"]).default("false").catch("false"),
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
  })
  .strip();

export const paymentStatusSchema = z
  .object({
    payment_status: z.enum(["unpaid", "paid", "refunded", "failed"]),
  })
  .strict();

export const adminNoteSchema = z
  .object({
    admin_note: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.string().trim().max(2000).nullable(),
    ),
  })
  .strict();

export const readMessageSchema = z
  .object({ is_read: z.coerce.boolean() })
  .strict();

