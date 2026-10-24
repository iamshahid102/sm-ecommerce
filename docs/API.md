# SM Store API

Base URL: `/api/v1`

The API is implemented with Express 5 and Supabase Postgres. The contract below
is the source of truth for the frontend and tests. Fields may be added in a
backward-compatible way; removing or renaming a field is a breaking change.

The document describes the complete target contract. **Phase 1 implements the
System routes, `/me`, and `/admin/dashboard`.** Catalog, cart, checkout, order,
review, CMS, and payment routes are implemented in later phases; their contracts
are listed here so the frontend and database can be built against a stable shape.

## Authentication

- Signup, login, email verification, and password reset are handled by Supabase
  Auth in the Next.js app.
- Every protected request sends `Authorization: Bearer <supabase-access-token>`.
- Express verifies the token with Supabase Auth using the anon key, then loads
  the profile with the service-role client. Admin routes additionally require
  `profiles.role = 'admin'` and `is_blocked = false`.
- Blocked accounts receive `403 ACCOUNT_BLOCKED` on every authenticated route.
- Public signup always creates `role = 'customer'`. There is no admin signup.
- Admin users cannot use cart, checkout, wishlist, or review endpoints.
- Browser protection is layered: `frontend/proxy.js` redirects on verified JWT
  claims, then the server DAL re-checks the profile before rendering
  `/account/*` or `/admin/*`. The API never trusts the frontend guard.

## Response envelope

Success:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

Error:

```json
{
  "success": false,
  "error": "Validation failed.",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "email", "message": "Invalid email", "code": "invalid_format" }
  ]
}
```

`meta` is only present on paginated lists. `details` is only present when it
helps the client (validation, specific business errors). Stack traces are never
returned in production.

### Common status codes

| Status | Meaning                                         |
| ------ | ----------------------------------------------- |
| 200    | Success                                         |
| 201    | Created                                         |
| 204    | Deleted, no body                                |
| 400    | Malformed request                               |
| 401    | Missing/invalid token                           |
| 403    | Authenticated but not allowed                   |
| 404    | Not found (or not owned by the caller)          |
| 409    | Conflict (stock, duplicate, invalid transition) |
| 422    | Zod validation failed                           |
| 429    | Rate limited                                    |
| 500    | Unexpected server error                         |
| 503    | Dependency not configured/ready                 |

### Common error codes

