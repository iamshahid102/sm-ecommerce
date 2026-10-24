-- Phase 1 · 0001
-- Extensions, enums, and shared identifiers.
-- Safe to re-run: every object is guarded.

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pgcrypto') then
    create extension pgcrypto with schema extensions;
  end if;

  if not exists (select 1 from pg_extension where extname = 'pg_trgm') then
    create extension pg_trgm with schema extensions;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role' and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('customer', 'admin');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'order_status' and n.nspname = 'public'
  ) then
    create type public.order_status as enum (
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'returned'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'payment_status' and n.nspname = 'public'
  ) then
    create type public.payment_status as enum (
      'unpaid',
      'paid',
      'refunded',
      'failed'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'coupon_type' and n.nspname = 'public'
  ) then
    create type public.coupon_type as enum ('percent', 'fixed');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'menu_location' and n.nspname = 'public'
  ) then
    create type public.menu_location as enum ('header', 'footer');
  end if;
end
$$;

create sequence if not exists public.order_number_seq as bigint start with 1 increment by 1;

create or replace function public.generate_order_number()
returns text
language sql
volatile
set search_path = ''
as $$
  select
    'SM-'
    || to_char((now() at time zone 'Asia/Karachi'), 'YYYYMMDD')
    || '-'
    || lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;

comment on function public.generate_order_number() is
  'Generates a human-readable, sequence-backed order number in Asia/Karachi time.';
