#!/usr/bin/env node

import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

import {
  BRAND_SEED,
  CATEGORY_SEED,
  PRODUCT_SEED,
} from "./data/catalog-seed.js";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
});

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const refresh = args.has("--refresh");
const skipImages = args.has("--skip-images");
const help = args.has("--help") || args.has("-h");

const UNSPLASH_BASE = "https://images.unsplash.com";
const PRODUCT_IMAGE_BUCKET = "product-images";
const CATEGORY_IMAGE_BUCKET = "site-assets";

function photoUrl(photo, width = 1200) {
  return `${UNSPLASH_BASE}/${photo}?fm=jpg&fit=crop&w=${width}&q=80`;
}

function truncate(value, maxLength) {
  const text = String(value ?? "").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function printHelp() {
  console.log(`
Seed the demo book and clothing catalog.

Usage:
  npm run seed:catalog -- [options]

Options:
  --refresh      Update existing seeded rows as well as creating missing rows.
  --skip-images  Keep remote Unsplash URLs instead of uploading to Supabase.
  --dry-run      Validate and print a summary without writing anything.
  --help         Show this help.

The script uses backend/.env and requires SUPABASE_URL and
SUPABASE_SERVICE_ROLE_KEY. It is safe to re-run without --refresh: existing
seeded rows are left untouched while missing rows are created.
`);
}

function fail(message) {
  console.error(`\nSeed failed: ${message}\n`);
  process.exitCode = 1;
}

async function downloadImage(url) {
  const response = await fetch(url, {
    headers: { Accept: "image/jpeg" },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`image request returned HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.byteLength > 5 * 1024 * 1024) {
    throw new Error("image is larger than the 5 MB bucket limit");
  }

  return buffer;
}

async function main() {
  if (help) {
    printHelp();
    return;
  }

  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter(
    (name) => !process.env[name],
  );

  if (missing.length > 0) {
    fail(
      `missing backend/.env values: ${missing.join(", ")}. Add them before seeding.`,
    );
    return;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  console.log("\nSM Store catalog seed");
  console.log(
    `Mode: ${dryRun ? "dry run" : refresh ? "create + refresh" : "create missing"}`,
  );

  if (dryRun) {
    console.log(
      `Would seed ${CATEGORY_SEED.length} categories, ${BRAND_SEED.length} brands, and ${PRODUCT_SEED.length} products.`,
    );
    return;
  }

  const imageCache = new Map();
  let uploadedImages = 0;
  let remoteImages = 0;

  async function resolveImage({ bucket, folder, slug, photo, width }) {
    const remoteUrl = photoUrl(photo, width);

    if (skipImages) {
      remoteImages += 1;
      return remoteUrl;
    }

    const cacheKey = `${bucket}/${folder}/${slug}`;
    if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

    const path = `${folder}/${slug}.jpg`;

    try {
      const buffer = await downloadImage(remoteUrl);
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      uploadedImages += 1;
      imageCache.set(cacheKey, data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      remoteImages += 1;
      console.warn(
        `  WARN ${bucket}/${path}: ${error.message}. Using the remote URL.`,
      );
      imageCache.set(cacheKey, remoteUrl);
      return remoteUrl;
    }
  }

  async function seedCategories() {
    const { data: existing, error } = await supabase
      .from("categories")
      .select("id, slug, parent_id");

    if (error) throw error;

    const existingBySlug = new Map(
      (existing ?? []).map((category) => [category.slug, category]),
    );
    const idsBySlug = new Map();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const category of CATEGORY_SEED) {
      const current = existingBySlug.get(category.slug);
      const shouldWrite = !current || refresh;

      if (!shouldWrite) {
        idsBySlug.set(category.slug, current.id);
        skipped += 1;
        continue;
      }

      const image_url = await resolveImage({
        bucket: CATEGORY_IMAGE_BUCKET,
        folder: "seed/categories",
        slug: category.slug,
        photo: category.photo,
        width: 700,
      });

      const payload = {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url,
        is_active: true,
        sort_order: category.sort_order,
        meta_title: truncate(category.meta_title, 70),
        meta_description: truncate(category.meta_description, 180),
      };

      if (!current) {
        const { data, error: insertError } = await supabase
          .from("categories")
          .insert({ ...payload, parent_id: null })
          .select("id")
          .single();

        if (insertError) throw insertError;
        idsBySlug.set(category.slug, data.id);
        created += 1;
      } else {
        const { error: updateError } = await supabase
          .from("categories")
          .update({ ...payload, parent_id: null })
          .eq("id", current.id);

        if (updateError) throw updateError;
        idsBySlug.set(category.slug, current.id);
        updated += 1;
      }
    }

    // Parent ids can point at categories created later in the list, so link
    // them in a second pass after every category has an id.
    for (const category of CATEGORY_SEED) {
      if (!category.parent) continue;

      const id = idsBySlug.get(category.slug);
      const parentId = idsBySlug.get(category.parent);
      const current = existingBySlug.get(category.slug);

      if (!id || !parentId) {
        throw new Error(
          `category "${category.slug}" references missing parent "${category.parent}"`,
        );
      }

      const currentParent = current?.parent_id ?? null;
      const shouldLink =
        !current || refresh || (currentParent === null && parentId !== null);

      if (!shouldLink || currentParent === parentId) continue;

      const { error: linkError } = await supabase
        .from("categories")
        .update({ parent_id: parentId })
        .eq("id", id);

      if (linkError) throw linkError;
    }

    console.log(
      `Categories: ${created} created, ${updated} updated, ${skipped} unchanged.`,
    );
  }

  async function seedBrands() {
    const { data: existing, error } = await supabase
      .from("brands")
      .select("id, slug");

    if (error) throw error;

    const existingBySlug = new Map(
      (existing ?? []).map((brand) => [brand.slug, brand]),
    );
    const idsBySlug = new Map();
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const brand of BRAND_SEED) {
      const current = existingBySlug.get(brand.slug);
      const shouldWrite = !current || refresh;

      if (!shouldWrite) {
        idsBySlug.set(brand.slug, current.id);
        skipped += 1;
        continue;
      }

      const payload = {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        is_active: true,
        sort_order: brand.sort_order,
        meta_title: truncate(brand.name, 70),
        meta_description: truncate(brand.description, 180),
      };

      if (!current) {
        const { data, error: insertError } = await supabase
          .from("brands")
          .insert(payload)
          .select("id")
          .single();

        if (insertError) throw insertError;
        idsBySlug.set(brand.slug, data.id);
        created += 1;
      } else {
        const { error: updateError } = await supabase
          .from("brands")
          .update(payload)
          .eq("id", current.id);

        if (updateError) throw updateError;
        idsBySlug.set(brand.slug, current.id);
        updated += 1;
      }
    }

    console.log(
      `Brands: ${created} created, ${updated} updated, ${skipped} unchanged.`,
    );

    return idsBySlug;
  }

  async function seedProducts(brandIds, categoryIds) {
    const { data: existing, error } = await supabase
      .from("products")
      .select("id, slug, og_image_url")
      .is("deleted_at", null);

    if (error) throw error;

    const existingBySlug = new Map(
      (existing ?? []).map((product) => [product.slug, product]),
    );
    const existingIds = (existing ?? []).map((product) => product.id);

    const [imageRows, variantRows] = await Promise.all([
      existingIds.length > 0
        ? supabase
            .from("product_images")
            .select("product_id")
            .in("product_id", existingIds)
        : Promise.resolve({ data: [], error: null }),
      existingIds.length > 0
        ? supabase
            .from("product_variants")
            .select("product_id")
            .in("product_id", existingIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (imageRows.error) throw imageRows.error;
    if (variantRows.error) throw variantRows.error;

    const imageCounts = new Map();
    for (const row of imageRows.data ?? []) {
      imageCounts.set(
        row.product_id,
        (imageCounts.get(row.product_id) ?? 0) + 1,
      );
    }

    const variantCounts = new Map();
    for (const row of variantRows.data ?? []) {
      variantCounts.set(
        row.product_id,
        (variantCounts.get(row.product_id) ?? 0) + 1,
      );
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const product of PRODUCT_SEED) {
      const current = existingBySlug.get(product.slug);
      const categoryId = categoryIds.get(product.category);
      const brandId = brandIds.get(product.brand);

      if (!categoryId) {
        throw new Error(
          `product "${product.slug}" references missing category "${product.category}"`,
        );
      }
      if (!brandId) {
        throw new Error(
          `product "${product.slug}" references missing brand "${product.brand}"`,
        );
      }

      const shouldWriteCore = !current || refresh;
      const needsImage =
        !current || refresh || (imageCounts.get(current.id) ?? 0) === 0;
      const needsVariants =
        !current ||
        refresh ||
        ((variantCounts.get(current.id) ?? 0) === 0 &&
          product.variants.length > 0);

      if (!shouldWriteCore && !needsImage && !needsVariants) {
        skipped += 1;
        continue;
      }

      const imageUrl = needsImage
        ? await resolveImage({
            bucket: PRODUCT_IMAGE_BUCKET,
            folder: "seed/products",
            slug: product.slug,
            photo: product.photo,
            width: 1200,
          })
        : (current.og_image_url ?? null);

      const payload = {
        title: product.title,
        slug: product.slug,
        short_description: product.short_description,
        description: product.description,
        category_id: categoryId,
        brand_id: brandId,
        price: product.price,
        discount_price: product.discount_price,
        sku: product.sku,
        stock: product.stock,
        low_stock_threshold: 5,
        is_published: true,
        is_featured: Boolean(product.is_featured),
        meta_title: truncate(product.meta_title || product.title, 70),
        meta_description: truncate(
          product.meta_description || product.short_description,
          180,
        ),
        og_image_url: imageUrl,
      };

      let productId = current?.id;

      if (!current) {
        const { data, error: insertError } = await supabase
          .from("products")
          .insert(payload)
          .select("id")
          .single();

        if (insertError) throw insertError;
        productId = data.id;
        created += 1;
      } else if (refresh) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", current.id);

        if (updateError) throw updateError;
        updated += 1;
      } else if (needsImage && imageUrl && imageUrl !== current.og_image_url) {
        const { error: updateError } = await supabase
          .from("products")
          .update({ og_image_url: imageUrl })
          .eq("id", current.id);

        if (updateError) throw updateError;
      }

      try {
        if (needsImage) {
          const { error: deleteImageError } = await supabase
            .from("product_images")
            .delete()
            .eq("product_id", productId);

          if (deleteImageError) throw deleteImageError;

          const { error: imageError } = await supabase
            .from("product_images")
            .insert({
              product_id: productId,
              url: imageUrl,
              alt_text: product.title,
              sort_order: 0,
              is_primary: true,
            });

          if (imageError) throw imageError;
        }

        if (needsVariants) {
          const { error: deleteVariantError } = await supabase
            .from("product_variants")
            .delete()
            .eq("product_id", productId);

          if (deleteVariantError) throw deleteVariantError;

          if (product.variants.length > 0) {
            const { error: variantError } = await supabase
              .from("product_variants")
              .insert(
                product.variants.map((variant) => ({
                  product_id: productId,
                  ...variant,
                })),
              );

            if (variantError) throw variantError;
          }
        }
      } catch (error) {
        if (!current) {
          await supabase.from("products").delete().eq("id", productId);
        }
        throw error;
      }
    }

    console.log(
      `Products: ${created} created, ${updated} updated, ${skipped} unchanged.`,
    );
  }

  try {
    await seedCategories();
    const brandIds = await seedBrands();

    const { data: categories, error: categoryError } = await supabase
      .from("categories")
      .select("id, slug");

    if (categoryError) throw categoryError;

    const categoryIds = new Map(
      (categories ?? []).map((category) => [category.slug, category.id]),
    );

    await seedProducts(brandIds, categoryIds);

    console.log(
      `Images: ${uploadedImages} uploaded to Supabase Storage, ${remoteImages} remote URL(s).`,
    );
    console.log("Catalog seed complete.\n");
  } catch (error) {
    fail(error.message);
  }
}

main().catch((error) => fail(error.message));
