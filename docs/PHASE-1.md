# Phase 1 — Database, security, and authentication

This phase delivers the complete Postgres schema, Row Level Security (RLS),
triggers, storage buckets, one-admin constraint, idempotent admin seed, customer
auth flow, account area, and server-enforced admin guard.

The code and migrations are complete. The connected Supabase project did **not**
have the migrations applied when this phase was built, because the CLI was not
logged in and no database password was available to the agent. Apply the
migrations with one of the two methods below before expecting signup, signin, or
the admin dashboard to work.

## 1. Apply the migrations

Run **one** method, not both. Both methods run the same nine files in order.

### Option A — Supabase CLI (recommended, Windows PowerShell)

```powershell
Set-Location D:\Coding\sm-ecommerce

# Optional but useful: confirm the CLI is available
npx.cmd --yes supabase@latest --version

# Opens a browser and stores a local access token
npx.cmd --yes supabase@latest login

# <project-ref> is the part before .supabase.co in the project URL
npx.cmd --yes supabase@latest link --project-ref <project-ref>

# Inspect first. This prints the migrations that would be applied.
npx.cmd --yes supabase@latest db push --dry-run

# Apply. Answer "y" when prompted.
npx.cmd --yes supabase@latest db push

# Verify the applied list
npx.cmd --yes supabase@latest migration list
```

`supabase link` may ask for the database password. It is not stored in this
repository. If you no longer know it, reset it in
**Supabase Dashboard → Project Settings → Database**.

Use `npx.cmd`, not `npx`, when PowerShell blocks npm-generated shims.

### Option B — Supabase SQL Editor (no CLI login)

1. Open **Supabase Dashboard → SQL Editor → New query**.
2. Paste the **entire contents** of each migration, one file at a time, and run
   it. Wait for success before opening the next file.
3. Run them in this exact order:

   | Order | File                                                       |
   | ----- | ---------------------------------------------------------- |
   | 1     | `supabase/migrations/20261024000100_extensions_and_enums.sql` |
   | 2     | `supabase/migrations/20261024000200_core_profiles_catalog.sql` |
   | 3     | `supabase/migrations/20261024000300_commerce.sql`             |
   | 4     | `supabase/migrations/20261024000400_cms_and_settings.sql`     |
   | 5     | `supabase/migrations/20261024000500_audit_and_webhooks.sql`   |
   | 6     | `supabase/migrations/20261024000600_functions_and_triggers.sql` |
   | 7     | `supabase/migrations/20261024000700_rls_policies.sql`         |
   | 8     | `supabase/migrations/20261024000800_storage.sql`              |
   | 9     | `supabase/migrations/20261024000900_defaults.sql`             |

4. If a file errors, **stop**. Do not continue to the next file. Fix the cause
   and re-run that file (the migrations are written to be safe to re-run).
5. Refresh the PostgREST schema cache if the API still reports `PGRST205`
   immediately after applying:

   ```sql
   notify pgrst, 'reload schema';
   ```

The SQL Editor runs as the `postgres` role, which can create the trigger on
`auth.users` and the storage object policy.

The migrations avoid destructive `drop table` statements. Re-running them:

- keeps existing rows;
- `create or replace`s functions;
- drops and recreates triggers and named policies;
- upserts the three storage buckets;
- inserts default settings and home sections only when missing.

## 2. Configure Supabase Auth

In **Supabase Dashboard → Authentication**:

1. **URL Configuration**
   - Site URL: `http://localhost:3000`
   - Additional Redirect URLs (exact, no trailing slash):
     - `http://localhost:3000/auth/callback`
     - `http://127.0.0.1:3000/auth/callback`
     - `http://localhost:3100/auth/callback`
     - `http://127.0.0.1:3100/auth/callback`
     - For production, also add `https://your-domain.com/auth/callback`.

   The 3100 entries matter on this machine because port 3000 is occupied by an
   unrelated application. The app builds the email redirect from
   `window.location.origin`, so the running origin must be allowed here.

2. **Providers → Email**
   - Email provider: enabled.
   - Confirm email: enabled.
   - Set up custom SMTP for reliable production delivery. Supabase's default
     sender is rate-limited and intended for testing.

3. **Settings / Password policy**
   - Minimum password length: `8`
   - Requirements: lowercase, uppercase, and digits.

   `supabase/config.toml` already reflects these values for local Supabase, but
   it does not change the hosted project's settings.

Remote email confirmation means a new customer must open the verification email
before signing in. The link returns through `/auth/callback`, which exchanges the
PKCE code for an HttpOnly session. The admin seed creates its user pre-confirmed.

