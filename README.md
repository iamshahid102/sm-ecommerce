# SM Store

Single-vendor e-commerce platform for Pakistan: one Admin, unlimited customers,
PKR pricing, Cash on Delivery and Stripe card payments.

Built with **Next.js 16 (App Router, JavaScript)**, **Tailwind CSS v4**,
**shadcn/ui**, **Express 5**, and **Supabase** (Postgres, Auth, Storage).

> **Status: Phase 1 implementation complete.** The database schema, RLS
> policies, storage rules, triggers, single-admin seed, customer auth, account
> area, and admin guard are implemented. The migrations are ready to apply to
> the connected Supabase project; see
> [`docs/PHASE-1.md`](docs/PHASE-1.md). Live auth/RLS verification is pending
> that step. The home page is still an intentional foundation page and is
> replaced by the real storefront in Phase 3.

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
  scripts/           Idempotent admin seed
  tests/             Jest + Supertest
supabase/            Timestamped migrations and local CLI config
docs/                API contract, decisions, deployment runbook, Phase 1
```

Two independently deployable apps live in one repository without npm
workspaces. The root package only orchestrates development.

## Quick start

Requirements: Node.js 22+ and npm 10+ (developed on Node 24 / npm 12), and a
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

# 5. Run both apps
npm.cmd run dev
```

- Storefront: http://localhost:3000
- API: http://localhost:4000/api/v1/health
- Readiness: http://localhost:4000/api/v1/health/ready

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

| Command                              | Description                                      |
| ------------------------------------ | ------------------------------------------------ |
| `npm run setup`                      | Install root, frontend, and backend dependencies |
| `npm run dev`                        | Run Next.js and Express together                 |
| `npm run dev:frontend`               | Run Next.js only                                 |
| `npm run dev:backend`                | Run Express with `--watch`                       |
| `npm run build`                      | Production build of the frontend                 |
| `npm run lint`                       | ESLint for frontend and backend                  |
| `npm run test`                       | Jest + Supertest API tests                       |
| `npm run format`                     | Prettier for JS, CSS, JSON, and Markdown         |
| `npm --prefix backend run seed:admin` | Create or verify the single admin account        |

Seeding is idempotent. Running it again does nothing when the configured admin
already exists. To deliberately reset that admin's password:

```powershell
Set-Location backend
npm.cmd run seed:admin -- --update-password
```

The seed never creates a second admin and never silently changes an existing
admin's password.

## Environment variables

### `frontend/.env.local`

| Variable                             | Required | Notes                                  |
| ------------------------------------ | -------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | Yes      | Project URL                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Yes      | Public anon/publishable key            |
| `NEXT_PUBLIC_API_URL`                | Yes      | `http://localhost:4000/api/v1` locally |
| `NEXT_PUBLIC_SITE_URL`               | Yes      | Used for metadata and canonical URLs   |
| `NEXT_PUBLIC_STORE_NAME`             | No       | Defaults to SM Store                   |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Phase 4+ | Stripe `pk_...`                        |

### `backend/.env`

| Variable                         | Required | Notes                                 |
| -------------------------------- | -------- | ------------------------------------- |
| `NODE_ENV`                       | Yes      | `development` / `test` / `production` |
| `PORT`                           | No       | Defaults to 4000                      |
| `FRONTEND_URL`                   | Yes      | Exact allowed CORS origin             |
| `SUPABASE_URL`                   | Yes      | Server-side project URL               |
| `SUPABASE_SERVICE_ROLE_KEY`      | Yes      | **Never** expose to the browser       |
| `SUPABASE_ANON_KEY`              | Yes      | Used only to verify customer tokens   |
| `RESEND_API_KEY`                 | Phase 5+ | Transactional email                   |
| `EMAIL_FROM`                     | Phase 5+ | Verified sender                       |
| `STRIPE_SECRET_KEY`              | Phase 4+ | Card payments                         |
| `STRIPE_WEBHOOK_SECRET`          | Phase 4+ | Webhook signature verification        |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed     | Used only by `seed:admin`             |

Production startup validates that the Supabase URL, anon key, and service-role
key are present. The frontend never imports the service-role key.

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
- Policies scope customer rows to `auth.uid()` and use `is_customer()` so blocked
  accounts lose access.
- The single admin is enforced by a partial unique index. Role updates are
  service-role or database only; the profile trigger rejects customer changes to
  `role` and `is_blocked`.
- Helmet, strict CORS, global rate limits, and sensitive-route rate limits.
- Zod validation on API bodies; file buckets accept only JPEG/PNG/WebP up to
  5 MB and are written only through the API/service role.
- Stripe webhook signature verification and audit logs are wired in their
  respective phases; the database tables and idempotency store exist now.
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
- [ ] Phase 2 — Admin catalog and product management
- [ ] Phase 3 — Storefront, search, filters, product pages
- [ ] Phase 4 — Cart, wishlist, checkout, orders (transactional RPC)
- [ ] Phase 5 — Order management, tracking, emails, invoices
- [ ] Phase 6 — Reviews and moderation
- [ ] Phase 7 — CMS portal
- [ ] Phase 8 — Reports, polish, performance
- [ ] Phase 9 — E2E tests, security review, deployment

## License

Proprietary. All rights reserved.
