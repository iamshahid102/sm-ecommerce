# Architecture Decisions

This file records decisions that are not fully specified by
`E-Commerce Website - Complete Project Plan (Roman Urdu).md`. When the plan and
the current framework documentation conflict, the conflict is recorded here and
the safer/current option is used.

## ADR-001: Next.js 16 uses `proxy.js`, not `middleware.js`

- **Status:** Accepted (Phase 0)
- **Context:** The plan (Section 4.3) asks for `middleware.js` to protect
  `/admin/*` and `/account/*`. Next.js 16 deprecates the `middleware` file
  convention and renames it to `proxy`.
- **Decision:** Use `frontend/proxy.js` with the exported `proxy` function. It
  refreshes the Supabase session on every request. Route authorization is added
  in Phase 1 using verified JWT claims plus a server-side profile role check.
- **Consequence:** The file name differs from the plan; behaviour and security
  intent are unchanged. Proxy is only the first layer; Express still verifies
  every admin request.

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
- **Decision:** Express runs as native ESM (`"type": "module"`) on Node 22+. All
  relative imports include the `.js` extension. Jest uses Babel only as a test
  transform; production code is not transpiled.
- **Rationale:** Aligns with modern Node and the frontend module system without
  adding a build step to the API.

## ADR-005: Supabase access split

- **Status:** Accepted (Phase 0)
- **Decision:**
  - Browser/server components use `@supabase/ssr` with the anon key and the
    user's cookies.
  - The Express API uses the service-role key for business writes and for
    verifying access tokens.
  - The service-role key never appears in a `NEXT_PUBLIC_*` variable and never
    leaves the backend.
- **Consequence:** Every customer query in Express must explicitly scope by
  `auth.user.id`; the service role bypasses RLS and is not a substitute for
  authorization.

## ADR-006: One admin, enforced twice

- **Status:** Accepted
- **Decision:**
  - `profiles.role` defaults to `customer`.
  - A partial unique index guarantees at most one `admin` row.
  - No admin signup UI or API route exists.
  - The admin is created by `backend/scripts/seed-admin.js` (Phase 1), which
    requires `ADMIN_EMAIL` and `ADMIN_PASSWORD` and refuses to run if an admin
    already exists.
  - Express admin routes require a valid JWT, an unblocked profile, and
    `role = 'admin'`.

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

- **Status:** Accepted
- **Decision:**
  - All totals are recalculated server-side in integer paisa internally, then
    stored as `numeric(10,2)`.
  - Only one coupon per order; coupon usage is incremented in the same
    transaction.
  - Shipping fee and free-shipping threshold come from `site_settings`.
  - Tax is stored as a configurable percentage and defaults to `0`.
  - COD orders become `paid` when marked `delivered`; card orders become `paid`
    only from a verified Stripe webhook.
  - A card payment is authorized at checkout, but the order is only confirmed
    after the webhook succeeds. Failed/abandoned card orders are cancelled and
    stock restored.
- **Caveat:** Stripe does not currently offer merchant accounts in Pakistan.
  The integration will be fully implemented and testable with Stripe test keys;
  going live with cards requires a supported Stripe account or the future
  JazzCash/Easypaisa integration listed in the plan.

## ADR-010: Order status transitions

- **Status:** Accepted
- **Decision:**

  | From | Allowed to |
  | --- | --- |
  | pending | confirmed, cancelled |
  | confirmed | processing, cancelled |
  | processing | shipped, cancelled |
  | shipped | delivered, returned |
  | delivered | returned |
  | cancelled | — (terminal) |
  | returned | — (terminal) |

  Customers may only cancel `pending` orders. Admins may cancel before
  `shipped`. `returned` is admin-only. Every change is written to
  `order_status_history` and triggers an email (skipped safely when Resend is
  not configured in development).

## ADR-011: Reviews and moderation

- **Status:** Accepted
- **Decision:**
  - A review requires a `delivered` order owned by the user that contains the
    product.
  - One review per product per user, enforced by a unique constraint.
  - New reviews are visible by default (matching the plan's schema); admins can
    hide or delete them.
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

- **Status:** Accepted
- **Decision:** Uploads go through the Express API to Supabase Storage. Accepted
  MIME types are JPEG, PNG, and WebP, max 5 MB, max 8 images per product.
  Filenames are generated server-side; original names are never trusted. The
  `product-images` bucket is public-read, write-restricted to the service role.

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
