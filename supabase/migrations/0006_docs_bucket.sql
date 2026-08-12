-- Storage bucket for uploaded archive documents (PDF/DWG/XLSX/MP4), so the
-- archive's "Скачать" button actually links to a real file instead of
-- nothing when no external Яндекс.Диск link was given. Same pattern as
-- covers/report-photos/media in 0002_storage.sql / 0005_media_bucket.sql.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

create policy "documents read" on storage.objects for select
  using (bucket_id = 'documents');
create policy "documents insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and public.can_manage(split_part(name, '/', 1)));
create policy "documents update" on storage.objects for update to authenticated
  using (bucket_id = 'documents' and public.can_manage(split_part(name, '/', 1)));
create policy "documents delete" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and public.can_manage(split_part(name, '/', 1)));