## 3. Seed the single admin

The seed reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env` and uses the
Supabase Auth Admin API. It never prints the password.

```powershell
Set-Location D:\Coding\sm-ecommerce\backend
npm.cmd run seed:admin
```

Behaviour:

- If no admin exists, it creates or promotes the configured user, confirms the
  email, and sets `profiles.role = 'admin'`.
- If the same admin already exists, it exits successfully without changing the
  password.
- If a **different** admin exists, it refuses to create a second one.
- `npm.cmd run seed:admin -- --update-password` deliberately resets the existing
  admin's password to `ADMIN_PASSWORD`. Use this only when intended.

Sign in at `http://localhost:3100/admin/login` (or port 3000).

## 4. Start the apps

```powershell
# Terminal 1
Set-Location D:\Coding\sm-ecommerce\backend
npm.cmd run dev

# Terminal 2 — use 3100 when 3000 is occupied
Set-Location D:\Coding\sm-ecommerce\frontend
npx.cmd next dev -p 3100
```

The dashboard page calls the Express API at `NEXT_PUBLIC_API_URL` (default
`http://localhost:4000/api/v1`). Keep the backend running while testing admin
pages. If the API is down, the admin page shows a clear "Dashboard data is
unavailable" alert instead of crashing.

## 5. Manual verification checklist

Use two customer accounts (A and B) and the seeded admin. Do not use the admin
account for shopper flows.

### Customer authentication

- [ ] `/register` creates an Auth user and returns "Check your email".
- [ ] The new `profiles` row has `role = 'customer'` and `is_blocked = false`.
- [ ] The verification email link returns to `/auth/callback` and lands on
      `/account`.
- [ ] Signing in before confirmation is rejected with a "confirm your email"
      message.
- [ ] Signing in after confirmation opens `/account` with the customer's name
      and email.
- [ ] Updating `full_name` and `phone` persists after a page refresh.
- [ ] Changing the password requires the current password; after signing out,
      the old password fails and the new one works.
- [ ] `/forgot-password` sends a link that opens `/reset-password`; the new
      password works and the link cannot be reused.
- [ ] A short/weak password is rejected by the form.
- [ ] Signing out clears the session; `/account` redirects to
      `/login?next=%2Faccount`.
- [ ] A customer can never change their own `role` or `is_blocked` through the
      UI or `/api/v1/me`.

### Admin authentication and guard

- [ ] Running `seed:admin` a second time exits 0 and does not change the
      password.
- [ ] Admin credentials work at `/admin/login` and land on `/admin`.
- [ ] The dashboard loads revenue/order/customer/product cards, recent orders,
      order pipeline, and low-stock list. Empty data shows zeros and empty
      states, not errors.
- [ ] The admin visiting `/account` is redirected to `/admin`.
- [ ] A signed-in **customer** visiting `/admin` is redirected to
      `/admin/login?error=forbidden`.
- [ ] A signed-out visitor to `/admin` is redirected to `/admin/login`.
- [ ] Customer credentials entered on `/admin/login` are rejected and the
      customer session is removed. The customer is not granted admin access.
- [ ] There is no admin signup page or API route.

### API authorization

Get short-lived tokens from the Supabase Auth token endpoint (replace the
placeholders; do not paste real secrets into committed files):

```powershell
$supabaseUrl = "https://<project-ref>.supabase.co"
$anonKey = "<anon-key>"

function Get-AccessToken($email, $password) {
  $body = @{ email = $email; password = $password } | ConvertTo-Json
  (Invoke-RestMethod -Method Post `
    -Uri "$supabaseUrl/auth/v1/token?grant_type=password" `
    -Headers @{ apikey = $anonKey; "Content-Type" = "application/json" } `
    -Body $body).access_token
}

$customerToken = Get-AccessToken "customer.a@example.com" "<password>"
$adminToken = Get-AccessToken "<admin-email>" "<admin-password>"
```

Then:

```powershell
# Missing token: expect 401
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:4000/api/v1/admin/dashboard

# Customer token on admin API: expect 403 ADMIN_REQUIRED
curl.exe -s -o NUL -w "%{http_code}`n" `
  -H "Authorization: Bearer $customerToken" `
  http://localhost:4000/api/v1/admin/dashboard

# Admin token on admin API: expect 200
curl.exe -s -o NUL -w "%{http_code}`n" `
  -H "Authorization: Bearer $adminToken" `
  http://localhost:4000/api/v1/admin/dashboard

