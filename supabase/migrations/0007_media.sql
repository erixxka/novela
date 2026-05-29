-- Personal media library: songs and movies the user wants to collect.
-- Each row is independent (no story_id) — these live at the user level,
-- linked from the Profile tab.

create table if not exists public.media_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  artist text,
  year text,
  genre text,
  image_path text,
  lyrics_snippet text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_songs_user_idx
  on public.media_songs (user_id, created_at desc);

create table if not exists public.media_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  director text,
  year text,
  genre text,
  image_path text,
  snippet text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_movies_user_idx
  on public.media_movies (user_id, created_at desc);

alter table public.media_songs  enable row level security;
alter table public.media_movies enable row level security;

drop policy if exists "media_songs_owner" on public.media_songs;
create policy "media_songs_owner" on public.media_songs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "media_movies_owner" on public.media_movies;
create policy "media_movies_owner" on public.media_movies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
