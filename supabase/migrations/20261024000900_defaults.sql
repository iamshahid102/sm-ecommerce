-- Phase 1 · 0009
-- Safe defaults required by the storefront and admin settings screens.
-- Re-running never overwrites values changed by the admin.

insert into public.site_settings (
  id,
  store_name,
  store_tagline,
  currency,
  currency_symbol,
  shipping_fee,
  free_shipping_threshold,
  tax_percent,
  cod_enabled,
  card_enabled
)
values (
  1,
  'SM Store',
  'Everyday essentials, thoughtfully selected.',
  'PKR',
  'Rs',
  250,
  5000,
  0,
  true,
  false
)
on conflict (id) do nothing;

insert into public.home_sections (
  section_key,
  title,
  subtitle,
  config,
  sort_order,
  is_active
)
values
  (
    'featured_products',
    'Featured picks',
    'Hand-picked products our customers love.',
    '{"limit": 8}'::jsonb,
    10,
    true
  ),
  (
    'new_arrivals',
    'New arrivals',
    'Fresh additions to the store.',
    '{"limit": 8}'::jsonb,
    20,
    true
  ),
  (
    'shop_by_category',
    'Shop by category',
    'Find what you need, faster.',
    '{}'::jsonb,
    30,
    true
  )
on conflict (section_key) do nothing;
