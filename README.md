# SM Store

Single-vendor e-commerce platform for Pakistan: one Admin, unlimited customers,
PKR pricing, and Cash on Delivery checkout (Stripe card payments deferred).

Built with **Next.js 16 (App Router, JavaScript)**, **Tailwind CSS v4**,
**shadcn/ui**, **Express 5**, and **Supabase** (Postgres, Auth, Storage).

> **Status: deployed on Vercel.**
> Storefront: <https://smstoreweb.vercel.app> · API:
> <https://smstoreweb-api.vercel.app/api/v1>.
> The storefront, customer account area, admin portal, Express API, database
> migrations, RLS policies, storage rules, and automated tests are implemented.
> Checkout is Cash on Delivery only; Stripe/card payments are intentionally
> deferred. Supabase Auth production redirect URLs, custom SMTP, CI/E2E,
> monitoring, and backups remain external setup items. See
> [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the deployment runbook.

## Repository layout

```
frontend/            Next.js storefront + admin UI
  app/               App Router routes, auth, account, and admin pages
  components/ui/     shadcn/ui primitives
  lib/auth/          Server-side session/profile guards
  lib/api/           Browser and server API clients
  lib/supabase/      Browser, server, and proxy clients
  proxy.js           Session refresh + optimistic route guard
backend/             Express REST API (ESM)
  src/config/        Environment and Supabase clients
  src/middleware/    Auth, CORS, logging, rate limits, validation, errors
  src/routes/        Versioned routes (/api/v1)
  src/controllers/   Request handlers
  src/services/      Business logic
  scripts/           Idempotent admin seed + schema/bucket check
  tests/             Jest + Supertest
supabase/            Timestamped migrations, local seed placeholder, CLI config
docs/                API contract, decisions, deployment runbook, Phase 1
```

Two independently deployable apps live in one repository without npm
workspaces. The root package only orchestrates development.

## Quick start

Requirements: Node.js 22.12+ and npm 10+ (developed on Node 24 / npm 12), and a
Supabase project.

```powershell
# 1. Install root, frontend, and backend dependencies
Set-Location D:\Coding\sm-ecommerce
npm.cmd run setup

# 2. Create env files, then fill in the Supabase values
Copy-Item frontend\.env.example frontend\.env.local
Copy-Item backend\.env.example backend\.env

# 3. Apply the database migrations (Supabase CLI must be logged in)
npx.cmd --yes supabase@latest login
npx.cmd --yes supabase@latest link --project-ref <project-ref>
npx.cmd --yes supabase@latest db push

# 4. Create the one admin account
Set-Location backend
npm.cmd run seed:admin
Set-Location ..

# 5. Verify tables, buckets, settings, and the admin
npm.cmd run db:check

# 6. Run both apps
npm.cmd run dev
```

- Storefront: http://localhost:3000
- API: http://localhost:4000/api/v1/health
- Readiness: http://localhost:4000/api/v1/health/ready

`/health/ready` validates real tables, not just network connectivity. Before the
migrations are applied it returns `503` with `services.database:
"schema_missing"`. After a successful `db push` it returns `200` and
`"reachable"`.

If port 3000 is already in use, run the frontend separately on 3100 and add
`http://localhost:3100/auth/callback` to Supabase **Authentication → URL
Configuration**:

```powershell
Set-Location frontend
npx.cmd next dev -p 3100
```

See [`docs/PHASE-1.md`](docs/PHASE-1.md) for the complete PowerShell migration
steps, the SQL Editor alternative, the admin seed options, and the manual
auth/RLS checklist.

If PowerShell blocks `npm` (execution policy), use `npm.cmd` for every command.

## Scripts

| Command                               | Description                                      |
| ------------------------------------- | ------------------------------------------------ |
| `npm run setup`                       | Install root, frontend, and backend dependencies |
| `npm run dev`                         | Run Next.js and Express together                 |
| `npm run dev:frontend`                | Run Next.js only                                 |
| `npm run dev:backend`                 | Run Express with `--watch`                       |
| `npm run build`                       | Production build of the frontend                 |
| `npm run lint`                        | ESLint for frontend and backend                  |
| `npm run test`                        | Frontend Node tests + backend Jest/Supertest     |
| `npm run db:check`                    | Verify tables, buckets, defaults, and the admin  |
| `npm run db:check:schema`             | Same check before the admin is seeded            |
| `npm run format`                      | Prettier for JS, CSS, JSON, and Markdown         |
| `npm --prefix backend run seed:admin` | Create or verify the single admin account        |

Seeding is idempotent. Running it again does nothing when the configured admin
already exists. To deliberately reset that admin's password:

```powershell
Set-Location backend
npm.cmd run seed:admin -- --update-password
```

The seed never creates a second admin and never silently changes an existing
admin's password.

`npm run db:check` is a full readiness check: run it after the migrations and the
admin seed. It fails loudly if any table, storage bucket, default settings row, or
the single active admin is missing. To check the schema before seeding, run
`npm run db:check:schema`.

## Environment variables

### `frontend/.env.local`

| Variable                             | Required | Notes                                       |
| ------------------------------------ | -------- | ------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | Yes      | Project URL                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Yes      | Public anon/publishable key                 |
| `NEXT_PUBLIC_API_URL`                | Yes      | `http://localhost:4000/api/v1` locally      |
| `NEXT_PUBLIC_SITE_URL`               | Yes      | Used for metadata and canonical URLs        |
| `NEXT_PUBLIC_STORE_NAME`             | No       | Defaults to SM Store                        |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Deferred | Stripe `pk_...` when card checkout is added |

### `backend/.env`

| Variable                         | Required | Notes                                  |
| -------------------------------- | -------- | -------------------------------------- |
| `NODE_ENV`                       | Yes      | `development` / `test` / `production`  |
| `PORT`                           | No       | Defaults to 4000                       |
| `FRONTEND_URL`                   | Yes      | Exact allowed CORS origin              |
| `SUPABASE_URL`                   | Yes      | Server-side project URL                |
| `SUPABASE_SERVICE_ROLE_KEY`      | Yes      | **Never** expose to the browser        |
| `SUPABASE_ANON_KEY`              | Yes      | Used only to verify customer tokens    |
| `RESEND_API_KEY`                 | Optional | Transactional email; no-op when absent |
| `EMAIL_FROM`                     | Optional | Verified sender for Resend             |
| `STRIPE_SECRET_KEY`              | Deferred | Card payments when Stripe is added     |
| `STRIPE_WEBHOOK_SECRET`          | Deferred | Webhook signature verification         |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed     | Used only by `seed:admin`              |

Production startup validates that `FRONTEND_URL`, the Supabase URL, anon key,
and service-role key are present. The frontend never imports the service-role
key.

## Authentication and authorization

- Public signup uses Supabase Auth and always creates a `profiles` row with
  `role = 'customer'` through a database trigger. There is no admin signup route.
- Email confirmation is enabled. The verification and recovery links return to
  `/auth/callback`, which exchanges the PKCE code for an HttpOnly session.
- `frontend/proxy.js` refreshes the session and performs optimistic redirects
  for `/account/*` and `/admin/*` based on verified JWT claims only.
- Server layouts and pages re-check the current profile from Postgres
  (`lib/auth/dal.js`). A customer can never gain admin access by editing a cookie
  or calling the admin UI directly.
- Express verifies the Bearer token with Supabase Auth, reloads the profile with
  the service-role client, rejects blocked accounts, and enforces the admin role
  on `/api/v1/admin/*`.
- Admin accounts may browse the storefront but are redirected away from the
  customer account area. Shopping routes will use `ADMIN_CANNOT_SHOP`.

## Security baseline

- RLS is enabled on every public table, with explicit column/table grants for
  `anon`, `authenticated`, and the service role.
- Policies scope customer-owned rows to `auth.uid()`. Shopping tables also
  require `is_customer()`, so blocked accounts lose cart, wishlist, address, and
  order access; the API rejects blocked sessions before any query. Own-profile
  read stays available so the server guard can report `blocked`.
- The single admin is enforced by a partial unique index. Role updates are
  service-role or database only; the profile trigger rejects customer changes to
  `role` and `is_blocked`.
- Helmet, strict CORS, global rate limits, and sensitive-route rate limits.
- Zod validation on API bodies; file buckets accept only JPEG/PNG/WebP up to
  5 MB and are written only through the API/service role.
- Admin writes are recorded in `audit_logs` with actor, action, entity, changed
  fields, IP, and user agent. Stripe checkout and webhook handling are
  intentionally not implemented; only COD is enabled, and card payments stay
  disabled in settings until a payment provider is connected.
- No secrets in the repository; `.env*` is ignored except for examples.

## Documentation

- [`docs/PHASE-1.md`](docs/PHASE-1.md) — migration commands, seeding, manual
  auth/RLS checklist, and Phase 1 verification record.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — architecture decisions, including
  the plan's `middleware.js` → Next.js 16 `proxy.js` conflict.
- [`docs/API.md`](docs/API.md) — REST contract, validation, and status codes.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Supabase, Vercel, Render, Stripe,
  Resend, and post-deploy checklist.
- [`supabase/README.md`](supabase/README.md) — migration workflow.

## Roadmap

- [x] Phase 0 — Repository, Next.js shell, theme, Express API, docs, CI-ready
      scripts
- [x] Phase 1 — Database schema, RLS, triggers, storage rules, admin seed,
      customer auth, account area, admin guard
- [x] Phase 2 - Admin catalog, media uploads, inventory, and dashboard layout
- [x] Phase 3 - Storefront, search, filters, product pages, SEO, and sitemap
- [x] Phase 4 - Cart, wishlist, coupons, addresses, COD checkout transaction
- [x] Phase 5 - Order management, tracking timeline, emails, and printable invoice
- [x] Phase 6 - Reviews, delivered-order rule, moderation, and rating aggregation
- [x] Phase 7 - CMS pages, banners, menu, home sections, settings, and contact inbox
- [x] Phase 8 - Reports, CSV exports, charts, responsive polish, and error states
- [x] Phase 9 (local) - Lint, unit/API-mock tests, security review, and build
- [x] Phase 9 (live) - Migrations applied, admin seeded, production deployed

Remaining external setup: Supabase Auth production redirect URLs, custom SMTP,
Resend, Stripe (deferred), CI/E2E, monitoring, and database backups. See
[`SM-Ecommerce-Project-Report-Roman-Urdu.txt`](SM-Ecommerce-Project-Report-Roman-Urdu.txt)
for the full Roman Urdu handover.

## License

Proprietary. All rights reserved.
