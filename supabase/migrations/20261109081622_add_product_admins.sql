begin;

create table public.product_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.product_admins enable row level security;
revoke all on table public.product_admins from public, anon, authenticated;
grant select (user_id) on table public.product_admins to authenticated;

create policy "Las cuentas pueden consultar su propio permiso"
  on public.product_admins for select to authenticated
  using (user_id = (select auth.uid()));

grant insert (name, category, price, symbol, color, description),
  update (name, category, price, symbol, color, description)
  on table public.products to authenticated;

create policy "Administradores pueden crear productos"
  on public.products for insert to authenticated
  with check (exists (
    select 1 from public.product_admins where user_id = (select auth.uid())
  ));

create policy "Administradores pueden editar productos"
  on public.products for update to authenticated
  using (exists (
    select 1 from public.product_admins where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.product_admins where user_id = (select auth.uid())
  ));

commit;
