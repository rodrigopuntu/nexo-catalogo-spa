begin;

grant delete on table public.products to authenticated;

create policy "Administradores pueden eliminar productos"
  on public.products for delete to authenticated
  using (exists (
    select 1 from public.product_admins where user_id = (select auth.uid())
  ));

commit;
