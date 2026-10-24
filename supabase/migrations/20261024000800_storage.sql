-- Phase 1 · 0008
-- Storage buckets and object policies for catalog/CMS images.
-- Safe to re-run: bucket upserts and policy resets.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'product-images',
    'product-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'cms-assets',
    'cms-assets',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'site-assets',
    'site-assets',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists catalog_assets_public_read on storage.objects;
create policy catalog_assets_public_read
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id in ('product-images', 'cms-assets', 'site-assets')
  );

drop policy if exists catalog_assets_admin_insert on storage.objects;
create policy catalog_assets_admin_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('product-images', 'cms-assets', 'site-assets')
    and public.is_admin()
  );

drop policy if exists catalog_assets_admin_update on storage.objects;
create policy catalog_assets_admin_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('product-images', 'cms-assets', 'site-assets')
    and public.is_admin()
  )
  with check (
    bucket_id in ('product-images', 'cms-assets', 'site-assets')
    and public.is_admin()
  );

drop policy if exists catalog_assets_admin_delete on storage.objects;
create policy catalog_assets_admin_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('product-images', 'cms-assets', 'site-assets')
    and public.is_admin()
  );
