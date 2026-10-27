# Architecture Decisions

This file records decisions that are not fully specified by
`E-Commerce Website - Complete Project Plan (Roman Urdu).md`. When the plan and
the current framework documentation conflict, the conflict is recorded here and
the safer/current option is used.

## ADR-001: Next.js 16 uses `proxy.js`, not `middleware.js`

- **Status:** Accepted (Phase 0), implemented (Phase 1)
- **Context:** The plan (Section 4.3) asks for `middleware.js` to protect
  `/admin/*` and `/account/*`. Next.js 16 deprecates the `middleware` file
  convention and renames it to `proxy`.
- **Decision:** Use `frontend/proxy.js` with the exported `proxy` function. It
  refreshes the Supabase session on every request and performs optimistic
  redirects based on verified JWT claims. Server layouts and pages call the
  profile-backed DAL in `frontend/lib/auth/dal.js` before rendering protected
  content.
- **Consequence:** The file name differs from the plan; behaviour and security
  intent are unchanged. Proxy is only the first layer. The server DAL and
  Express still verify the profile role; a cookie cannot be edited to grant
  admin access.

## ADR-002: Phase numbering

- **Status:** Accepted (Phase 0)
- **Context:** The plan calls setup "Phase 1", while the delivery instructions
  call setup "Phase 0" and reserve "Phase 1" for database and auth.
- **Decision:** Phase 0 = plan's Setup phase. Phase 1 = plan's Database + Auth
  phase (plan Phase 2). Later phases are offset by one from the plan:
  Phase 2 = plan Phase 3, …, Phase 9 = plan Phase 10.

## ADR-003: Monorepo without npm workspaces

- **Status:** Accepted (Phase 0)
- **Context:** Next.js and Express have different runtime and build needs, and
  both deploy independently (Vercel and Render/Railway).
- **Decision:** `frontend/` and `backend/` keep independent `package.json` and
  lockfiles. The root package only provides orchestration scripts and shared
  tooling (Prettier, concurrently).
- **Consequence:** `npm run setup` installs all three package trees. Deploying
  one app does not require installing the other.

## ADR-004: Backend is ESM JavaScript

- **Status:** Accepted (Phase 0)
- **Decision:** Express runs as native ESM (`"type": "module"`) on Node 22.12+. All
  relative imports include the `.js` extension. Jest uses Babel only as a test
  transform; production code is not transpiled.
- **Rationale:** Aligns with modern Node and the frontend module system without
  adding a build step to the API.

## ADR-005: Supabase access split

- **Status:** Accepted (Phase 0), refined (Phase 1)
- **Decision:**
  - Browser/server components use `@supabase/ssr` with the anon key and the
    user's cookies.
  - Express verifies the Bearer token with `supabase.auth.getUser()` using an
    **anon-key** client, then loads the profile with the service-role client.
  - Business reads/writes that need to bypass RLS use the service-role key. The
    service-role key never appears in a `NEXT_PUBLIC_*` variable and never
    leaves the backend.
- **Consequence:** Every customer query in Express must explicitly scope by
  `auth.user.id`; the service role bypasses RLS and is not a substitute for
  authorization. Token verification deliberately uses the anon key so a leaked
  service key is not also a token-verification path.

## ADR-006: One admin, enforced at every layer

