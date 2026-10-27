-- Phase 2 — 0013
-- Inventory correctness fixes.
--
-- 1. A generated column makes the admin "low stock" filter work with
--    pagination and exact counts. PostgREST cannot compare two columns, so the
--    previous JavaScript-side filter could return an empty page while matching
--    products existed on a later page.
-- 2. Variant stock is deducted only from product_variants during checkout.
--    Restoring a variant order must therefore not add the same quantity back
--    to the parent product's base stock.
--
-- Safe to re-run: the column is added conditionally, the index is idempotent,
-- and the function is replaced.

alter table public.products
  add column if not exists is_low_stock boolean
  generated always as (
    stock > 0 and stock <= low_stock_threshold
  ) stored;

comment on column public.products.is_low_stock is
  'True when an in-stock product is at or below its low-stock threshold.';

create index if not exists products_low_stock_active_idx
  on public.products (is_low_stock)
  where is_low_stock and deleted_at is null;

create or replace function public.restore_order_stock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in ('cancelled', 'returned')
    and old.status not in ('cancelled', 'returned') then
    -- Only base-product order lines consumed products.stock. Variant lines
    -- consumed product_variants.stock and are restored separately below.
    update public.products p
    set stock = p.stock + restored.quantity, updated_at = now()
    from (
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = new.id
        and product_id is not null
        and variant_id is null
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
