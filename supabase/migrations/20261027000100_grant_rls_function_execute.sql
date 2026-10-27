-- 2026-10-27
-- Restore EXECUTE grants required by the RLS policies.
-- Live projects that were provisioned before/without the grant block in 0007
-- fail authenticated reads with: 42501 permission denied for function is_admin.

grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.is_customer() to anon, authenticated, service_role;
grant execute on function public.can_review(uuid, uuid) to authenticated, service_role;

-- Ask PostgREST to refresh its schema cache immediately.
notify pgrst, 'reload schema';