`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `ADMIN_REQUIRED`,
`ADMIN_CANNOT_SHOP`, `ACCOUNT_BLOCKED`, `NOT_FOUND`, `CONFLICT`, `OUT_OF_STOCK`,
`INVALID_COUPON`, `INVALID_STATUS_TRANSITION`, `REVIEW_NOT_ALLOWED`,
`ALREADY_REVIEWED`, `RATE_LIMITED`, `PAYLOAD_TOO_LARGE`,
`INVALID_CURRENT_PASSWORD`, `PASSWORD_NOT_AVAILABLE`, `PROFILE_UPDATE_FAILED`,
`PASSWORD_UPDATE_FAILED`, `AUTH_SERVICE_UNAVAILABLE`,
`DASHBOARD_UNAVAILABLE`, `INTERNAL_ERROR`.

## Pagination and filtering

All lists accept `page` (default 1) and `limit` (default 20, max 100). Invalid
values are clamped or rejected with `422`. Sort fields are whitelisted per
endpoint. Search is case-insensitive and trimmed.

---

## System

### `GET /health`

Liveness. Always returns `200` when the process is running.

### `GET /health/ready`

Readiness. Returns `200` only when the database is reachable **and** the Phase 1
schema exists. `services.database` is `reachable`, `schema_missing`,
`unreachable`, or `not_configured`. A missing schema (for example `PGRST205`)
returns `503` with `code: "NOT_READY"` and
`details.services.database: "schema_missing"`.

---

## Public

### `GET /products`

Query: `search`, `category` (slug), `brand` (slug), `minPrice`, `maxPrice`,
`rating` (1-5), `inStock` (`true`), `featured` (`true`), `sort`
(`newest|price_asc|price_desc|rating|popular`), `page`, `limit`.

Returns published, non-deleted products with primary image, category, brand,
price, discount price, stock status, rating, and review count. Never returns
admin-only fields.

### `GET /products/:slug`

Returns the product, all images, variants, category, brand, visible reviews
(paginated), rating summary, and up to 8 related products from the same category.

### `GET /products/:id/reviews`

Visible reviews for a product, newest first, paginated.

### `GET /categories`

Active categories with product counts, ordered by `sort_order`.

### `GET /brands`

Active brands with product counts.

### `GET /cms/home`

Returns active banners ordered by `sort_order`, enabled home sections, and
public site settings (store name, logo, contact, social links, announcement).

### `GET /cms/pages/:slug`

Returns a published CMS page with sanitized HTML and SEO fields.

### `GET /cms/menu`

Returns header and footer menu items as a tree.

### `POST /contact`

Body: `name` (2-100), `email`, `phone` (optional), `subject` (3-150),
`message` (10-5000). Rate limited to 5/hour per IP. Stores the message and
returns `201`.

### `POST /newsletter`

Body: `email`. Idempotent. Returns `201` for a new subscriber and `200` if
already subscribed. Rate limited.

---

## Customer (Bearer token required)

### `GET /me`

Returns the profile: `id`, `email`, `full_name`, `phone`, `role`, `avatar_url`,
`is_blocked`, `email_confirmed_at`, `created_at`, `updated_at`. The service-role
profile lookup is always scoped to the verified token's user id.

### `PUT /me`

Body: `full_name` (2-100), `phone` (optional, valid Pakistani format). Email is
changed through Supabase Auth, not this endpoint. `role` and `is_blocked` are
rejected by the request schema and protected by a database trigger.

### `POST /me/password`

Body: `current_password`, `new_password` (min 8, mixed case + number). Verifies
the current password with Supabase Auth before changing it. Returns `200` with
`{ updated: true }`. Wrong current password: `401 INVALID_CURRENT_PASSWORD`. If\nSupabase rate-limits the verification attempt, the API returns\n`429 RATE_LIMITED`.

### Addresses

- `GET /me/addresses` — caller's addresses, default first.
- `POST /me/addresses` — `label`, `full_name`, `phone`, `address_line1`,
  `address_line2?`, `city`, `state`, `postal_code?`, `country` (default `PK`),
  `is_default?`.
- `PUT /me/addresses/:id` — same fields; scoped to the caller.
- `DELETE /me/addresses/:id` — scoped to the caller. Cannot delete the last
  address if it is referenced by a pending order.
- Setting `is_default = true` clears the previous default in one transaction.

### Wishlist

- `GET /wishlist` — caller's wishlist with product summaries.
- `POST /wishlist` — body `product_id`. Idempotent.
- `DELETE /wishlist/:productId` — removes one entry.

### Cart

- `GET /cart` — items with current price, stock, line totals, and cart summary.
- `POST /cart` — body `product_id`, `variant_id?`, `quantity` (1-99). Adds or
  increments; clamps to stock and returns a warning if clamped.
- `PUT /cart/:itemId` — body `quantity` (1-99). Rejects if stock is
  insufficient.
- `DELETE /cart/:itemId` — removes one item.
- `DELETE /cart` — clears the cart.
- `POST /cart/merge` — body `items: [{ product_id, variant_id?, quantity }]`.
  Merges the guest cart, clamping to stock.

Cart responses always use server prices. Client-supplied prices are ignored.

### Coupons

#### `POST /coupons/validate`

Body: `code`, plus current cart context (server reads the cart itself). Returns
the coupon, discount amount, and final totals, or a typed error:
`INVALID_COUPON`, `COUPON_EXPIRED`, `COUPON_MIN_SUBTOTAL`, `COUPON_USAGE_LIMIT`,
`COUPON_NOT_APPLICABLE`.

### Orders

### `POST /orders`

Body:

```json
{
  "address_id": "uuid",
  "shipping_method": "standard",
  "payment_method": "cod",
  "coupon_code": "WELCOME10",
  "customer_note": "optional",
  "items": [{ "product_id": "uuid", "variant_id": "uuid", "quantity": 2 }]
}
```

`items` is optional; when omitted the server uses the saved cart. When present,
the server still validates ownership and uses only IDs/quantities.

Server behaviour (single Postgres RPC transaction):

1. Lock each product row (`FOR UPDATE`) and validate stock and publish state.
2. Recalculate every line price from the database. Ignore client prices.
3. Re-validate and apply the coupon inside the transaction.
4. Create the order and items with title/price/image snapshots.
5. Snapshot the shipping address.
6. Decrement stock (and variant stock).
7. Record initial status history.
8. Clear the cart.
9. Increment coupon usage.

Returns `201` with the order. `409 OUT_OF_STOCK` includes the affected items.
For card payments the response also contains the Stripe client secret.

### `GET /orders`

Caller's orders, newest first, paginated. Filters: `status`, `search` (order
number), `from`, `to`.

### `GET /orders/:id`

Caller's order with items, payment summary, address snapshot, status history,
tracking number, and invoice metadata. Returns `404` for other users' orders
(IDOR protection).

### `PATCH /orders/:id/cancel`

Allowed only when `status = 'pending'` and the order belongs to the caller.
Restores stock and coupon usage in one transaction, appends history, and sends
an email. `409 INVALID_STATUS_TRANSITION` otherwise.

### `GET /orders/:id/invoice`

Returns an HTML invoice (print-friendly) scoped to the caller. The admin variant
is under `/admin/orders/:id/invoice`.

### Reviews

### `POST /products/:id/reviews`

Body: `rating` (1-5), `comment` (10-2000), `order_id?`. The server finds a
delivered order for the caller containing the product; the client cannot bypass
this. One review per product per user. Returns `201` and updated aggregates.

### `PUT /reviews/:id`

Caller's own review. Body: `rating`, `comment`.

### `DELETE /reviews/:id`

Caller's own review. Triggers aggregate recalculation.

---

## Admin (Bearer token + admin role)

### `GET /admin/dashboard`

Phase 1 returns:

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRevenue": 0,
      "totalOrders": 0,
      "totalCustomers": 0,
      "totalProducts": 0,
      "lowStockCount": 0,
      "pendingOrders": 0
    },
    "orderStatusCounts": {
      "pending": 0,
      "confirmed": 0,
      "processing": 0,
      "shipped": 0,
      "delivered": 0,
      "cancelled": 0,
      "returned": 0
    },
    "lowStockProducts": [],
    "recentOrders": [],
    "generatedAt": "2026-10-24T10:00:00.000Z"
  },
  "message": "Dashboard loaded."
}
```

