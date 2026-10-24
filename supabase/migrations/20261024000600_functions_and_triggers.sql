-- Phase 1 · 0006
-- Triggers and business invariants.
-- Safe to re-run: functions are replaced and triggers are dropped/recreated.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.is_blocked = false
  );
$$;

create or replace function public.is_customer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'customer'
      and p.is_blocked = false
  );
$$;

create or replace function public.can_review(
  p_product_id uuid,
  p_order_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.id = p_order_id
      and o.user_id = (select auth.uid())
      and o.status = 'delivered'
      and oi.product_id = p_product_id
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.handle_user_email_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email and new.email is not null then
    update public.profiles
    set email = new.email, updated_at = now()
    where id = new.id;
  end if;

  return new;
end;
$$;

create or replace function public.guard_profile_protected_columns()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and not public.is_admin() then
    if new.role is distinct from old.role
      or new.is_blocked is distinct from old.is_blocked then
      raise exception using
        errcode = '42501',
        message = 'PROFILE_PROTECTED_FIELDS';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.refresh_product_rating(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.products p
  set
    avg_rating = coalesce(
      (
        select round(avg(r.rating)::numeric, 1)
        from public.reviews r
        where r.product_id = p_product_id and r.is_visible = true
      ),
      0
    ),
    review_count = (
      select count(*)
      from public.reviews r
      where r.product_id = p_product_id and r.is_visible = true
    ),
    updated_at = now()
  where p.id = p_product_id;
end;
$$;

create or replace function public.reviews_rating_trigger()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_product_rating(old.product_id);
    return old;
  end if;

  if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    perform public.refresh_product_rating(old.product_id);
  end if;

  perform public.refresh_product_rating(new.product_id);
  return new;
end;
$$;

create or replace function public.validate_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null and new.user_id <> (select auth.uid()) then
    raise exception using
      errcode = '42501',
      message = 'REVIEW_USER_MISMATCH';
  end if;

  if tg_op = 'UPDATE' then
    if new.user_id is distinct from old.user_id
      or new.product_id is distinct from old.product_id
      or new.order_id is distinct from old.order_id then
      raise exception using
        errcode = '42501',
        message = 'REVIEW_IDENTITY_IMMUTABLE';
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.order_id is null or not exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.id = new.order_id
        and o.user_id = new.user_id
        and o.status = 'delivered'
        and oi.product_id = new.product_id
    ) then
      raise exception using
        errcode = '42501',
        message = 'REVIEW_NOT_ALLOWED';
    end if;
  elsif new.product_id is distinct from old.product_id
    or new.order_id is distinct from old.order_id then
    if new.order_id is null or not exists (
      select 1
      from public.orders o
      join public.order_items oi on oi.order_id = o.id
      where o.id = new.order_id
        and o.user_id = new.user_id
        and o.status = 'delivered'
        and oi.product_id = new.product_id
    ) then
      raise exception using
        errcode = '42501',
        message = 'REVIEW_NOT_ALLOWED';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.validate_order_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    if not (
      (old.status = 'pending' and new.status in ('confirmed', 'cancelled'))
      or (old.status = 'confirmed' and new.status in ('processing', 'cancelled'))
      or (old.status = 'processing' and new.status in ('shipped', 'cancelled'))
      or (old.status = 'shipped' and new.status in ('delivered', 'returned'))
      or (old.status = 'delivered' and new.status = 'returned')
    ) then
      raise exception using
        errcode = 'P0001',
        message = 'INVALID_STATUS_TRANSITION';
    end if;

    if new.status = 'shipped' then
      new.shipped_at = coalesce(new.shipped_at, now());
    elsif new.status = 'delivered' then
      new.delivered_at = coalesce(new.delivered_at, now());
    elsif new.status = 'cancelled' then
      new.cancelled_at = coalesce(new.cancelled_at, now());
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid;
  v_actor_role text;
begin
  v_actor_id := coalesce(
    nullif(current_setting('app.actor_id', true), '')::uuid,
    (select auth.uid()),
    case when tg_op = 'INSERT' then new.user_id else null end
  );

  v_actor_role := coalesce(
    nullif(current_setting('app.actor_role', true), ''),
    case
      when tg_op = 'INSERT' then 'customer'
      when (select auth.uid()) is null then 'system'
      when public.is_admin() then 'admin'
      else 'customer'
    end
  );

  insert into public.order_status_history (
    order_id,
    status,
    note,
    changed_by,
    actor_role
  )
  values (
    new.id,
    new.status,
    null,
    v_actor_id,
    v_actor_role
  );

  return new;
end;
$$;

create or replace function public.restore_order_stock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in ('cancelled', 'returned')
    and old.status not in ('cancelled', 'returned') then
    update public.products p
    set stock = p.stock + restored.quantity, updated_at = now()
    from (
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = new.id and product_id is not null
      group by product_id
    ) restored
    where p.id = restored.product_id;

    update public.product_variants v
    set stock = v.stock + restored.quantity, updated_at = now()
    from (
      select variant_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = new.id and variant_id is not null
      group by variant_id
    ) restored
    where v.id = restored.variant_id;
  end if;

  return new;
end;
$$;

-- Keep updated_at accurate on every mutable table.
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
    'product_variants',
    'coupons',
    'orders',
    'payments',
    'cart_items',
    'reviews',
    'site_settings',
    'banners',
    'home_sections',
    'cms_pages',
    'menu_items'
  ]
  loop
    execute format(
      'drop trigger if exists set_%I_updated_at on public.%I',
      table_name,
      table_name
    );
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_updated();

drop trigger if exists guard_profile_protected_columns on public.profiles;
create trigger guard_profile_protected_columns
  before update on public.profiles
  for each row execute function public.guard_profile_protected_columns();

drop trigger if exists reviews_rating_trigger on public.reviews;
create trigger reviews_rating_trigger
  after insert or update or delete on public.reviews
  for each row execute function public.reviews_rating_trigger();

drop trigger if exists validate_review on public.reviews;
create trigger validate_review
  before insert or update on public.reviews
  for each row execute function public.validate_review();

drop trigger if exists validate_order_status_transition on public.orders;
create trigger validate_order_status_transition
  before update on public.orders
  for each row execute function public.validate_order_status_transition();

drop trigger if exists log_initial_order_status on public.orders;
create trigger log_initial_order_status
  after insert on public.orders
  for each row execute function public.log_order_status_change();

drop trigger if exists log_order_status_change on public.orders;
create trigger log_order_status_change
  after update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.log_order_status_change();

drop trigger if exists restore_order_stock on public.orders;
create trigger restore_order_stock
  after update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.restore_order_stock();
