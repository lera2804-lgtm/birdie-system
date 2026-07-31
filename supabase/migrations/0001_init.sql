-- Birdie System — initial schema
-- Run this once in Supabase Dashboard → SQL Editor → New query → paste → Run.

create extension if not exists "pgcrypto";

create type member_role as enum ('admin', 'project_manager', 'site_manager', 'client');
create type member_status as enum ('active', 'pending');
create type task_kind as enum ('field', 'desk');
create type office_side as enum ('front', 'back');
create type event_tone as enum ('plan', 'fact');

-- One row per person, mirrors auth.users. is_admin is platform-wide;
-- per-object roles live in memberships below.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- A construction object (BIRDIE-10, BIRDIE-75, ...).
create table public.objects (
  code text primary key,
  title text not null,
  address text not null default '',
  village text not null default '',
  cadastre text not null default '',
  contacts text not null default '',
  cover_url text,
  start_date date,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- Who has what role on which object. Admins don't need a row here —
-- is_admin on profiles already grants full access everywhere.
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  object_code text not null references public.objects(code) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  invited_email text,
  role member_role not null,
  status member_status not null default 'active',
  created_at timestamptz not null default now(),
  constraint membership_has_user_or_invite check (user_id is not null or invited_email is not null)
);
create unique index memberships_object_user_idx on public.memberships(object_code, user_id) where user_id is not null;