- **Status:** Accepted (Phase 0), implemented (Phase 1)
- **Decision:**
  - `profiles.role` defaults to `customer`; the Auth trigger never assigns
    `admin`.
  - A partial unique index (`only_one_admin`) guarantees at most one admin row.
  - No admin signup UI or API route exists.
  - `backend/scripts/seed-admin.js` requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`,
    creates or promotes that one user, and marks the email confirmed.
  - The seed is idempotent: an existing matching admin is left untouched, while
    a different existing admin causes a hard failure. Changing a password is an
    explicit `--update-password` action, never a silent side effect.
  - The profile guard trigger rejects customer changes to `role` and
    `is_blocked`; those fields are service-role/database controlled.
  - Express admin routes require a valid JWT, an unblocked profile, and
    `role = 'admin'`. The frontend admin layout independently checks the
    profile.

## ADR-007: Cart storage is hybrid

- **Status:** Accepted
- **Decision:** Guests keep the cart in a persisted Zustand store. Authenticated
  customers use `cart_items` through the API so the cart follows them across
  devices. On login, the guest cart is merged into the server cart with stock
  clamped to available quantity.
- **Rationale:** Matches the plan's guest-local / customer-saved distinction and
  keeps checkout server-authoritative.

## ADR-008: Admin accounts cannot shop

- **Status:** Accepted
- **Decision:** Admin users may browse the storefront but cannot add items,
  check out, review products, or use the wishlist. The API rejects these
  actions with `403 ADMIN_CANNOT_SHOP`.

## ADR-009: Order and payment rules

- **Status:** COD implemented; card payments deferred
- **Decision:**
  - All totals are recalculated server-side. Arithmetic that combines prices,
    discounts, tax, and shipping is done in integer paisa and rounded once
    before storage; monetary columns are `numeric(12,2)`.
  - Only one coupon per order; coupon usage is incremented in the same
    transaction.
  - Shipping fee and free-shipping threshold come from `site_settings`.
  - Tax is stored as a configurable percentage and defaults to `0`.
  - COD orders become `paid` when marked `delivered`. The admin can also mark a
    COD payment paid or refunded explicitly.
  - Card checkout is disabled in this build. When it is implemented, card
    orders must become `paid` only from a verified Stripe webhook; a card order
    must not be confirmed from the browser redirect alone.
- **Caveat:** Stripe does not currently offer merchant accounts in Pakistan.
  A future integration can be tested with Stripe test keys; going live with
  cards requires a supported Stripe account or the JazzCash/Easypaisa option
  listed in the plan.
- **Schema deviation:** The plan's sample uses `numeric(10,2)`. The implementation
  uses `numeric(12,2)` for money so large PKR order totals and aggregates do not
  overflow. Display and API values still use two decimals.

## ADR-010: Order status transitions

- **Status:** Accepted
- **Decision:**

  | From       | Allowed to            |
  | ---------- | --------------------- |
  | pending    | confirmed, cancelled  |
  | confirmed  | processing, cancelled |
  | processing | shipped, cancelled    |
  | shipped    | delivered, returned   |
  | delivered  | returned              |
  | cancelled  | — (terminal)          |
  | returned   | — (terminal)          |

  Customers may only cancel `pending` orders. Admins may cancel before
  `shipped`. `returned` is admin-only. Every change is written to
  `order_status_history`; the API will also trigger a status email (skipped
  safely when Resend is not configured in development).

## ADR-011: Reviews and moderation

- **Status:** Accepted
- **Decision:**
  - A review requires a `delivered` order owned by the user that contains the
    product.
  - One review per product per user, enforced by a unique constraint.
  - New reviews are visible by default (matching the plan's schema); admins can
    hide or delete them through the moderation API. Customers have column-level
    grants only for rating/title/comment, so they cannot unhide a moderated
    review or rewrite its identity.
  - `products.avg_rating` and `review_count` are maintained by a database
    trigger and only count visible reviews. Editing/hiding/deleting a review
    recalculates the aggregate.
  - The verified-purchase badge is derived from the review's `order_id`.

## ADR-012: Prices, currency, and display

- **Status:** Accepted
- **Decision:** Currency is PKR. Values are stored with two decimals. Storefront
  prices are displayed with `Intl.NumberFormat("en-PK")` and zero fraction
  digits. Discount price, when present and lower than price, is the selling
  price. Percentage discounts are rounded for display only.

## ADR-013: CMS HTML sanitization

- **Status:** Accepted
- **Decision:** Rich text is sanitized on the server before storage and again on
  render. Allowed tags are limited to headings, paragraphs, lists, links,
  emphasis, blockquotes, code, and tables. Scripts, styles, iframes, event
  handlers, and `javascript:` URLs are removed. The storefront never uses
  `dangerouslySetInnerHTML` without the sanitizer.

## ADR-014: Image uploads

- **Status:** Accepted (Phase 0), bucket rules implemented (Phase 1)
- **Decision:** Uploads go through the Express API to Supabase Storage. Accepted
  MIME types are JPEG, PNG, and WebP, max 5 MB, max 8 images per product.
  Filenames are generated server-side; original names are never trusted. The
  `product-images`, `cms-assets`, and `site-assets` buckets are public-read and
  write-restricted to the service role. Bucket-level MIME and size limits apply
  to service-role uploads too.

## ADR-015: Pagination and API envelope

- **Status:** Accepted
- **Decision:** Every list endpoint is paginated (default 20, max 100) and
  returns `meta: { page, limit, total, totalPages }`. Responses follow the
  plan's `{ success, data, message }` / `{ success, error, code, details }`
  envelope. HTTP status codes carry the primary meaning.

## ADR-016: Time and identifiers

- **Status:** Accepted
- **Decision:** Timestamps are `timestamptz` in UTC and rendered in
  `Asia/Karachi`. Order numbers use `SM-YYYYMMDD-XXXX` with a collision-safe
  sequence. Slugs are unique, lowercase, and generated server-side.

## ADR-017: Email confirmation, PKCE, and the auth callback

- **Status:** Accepted (Phase 1)
- **Context:** The hosted Supabase project has email confirmations enabled.
  Supabase cannot create a confirmed session until the customer opens the email
  link, and recovery links have the same requirement.
- **Decision:**
  - Use the SSR cookie client with PKCE. Signup and recovery emails redirect to
    `/auth/callback` on the current origin.
  - The callback route exchanges the code server-side, writes the session to
    HttpOnly cookies via `@supabase/ssr`, then redirects to the requested page.
  - The running origin must be listed in Supabase **Redirect URLs**; the current
    local development ports are 3000 and 3100.
  - Signout is a server action that clears the Supabase cookies. The proxy
    refreshes sessions on ordinary navigation.
- **Consequence:** Opening a confirmation/recovery link on the wrong host fails
  safely with an "expired or invalid link" state instead of leaking a session.
  Custom SMTP is required for dependable production delivery.

## ADR-018: Migrations are additive and re-runnable

- **Status:** Accepted (Phase 1)
- **Context:** The project is applied both through the Supabase CLI and, when
  CLI login is unavailable, through the SQL Editor. A failed or partial run must
  be recoverable without dropping data.
- **Decision:**
  - Migrations are timestamped SQL files applied in filename order.
  - Tables, indexes, and buckets use `if not exists`; functions use
    `create or replace`; triggers and named policies are dropped and recreated
    before creation.
  - Enums are created only if absent. Default rows are inserted `on conflict do