`totalRevenue` is the sum of `orders.total` where `payment_status = 'paid'`.
`recentOrders` returns the latest 8 orders; `lowStockProducts` returns up to 5
products where stock is at or below `low_stock_threshold`. The totals and the
low-stock list are computed by the `admin_dashboard_metrics()` database function,
so PostgREST's 1000-row response cap cannot truncate lifetime revenue or counts.
Date-range parameters and the sales chart series are added in the reports phase;
no `range` query is accepted yet.

### Products

- `GET /admin/products` — all products including drafts and soft-deleted
  (optional `includeDeleted=true`). Filters: search, category, brand, status.
- `POST /admin/products` — full product payload with SEO fields, images,
  variants, publish/feature flags.
- `GET /admin/products/:id`
- `PUT /admin/products/:id`
- `DELETE /admin/products/:id` — soft delete (`deleted_at`). Existing orders
  keep working.
- `POST /admin/products/:id/restore`
- `POST /admin/products/:id/images` — multipart upload, max 5 MB each,
  jpg/png/webp, max 8 images. Writes to Supabase Storage.
- `DELETE /admin/products/:id/images/:imageId` — removes a product image.
- `PUT /admin/products/:id/variants` — replaces variants (size/color/SKU/stock).

Product validation: title 3-200, slug unique, price > 0, discount price < price,
stock >= 0, SKU unique when present, category exists, images <= 8.

