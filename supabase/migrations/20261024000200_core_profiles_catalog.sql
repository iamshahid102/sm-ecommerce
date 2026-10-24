-- Phase 1 · 0002
-- Profiles, addresses, catalog, and inventory.
-- Safe to re-run: create table/index if not exists.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  is_blocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (
    full_name is null or char_length(full_name) between 2 and 100
  ),
  constraint profiles_phone_format check (
    phone is null or phone ~ '^\+?[0-9][0-9 ()-]{6,19}$'
  ),
  constraint profiles_avatar_url_length check (
    avatar_url is null or char_length(avatar_url) <= 2048
  )
);

create unique index if not exists only_one_admin
  on public.profiles (role)
  where role = 'admin';

create unique index if not exists profiles_email_unique
  on public.profiles (lower(email));

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text not null default 'Home',
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text,
  country text not null default 'PK',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint addresses_label_length check (char_length(label) between 1 and 40),
  constraint addresses_name_length check (char_length(full_name) between 2 and 100),
  constraint addresses_phone_format check (
    phone ~ '^\+?[0-9][0-9 ()-]{6,19}$'
  ),
  constraint addresses_line1_length check (char_length(address_line1) between 5 and 200),
  constraint addresses_city_length check (char_length(city) between 2 and 80),
  constraint addresses_state_length check (char_length(state) between 2 and 80),
  constraint addresses_country_length check (char_length(country) = 2)
);

create unique index if not exists addresses_one_default_per_user
  on public.addresses (user_id)
  where is_default;

create index if not exists addresses_user_idx
  on public.addresses (user_id, created_at desc);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  image_url text,
  parent_id uuid references public.categories (id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_length check (char_length(name) between 2 and 80),
  constraint categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint categories_not_own_parent check (parent_id is null or parent_id <> id)
);

create unique index if not exists categories_slug_unique
  on public.categories (lower(slug));

create index if not exists categories_parent_idx on public.categories (parent_id);
create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  logo_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brands_name_length check (char_length(name) between 2 and 80),
  constraint brands_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  )
);

create unique index if not exists brands_slug_unique
  on public.brands (lower(slug));

create index if not exists brands_active_sort_idx
  on public.brands (is_active, sort_order);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  short_description text,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  price numeric(12, 2) not null,
  discount_price numeric(12, 2),
  sku text,
  stock integer not null default 0,
  low_stock_threshold integer not null default 5,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  avg_rating numeric(2, 1) not null default 0,
  review_count integer not null default 0,
  meta_title text,
  meta_description text,
  og_image_url text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_title_length check (char_length(title) between 3 and 200),
  constraint products_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint products_price_positive check (price > 0),
  constraint products_discount_price_valid check (
    discount_price is null
    or (discount_price > 0 and discount_price < price)
  ),
  constraint products_stock_non_negative check (stock >= 0),
  constraint products_low_stock_non_negative check (low_stock_threshold >= 0),
  constraint products_rating_range check (avg_rating >= 0 and avg_rating <= 5),
  constraint products_review_count_non_negative check (review_count >= 0)
);

create unique index if not exists products_slug_unique
  on public.products (lower(slug))
  where deleted_at is null;

create unique index if not exists products_sku_unique
  on public.products (lower(sku))
  where sku is not null and deleted_at is null;

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists products_published_idx
  on public.products (is_published, created_at desc)
  where deleted_at is null;
create index if not exists products_featured_idx
  on public.products (is_featured, created_at desc)
  where deleted_at is null and is_published;
create index if not exists products_price_idx
  on public.products (price)
  where deleted_at is null and is_published;
create index if not exists products_rating_idx
  on public.products (avg_rating desc)
  where deleted_at is null and is_published;
create index if not exists products_low_stock_idx
  on public.products (stock, low_stock_threshold)
  where deleted_at is null and is_published;

create index if not exists products_search_idx
  on public.products
  using gin (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' ||
      coalesce(short_description, '') || ' ' ||
      coalesce(description, '')
    )
  )
  where deleted_at is null;

-- pg_trgm normally lives in the `extensions` schema on Supabase. Resolve the
-- operator class through the search path so an existing installation in
-- `public` also works.
set search_path = public, extensions;

create index if not exists products_title_trgm_idx
  on public.products using gin (title gin_trgm_ops)
  where deleted_at is null;

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint product_images_url_length check (char_length(url) <= 2048)
);

create unique index if not exists product_images_one_primary
  on public.product_images (product_id)
  where is_primary;

create index if not exists product_images_product_idx
  on public.product_images (product_id, sort_order);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text,
  color text,
  sku text,
  price_delta numeric(12, 2) not null default 0,
  stock integer not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_stock_non_negative check (stock >= 0),
  constraint product_variants_size_length check (
    size is null or char_length(size) between 1 and 40
  ),
  constraint product_variants_color_length check (
    color is null or char_length(color) between 1 and 40
  )
);

create unique index if not exists product_variants_combo_unique
  on public.product_variants (
    product_id,
    coalesce(lower(size), ''),
    coalesce(lower(color), '')
  );

create unique index if not exists product_variants_sku_unique
  on public.product_variants (lower(sku))
  where sku is not null;

create index if not exists product_variants_product_idx
  on public.product_variants (product_id, sort_order);
