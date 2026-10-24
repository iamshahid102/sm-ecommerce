# E-Commerce Website - Complete Project Plan

Roman Urdu documentation | Stack: Next.js, Tailwind, shadcn/ui, Node.js, Express.js, Supabase | Version 1.0

## 1. Project Overview

Yeh ek full-stack e-commerce website hai jisme **sirf 1 Admin** hoga aur baqi sab users **Customer** honge.

- **Admin**: products ki CRUD, orders manage karna, CMS portal se website ka content control karna, coupons, customers, reports.
- **Customer**: products dekhna, cart/wishlist, order karna, order track karna, delivery ke baad review dena, profile aur addresses manage karna.
- **Theme**: Blue, White aur Black, modern gradients ke sath (details Section 9 mein).

### Goals

- Fast, SEO-friendly aur mobile-first website.
- Admin ke liye aasaan dashboard jahan code likhe baghair content change ho sake.
- Secure system: sirf ek admin, baqi sab customers.
- Scalable architecture taake baad mein features add ho saken.

## 2. Roles aur Permissions

| Feature | Guest | Customer | Admin |
| --- | --- | --- | --- |
| Products / categories dekhna | Yes | Yes | Yes |
| Search aur filter | Yes | Yes | Yes |
| Cart | Yes (local) | Yes (saved) | No |
| Checkout aur order | No | Yes | No |
| Order tracking | No | Apne orders | Sab orders |
| Review dena | No | Sirf delivered product par | Moderate kar sakta hai |
| Product CRUD | No | No | Yes |
| CMS control | No | No | Yes |
| Users / reports dekhna | No | No | Yes |

### Single Admin ka rule

- Public signup se hamesha `role = 'customer'` banega.
- Admin account **manually** Supabase se seed hoga (ek baar), website par admin signup ka koi route nahi hoga.
- Database mein unique index laga denge taake 2nd admin ban hi na sake.

## 3. Features List

### 3.1 Customer Features

1. Register / Login / Logout (Email + password, Google login optional)
2. Email verification aur Forgot / Reset password
3. Home page: hero banner, featured products, categories, offers
4. Product listing: search, filters (category, price, brand, rating), sorting, pagination
5. Product detail: image gallery, variants (size/color), stock status, reviews, related products
6. Cart: quantity update, remove, coupon apply
7. Wishlist
8. Checkout: address select/add, shipping method, payment method, order summary
9. Order placed email confirmation
10. My Orders: list, detail, status timeline, invoice download, cancel (jab tak Pending ho)
11. Order tracking: Pending > Confirmed > Processing > Shipped > Delivered
12. Reviews aur ratings (sirf Delivered order ke baad, 1 product par 1 review)
13. Profile: naam, phone, password change, saved addresses
14. Static pages: About, Contact, FAQ, Privacy Policy, Terms, Return Policy
15. Contact form aur newsletter subscribe
16. Dark mode toggle (optional)

### 3.2 Admin Features

1. Secure admin login
2. Dashboard: total sales, orders, customers, low stock alerts, charts
3. **Products CRUD**: add, edit, delete (soft delete), multiple images, variants, price, discount price, stock, SKU, SEO fields, publish/draft
4. **Categories / Brands CRUD**
5. **Orders management**: list, filter, status update, payment status, tracking number, invoice print, cancel/refund note
6. **Customers**: list, order history, block/unblock
7. **Reviews moderation**: approve, hide, delete
8. **Coupons / Discounts** management
9. **CMS Portal** (Section 4.3 mein detail)
10. **Settings**: store name, logo, currency, shipping charges, tax, payment methods, contact info
11. **Reports**: sales by date, top products, export CSV
12. Inventory: stock update aur low-stock warning
13. Notifications: naya order aane par email / in-app alert

### 3.3 CMS Portal (Admin)

Admin yeh sab bina developer ke change kar sake:

- **Hero banners / sliders**: image, heading, button text, link, order, active/inactive
- **Homepage sections**: featured products, new arrivals, categories ka order on/off
- **Static pages editor**: About, FAQ, Privacy, Terms (rich text editor)
- **Navigation menu aur footer links**
- **Announcement bar / promo strip**
- **Site settings**: logo, favicon, theme text, social links, contact details
- **SEO**: meta title, description, OG image per page aur per product
- **Blog** (optional phase 2)

## 4. Tech Stack aur Architecture

| Layer | Technology | Kaam |
| --- | --- | --- |
| Frontend | Next.js (App Router), JavaScript | UI, SSR/SSG, SEO, routing |
| Styling | Tailwind CSS + shadcn/ui | Components aur theme |
| Backend API | Node.js + Express.js | Business logic, REST API, validation |
| Database | Supabase (PostgreSQL) | Data storage |
| Auth | Supabase Auth (JWT) | Login/signup, sessions |
| File storage | Supabase Storage | Product images, banners, logo |
| Forms/validation | React Hook Form + Zod | Frontend + backend validation |
| Data fetching | TanStack Query (React Query) | Caching, loading states |
| State | Zustand | Cart, UI state |
| Rich text | Tiptap | CMS pages editor |
| Charts | Recharts | Admin dashboard |
| Email | Resend (ya Nodemailer) | Order emails, reset links |
| Payments | Cash on Delivery + Stripe (card) | Pakistan ke liye COD sab se zaroori hai |
| Security | Helmet, CORS, express-rate-limit | API protection |
| Hosting | Vercel (frontend), Render/Railway (Express), Supabase Cloud | Deployment |

### 4.1 Architecture Diagram (Text)

```
[ Browser: Customer / Admin ]
          |
   Next.js App (Vercel)  -- SEO pages, UI, Supabase Auth login
          |  (JWT token bhejta hai)
   Express.js API (Render/Railway)
     - JWT verify middleware
     - Role check (admin/customer)
     - Business logic, validation
          |
   Supabase: PostgreSQL + Storage + Auth
```

### 4.2 Auth Flow

1. User Next.js se Supabase Auth se login karta hai, JWT milta hai.
2. Frontend har API request ke header mein `Authorization: Bearer <token>` bhejta hai.
3. Express middleware token verify karta hai aur `profiles` table se role check karta hai.
4. Admin routes par `requireAdmin` middleware lagega, warna 403 error.
5. Express **service role key** use karega jo sirf server par rahegi, kabhi frontend par nahi.

### 4.3 Rendering Strategy

- Home, product list, product detail: **SSR/ISR** (SEO ke liye)
- Cart, checkout, account, admin: **Client components** with protected routes
- Next.js `middleware.js` se `/admin/*` aur `/account/*` routes protect honge.

## 5. Database Design (Supabase PostgreSQL)

### Tables ki list

`profiles`, `addresses`, `categories`, `brands`, `products`, `product_images`, `product_variants`, `cart_items`, `wishlist`, `orders`, `order_items`, `order_status_history`, `payments`, `reviews`, `coupons`, `banners`, `cms_pages`, `menu_items`, `site_settings`, `contact_messages`, `newsletter_subscribers`

### Main tables ki SQL (sample)

```sql
-- Roles
create type user_role as enum ('customer', 'admin');
create type order_status as enum
  ('pending','confirmed','processing','shipped','delivered','cancelled','returned');
create type payment_status as enum ('unpaid','paid','refunded','failed');

-- Profiles (auth.users se linked)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  is_blocked boolean default false,
  created_at timestamptz default now()
);
-- Sirf ek admin allowed
create unique index only_one_admin on profiles (role) where role = 'admin';

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  image_url text,
  parent_id uuid references categories(id),
  is_active boolean default true
);

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  category_id uuid references categories(id),
  brand_id uuid references brands(id),
  price numeric(10,2) not null,
  discount_price numeric(10,2),
  sku text unique,
  stock int not null default 0,
  is_published boolean default false,
  is_featured boolean default false,
  avg_rating numeric(2,1) default 0,
  review_count int default 0,
  meta_title text,
  meta_description text,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references profiles(id),
  status order_status default 'pending',
  payment_method text not null,      -- 'cod' | 'card'
  payment_status payment_status default 'unpaid',
  subtotal numeric(10,2),
  shipping_fee numeric(10,2),
  discount numeric(10,2) default 0,
  total numeric(10,2),
  shipping_address jsonb not null,   -- snapshot
  tracking_number text,
  created_at timestamptz default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  title text, unit_price numeric(10,2), quantity int
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references profiles(id),
  order_id uuid references orders(id),
  rating int check (rating between 1 and 5),
  comment text,
  is_visible boolean default true,
  created_at timestamptz default now(),
  unique (product_id, user_id)       -- 1 user = 1 review per product
);
```