nothing`.
  - RLS is enabled for every public table, then grants are set explicitly for
    `anon`, `authenticated`, and `service_role`; no table relies on inherited
    default grants.
  - The admin is not a SQL seed. It is created through the Auth Admin API so the
    password is hashed by Supabase and never stored in a migration.
- **Consequence:** Re-running the migration set does not destroy data, but it
  also does not alter existing table columns. Future schema changes must be new
  additive migrations, not edits to already-applied files.

## ADR-019: Phase 1 dashboard scope

- **Status:** Accepted (Phase 1)
- **Decision:** The Phase 1 admin dashboard returns lifetime paid revenue,
  current order-status counts, customer/product totals, the five lowest-stock
  products, and eight recent orders. The aggregate figures and low-stock list are
  computed by `public.admin_dashboard_metrics()` so PostgREST's default row limit
  cannot truncate them. Date-range series and charts are delivered with the
  reports phase and will extend the response backward-compatibly.
- **Rationale:** Phase 1 proves the auth/role pipeline and database read path
  without pre-building reporting screens that depend on order data.

## ADR-020: Readiness checks the schema, not only connectivity

- **Status:** Accepted (Phase 1)
- **Context:** The original readiness query used Supabase/PostgREST with
  `head: true`. A HEAD request against a missing table can return `204` without an
  error, so `/api/v1/health/ready` reported `reachable` on the connected project
  even though none of the migrations were applied. The deployment checklist then
  passed while signup and login were unusable.
- **Decision:** Readiness performs normal limited `select` queries against one
  table from each core migration (`profiles`, `orders`, `site_settings`,
  `audit_logs`). It returns `schema_missing` for `PGRST205` and `unreachable` for
  other failures. `npm run db:check` / `db:check:schema` provide the same
  diagnosis from the command line, including storage buckets.
- **Consequence:** A deployment with a live database but no schema reports `503`
  until the migrations are applied. This is intentional; a process that cannot
  serve auth or dashboard requests is not ready.

## ADR-021: Production requires an explicit frontend origin

- **Status:** Accepted (Phase 1)
- **Decision:** `FRONTEND_URL` no longer has a silent `http://localhost:3000`
  default in production. It is required by `assertRequiredProductionConfig` and
  is normalized without a trailing slash. Development still includes ports 3000
  and 3100 automatically for local CORS.
- **Rationale:** Starting production with a localhost CORS allow-list is a
  configuration failure that should stop the process, not fail silently in the
  browser.

## ADR-022: Database-side low-stock filtering and batched exports

- **Status:** Accepted (Phase 8)
- **Context:** Admin pagination must agree with the low-stock filter. Filtering
  after `range()` can return an empty page while matching rows exist later.
  PostgREST also caps an unpaginated select at 1000 rows, which can silently
  truncate reports and CSV exports on a busy store.
- **Decision:**
  - `products.is_low_stock` is a stored generated column, indexed for the admin
    low-stock filter and its exact count.
  - Report and CSV queries re-run the query for 1000-row windows until a short
    batch is returned.
  - Variant order lines restore only `product_variants.stock`; base-product
    lines restore only `products.stock`.
  - Checkout previews use the exact configured `tax_percent`, while the order
    RPC remains authoritative for the committed total.
- **Consequence:** Admin counts, large exports, and cancellation stock changes
  stay correct without loading every row into the browser or inflating stock.
