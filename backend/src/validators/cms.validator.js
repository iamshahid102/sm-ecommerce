import { z } from "zod";

const emptyToNull = (value) =>
  typeof value === "string" && value.trim() === "" ? null : value;

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

const socialUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (value === "") return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid http(s) URL.");

const optionalDate = z.preprocess(
  emptyToNull,
  z.string().datetime({ offset: true }).nullable(),
);

const menuUrl = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine(
    (value) =>
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\"),
    "Menu links must be internal paths such as /products.",
  );

export const settingsSchema = z
  .object({
    store_name: z.string().trim().min(2).max(80),
    store_tagline: nullableText(160).optional(),
    logo_url: optionalUrl.optional(),
    favicon_url: optionalUrl.optional(),
    currency: z.string().trim().length(3).toUpperCase(),
    currency_symbol: z.string().trim().min(1).max(8),
    shipping_fee: z.coerce.number().min(0).max(1000000),
    free_shipping_threshold: z.preprocess(
      emptyToNull,
      z.coerce.number().min(0).nullable(),
    ).optional(),
    tax_percent: z.coerce.number().min(0).max(100),
    cod_enabled: z.coerce.boolean(),
    card_enabled: z.coerce.boolean().default(false),
    contact_email: z.preprocess(
      emptyToNull,
      z.email("Enter a valid email address.").nullable(),
    ).optional(),
    contact_phone: nullableText(30).optional(),
    whatsapp_number: nullableText(30).optional(),
    address: nullableText(300).optional(),
    city: nullableText(80).optional(),
    country: z.string().trim().length(2).toUpperCase().default("PK"),
    social_links: z.record(z.string().max(40), socialUrl).default({}),
    announcement_text: nullableText(200).optional(),
    announcement_active: z.coerce.boolean().default(false),
    meta_title: nullableText(70).optional(),
    meta_description: nullableText(180).optional(),
    og_image_url: optionalUrl.optional(),
  })
  .strict();

export const bannerSchema = z
  .object({
    title: z.string().trim().min(2).max(150),
    subtitle: nullableText(300).optional(),
    image_url: z.string().trim().min(1).max(2048),
    mobile_image_url: optionalUrl.optional(),
    button_text: nullableText(40).optional(),
    button_link: z.preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(2048)
        .refine(
          (value) =>
            value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"),
          "Enter an internal path or a full URL.",
        )
        .nullable(),
    ).optional(),
    placement: z.enum(["home_hero", "home_promo"]).default("home_hero"),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    is_active: z.coerce.boolean().default(true),
    starts_at: optionalDate.optional(),
    ends_at: optionalDate.optional(),
  })
  .strict()
  .refine(
    (value) =>
      !value.starts_at ||
      !value.ends_at ||
      new Date(value.ends_at) > new Date(value.starts_at),
    "End date must be after the start date.",
  );

export const homeSectionSchema = z
  .object({
    section_key: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9_]{2,40}$/, "Use lowercase letters, numbers, or underscores."),
    title: nullableText(120).optional(),
    subtitle: nullableText(300).optional(),
    config: z.record(z.string(), z.unknown()).default({}),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    is_active: z.coerce.boolean().default(true),
  })
  .strict();

export const cmsPageSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.")
      .max(120),
    title: z.string().trim().min(2).max(150),
    excerpt: nullableText(300).optional(),
    content: z.string().trim().min(1, "Page content is required.").max(120000),
    is_published: z.coerce.boolean().default(false),
    meta_title: nullableText(70).optional(),
    meta_description: nullableText(180).optional(),
    og_image_url: optionalUrl.optional(),
  })
  .strict();

export const menuItemSchema = z
  .object({
    location: z.enum(["header", "footer"]).default("header"),
    label: z.string().trim().min(1).max(60),
    url: menuUrl,
    parent_id: z.preprocess(
      emptyToNull,
      z.string().uuid().nullable(),
    ).optional(),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    is_active: z.coerce.boolean().default(true),
    opens_new_tab: z.coerce.boolean().default(false),
  })
  .strict();

export const uploadSchema = z.object({
  bucket: z.enum(["product", "cms", "site"]).default("product"),
  folder: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9/_-]*$/i, "Folder may only contain letters, numbers, /, _ and -.")
    .optional(),
});
