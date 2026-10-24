# SM Store

Single-vendor e-commerce platform for Pakistan: one Admin, unlimited customers,
PKR pricing, Cash on Delivery and Stripe card payments.

Built with **Next.js 16 (App Router, JavaScript)**, **Tailwind CSS v4**,
**shadcn/ui**, **Express 5**, and **Supabase** (Postgres, Auth, Storage).

> **Status: Phase 0 complete.** The frontend shell, API service, design tokens,
> docs, linting, and tests are in place. Database, RLS, and authentication are
> the next phase. The storefront in this phase is an intentional foundation page;
> it is replaced by the real home page in Phase 4.

## Repository layout

```
frontend/            Next.js storefront + admin UI
  app/               App Router routes, layout, global theme
  components/ui/     shadcn/ui primitives
  lib/supabase/      browser, server, and proxy clients
  proxy.js           Session refresh (Next.js 16 replacement for middleware.js)
backend/             Express REST API (ESM)
  src/config/        Environment and Supabase client
  src/middleware/    CORS, logging, rate limits, validation, errors
  src/routes/        Versioned routes (/api/v1)
  src/controllers/   Request handlers
  src/services/      Business logic
  tests/             Jest + Supertest
supabase/            Migrations, seeds (Phase 1+)
docs/                API contract, decisions, deployment runbook
```

Two independently deployable apps live in one repository without npm
workspaces. The root package only orchestrates development.

## Quick start

Requirements: Node.js 22+ and npm 10+ (developed on Node 24 / npm 12).

```bash
# 1. Install root, frontend, and backend dependencies
npm run setup

# 2. Create local env files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

Fill the Supabase values when you have a project. Phase 0 runs without them:
the marketing foundation page renders and the API health endpoint works.

```bash
# 3. Run both apps (frontend :3000, API :4000)
npm run dev
```

- Storefront: http://localhost:3000
- API: http://localhost:4000/api/v1/health
- Readiness: http://localhost:4000/api/v1/health/ready

If PowerShell blocks `npm` (execution policy), use `npm.cmd`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run setup` | Install root, frontend, and backend dependencies |
| `npm run dev` | Run Next.js and Express together |
| `npm run dev:frontend` | Run Next.js only |
| `npm run dev:backend` | Run Express with `--watch` |
| `npm run build` | Production build of the frontend |
| `npm run lint` | ESLint for frontend and backend |
| `npm run test` | Jest + Supertest API tests |
| `npm run format` | Prettier for JS, CSS, JSON, and Markdown |

## Environment variables

### `frontend/.env.local`

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Phase 1+ | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Phase 1+ | Public anon/publishable key |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:4000/api/v1` locally |
| `NEXT_PUBLIC_SITE_URL` | Yes | Used for metadata and canonical URLs |
| `NEXT_PUBLIC_STORE_NAME` | No | Defaults to SM Store |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Phase 5+ | Stripe `pk_...` |

### `backend/.env`

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | Yes | `development` / `test` / `production` |
| `PORT` | No | Defaults to 4000 |
| `FRONTEND_URL` | Yes | Exact allowed CORS origin |
| `SUPABASE_URL` | Phase 1+ | Server-side project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 1+ | **Never** expose to the browser |
| `SUPABASE_ANON_KEY` | Phase 1+ | Used to verify access tokens |
| `RESEND_API_KEY` | Phase 6+ | Transactional email |
| `EMAIL_FROM` | Phase 6+ | Verified sender |
| `STRIPE_SECRET_KEY` | Phase 5+ | Card payments |
| `STRIPE_WEBHOOK_SECRET` | Phase 5+ | Webhook signature verification |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Phase 1 | Seed script only |

Production startup validates that the Supabase URL and service-role key are
present. The frontend never imports the service-role key.

## Security baseline

- Helmet, strict CORS, and rate limiting on the API.
- Zod validation middleware ready for every route.
- Supabase session refreshed and JWT verified with `getClaims()` in
  `frontend/proxy.js`.
- Server-side Supabase client uses HttpOnly cookies; the browser client is a
  singleton.
- API returns a consistent error envelope and hides internals in production.
- Structured logging with redaction of authorization/cookie headers and tokens.
- No secrets in the repository; `.env*` is ignored except for examples.

RLS, admin role checks, audit logs, upload limits, and Stripe signature
verification are implemented in their respective phases. The target design is
documented in `docs/DECISIONS.md`, `docs/API.md`, and `docs/DEPLOYMENT.md`.

## Documentation

- [`docs/DECISIONS.md`](docs/DECISIONS.md) — architecture decisions, including
  the plan's `middleware.js` → Next.js 16 `proxy.js` conflict.
- [`docs/API.md`](docs/API.md) — full REST contract, validation, and status
  codes.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Supabase, Vercel, Render, Stripe,
  Resend, and post-deploy checklist.
- [`supabase/README.md`](supabase/README.md) — migration workflow.

## Roadmap

- [x] Phase 0 — Repository, Next.js shell, theme, Express API, docs, CI-ready
      scripts
- [ ] Phase 1 — Database schema, RLS, triggers, admin seed, authentication
- [ ] Phase 2 — Admin dashboard and catalog
- [ ] Phase 3 — Storefront, search, filters, product pages
- [ ] Phase 4 — Cart, wishlist, checkout, orders (transactional RPC)
- [ ] Phase 5 — Order management, tracking, emails, invoices
- [ ] Phase 6 — Reviews and moderation
- [ ] Phase 7 — CMS portal
- [ ] Phase 8 — Reports, polish, performance
- [ ] Phase 9 — E2E tests, security review, deployment

## License

Proprietary. All rights reserved.
