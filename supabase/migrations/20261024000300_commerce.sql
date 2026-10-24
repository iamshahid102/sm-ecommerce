-- Phase 1 · 0003
-- Coupons, cart, wishlist, orders, payments, and reviews.
-- Safe to re-run: create table/index if not exists.

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  description text,
  type public.coupon_type not null,
  value numeric(12, 2) not null,
  min_subtotal numeric(12, 2) not null default 0,
  max_discount numeric(12, 2),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  per_user_limit integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_code_format check (code ~ '^[A-Z0-9_-]{3,30}$'),
  constraint coupons_value_positive check (value > 0),
  constraint coupons_percent_max check (type <> 'percent' or value <= 100),
  constraint coupons_min_subtotal_non_negative check (min_subtotal >= 0),
  constraint coupons_max_discount_positive check (
    max_discount is null or max_discount > 0
  ),
  constraint coupons_usage_limit_positive check (
    usage_limit is null or usage_limit > 0
  ),
  constraint coupons_per_user_limit_positive check (per_user_limit > 0),
  constraint coupons_dates_valid check (
    starts_at is null or expires_at is null or expires_at > starts_at
  )
);

create unique index if not exists coupons_code_unique
  on public.coupons (upper(code));

create index if not exists coupons_active_idx
  on public.coupons (is_active, expires_at);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.generate_order_number(),
  user_id uuid references public.profiles (id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  status public.order_status not null default 'pending',
  payment_method text not null,
  payment_status public.payment_status not null default 'unpaid',
  subtotal numeric(12, 2) not null default 0,
  shipping_fee numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  coupon_id uuid references public.coupons (id) on delete set null,
  coupon_code text,
  shipping_address jsonb not null,
  billing_address jsonb,
  shipping_method text not null default 'standard',
  customer_note text,
  admin_note text,
  tracking_number text,
  courier text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_payment_method_check
    check (payment_method in ('cod', 'card')),
  constraint orders_amounts_non_negative check (
    subtotal >= 0
    and shipping_fee >= 0
    and discount >= 0
    and tax >= 0
    and total >= 0
  ),
  constraint orders_total_matches check (
    abs(total - (subtotal + shipping_fee + tax - discount)) < 0.01
  ),
  constraint orders_discount_not_above_goods check (
    discount <= subtotal + shipping_fee + tax
  ),
  constraint orders_note_length check (
    customer_note is null or char_length(customer_note) <= 1000
  )
);

create index if not exists orders_user_idx
  on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx
  on public.orders (status, created_at desc);
create index if not exists orders_payment_status_idx
  on public.orders (payment_status, created_at desc);
create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  title text not null,
  variant_label text,
  sku text,
  image_url text,
  unit_price numeric(12, 2) not null,
  quantity integer not null,
  line_total numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity between 1 and 99),
  constraint order_items_unit_price_non_negative check (unit_price >= 0),
  constraint order_items_line_total_matches check (
    abs(line_total - (unit_price * quantity)) < 0.01
  )
);

create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_items_product_idx
  on public.order_items (product_id);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  note text,
  changed_by uuid references public.profiles (id) on delete set null,
  actor_role text not null default 'system',
  created_at timestamptz not null default now(),
  constraint order_status_history_actor_role_check
    check (actor_role in ('customer', 'admin', 'system', 'webhook'))
);

create index if not exists order_status_history_order_idx
  on public.order_status_history (order_id, created_at);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null,
  status public.payment_status not null default 'unpaid',
  amount numeric(12, 2) not null default 0,
  currency text not null default 'PKR',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_provider_check check (provider in ('cod', 'stripe')),
  constraint payments_amount_non_negative check (amount >= 0)
);

create unique index if not exists payments_stripe_intent_unique
  on public.payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists payments_order_idx on public.payments (order_id);

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  order_id uuid not null references public.orders (id) on delete cascade,
  discount_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  constraint coupon_redemptions_discount_non_negative check (discount_amount >= 0)
);

create unique index if not exists coupon_redemptions_order_unique
  on public.coupon_redemptions (order_id);

create index if not exists coupon_redemptions_coupon_idx
  on public.coupon_redemptions (coupon_id, user_id);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_quantity_range check (quantity between 1 and 99)
);

create unique index if not exists cart_items_unique_line
  on public.cart_items (
    user_id,
    product_id,
    coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index if not exists cart_items_user_idx on public.cart_items (user_id);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists wishlist_user_product_unique
  on public.wishlist (user_id, product_id);

create index if not exists wishlist_user_idx on public.wishlist (user_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  rating integer not null,
  title text,
  comment text not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_rating_range check (rating between 1 and 5),
  constraint reviews_comment_length check (char_length(comment) between 10 and 2000),
  constraint reviews_title_length check (
    title is null or char_length(title) between 2 and 120
  )
);

create unique index if not exists reviews_product_user_unique
  on public.reviews (product_id, user_id);

create index if not exists reviews_product_visible_idx
  on public.reviews (product_id, created_at desc)
  where is_visible;
create index if not exists reviews_user_idx on public.reviews (user_id);