### Important database rules

- Order place hone par **address aur price ka snapshot** save hoga, taake baad mein product price change ho to purani order na bigray.
- Stock kam karna aur order banana **ek transaction** (Postgres function / RPC) mein hoga taake overselling na ho.
- Review sirf tab allowed jab user ke paas us product ka `delivered` order ho (backend check karega).
- Review save hone par `products.avg_rating` aur `review_count` trigger se update honge.
- Product delete **soft delete** hoga (`deleted_at`), kyun ke purane orders us se linked hain.

## 6. Security Plan

1. **Row Level Security (RLS)** har table par ON ho. Customer sirf apna data dekh sake (cart, orders, addresses).
2. Admin ke liye policies `profiles.role = 'admin'` check karen.
3. Express mein har request par Zod validation aur sanitization.
4. `helmet`, strict `CORS` (sirf apni website ka domain), `express-rate-limit` (login aur contact form par khaas).
5. Passwords Supabase handle karta hai (bcrypt), khud store nahi karne.
6. Image upload par file type aur size limit (max 5MB, sirf jpg/png/webp).
7. `.env` secrets git mein commit nahi honge. Service role key sirf backend par.
8. HTTPS everywhere, secure cookies, XSS protection (CMS HTML ko sanitize karein, DOMPurify).
9. Admin actions ka **audit log** (kis ne kab kya change kiya).
10. Payment webhook signature verify karna (Stripe).

## 7. REST API Endpoints (Express.js)

Base URL: `/api/v1`

### Public

| Method | Route | Kaam |
| --- | --- | --- |
| GET | `/products` | List (query: search, category, price, sort, page) |
| GET | `/products/:slug` | Product detail + reviews |
| GET | `/categories` | Categories list |
| GET | `/cms/home` | Banners, sections, settings |
| GET | `/cms/pages/:slug` | Static page content |
| POST | `/contact` | Contact form |
| POST | `/newsletter` | Subscribe |

### Customer (login zaroori)

| Method | Route | Kaam |
| --- | --- | --- |
| GET/PUT | `/me` | Profile dekhna / update |
| CRUD | `/me/addresses` | Addresses |
| GET/POST/DELETE | `/wishlist` | Wishlist |
| GET/POST/PUT/DELETE | `/cart` | Cart |
| POST | `/coupons/validate` | Coupon check |
| POST | `/orders` | Order place karna |
| GET | `/orders` | Mere orders |
| GET | `/orders/:id` | Order detail + tracking timeline |
| PATCH | `/orders/:id/cancel` | Cancel (sirf pending) |
| POST | `/products/:id/reviews` | Review add (delivered ke baad) |
| PUT/DELETE | `/reviews/:id` | Apna review edit/delete |

### Admin (`requireAdmin`)

| Method | Route | Kaam |
| --- | --- | --- |
| GET | `/admin/dashboard` | Stats aur charts |
| CRUD | `/admin/products` | Product management |
| POST | `/admin/products/:id/images` | Image upload |
| CRUD | `/admin/categories`, `/admin/brands` | Taxonomy |
| GET | `/admin/orders` | Sab orders (filters) |
| PATCH | `/admin/orders/:id/status` | Status + tracking number |
| GET/PATCH | `/admin/customers` | List, block/unblock |
| GET/PATCH/DELETE | `/admin/reviews` | Moderation |
| CRUD | `/admin/coupons` | Coupons |
| CRUD | `/admin/cms/banners` | Hero banners |
| CRUD | `/admin/cms/pages` | Static pages |
| PUT | `/admin/cms/menu` | Navigation/footer |
| PUT | `/admin/settings` | Site settings |
| GET | `/admin/reports/sales` | Reports + CSV export |

