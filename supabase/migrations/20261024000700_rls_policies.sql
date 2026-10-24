-- Phase 1 · 0007
-- Row Level Security and explicit API grants.
-- Safe to re-run: RLS is idempotent and every policy is dropped first.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'addresses',
    'categories',
    'brands',
    'products',
    'product_images',
    'product_variants',
    'coupons',
    'orders',
    'order_items',
    'order_status_history',
    'payments',
    'coupon_redemptions',
    'cart_items',
    'wishlist',
    'reviews',
    'site_settings',
    'banners',
    'home_sections',
    'cms_pages',
    'menu_items',
    'contact_messages',
    'newsletter_subscribers',
    'audit_logs',
    'stripe_events'
  ]
  loop
    execute format(
      'alter table public.%I enable row level security',
      table_name
    );
  end loop;
end
$$;

revoke all on all tables in schema public from public, anon, authenticated;
revoke all on all sequences in schema public from public, anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- Public catalog content -----------------------------------------------------
grant select on public.categories to anon, authenticated;
grant select on public.brands to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_images to anon, authenticated;
grant select on public.product_variants to anon, authenticated;
grant select on public.banners to anon, authenticated;
grant select on public.home_sections to anon, authenticated;
grant select on public.cms_pages to anon, authenticated;
grant select on public.menu_items to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.reviews to anon, authenticated;

-- Customer-owned data --------------------------------------------------------
grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update, delete on public.wishlist to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant select on public.order_status_history to authenticated;
grant select on public.payments to authenticated;
grant select on public.coupon_redemptions to authenticated;
grant insert (product_id, user_id, order_id, rating, title, comment)
  on public.reviews to authenticated;
grant update (rating, title, comment) on public.reviews to authenticated;
grant delete on public.reviews to authenticated;

-- Contact and newsletter writes go through rate-limited Express endpoints using
-- the service role. Anonymous direct REST inserts would bypass those limits.

-- Admin-managed data (writes are additionally restricted by is_admin()) ------
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.brands to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_images to authenticated;
grant insert, update, delete on public.product_variants to authenticated;
grant insert, update, delete on public.coupons to authenticated;
grant select, insert, update, delete on public.banners to authenticated;
grant select, insert, update, delete on public.home_sections to authenticated;
grant select, insert, update, delete on public.cms_pages to authenticated;
grant select, insert, update, delete on public.menu_items to authenticated;
grant update on public.site_settings to authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select, update, delete on public.newsletter_subscribers to authenticated;
grant select on public.audit_logs to authenticated;
grant select on public.stripe_events to authenticated;

-- The order number sequence is only used by the API/database transaction.
grant usage, select on sequence public.order_number_seq to service_role;

-- Functions used by policies or explicitly by the API.
grant usage on schema public to anon, authenticated, service_role;

grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_customer() to anon, authenticated, service_role;
grant execute on function public.can_review(uuid, uuid) to authenticated, service_role;
grant execute on function public.generate_order_number() to service_role;

-- Profiles -------------------------------------------------------------------
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) and public.is_customer())
  with check (id = (select auth.uid()) and public.is_customer());

-- Addresses ------------------------------------------------------------------
drop policy if exists addresses_own on public.addresses;
create policy addresses_own
  on public.addresses for all
  to authenticated
  using (user_id = (select auth.uid()) and public.is_customer())
  with check (user_id = (select auth.uid()) and public.is_customer());

-- Catalog --------------------------------------------------------------------
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read
  on public.categories for select
  to anon, authenticated
  using (is_active);

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists brands_public_read on public.brands;
create policy brands_public_read
  on public.brands for select
  to anon, authenticated
  using (is_active);

drop policy if exists brands_admin_all on public.brands;
create policy brands_admin_all
  on public.brands for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products for select
  to anon, authenticated
  using (is_published and deleted_at is null);

drop policy if exists products_admin_all on public.products;
create policy products_admin_all
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read
  on public.product_images for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.is_published
        and p.deleted_at is null
    )
  );

drop policy if exists product_images_admin_all on public.product_images;
create policy product_images_admin_all
  on public.product_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists product_variants_public_read on public.product_variants;
create policy product_variants_public_read
  on public.product_variants for select
  to anon, authenticated
  using (
    is_active
    and exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.is_published
        and p.deleted_at is null
    )
  );

drop policy if exists product_variants_admin_all on public.product_variants;
create policy product_variants_admin_all
  on public.product_variants for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Cart and wishlist ----------------------------------------------------------
drop policy if exists cart_items_own on public.cart_items;
create policy cart_items_own
  on public.cart_items for all
  to authenticated
  using (user_id = (select auth.uid()) and public.is_customer())
  with check (user_id = (select auth.uid()) and public.is_customer());

