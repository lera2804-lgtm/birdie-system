-- Raises the archive documents bucket's upload cap to match the client-side
-- limit already advertised in the UI (ALLOWED/MAX_UPLOAD_MB in
-- src/mocks/archive.ts = 500 MB). The bucket was created in 0006 without an
-- explicit file_size_limit, so it was silently falling back to the
-- project's default (much smaller) cap and rejecting larger uploads with
-- a raw "exceeded the maximum allowed size" error.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

update storage.buckets
set file_size_limit = 524288000 -- 500 MB, in bytes
where id = 'documents';
