-- Story-level notes: planning workspace per novel.
-- 1:1 concept row, plus 1:many characters and snippets.

-- Concept (1:1 with story)
create table if not exists public.story_notes (
  story_id uuid primary key references public.stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  possible_titles text[] not null default '{}',
  summary text not null default '',
  outline text not null default '',
  genres text[] not null default '{}',
  themes text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Character profiles (1:many)
create table if not exists public.story_characters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text,
  age text,
  gender text,
  occupation text,
  background text,
  appearance text,
  personality text,
  goals text,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists story_characters_story_idx
  on public.story_characters (story_id, order_index, created_at);

-- General-notes snippets (1:many)
create table if not exists public.story_snippets (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'note'
    check (kind in ('note','quote','dialogue','outline','prompt')),
  title text,
  body text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists story_snippets_story_idx
  on public.story_snippets (story_id, order_index, created_at desc);

-- RLS
alter table public.story_notes enable row level security;
alter table public.story_characters enable row level security;
alter table public.story_snippets enable row level security;

drop policy if exists "story_notes_owner" on public.story_notes;
create policy "story_notes_owner" on public.story_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "story_characters_owner" on public.story_characters;
create policy "story_characters_owner" on public.story_characters
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "story_snippets_owner" on public.story_snippets;
create policy "story_snippets_owner" on public.story_snippets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
