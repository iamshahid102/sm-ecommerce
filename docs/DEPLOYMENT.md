# Deployment

Target architecture from the project plan:

| Part                       | Platform                              |
| -------------------------- | ------------------------------------- |
| Next.js storefront + admin | Vercel                                |
| Express API                | Render / Railway / VPS                |
| Database, Auth, Storage    | Supabase Cloud                        |
| Email                      | Resend                                |
| Payments                   | Stripe (cards) + COD                  |
| Monitoring                 | Sentry, Vercel Analytics, UptimeRobot |

Phase 1 provides the database, auth, storage, and admin foundation. This document
is the runbook that will be exercised in Phase 9; it can already be used to
provision a staging project after the Phase 1 migrations are applied.

## 1. Prerequisites

- Node.js 22+ (the repo is developed on Node 24).
- A Supabase project (free tier is fine for staging).
- A Stripe account with test keys (see the Pakistan caveat in
  `docs/DECISIONS.md`).
- A Resend account and a verified sending domain.
- Accounts on Vercel and Render/Railway.

## 2. Supabase

1. Create a project and choose the region closest to Pakistan (Mumbai/Singapore
   are typical).
2. Copy the Project URL, anon (publishable) key, and service-role key from
   **Project Settings → API**.
3. In **Authentication → URL Configuration**, set:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`,
     `http://localhost:3000/auth/callback`,
     `http://localhost:3100/auth/callback` (port 3100 is used when 3000 is
     already occupied).
4. In **Authentication → Providers → Email**, keep email confirmation enabled
   and configure a custom SMTP sender (Resend) so verification mail is reliable.
   In **Authentication → Settings**, set a minimum password length of 8 with
   lowercase, uppercase, and digit requirements. These hosted-project settings
   are not applied by `supabase/config.toml`.
5. Apply migrations from the repository root:

   ```powershell
   npx.cmd --yes supabase@latest login
   npx.cmd --yes supabase@latest link --project-ref <project-ref>
   npx.cmd --yes supabase@latest db push --dry-run
   npx.cmd --yes supabase@latest db push
   npx.cmd --yes supabase@latest migration list
   ```

   The CLI is preferred. The SQL Editor alternative, with the exact file order
   and re-run rules, is in `docs/PHASE-1.md`.

6. Create the single admin (Phase 1):

   ```powershell
   Set-Location backend
   npm.cmd run seed:admin
   ```

   This reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`, creates a confirmed Auth user,
   and sets `profiles.role = 'admin'`. It is idempotent and refuses to create a
   second admin. To deliberately reset the existing admin password, run
   `npm.cmd run seed:admin -- --update-password`.

7. Storage buckets are created by `20261024000800_storage.sql`:
   - `product-images` (public read, 5 MB, JPEG/PNG/WebP)
   - `cms-assets` (public read, 5 MB, JPEG/PNG/WebP)
   - `site-assets` (public read, 5 MB, JPEG/PNG/WebP)

   Writes are service-role only and will go through the Express upload API.
   Do not create duplicate buckets manually.

8. Verify the live schema before deploying:

   ```powershell
   Set-Location D:\Coding\sm-ecommerce
   npm.cmd run db:check
   ```

   This checks all 25 tables, the three buckets, the default settings row, and
   the single active admin. It never prints secrets or emails. The readiness
   endpoint reports `schema_missing`/`503` until this passes.

## 3. Backend (Render/Railway)

Build command:

```bash
npm ci
```

Start command:

```bash
npm start
```

Health check path: `/api/v1/health/ready`.

Required environment variables:

```
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
FRONTEND_URL=https://your-domain.com
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_ANON_KEY=<anon-key>
RESEND_API_KEY=<resend-key>
EMAIL_FROM=SM Store <orders@your-domain.com>
STRIPE_SECRET_KEY=<stripe-secret>
STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
```

Rules:

- Never put any of these in Vercel or in a `NEXT_PUBLIC_*` variable.
- Set `FRONTEND_URL` to the exact production origin, without a trailing slash.
- Add custom domains to `FRONTEND_URLS` if the site is served from both apex and
  `www`; otherwise CORS rejects the second origin.
- The service-role key bypasses RLS. Treat it as a database password.

## 4. Frontend (Vercel)

- Root directory: `frontend`
- Framework preset: Next.js
- Build command: `npm run build`
- Output: Next.js default
- Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_STORE_NAME=SM Store
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<stripe-pk>
```

