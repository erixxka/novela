-- Reading list: stories the user explicitly adds to track reading progress.
create table if not exists public.reading_list (
  user_id  uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

create index if not exists reading_list_user_idx on public.reading_list (user_id, added_at desc);

alter table public.reading_list enable row level security;

drop policy if exists "reading_list_owner" on public.reading_list;
create policy "reading_list_owner" on public.reading_list
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
