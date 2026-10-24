-- Phase 2 · 0011
-- Atomic checkout. Only the service role may execute this function; the API
-- authenticates the customer and passes the resolved user id.
-- Cash on Delivery is the only payment provider enabled at this stage.

create or replace function public.place_order(
  p_user_id uuid,
  p_address_id uuid,
  p_payment_method text,
  p_coupon_code text default null,
  p_customer_note text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile public.profiles%rowtype;
  v_address public.addresses%rowtype;
  v_settings public.site_settings%rowtype;
  v_order public.orders%rowtype;
  v_coupon public.coupons%rowtype;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_item record;
  v_quantity integer;
  v_unit_price numeric(12, 2);
  v_subtotal numeric(12, 2) := 0;
  v_shipping numeric(12, 2) := 0;
  v_tax numeric(12, 2) := 0;
  v_discount numeric(12, 2) := 0;
  v_total numeric(12, 2);
  v_coupon_id uuid;
  v_usage integer;
  v_user_usage integer;
  v_item_count integer;
  v_line_count integer := 0;
begin
  select * into v_profile
  from public.profiles
  where id = p_user_id;

  if not found then
    raise exception using errcode = 'P0001', message = 'PROFILE_NOT_FOUND';
  end if;

  if v_profile.role = 'admin' then
    raise exception using errcode = 'P0001', message = 'ADMIN_CANNOT_SHOP';
  end if;

  if v_profile.is_blocked then
    raise exception using errcode = 'P0001', message = 'ACCOUNT_BLOCKED';
  end if;

  if p_payment_method <> 'cod' then
    raise exception using errcode = 'P0001', message = 'PAYMENT_METHOD_UNAVAILABLE';
  end if;

  select * into v_settings
  from public.site_settings
  where id = 1;

  if not found or not v_settings.cod_enabled then
    raise exception using errcode = 'P0001', message = 'COD_DISABLED';
  end if;

  select * into v_address
  from public.addresses
  where id = p_address_id and user_id = p_user_id;

  if not found then
    raise exception using errcode = 'P0001', message = 'ADDRESS_NOT_FOUND';
  end if;

  perform 1
  from public.cart_items
  where user_id = p_user_id
  limit 1;

  if not found then
    raise exception using errcode = 'P0001', message = 'CART_EMPTY';
  end if;

  -- Validate every line and calculate the goods subtotal. Rows are locked in a
  -- stable order so two checkouts cannot oversell the same variant.
  for v_item in
    select id, product_id, variant_id, quantity
    from public.cart_items
    where user_id = p_user_id
    order by product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
  loop
    v_quantity := v_item.quantity;

    select * into v_product
    from public.products
    where id = v_item.product_id
    for update;

    if not found or v_product.deleted_at is not null or not v_product.is_published then
      raise exception using errcode = 'P0001', message = 'PRODUCT_UNAVAILABLE';
    end if;

    if v_item.variant_id is not null then
      select * into v_variant
      from public.product_variants
      where id = v_item.variant_id and product_id = v_product.id
      for update;

      if not found or not v_variant.is_active then
        raise exception using errcode = 'P0001', message = 'VARIANT_UNAVAILABLE';
      end if;

      if v_variant.stock < v_quantity then
        raise exception using errcode = 'P0001', message = 'OUT_OF_STOCK';
      end if;

      v_unit_price := round(
        (coalesce(v_product.discount_price, v_product.price) + v_variant.price_delta)::numeric,
        2
      );
    else
      if v_product.stock < v_quantity then
        raise exception using errcode = 'P0001', message = 'OUT_OF_STOCK';
      end if;

      v_unit_price := round(
        coalesce(v_product.discount_price, v_product.price)::numeric,
        2
      );
    end if;

    if v_unit_price < 0 then
      raise exception using errcode = 'P0001', message = 'INVALID_PRICE';
    end if;

    v_subtotal := v_subtotal + round(v_unit_price * v_quantity, 2);
    v_line_count := v_line_count + 1;
  end loop;

  if v_line_count = 0 then
    raise exception using errcode = 'P0001', message = 'CART_EMPTY';
  end if;

  if p_coupon_code is not null and btrim(p_coupon_code) <> '' then
    select * into v_coupon
    from public.coupons
    where upper(code) = upper(btrim(p_coupon_code))
    for update;

    if not found or not v_coupon.is_active then
      raise exception using errcode = 'P0001', message = 'COUPON_INVALID';
    end if;

    if v_coupon.starts_at is not null and v_coupon.starts_at > now() then
      raise exception using errcode = 'P0001', message = 'COUPON_NOT_STARTED';
    end if;

    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception using errcode = 'P0001', message = 'COUPON_EXPIRED';
    end if;

    if v_subtotal < v_coupon.min_subtotal then
      raise exception using errcode = 'P0001', message = 'COUPON_MIN_SUBTOTAL';
    end if;

    if v_coupon.usage_limit is not null then
      select count(*) into v_usage
      from public.coupon_redemptions
      where coupon_id = v_coupon.id;

      if v_usage >= v_coupon.usage_limit then
        raise exception using errcode = 'P0001', message = 'COUPON_USAGE_LIMIT';
      end if;
    end if;

    select count(*) into v_user_usage
    from public.coupon_redemptions
    where coupon_id = v_coupon.id and user_id = p_user_id;

    if v_user_usage >= v_coupon.per_user_limit then
      raise exception using errcode = 'P0001', message = 'COUPON_PER_USER_LIMIT';
    end if;

    if v_coupon.type = 'percent' then
      v_discount := round(v_subtotal * v_coupon.value / 100, 2);
    else
      v_discount := round(v_coupon.value, 2);
    end if;

    if v_coupon.max_discount is not null then
      v_discount := least(v_discount, v_coupon.max_discount);
    end if;

    v_discount := greatest(0, least(v_discount, v_subtotal));
    v_coupon_id := v_coupon.id;
  end if;

  if v_settings.free_shipping_threshold is not null
    and v_subtotal >= v_settings.free_shipping_threshold then
    v_shipping := 0;
  else
    v_shipping := round(v_settings.shipping_fee, 2);
  end if;

  v_tax := round(
    greatest(0, v_subtotal - v_discount) * v_settings.tax_percent / 100,
    2
  );
  v_total := round(v_subtotal + v_shipping + v_tax - v_discount, 2);

  perform set_config('app.actor_id', p_user_id::text, true);
  perform set_config('app.actor_role', 'customer', true);

  insert into public.orders (
    user_id,
    customer_email,
    customer_name,
    payment_method,
    payment_status,
    subtotal,
    shipping_fee,
    discount,
    tax,
    total,
    coupon_id,
    coupon_code,
    shipping_address,
    billing_address,
    shipping_method,
    customer_note
  )
  values (
    p_user_id,
    v_profile.email,
    coalesce(nullif(v_profile.full_name, ''), v_address.full_name),
    'cod',
    'unpaid',
    v_subtotal,
    v_shipping,
    v_discount,
    v_tax,
    v_total,
    v_coupon_id,
    case when v_coupon_id is null then null else v_coupon.code end,
    to_jsonb(v_address) - 'user_id' - 'created_at' - 'updated_at',
    to_jsonb(v_address) - 'user_id' - 'created_at' - 'updated_at',
    'standard',
    nullif(btrim(coalesce(p_customer_note, '')), '')
  )
  returning * into v_order;

  for v_item in
    select id, product_id, variant_id, quantity
    from public.cart_items
    where user_id = p_user_id
    order by product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
  loop
    v_quantity := v_item.quantity;

    select * into v_product
    from public.products
    where id = v_item.product_id;

    if v_item.variant_id is not null then
      select * into v_variant
      from public.product_variants
      where id = v_item.variant_id;

      v_unit_price := round(
        (coalesce(v_product.discount_price, v_product.price) + v_variant.price_delta)::numeric,
        2
      );
    else
      v_variant := null;
      v_unit_price := round(
        coalesce(v_product.discount_price, v_product.price)::numeric,
        2
      );
    end if;

    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      title,
      variant_label,
      sku,
      image_url,
      unit_price,
      quantity,
      line_total
    )
    values (
      v_order.id,
      v_product.id,
      v_item.variant_id,
      v_product.title,
      nullif(
        concat_ws(
          ' / ',
          nullif(v_variant.size, ''),
          nullif(v_variant.color, '')
        ),
        ''
      ),
      coalesce(v_variant.sku, v_product.sku),
      (
        select url
        from public.product_images
        where product_id = v_product.id
        order by is_primary desc, sort_order asc
        limit 1
      ),
      v_unit_price,
      v_quantity,
      round(v_unit_price * v_quantity, 2)
    );

    if v_item.variant_id is not null then
      update public.product_variants
      set stock = stock - v_quantity
      where id = v_item.variant_id and stock >= v_quantity;

      if not found then
        raise exception using errcode = 'P0001', message = 'OUT_OF_STOCK';
      end if;
    else
      update public.products
      set stock = stock - v_quantity
      where id = v_item.product_id and stock >= v_quantity;

      if not found then
        raise exception using errcode = 'P0001', message = 'OUT_OF_STOCK';
      end if;
    end if;
  end loop;

  insert into public.payments (order_id, provider, status, amount, currency)
  values (v_order.id, 'cod', 'unpaid', v_total, v_settings.currency);

  if v_coupon_id is not null then
    insert into public.coupon_redemptions (
      coupon_id, user_id, order_id, discount_amount
    )
    values (v_coupon_id, p_user_id, v_order.id, v_discount);
  end if;

  delete from public.cart_items where user_id = p_user_id;

  return v_order;
end;
$$;

revoke all on function public.place_order(uuid, uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.place_order(uuid, uuid, text, text, text)
  to service_role;

comment on function public.place_order(uuid, uuid, text, text, text) is
  'Creates an order atomically from the authenticated customer cart. Service role only.';
