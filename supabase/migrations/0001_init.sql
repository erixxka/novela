-- Novella: initial schema
-- Users are managed by Supabase Auth (auth.users)

create extension if not exists "pgcrypto";

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stories_user_idx on public.stories (user_id, updated_at desc);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  content_text text default '',
  order_index int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chapters_story_order_idx
  on public.chapters (story_id, order_index);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unique (user_id, name)
);

create table if not exists public.story_tags (
  story_id uuid not null references public.stories(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (story_id, tag_id)
);

create table if not exists public.reading_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  scroll_position float not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, story_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  note text,
  scroll_position float not null,
  created_at timestamptz not null default now()
);

create index if not exists bookmarks_chapter_idx
  on public.bookmarks (chapter_id, scroll_position);

-- Full-text search indexes
create index if not exists chapters_content_text_fts
  on public.chapters using gin (to_tsvector('english', coalesce(content_text,'')));

create index if not exists stories_title_fts
  on public.stories using gin (
    to_tsvector('english', title || ' ' || coalesce(description,''))
  );

-- RLS
alter table public.stories enable row level security;
alter table public.chapters enable row level security;
alter table public.tags enable row level security;
alter table public.story_tags enable row level security;
alter table public.reading_progress enable row level security;
alter table public.bookmarks enable row level security;

drop policy if exists "stories_owner" on public.stories;
create policy "stories_owner" on public.stories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "chapters_owner" on public.chapters;
create policy "chapters_owner" on public.chapters
  for all
  using (exists (
    select 1 from public.stories s where s.id = story_id and s.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.stories s where s.id = story_id and s.user_id = auth.uid()
  ));

drop policy if exists "tags_owner" on public.tags;
create policy "tags_owner" on public.tags
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "story_tags_owner" on public.story_tags;
create policy "story_tags_owner" on public.story_tags
  for all
  using (exists (
    select 1 from public.stories s where s.id = story_id and s.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.stories s where s.id = story_id and s.user_id = auth.uid()
  ));

drop policy if exists "reading_progress_owner" on public.reading_progress;
create policy "reading_progress_owner" on public.reading_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "bookmarks_owner" on public.bookmarks;
create policy "bookmarks_owner" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket for covers (private, signed URLs)
insert into storage.buckets (id, name, public)
values ('covers', 'covers', false)
on conflict (id) do nothing;

drop policy if exists "covers_owner_select" on storage.objects;
create policy "covers_owner_select" on storage.objects
  for select using (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "covers_owner_insert" on storage.objects;
create policy "covers_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "covers_owner_delete" on storage.objects;
create policy "covers_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Search RPC: union of story-title and chapter-content matches, scoped to user via RLS.
create or replace function public.search_library(q text)
returns table (
  story_id uuid,
  story_title text,
  chapter_id uuid,
  chapter_title text,
  snippet text,
  rank real
)
language sql
stable
security invoker
as $$
  with query as (
    select plainto_tsquery('english', q) as tsq
  )
  -- chapter content matches
  select
    s.id as story_id,
    s.title as story_title,
    c.id as chapter_id,
    c.title as chapter_title,
    ts_headline(
      'english',
      coalesce(c.content_text,''),
      (select tsq from query),
      'MaxFragments=2, MinWords=5, MaxWords=20'
    ) as snippet,
    ts_rank(
      to_tsvector('english', coalesce(c.content_text,'')),
      (select tsq from query)
    ) as rank
  from public.chapters c
  join public.stories s on s.id = c.story_id
  where s.user_id = auth.uid()
    and to_tsvector('english', coalesce(c.content_text,'')) @@ (select tsq from query)
  union all
  -- story metadata matches (returned with chapter_id = the first chapter if any)
  select
    s.id as story_id,
    s.title as story_title,
    coalesce(
      (select c2.id from public.chapters c2 where c2.story_id = s.id order by order_index asc limit 1),
      s.id
    ) as chapter_id,
    s.title as chapter_title,
    coalesce(s.description, '') as snippet,
    ts_rank(
      to_tsvector('english', s.title || ' ' || coalesce(s.description,'')),
      (select tsq from query)
    ) * 0.6 as rank
  from public.stories s
  where s.user_id = auth.uid()
    and to_tsvector('english', s.title || ' ' || coalesce(s.description,'')) @@ (select tsq from query)
  order by rank desc
  limit 50;
$$;
