# Supabase

All database changes live in `migrations/` and are applied in filename order.
Phase 1 creates the schema, RLS policies, triggers, and seed scripts.

## Planned structure

```
supabase/
  config.toml          # local CLI configuration
  migrations/
    0001_extensions_and_types.sql
    0002_profiles_and_auth.sql
    ...
  seed.sql             # optional demo data (local only)
```

## Commands (after Phase 1)

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

The admin account is intentionally **not** a SQL seed. It is created by
`backend/scripts/seed-admin.js` using the Auth Admin API and the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables. The database enforces a
single admin with a partial unique index.
