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

-- Writes go through the Express API, which uses the service-role key and
-- validates the file server-side. The service role bypasses RLS, while the
-- bucket-level MIME and size limits still apply to every upload.
drop policy if exists catalog_assets_admin_insert on storage.objects;
drop policy if exists catalog_assets_admin_update on storage.objects;
drop policy if exists catalog_assets_admin_delete on storage.objects;
