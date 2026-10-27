# Book & Clothing Catalog Seed

This project now ships with a professional demo catalog for two departments:

- **Books** with Fiction, Business & Self-Development, Islamic Books,
  Children & Young Readers, Academic & Reference, Urdu Literature, and
  History & Society.
- **Clothing** with Men's Clothing, Women's Clothing, Outerwear, Accessories,
  and Kids' Clothing.

The seed includes **14 categories**, **18 brands**, and **25 published
products** (12 books and 13 clothing/accessory items). Clothing products have
size/colour variants with individual stock. Product and category photos are
downloaded into Supabase Storage during seeding.

## Run the seed

From the repository root:

```powershell
npm.cmd run seed:catalog
```

Or from `backend/`:

```powershell
npm.cmd run seed:catalog
```

The script reads `backend/.env` and needs:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key is only used by this local/admin script. It is never sent
to the browser.

## Options

```powershell
# Preview without writing anything
npm.cmd run seed:catalog -- --dry-run

# Update existing seeded rows too
npm.cmd run seed:catalog -- --refresh

# Keep Unsplash URLs instead of uploading images to Supabase
npm.cmd run seed:catalog -- --skip-images
```

Without `--refresh`, the seed is safe to re-run: it creates missing categories,
brands, products, images, and variants, but leaves existing seeded rows
unchanged. Use `--refresh` when you want the seed data to reset itself to the
versions in `backend/scripts/data/catalog-seed.js`.

## What gets created

- `categories` with parent/child relationships and storefront images.
- `brands` with descriptions and sort order.
- `products` with PKR prices, discount prices, SKU, stock, SEO metadata,
  descriptions, primary images, and optional variants.
- `product_images` with one primary image per seeded product.
- `product_variants` for clothing sizes and colours.

The script skips the existing `travel products` row and any other catalog rows
that do not share a seed slug.

## Admin workflow for new categories and brands

Admins can manage the catalog from:

- `/admin/categories` - create/edit/delete categories, set a parent, image,
  description, sort order, and SEO fields.
- `/admin/brands` - create/edit/delete brands, set a logo, description, sort
  order, and SEO fields.
- `/admin/products/new` and `/admin/products/[id]` - category and brand selects
  now have a **New** button. Create a category or brand without leaving the
  product form; it is selected automatically for the product.

Categories are displayed as a readable path, for example
`Books / Fiction`. The storefront category dropdown uses the same hierarchy, and
opening a parent category such as **Books** includes products from every child
category.

## Image storage

- Product images: `product-images/seed/products/<slug>.jpg`
- Category images: `site-assets/seed/categories/<slug>.jpg`

If an image download or upload fails, the script logs a warning and keeps the
remote image URL so the catalog still completes. Re-run without
`--skip-images` to retry the upload.

## Verify

```powershell
npm.cmd run db:check
npm.cmd run db:check-auth
```

Then open:

- `http://localhost:3000/` - collection shortcuts and featured products
- `http://localhost:3000/categories/books`
- `http://localhost:3000/categories/clothing`
- `http://localhost:3000/admin/products`

## Notes

- The catalog is intentionally Cash on Delivery only. Stripe checkout remains
  deferred.
- Demo products are published immediately. Use the admin product form to draft,
  reprice, or replace any item.
- The seed keeps the current single-admin rule and does not create users.
