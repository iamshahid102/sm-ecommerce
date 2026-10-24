import { z } from "zod";

const emptyToNull = (value) =>
  typeof value === "string" && value.trim() === "" ? null : value;

export const uuidSchema = z.string().uuid("Enter a valid identifier.");

export const nullableUuid = z.preprocess(
  emptyToNull,
  z.string().uuid("Enter a valid identifier.").nullable(),
);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must use lowercase letters, numbers, and single hyphens.",
  )
  .max(120, "Slug must be 120 characters or fewer.");

const nullableText = (max) =>
  z.preprocess(
    emptyToNull,
    z.string().trim().max(max, `Must be ${max} characters or fewer.`).nullable(),
  );

const optionalUrl = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .max(2048)
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid http(s) URL.")
    .nullable(),
);

export const imageSchema = z.object({
  id: uuidSchema.optional(),
  url: z.string().trim().min(1).max(2048, "Image URL is too long."),
  alt_text: nullableText(160).optional(),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  is_primary: z.coerce.boolean().default(false),
});

export const variantSchema = z.object({
  id: uuidSchema.optional(),
  size: nullableText(40).optional(),
  color: nullableText(40).optional(),
  sku: nullableText(80).optional(),
  price_delta: z.coerce.number().min(-10000000).max(10000000).default(0),
  stock: z.coerce.number().int().min(0).max(1000000).default(0),
  is_active: z.coerce.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
});

const productBase = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title must be 200 characters or fewer."),
  slug: slugSchema.optional(),
  short_description: nullableText(500).optional(),
  description: nullableText(50000).optional(),
  category_id: nullableUuid.optional(),
  brand_id: nullableUuid.optional(),
  price: z.coerce.number().positive("Price must be greater than zero."),
  discount_price: z.preprocess(
    emptyToNull,
    z.coerce.number().positive().nullable(),
  ).optional(),
  sku: nullableText(80).optional(),
  stock: z.coerce.number().int().min(0).max(1000000).default(0),
  low_stock_threshold: z.coerce.number().int().min(0).max(100000).default(5),
  is_published: z.coerce.boolean().default(false),
  is_featured: z.coerce.boolean().default(false),
  meta_title: nullableText(70).optional(),
  meta_description: nullableText(180).optional(),
  og_image_url: optionalUrl.optional(),
  images: z.array(imageSchema).max(8, "Add at most 8 images.").default([]),
  variants: z.array(variantSchema).max(60, "Add at most 60 variants.").default([]),
});

function validateDiscount(product) {
  if (
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    product.discount_price >= product.price
  ) {
    return false;
  }

  const primaryCount = (product.images ?? []).filter(
    (image) => image.is_primary,
  ).length;
  return primaryCount <= 1;
}

export const createProductSchema = productBase
  .strict()
  .refine(validateDiscount, {
    message:
      "Discount price must be lower than the price and only one image can be primary.",
    path: ["discount_price"],
  });

export const updateProductSchema = productBase
  .partial()
  .strict()
  .refine((value) => {
    if (
      value.discount_price !== null &&
      value.discount_price !== undefined &&
      value.price !== undefined &&
      value.discount_price >= value.price
    ) {
      return false;
    }

    return (
      (value.images ?? []).filter((image) => image.is_primary).length <= 1
    );
  }, "Discount price must be lower than the price and only one image can be primary.");

export const categorySchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    slug: slugSchema.optional(),
    description: nullableText(2000).optional(),
    image_url: optionalUrl.optional(),
    parent_id: nullableUuid.optional(),
    is_active: z.coerce.boolean().default(true),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    meta_title: nullableText(70).optional(),
    meta_description: nullableText(180).optional(),
  })
  .strict();

export const brandSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    slug: slugSchema.optional(),
    description: nullableText(2000).optional(),
    logo_url: optionalUrl.optional(),
    is_active: z.coerce.boolean().default(true),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    meta_title: nullableText(70).optional(),
    meta_description: nullableText(180).optional(),
  })
  .strict();

export const productListQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional().catch(undefined),
    category: z.string().trim().max(120).optional().catch(undefined),
    brand: z.string().trim().max(120).optional().catch(undefined),
    featured: z.enum(["true", "false"]).optional().catch(undefined),
    min_price: z.coerce.number().min(0).optional().catch(undefined),
    max_price: z.coerce.number().min(0).optional().catch(undefined),
    sort: z
      .enum(["newest", "price_asc", "price_desc", "rating", "popular"])
      .default("newest")
      .catch("newest"),
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(60).default(20).catch(20),
  })
  .strip();

export const adminProductListQuerySchema = productListQuerySchema.extend({
  status: z
    .enum(["all", "published", "draft", "low_stock", "out_of_stock"])
    .default("all")
    .catch("all"),
});

export const adminListQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional().catch(undefined),
    page: z.coerce.number().int().min(1).default(1).catch(1),
    limit: z.coerce.number().int().min(1).max(100).default(20).catch(20),
  })
  .strip();
