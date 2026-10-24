-- Phase 1 · 0004
-- CMS, settings, contact, and newsletter.
-- Safe to re-run: create table/index if not exists.

create table if not exists public.site_settings (
  id smallint primary key default 1,
  store_name text not null default 'SM Store',
  store_tagline text,
  logo_url text,
  favicon_url text,
  currency text not null default 'PKR',
  currency_symbol text not null default 'Rs',
  shipping_fee numeric(12, 2) not null default 250,
  free_shipping_threshold numeric(12, 2),
  tax_percent numeric(5, 2) not null default 0,
  cod_enabled boolean not null default true,
  card_enabled boolean not null default false,
  contact_email text,
  contact_phone text,
  whatsapp_number text,
  address text,
  city text,
  country text not null default 'PK',
  social_links jsonb not null default '{}'::jsonb,
  announcement_text text,
  announcement_active boolean not null default false,
  meta_title text,
  meta_description text,
  og_image_url text,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1),
  constraint site_settings_currency_check check (char_length(currency) = 3),
  constraint site_settings_shipping_non_negative check (shipping_fee >= 0),
  constraint site_settings_free_shipping_non_negative check (
    free_shipping_threshold is null or free_shipping_threshold >= 0
  ),
  constraint site_settings_tax_range check (tax_percent between 0 and 100),
  constraint site_settings_social_object check (jsonb_typeof(social_links) = 'object')
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text not null,
  mobile_image_url text,
  button_text text,
  button_link text,
  placement text not null default 'home_hero',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banners_title_length check (char_length(title) between 2 and 150),
  constraint banners_placement_check
    check (placement in ('home_hero', 'home_promo')),
  constraint banners_dates_valid check (
    starts_at is null or ends_at is null or ends_at > starts_at
  )
);

create index if not exists banners_active_sort_idx
  on public.banners (is_active, placement, sort_order);

create table if not exists public.home_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null,
  title text,
  subtitle text,
  config jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint home_sections_key_format check (
    section_key ~ '^[a-z0-9_]{2,40}$'
  ),
  constraint home_sections_config_object check (jsonb_typeof(config) = 'object')
);

create unique index if not exists home_sections_key_unique
  on public.home_sections (section_key);

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  excerpt text,
  content text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  meta_title text,
  meta_description text,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_pages_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint cms_pages_title_length check (char_length(title) between 2 and 150)
);

create unique index if not exists cms_pages_slug_unique
  on public.cms_pages (lower(slug));

create index if not exists cms_pages_published_idx
  on public.cms_pages (is_published, slug);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  location public.menu_location not null default 'header',
  label text not null,
  url text not null,
  parent_id uuid references public.menu_items (id) on delete cascade,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  opens_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint menu_items_label_length check (char_length(label) between 1 and 60),
  constraint menu_items_not_own_parent check (parent_id is null or parent_id <> id)
);

create index if not exists menu_items_location_sort_idx
  on public.menu_items (location, is_active, sort_order);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint contact_messages_name_length check (char_length(name) between 2 and 100),
  constraint contact_messages_subject_length check (
    char_length(subject) between 3 and 150
  ),
  constraint contact_messages_message_length check (
    char_length(message) between 10 and 5000
  )
);

create index if not exists contact_messages_unread_idx
  on public.contact_messages (is_read, created_at desc);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  is_active boolean not null default true,
  source text not null default 'website',
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create unique index if not exists newsletter_subscribers_email_unique
  on public.newsletter_subscribers (lower(email));

create unique index if not exists newsletter_subscribers_token_unique
  on public.newsletter_subscribers (unsubscribe_token);

create index if not exists newsletter_subscribers_active_idx
  on public.newsletter_subscribers (is_active, created_at desc);
