# Supabase

All database changes live in `migrations/` and are applied in filename order.
Phase 1 creates the schema, RLS policies, triggers, storage buckets, and
defaults.

## Structure

```
supabase/
  config.toml          # local CLI configuration (auth URLs, password policy)
  seed.sql             # local reset placeholder; admin is API-seeded
  migrations/
    20261024000100_extensions_and_enums.sql
    20261024000200_core_profiles_catalog.sql
    20261024000300_commerce.sql
    20261024000400_cms_and_settings.sql
    20261024000500_audit_and_webhooks.sql
    20261024000600_functions_and_triggers.sql
    20261024000700_rls_policies.sql
    20261024000800_storage.sql
    20261024000900_defaults.sql
    20261024001000_dashboard_metrics.sql
```

The 25 public tables are:

`profiles`, `addresses`, `categories`, `brands`, `products`, `product_images`,
`product_variants`, `coupons`, `orders`, `order_items`, `order_status_history`,
`payments`, `coupon_redemptions`, `cart_items`, `wishlist`, `reviews`,
`site_settings`, `banners`, `home_sections`, `cms_pages`, `menu_items`,
`contact_messages`, `newsletter_subscribers`, `audit_logs`, `stripe_events`.

Migration 0010 also adds `admin_dashboard_metrics()`, a service-role-only
function that computes dashboard totals without PostgREST's 1000-row cap.

## Apply to a hosted project

### CLI (Windows PowerShell)

```powershell
Set-Location D:\Coding\sm-ecommerce
npx.cmd --yes supabase@latest login
npx.cmd --yes supabase@latest link --project-ref <project-ref>
npx.cmd --yes supabase@latest db push --dry-run
npx.cmd --yes supabase@latest db push
npx.cmd --yes supabase@latest migration list
```

### SQL Editor alternative

Run the ten migration files in filename order in the Supabase SQL Editor. Each
file must finish before starting the next. The SQL Editor does not update the
CLI's `supabase_migrations.schema_migrations` history, so keep using the editor
or mark the applied versions with `supabase migration repair` before switching to
`db push`. After applying, reload the schema cache if PostgREST still reports
`PGRST205`:

```sql
notify pgrst, 'reload schema';
```

The migrations are safe to re-run but do not alter existing tables. Future
schema changes must be new migration files.

After applying the migrations, reload the PostgREST schema cache and verify the
live project from the repository root:

```powershell
Set-Location D:\Coding\sm-ecommerce
npm.cmd run db:check:schema
```

The backend readiness endpoint uses the same real-table check, so it reports
`503` with `"schema_missing"` until all tables exist.

## Seed the admin

The admin account is intentionally **not** a SQL seed. It is created by
`backend/scripts/seed-admin.js` through the Auth Admin API using
`ADMIN_EMAIL` / `ADMIN_PASSWORD`. The database enforces a single admin with the
`only_one_admin` partial unique index.

```powershell
Set-Location D:\Coding\sm-ecommerce\backend
npm.cmd run seed:admin
```

The command is idempotent. It refuses to create a second admin and does not
change an existing admin's password unless called with `-- --update-password`.

## Auth settings

`config.toml` configures local Supabase only. The hosted project must also have:

- Site URL `http://localhost:3000` for local development.
- Redirect URLs for `/auth/callback` on every origin used: ports 3000 and 3100,
  plus the production domain.
- Email confirmations enabled.
- Minimum password length 8 with lower/upper/digit requirements.

See [`../docs/PHASE-1.md`](../docs/PHASE-1.md) for the full migration,
verification, and RLS test checklist.
