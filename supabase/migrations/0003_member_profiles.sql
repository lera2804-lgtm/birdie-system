-- Lets teammates who share an object see each other's name/email in the
-- "Участники и роли" roster. Run this once in Supabase Dashboard -> SQL
-- Editor -> New query -> paste -> Run.

drop policy if exists profiles_select on public.profiles;

create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.memberships m1
    join public.memberships m2 on m1.object_code = m2.object_code
    where m1.user_id = auth.uid() and m1.status = 'active'
      and m2.user_id = profiles.id and m2.status = 'active'
  )
);