# Customer profile: expect 200
curl.exe -s -o NUL -w "%{http_code}`n" `
  -H "Authorization: Bearer $customerToken" `
  http://localhost:4000/api/v1/me
```

Expected: `401`, `403`, `200`, `200`. Internal errors are never returned in
production; `403 ADMIN_REQUIRED` is the admin guard.

### RLS verification

Run these in the Supabase SQL Editor as `postgres`.

**1. RLS is enabled on every public table.** Expect 25 rows, all `true`.

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

**2. Policies exist.** This lists the table policies. Every table in the
migration should have at least one policy except write-only/service-only tables
whose only path is the service role.

```sql
select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

**3. Exactly one admin after seeding.** Expect `1`.

```sql
select count(*)::int as admin_count
from public.profiles
where role = 'admin';
```

**4. A second admin is impossible.** Replace the UUID with customer B's id.
Expect `NOTICE: Second admin blocked as expected`; if it succeeds, the DO block
fails with `ONE_ADMIN_TEST_FAILED`.

```sql
do $$
begin
  begin
    update public.profiles
    set role = 'admin'
    where id = '<CUSTOMER_B_UUID>';

    raise exception 'ONE_ADMIN_TEST_FAILED';
  exception
    when unique_violation then
      raise notice 'Second admin blocked as expected';
  end;
end
$$;
```

**5. Customer A cannot read customer B's profile.** Replace the UUIDs with the
two customer ids. Inside the transaction, expect only A's row and `0` for B.
`rollback` restores the session.

```sql
begin;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '<CUSTOMER_A_UUID>', 'role', 'authenticated')::text,
  true
);

-- Expect only customer A's row.
select id, email, role from public.profiles order by created_at;

-- Expect 0.
select count(*) from public.profiles where id = '<CUSTOMER_B_UUID>';

rollback;
```

**6. A customer cannot write catalog data.** This should raise
`new row violates row-level security policy for table "categories"` (SQLSTATE
`42501`). Afterwards run `rollback;` because the failed statement aborts the
transaction.

```sql
begin;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '<CUSTOMER_A_UUID>', 'role', 'authenticated')::text,
  true
);

insert into public.categories (name, slug)
values ('RLS test', 'rls-test');

rollback;
```

**7. A customer cannot promote themselves.** This should be rejected by the
column grant and/or the profile guard trigger. Afterwards run `rollback;`.

```sql
begin;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '<CUSTOMER_A_UUID>', 'role', 'authenticated')::text,
  true
);

update public.profiles
set role = 'admin'
where id = '<CUSTOMER_A_UUID>';

rollback;
```

**8. Storage buckets and limits.** Expect three public buckets with
`file_size_limit = 5242880` and only JPEG/PNG/WebP MIME types. Only one
`catalog_assets%` SELECT policy should remain; writes are service-role only.

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('product-images', 'cms-assets', 'site-assets')
order by id;

select policyname, cmd, roles
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'catalog_assets%';
```

**9. RLS through the REST API.** Use the customer token from the API section:

```powershell
$headers = @{
  apikey = $anonKey
  Authorization = "Bearer $customerToken"
}

# Expect only customer A's profile row.
Invoke-RestMethod `
  -Uri "$supabaseUrl/rest/v1/profiles?select=id,email,role" `
  -Headers $headers
```

Repeat with customer B's token. Each request must return only that customer's
profile. If either returns both rows, stop and re-check the RLS migration.

## 6. Build and test verification

Run from the repository root:

```powershell
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Phase 1 result: backend lint clean, 22 Jest/Supertest tests passing, Next.js
production build passing. The build does not require the database; the admin
dashboard fetch is dynamic and only runs when the page is requested.

## 7. Known limits at the end of Phase 1

- The live Supabase project still needs the migrations applied and the admin
  seeded. Until then `/account` and `/admin` redirect correctly, but signup and
  login cannot create or read profiles.
- The admin dashboard currently returns lifetime paid revenue plus current
  counts. The 7/30/90-day sales series and charts belong to the reports phase.
- Product/catalog CRUD, storefront, cart, checkout, orders, reviews, CMS screens,
  Stripe webhooks, Resend emails, and audit-log writes are implemented in later
  phases; their tables, constraints, buckets, and some defensive triggers are
  already present.
- Supabase's default email service is rate-limited. Use custom SMTP for reliable
  production verification and recovery mail.
- Stripe does not currently offer merchant accounts in Pakistan. The integration
  will be built and tested with test keys; live card payments require a supported
  Stripe account (see `docs/DECISIONS.md`, ADR-009).
