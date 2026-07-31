-- Storage buckets for report photos and object cover images.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- Both buckets use a "{object_code}/..." path convention so access can be
-- gated per-object the same way the database tables already are. Buckets
-- are public for read (anyone with the exact, random file path can view —
-- the same trust model already used for the Yandex Disk links in the
-- archive), but writes require real object membership.

create policy "report-photos read" on storage.objects for select
  using (bucket_id = 'report-photos');
create policy "report-photos insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'report-photos' and public.can_report(split_part(name, '/', 1)));
create policy "report-photos delete" on storage.objects for delete to authenticated
  using (bucket_id = 'report-photos' and public.can_report(split_part(name, '/', 1)));

create policy "covers read" on storage.objects for select
  using (bucket_id = 'covers');
create policy "covers insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and public.can_manage(split_part(name, '/', 1)));
create policy "covers update" on storage.objects for update to authenticated
  using (bucket_id = 'covers' and public.can_manage(split_part(name, '/', 1)));
create policy "covers delete" on storage.objects for delete to authenticated
  using (bucket_id = 'covers' and public.can_manage(split_part(name, '/', 1)));