drop policy if exists wishlist_own on public.wishlist;
create policy wishlist_own
  on public.wishlist for all
  to authenticated
  using (user_id = (select auth.uid()) and public.is_customer())
  with check (user_id = (select auth.uid()) and public.is_customer());

-- Coupons --------------------------------------------------------------------
drop policy if exists coupons_admin_all on public.coupons;
create policy coupons_admin_all
  on public.coupons for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists coupon_redemptions_select on public.coupon_redemptions;
create policy coupon_redemptions_select
  on public.coupon_redemptions for select
  to authenticated
  using (
    (user_id = (select auth.uid()) and public.is_customer())
    or public.is_admin()
  );

-- Orders ---------------------------------------------------------------------
drop policy if exists orders_select on public.orders;
create policy orders_select
  on public.orders for select
  to authenticated
  using (
    (user_id = (select auth.uid()) and public.is_customer())
    or public.is_admin()
  );

drop policy if exists order_items_select on public.order_items;
create policy order_items_select
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          (o.user_id = (select auth.uid()) and public.is_customer())
          or public.is_admin()
        )
    )
  );

drop policy if exists order_status_history_select on public.order_status_history;
create policy order_status_history_select
  on public.order_status_history for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          (o.user_id = (select auth.uid()) and public.is_customer())
          or public.is_admin()
        )
    )
  );

drop policy if exists payments_select on public.payments;
create policy payments_select
  on public.payments for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          (o.user_id = (select auth.uid()) and public.is_customer())
          or public.is_admin()
        )
    )
  );

-- Reviews --------------------------------------------------------------------
drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read
  on public.reviews for select
  to anon, authenticated
  using (
    is_visible
    or (user_id = (select auth.uid()) and public.is_customer())
    or public.is_admin()
  );

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own
  on public.reviews for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and public.is_customer()
    and public.can_review(product_id, order_id)
  );

drop policy if exists reviews_update_own on public.reviews;
create policy reviews_update_own
  on public.reviews for update
  to authenticated
  using (user_id = (select auth.uid()) and public.is_customer())
  with check (user_id = (select auth.uid()) and public.is_customer());

drop policy if exists reviews_delete_own on public.reviews;
create policy reviews_delete_own
  on public.reviews for delete
  to authenticated
  using (user_id = (select auth.uid()) and public.is_customer());

drop policy if exists reviews_admin_update on public.reviews;
create policy reviews_admin_update
  on public.reviews for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_admin_delete
  on public.reviews for delete
  to authenticated
  using (public.is_admin());

-- Site settings --------------------------------------------------------------
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists site_settings_admin_update on public.site_settings;
create policy site_settings_admin_update
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- CMS ------------------------------------------------------------------------
drop policy if exists banners_public_read on public.banners;
create policy banners_public_read
  on public.banners for select
  to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

drop policy if exists banners_admin_all on public.banners;
create policy banners_admin_all
  on public.banners for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists home_sections_public_read on public.home_sections;
create policy home_sections_public_read
  on public.home_sections for select
  to anon, authenticated
  using (is_active);

drop policy if exists home_sections_admin_all on public.home_sections;
create policy home_sections_admin_all
  on public.home_sections for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists cms_pages_public_read on public.cms_pages;
create policy cms_pages_public_read
  on public.cms_pages for select
  to anon, authenticated
  using (is_published and (published_at is null or published_at <= now()));

drop policy if exists cms_pages_admin_all on public.cms_pages;
create policy cms_pages_admin_all
  on public.cms_pages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists menu_items_public_read on public.menu_items;
create policy menu_items_public_read
  on public.menu_items for select
  to anon, authenticated
  using (is_active);

drop policy if exists menu_items_admin_all on public.menu_items;
create policy menu_items_admin_all
  on public.menu_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Contact and newsletter -----------------------------------------------------
-- No public INSERT grant or policy: Express validates and rate-limits these
-- submissions, then writes with the service role.
drop policy if exists contact_messages_public_insert on public.contact_messages;

drop policy if exists contact_messages_admin_all on public.contact_messages;
create policy contact_messages_admin_all
  on public.contact_messages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists newsletter_subscribers_public_insert
  on public.newsletter_subscribers;

drop policy if exists newsletter_subscribers_admin_all
  on public.newsletter_subscribers;
create policy newsletter_subscribers_admin_all
  on public.newsletter_subscribers for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Audit and webhook tables ---------------------------------------------------
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read
  on public.audit_logs for select
  to authenticated
  using (public.is_admin());

drop policy if exists stripe_events_admin_read on public.stripe_events;
create policy stripe_events_admin_read
  on public.stripe_events for select
  to authenticated
  using (public.is_admin());
