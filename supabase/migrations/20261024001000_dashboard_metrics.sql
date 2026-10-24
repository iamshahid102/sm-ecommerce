-- Phase 1 · 0010
-- Admin dashboard metrics in one database query.
--
-- PostgREST limits unpaginated selects (default 1000 rows). Summing paid orders
-- or counting low-stock products in JavaScript silently under-reports once the
-- store grows past that limit. This function computes the lifetime figures and
-- the five lowest-stock products server-side, so the admin dashboard stays
-- correct without fetching every order.
--
-- Safe to re-run: the function is replaced.

create or replace function public.admin_dashboard_metrics()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with product_stats as (
    select
      count(*) filter (where deleted_at is null) as total_products,
      count(*) filter (
        where deleted_at is null and stock <= low_stock_threshold
      ) as low_stock_count
    from public.products
  ),
  order_stats as (
    select
      count(*) as total_orders,
      coalesce(
        sum(total) filter (where payment_status = 'paid'),
        0
      ) as total_revenue,
      coalesce(
        jsonb_object_agg(status::text, status_count),
        '{}'::jsonb
      ) as order_status_counts
    from (
      select status, count(*) as status_count
      from public.orders
      group by status
    ) grouped
  )
  select jsonb_build_object(
    'total_revenue', order_stats.total_revenue,
    'total_orders', order_stats.total_orders,
    'total_customers', (
      select count(*)
      from public.profiles
      where role = 'customer'
    ),
    'total_products', product_stats.total_products,
    'low_stock_count', product_stats.low_stock_count,
    'order_status_counts', order_stats.order_status_counts,
    'low_stock_products', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'title', p.title,
            'slug', p.slug,
            'stock', p.stock,
            'low_stock_threshold', p.low_stock_threshold
          )
          order by p.stock asc, p.title asc
        )
        from (
          select id, title, slug, stock, low_stock_threshold
          from public.products
          where deleted_at is null
            and stock <= low_stock_threshold
          order by stock asc, title asc
          limit 5
        ) p
      ),
      '[]'::jsonb
    )
  )
  from product_stats
  cross join order_stats;
$$;

revoke all on function public.admin_dashboard_metrics()
  from public, anon, authenticated;
grant execute on function public.admin_dashboard_metrics() to service_role;