### Categories and brands

- `GET/POST /admin/categories`, `PUT/DELETE /admin/categories/:id`
- `GET/POST /admin/brands`, `PUT/DELETE /admin/brands/:id`

Deleting a category/brand with products is blocked; deactivate instead.

### Orders

- `GET /admin/orders` — all orders. Filters: status, payment status, search,
  date range.
- `GET /admin/orders/:id`
- `PATCH /admin/orders/:id/status` — body `status`, optional `tracking_number`,
  `note`, `courier`. Enforces the transition table in `DECISIONS.md`, writes
  history, and emails the customer.
- `PATCH /admin/orders/:id/payment` — body `payment_status` (`paid` |
  `refunded` | `failed`) with a note. Card orders normally change via webhook.
- `POST /admin/orders/:id/refund` — records a refund note; Stripe refund is
  attempted for card orders.
- `GET /admin/orders/:id/invoice`

### Customers

- `GET /admin/customers` — search, sort by join date/order count.
- `GET /admin/customers/:id` — profile, addresses, order history, totals.
- `PATCH /admin/customers/:id` — `is_blocked`. Blocking does not delete data.
  An admin cannot block themselves; the single admin is protected.

### Reviews

- `GET /admin/reviews` — filter by visibility, rating, product.
- `PATCH /admin/reviews/:id` — `is_visible`.
- `DELETE /admin/reviews/:id`

### Coupons

- `GET/POST /admin/coupons`, `PUT/DELETE /admin/coupons/:id`
- Fields: code, type (`percent|fixed`), value, min_subtotal, max_discount,
  starts_at, expires_at, usage_limit, per_user_limit, is_active.
- Codes are uppercase, unique, and validated server-side.

### CMS

- `GET/POST /admin/cms/banners`, `PUT/DELETE /admin/cms/banners/:id`
- `GET/PUT /admin/cms/home` — section order and visibility.
- `GET/POST /admin/cms/pages`, `PUT/DELETE /admin/cms/pages/:id`
- `GET/PUT /admin/cms/menu` — header/footer items, nesting, order.
- `PUT /admin/settings` — store name, logo, favicon, currency, shipping fee,
  free-shipping threshold, tax percent, payment methods, contact info, social
  links, SEO defaults, announcement.
- `GET /admin/contact-messages`, `PATCH /admin/contact-messages/:id` (mark read)
- `GET /admin/newsletter` — paginated subscriber list, CSV export.

All CMS HTML is sanitized server-side before storage. SEO fields are length
limited.

### Reports

### `GET /admin/reports/sales`

Query: `from`, `to`, `groupBy=day|week|month`. Returns gross sales, discounts,
shipping, refunds, net revenue, order count, average order value, and top
products. `format=csv` streams a CSV with the same data.

### `GET /admin/reports/inventory`

Low-stock and out-of-stock products, total inventory value.

### `GET /admin/reports/customers`

New vs returning customers, top customers by spend.

### Audit log

Every admin write appends `{ actor_id, action, entity_type, entity_id,
changes, ip, user_agent, created_at }` to `audit_logs`. The log is readable by
the admin at `GET /admin/audit-logs` and is never writable through the API.

---

## Webhooks

### `POST /webhooks/stripe`

Raw body, no auth header. Verifies `stripe-signature` against
`STRIPE_WEBHOOK_SECRET`. Handles `payment_intent.succeeded`,
`payment_intent.payment_failed`, and `charge.refunded`. Idempotent by Stripe
event ID. Returns `400` for invalid signatures; never trusts the payload without
verification.

## Rate limits

| Scope                  | Limit                 |
| ---------------------- | --------------------- |
| Global per IP          | 300 requests / 15 min |
| Auth-sensitive actions | 15 / 15 min           |
| Contact form           | 5 / hour              |
| Review creation        | 10 / hour             |
| Order creation         | 20 / hour             |

Limits are per IP (trusted proxy aware) and are disabled in the test
environment.
