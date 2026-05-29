-- Expand the status check constraint to include all writing states.
-- The original constraint only allowed 'draft' and 'published'.
alter table public.stories
  drop constraint if exists stories_status_check;

alter table public.stories
  add constraint stories_status_check
  check (status in ('draft', 'on-going', 'hiatus', 'completed', 'published'));