### Standard response format

```json
{ "success": true, "data": { }, "message": "OK" }
{ "success": false, "error": "Validation failed", "details": [ ] }
```

## 8. Folder Structure

### Frontend (Next.js)

```
frontend/
  app/
    (store)/              # public + customer pages
      page.js             # Home
      products/page.js
      products/[slug]/page.js
      cart/page.js
      checkout/page.js
      account/orders/page.js
      account/orders/[id]/page.js
      account/profile/page.js
      wishlist/page.js
      [slug]/page.js      # CMS static pages
    (auth)/login, register, forgot-password
    admin/
      layout.js           # sidebar + guard
      page.js             # dashboard
      products/, orders/, customers/, reviews/
      coupons/, settings/
      cms/banners, cms/pages, cms/menu
  components/
    ui/                   # shadcn/ui components
    store/                # ProductCard, CartDrawer, Navbar...
    admin/                # DataTable, StatCard, Charts...
  lib/                    # supabase client, api helper, utils
  hooks/  store/(zustand)  middleware.js  tailwind.config.js
```

### Backend (Express)

```
backend/
  src/
    config/        # env, supabase client
    middleware/    # auth, requireAdmin, validate, errorHandler
    routes/        # public, customer, admin route files
    controllers/   # request handlers
    services/      # business logic (orderService, stockService)
    validators/    # Zod schemas
    utils/         # email, slugify, logger
    app.js  server.js
  .env
```

## 9. UI/UX Design System

### Colors (Blue / White / Black)

| Naam | Hex | Istemal |
| --- | --- | --- |
| Primary Blue | `#2563EB` | Buttons, links |
| Deep Blue | `#1E3A8A` | Hover, headings |
| Sky Blue | `#38BDF8` | Accents, gradient end |
| Black / Ink | `#0B0F1A` | Navbar, footer, dark sections |
| Soft White | `#F8FAFC` | Page background |
| Pure White | `#FFFFFF` | Cards |
| Gray text | `#64748B` | Secondary text |
| Success / Warning / Danger | `#16A34A` / `#F59E0B` / `#DC2626` | Status badges |

### Gradients

```css
/* Hero / CTA buttons */
background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #38BDF8 100%);

/* Dark premium section / footer */
background: linear-gradient(180deg, #0B0F1A 0%, #111B3A 100%);

/* Sale badge / highlights */
background: linear-gradient(90deg, #2563EB, #0B0F1A);

/* Subtle section background */
background: linear-gradient(180deg, #F8FAFC 0%, #E0ECFF 100%);
```

### Design guidelines

- **Font**: Inter ya Poppins (headings ke liye Poppins).
- **Cards**: rounded-2xl, soft shadow, hover par halka lift + blue glow.
- **Navbar**: black/glass effect (backdrop-blur), search bar, cart icon with badge.
- **Hero**: blue gradient background, bara heading, white CTA button.
- **Product card**: image, discount badge, rating stars, price, quick add-to-cart.
- **Animations**: Framer Motion se smooth fade/slide (zyada nahi, performance ka khayal).
- **Responsive**: mobile-first (sm, md, lg, xl), mobile par bottom cart bar.
- **Admin panel**: dark sidebar (black), white content area, blue active states.
- **shadcn/ui components**: Button, Card, Dialog, Sheet (cart drawer), Table, Tabs, Select, Dropdown, Badge, Toast (Sonner), Skeleton, Form, Input, Checkbox, Calendar, Pagination.
- **Accessibility**: proper contrast, alt text, keyboard navigation, focus rings.

## 10. Order Flow