-- A project/stage of work within an object (BIRDIE-10/6, BIRDIE-10/7...).
create table public.stages (
  id uuid primary key default gen_random_uuid(),
  object_code text not null references public.objects(code) on delete cascade,
  code text not null unique,
  title text not null,
  readiness int,
  updated_on date,
  active boolean not null default false,
  start_date date,
  meeting_date date,
  handover_date date,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.work_items (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages(id) on delete cascade,
  title text not null,
  qty text,
  pct int not null default 0,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.stage_events (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages(id) on delete cascade,
  tone event_tone not null,
  event_date date not null,
  title text not null,
  created_at timestamptz not null default now()
);

-- One report per object per day.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  object_code text not null references public.objects(code) on delete cascade,
  report_date date not null,
  milestone text not null default '',
  milestone_tag text,
  is_draft boolean not null default false,
  edited_by uuid references public.profiles(id),
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  unique(object_code, report_date)
);

create table public.report_tasks (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  stage_code text,
  kind task_kind not null default 'field',
  title text not null default '',
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.report_photos (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.report_tasks(id) on delete cascade,
  storage_path text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table public.report_office_rows (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  side office_side not null,
  qty text not null default '',
  role text not null default '',
  position int not null default 0
);

create table public.archive_files (
  id uuid primary key default gen_random_uuid(),
  object_code text not null references public.objects(code) on delete cascade,
  type text not null,
  name text not null,
  album text not null default '',
  variant text not null default '',
  created_date date not null,
  uploaded_date date not null default current_date,
  is_key boolean not null default false,
  key_status text,
  client_hidden boolean not null default false,
  drive_url text,
  storage_path text,
  created_at timestamptz not null default now()
);

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  object_code text not null references public.objects(code) on delete cascade,
  kind text not null,
  name text not null,
  item_date date not null,
  drive_url text,
  storage_path text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.member_role(p_object_code text)
returns member_role language sql stable security definer set search_path = public as $$
  select role from public.memberships
  where object_code = p_object_code and user_id = auth.uid() and status = 'active'
  limit 1;
$$;

create or replace function public.is_member(p_object_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.memberships
    where object_code = p_object_code and user_id = auth.uid() and status = 'active'
  );
$$;

-- Admin or PM of that object.
create or replace function public.can_manage(p_object_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.member_role(p_object_code) = 'project_manager';
$$;

-- Admin, PM, or Object Manager of that object (everyone who can log reports).
create or replace function public.can_report(p_object_code text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.member_role(p_object_code) in ('project_manager', 'site_manager');
$$;

alter table public.profiles enable row level security;
alter table public.objects enable row level security;
alter table public.memberships enable row level security;
alter table public.stages enable row level security;
alter table public.work_items enable row level security;
alter table public.stage_events enable row level security;
alter table public.reports enable row level security;
alter table public.report_tasks enable row level security;
alter table public.report_photos enable row level security;
alter table public.report_office_rows enable row level security;
alter table public.archive_files enable row level security;
alter table public.media_items enable row level security;

-- profiles: read own row or (if admin) everyone's; update own row only.
create policy profiles_select on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_self on public.profiles for update using (id = auth.uid());

-- objects: members (any role) can read; only admin creates; admin/PM update.
create policy objects_select on public.objects for select using (public.is_member(code));
create policy objects_insert on public.objects for insert with check (public.is_admin());
create policy objects_update on public.objects for update using (public.can_manage(code));
create policy objects_delete on public.objects for delete using (public.is_admin());

-- memberships: members of the object can see the roster; PM/admin manage it.
create policy memberships_select on public.memberships for select using (public.is_member(object_code));
create policy memberships_write on public.memberships for all using (public.can_manage(object_code)) with check (public.can_manage(object_code));

-- stages / work_items / stage_events: readable by members, writable by PM/admin.
create policy stages_select on public.stages for select using (public.is_member(object_code));
create policy stages_write on public.stages for all using (public.can_manage(object_code)) with check (public.can_manage(object_code));

create policy work_items_select on public.work_items for select using (
  exists (select 1 from public.stages s where s.id = stage_id and public.is_member(s.object_code))
);
create policy work_items_write on public.work_items for all using (
  exists (select 1 from public.stages s where s.id = stage_id and public.can_manage(s.object_code))
) with check (
  exists (select 1 from public.stages s where s.id = stage_id and public.can_manage(s.object_code))
);

create policy stage_events_select on public.stage_events for select using (
  exists (select 1 from public.stages s where s.id = stage_id and public.is_member(s.object_code))
);
create policy stage_events_write on public.stage_events for all using (
  exists (select 1 from public.stages s where s.id = stage_id and public.can_manage(s.object_code))
) with check (
  exists (select 1 from public.stages s where s.id = stage_id and public.can_manage(s.object_code))
);

-- reports: members can read published reports; drafts hidden from clients.
-- PM/admin/site_manager (OM) can write.
create policy reports_select on public.reports for select using (
  public.is_member(object_code) and (not is_draft or public.member_role(object_code) <> 'client')
);
create policy reports_write on public.reports for all using (public.can_report(object_code)) with check (public.can_report(object_code));

create policy report_tasks_select on public.report_tasks for select using (
  exists (
    select 1 from public.reports r
    where r.id = report_id and public.is_member(r.object_code)
      and (not r.is_draft or public.member_role(r.object_code) <> 'client')
  )
);
create policy report_tasks_write on public.report_tasks for all using (
  exists (select 1 from public.reports r where r.id = report_id and public.can_report(r.object_code))
) with check (
  exists (select 1 from public.reports r where r.id = report_id and public.can_report(r.object_code))
);

create policy report_photos_select on public.report_photos for select using (
  exists (
    select 1 from public.report_tasks t join public.reports r on r.id = t.report_id
    where t.id = task_id and public.is_member(r.object_code)
      and (not r.is_draft or public.member_role(r.object_code) <> 'client')
  )
);
create policy report_photos_write on public.report_photos for all using (
  exists (select 1 from public.report_tasks t join public.reports r on r.id = t.report_id where t.id = task_id and public.can_report(r.object_code))
) with check (
  exists (select 1 from public.report_tasks t join public.reports r on r.id = t.report_id where t.id = task_id and public.can_report(r.object_code))
);

create policy report_office_rows_select on public.report_office_rows for select using (
  exists (
    select 1 from public.reports r
    where r.id = report_id and public.is_member(r.object_code)
      and (not r.is_draft or public.member_role(r.object_code) <> 'client')
  )
);
create policy report_office_rows_write on public.report_office_rows for all using (
  exists (select 1 from public.reports r where r.id = report_id and public.can_report(r.object_code))
) with check (
  exists (select 1 from public.reports r where r.id = report_id and public.can_report(r.object_code))
);

-- archive_files / media_items: readable by members (files hidden from
-- client if client_hidden); writable by PM/admin.
create policy archive_files_select on public.archive_files for select using (
  public.is_member(object_code) and (not client_hidden or public.member_role(object_code) <> 'client')
);
create policy archive_files_write on public.archive_files for all using (public.can_manage(object_code)) with check (public.can_manage(object_code));

create policy media_items_select on public.media_items for select using (public.is_member(object_code));
create policy media_items_write on public.media_items for all using (public.can_manage(object_code)) with check (public.can_manage(object_code));