`NEXT_PUBLIC_*` values are embedded in the browser bundle. Only publishable keys
belong there.

## 5. Stripe

1. Add the webhook endpoint `https://api.your-domain.com/api/v1/webhooks/stripe`
   in the Stripe dashboard.
2. Subscribe to `payment_intent.succeeded`, `payment_intent.payment_failed`, and
   `charge.refunded`.
3. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`.
4. The webhook route uses the raw request body; do not put a JSON parser in
   front of it (the app mounts it before `express.json()` in Phase 5).
5. Test with the Stripe CLI:

   ```bash
   stripe listen --forward-to localhost:4000/api/v1/webhooks/stripe
   stripe trigger payment_intent.succeeded
   ```

## 6. Email (Resend)

1. Verify the sending domain in Resend and add the DNS records it provides.
2. Set `RESEND_API_KEY` and `EMAIL_FROM`.
3. Order and status emails are skipped (and logged) in development when the key
   is absent; production startup should fail fast if email is required. This is
   finalized in Phase 5.

## 7. Domain, TLS, and DNS

- Point the apex/`www` domain to Vercel.
- Point `api.your-domain.com` to Render/Railway.
- Enforce HTTPS at the platform level and enable HSTS.
- Keep the Supabase project URL private in docs where possible; the anon key is
  public by design, the service key is not.

## 8. Post-deploy checklist

- [ ] `GET https://api.your-domain.com/api/v1/health` returns `200`.
- [ ] `GET /api/v1/health/ready` returns `200` and
      `services.database: "reachable"`. A `503` with `"schema_missing"` means the
      migrations were applied to a different project or not applied at all.
- [ ] `npm run db:check` passes after the admin seed.
- [ ] CORS rejects an unknown origin and allows the production site.
- [ ] Signup creates only `customer`; the second admin insert fails.
- [ ] Email verification and password-recovery links return through
      `/auth/callback` on the production origin.
- [ ] Admin login works; a customer is rejected by `/admin` and by
      `/api/v1/admin/dashboard`.
- [ ] The complete Phase 1 manual checklist in `docs/PHASE-1.md` passes.
- [ ] Customer cannot read another customer's order (IDOR test).
- [ ] `npm run lint`, `npm test`, and `npm run build` pass in CI.
- [ ] RLS is enabled on every public table.
- [ ] Storage buckets reject non-image uploads and files over 5 MB.
- [ ] Stripe webhook rejects an invalid signature.
- [ ] Admin audit logs are written on create/update/delete.
- [ ] Database backups are enabled in Supabase.
- [ ] UptimeRobot monitors both health endpoints.
- [ ] Sentry receives a test error from each app.

## 9. CI/CD (Phase 9)

GitHub Actions will run, on every pull request:

```bash
npm run setup
npm run lint
npm run test
npm run build
```

Deployment is triggered by the platform integrations (Vercel/Render) on `main`.
Migrations are applied manually or by a protected workflow after review. Never
run `db push` automatically against production from an untrusted branch.

## 10. Rollback

- Frontend: promote the previous Vercel deployment.
- Backend: redeploy the previous Render build.
- Database: migrations are additive and reviewed; destructive changes require a
  backup and a two-step deploy. Supabase point-in-time recovery is the last
  resort.
- Payments: disable card payments in site settings while investigating; COD
  remains available.
