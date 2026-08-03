-- Fixes "there is no unique or exclusion constraint matching the ON
-- CONFLICT specification" when inviting a member: Postgres won't use a
-- partial unique index as an upsert arbiter for a plain column-list
-- ON CONFLICT target. Switching to a full index has no behavior change for
-- our data (NULL user_id rows were never actually compared for uniqueness
-- either way), it just makes the upsert usable.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> paste -> Run.

drop index if exists public.memberships_object_user_idx;
create unique index memberships_object_user_idx on public.memberships(object_code, user_id);
