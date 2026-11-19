begin;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'cancelled')),
  total bigint not null check (total >= 0),
  unique (user_id, request_id),
  check (user_id is not null or customer_email is null)
);

create table public.order_items (
  order_id uuid not null references public.orders(id) on delete cascade,
  -- El identificador, el nombre y el precio forman parte del historial.
  product_id integer not null check (product_id > 0),
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 99),
  primary key (order_id, product_id)
);

create index orders_customer_history_idx on public.orders (user_id, created_at desc, id desc);
create index orders_admin_history_idx on public.orders (created_at desc, id desc);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on table public.orders, public.order_items from public, anon, authenticated;
grant select (id, user_id, customer_email, created_at, status, total)
  on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

create policy "Clientes y administradores pueden consultar sus pedidos"
  on public.orders for select to authenticated
  using (
    user_id = (select auth.uid())
    or exists (select 1 from public.product_admins where user_id = (select auth.uid()))
  );

create policy "Lectura de ítems para pedidos visibles"
  on public.order_items for select to authenticated
  using (exists (select 1 from public.orders where id = order_items.order_id));

create function public.clear_deleted_order_customer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.customer_email := null;
  return new;
end;
$$;

revoke all on function public.clear_deleted_order_customer() from public, anon, authenticated;

create trigger clear_deleted_order_customer
  before update of user_id on public.orders
  for each row when (new.user_id is null)
  execute function public.clear_deleted_order_customer();

create function public.create_order(p_items jsonb, p_request_id uuid, p_expected_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_order_id uuid;
  v_count bigint;
  v_distinct_count bigint;
  v_max_id bigint;
  v_requested_items jsonb;
  v_existing_items jsonb;
  v_snapshot jsonb;
  v_total bigint;
begin
  if v_user_id is null or v_user_id is distinct from p_expected_user_id then
    raise exception 'La sesión no coincide con la cuenta del pedido.' using errcode = '42501';
  end if;

  if p_request_id is null or jsonb_typeof(p_items) is distinct from 'array' then
    raise exception 'El pedido debe incluir productos y un identificador de solicitud.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as line(item)
    where jsonb_typeof(item) is distinct from 'object'
      or jsonb_typeof(item->'id') is distinct from 'number'
      or jsonb_typeof(item->'quantity') is distinct from 'number'
      or (item->>'id') !~ '^[1-9][0-9]{0,9}$'
      or (item->>'quantity') !~ '^[1-9][0-9]?$'
  ) then
    raise exception 'El pedido incluye identificadores o cantidades inválidos.' using errcode = '22023';
  end if;

  select count(*), count(distinct id), max(id),
    jsonb_agg(jsonb_build_object('id', id, 'quantity', quantity) order by id)
  into v_count, v_distinct_count, v_max_id, v_requested_items
  from jsonb_to_recordset(p_items) as requested(id bigint, quantity integer);

  if v_count = 0 or v_count <> v_distinct_count or v_max_id > 2147483647 then
    raise exception 'El pedido debe incluir productos válidos y sin repetir.' using errcode = '22023';
  end if;

  select users.email into v_email from auth.users as users where users.id = v_user_id for key share;
  if not found then
    raise exception 'No se encontró la cuenta del pedido.' using errcode = '42501';
  end if;

  -- Serializa los reintentos de la misma solicitud hasta que termine la transacción.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || p_request_id::text, 0));

  select id into v_order_id
  from public.orders
  where user_id = v_user_id and request_id = p_request_id;

  if found then
    select jsonb_agg(jsonb_build_object('id', product_id, 'quantity', quantity) order by product_id)
    into v_existing_items
    from public.order_items
    where order_id = v_order_id;

    if v_requested_items is distinct from v_existing_items then
      raise exception 'La solicitud pertenece a otro carrito.' using errcode = '22023';
    end if;
    return v_order_id;
  end if;

  select jsonb_agg(jsonb_build_object(
    'product_id', product.id, 'product_name', product.name,
    'unit_price', product.price, 'quantity', requested.quantity
  )), sum(product.price::bigint * requested.quantity)
  into v_snapshot, v_total
  from jsonb_to_recordset(v_requested_items) as requested(id integer, quantity integer)
  join public.products as product on product.id = requested.id;

  if coalesce(jsonb_array_length(v_snapshot), 0) <> v_count then
    raise exception 'Uno o más productos ya no están disponibles.' using errcode = 'P0002';
  end if;

  insert into public.orders (user_id, customer_email, request_id, total)
  values (v_user_id, v_email, p_request_id, v_total)
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, unit_price, quantity)
  select v_order_id, product_id, product_name, unit_price, quantity
  from jsonb_to_recordset(v_snapshot) as item(product_id integer, product_name text, unit_price integer, quantity integer);

  return v_order_id;
end;
$$;

create function public.update_order_status(p_order_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_status text;
begin
  if not exists (select 1 from public.product_admins where user_id = auth.uid()) then
    raise exception 'La cuenta no tiene permiso para gestionar pedidos.' using errcode = '42501';
  end if;

  if p_status is null or p_status not in ('pending', 'processing', 'completed', 'cancelled') then
    raise exception 'El estado del pedido es inválido.' using errcode = '22023';
  end if;

  select status into v_current_status from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'El pedido no existe.' using errcode = 'P0002';
  end if;
  if v_current_status = p_status then
    return;
  end if;
  if not (
    (v_current_status = 'pending' and p_status in ('processing', 'cancelled'))
    or (v_current_status = 'processing' and p_status in ('completed', 'cancelled'))
  ) then
    raise exception 'El pedido no puede pasar al estado indicado.' using errcode = '22023';
  end if;

  update public.orders set status = p_status where id = p_order_id;
end;
$$;

revoke all on function public.create_order(jsonb, uuid, uuid), public.update_order_status(uuid, text)
  from public, anon, authenticated;
grant execute on function public.create_order(jsonb, uuid, uuid), public.update_order_status(uuid, text)
  to authenticated;

commit;
