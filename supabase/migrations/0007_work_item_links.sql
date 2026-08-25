-- Lets report tasks tag the specific work item they belong to (not just
-- the whole stage), so work done can be counted and browsed per work item.
-- tag is an optional short label for work_items so the task picker doesn't
-- have to show the full (often long) work item title.

alter table public.work_items add column tag text;

alter table public.report_tasks
  add column work_item_id uuid references public.work_items(id) on delete set null;
