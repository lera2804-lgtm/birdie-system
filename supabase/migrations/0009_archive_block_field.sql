-- Adds an optional "Блок" (block/building) label to archive files and
-- media items. Currently only surfaced in the UI for object BIRDIE-10
-- (that object groups work by physical building blocks), but the column
-- itself is added globally — nullable and unused elsewhere, so it's a
-- no-op for every other object and can be turned on for them later
-- without another migration.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

alter table public.archive_files add column block text;
alter table public.media_items add column block text;