```
Customer checkout > Order [Pending] > Admin confirm [Confirmed]
 > [Processing] > [Shipped + tracking no.] > [Delivered]
                                          > Review unlock
Cancel: sirf Pending par customer kar sakta hai
Return: Delivered ke baad admin [Returned] mark kare
```

- Har status change `order_status_history` mein save hoga (timeline ke liye).
- Har status par customer ko **email** jayegi.
- COD order: Delivered par `payment_status = paid` hoga.
- Card order: Stripe webhook se `paid` hoga.

## 11. Development Phases aur Timeline

| Phase | Kaam | Muddat (approx) |
| --- | --- | --- |
| 1. Setup | Repos, Next.js + Tailwind + shadcn, Express, Supabase project, env, ESLint/Prettier | 2-3 din |
| 2. Database + Auth | Tables, RLS, triggers, admin seed, login/register, middleware | 4-5 din |
| 3. Admin: Catalog | Dashboard layout, Categories, Products CRUD, image upload | 5-6 din |
| 4. Store Frontend | Home, listing, filters, detail page, search | 6-7 din |
| 5. Cart + Checkout | Cart, wishlist, addresses, coupons, order placement (transaction) | 5-6 din |
| 6. Orders | Customer tracking, admin order management, emails, invoice | 4-5 din |
| 7. Reviews | Review rules, moderation, rating aggregation | 2-3 din |
| 8. CMS Portal | Banners, pages editor, menu, settings, SEO | 5-6 din |
| 9. Reports + Polish | Charts, CSV export, animations, responsive fixes | 3-4 din |
| 10. Testing + Deploy | Testing, security review, deploy, domain, monitoring | 4-5 din |

**Total approx: 6 se 8 hafte** (1 developer, full time). Part-time mein 10-14 hafte.

## 12. Testing Plan

- **Unit tests**: Jest (services jaise price calculation, stock logic)
- **API tests**: Supertest + Jest (auth, orders, admin guard)
- **E2E tests**: Playwright (register > add to cart > checkout > track order > review)
- **Manual checklist**: mobile devices, slow internet, alag browsers
- **Security checks**: customer admin routes ko access na kar sake, RLS verify, rate limiting

## 13. Deployment Plan

| Part | Platform |
| --- | --- |
| Next.js frontend | Vercel |
| Express API | Render / Railway / VPS |
| Database, Auth, Storage | Supabase Cloud |
| Domain + SSL | Namecheap / Cloudflare |
| Emails | Resend |
| Monitoring | Sentry (errors), Vercel Analytics, UptimeRobot |
| CI/CD | GitHub Actions (lint + test + auto deploy) |

### Environment Variables

```
# Frontend
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=

# Backend
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=   # kabhi frontend par nahi
FRONTEND_URL=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## 14. Performance aur SEO

- `next/image` se images optimize, WebP format, lazy loading.
- ISR se product pages cache, `revalidate` jab admin product update kare.
- Dynamic `sitemap.xml`, `robots.txt`, meta tags, Open Graph, product JSON-LD schema.
- Database indexes: `products(slug)`, `products(category_id)`, `orders(user_id)`, full-text search index.
- Pagination har list par, kabhi sab data ek sath load nahi.

## 15. Future Enhancements (Phase 2)

- JazzCash / Easypaisa payment integration
- Courier API integration (TCS, Leopards, PostEx) auto tracking
- Blog module, product Q&A, recently viewed
- WhatsApp order notifications
- Multi-language (English + Urdu) aur RTL support
- PWA / mobile app (React Native)
- Abandoned cart emails, product recommendations

## 16. Aglay Qadam (Next Steps)

1. Is plan ko review karen aur jo cheez add/remove karni ho batayen.
2. Business details final karen: store ka naam, logo, currency (PKR), shipping charges, payment methods.
3. Supabase project banayen aur GitHub repos setup karen.
4. **Phase 1 se coding shuru karen**. Main aap ko step-by-step code (setup, database SQL, auth, admin panel) bana kar de sakta hoon.
