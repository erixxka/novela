-- Page-turn reader: add page_index to reading_progress and bookmarks.
-- scroll_position is kept (still NOT NULL on reading_progress) and dual-written
-- by the client until a v2 migration drops it.

alter table public.reading_progress
  add column if not exists page_index integer not null default 0;

alter table public.bookmarks
  add column if not exists page_index integer;

update public.reading_progress
  set page_index = 0
  where page_index is null;

update public.bookmarks
  set page_index = 0
  where page_index is null;

create index if not exists bookmarks_chapter_page_idx
  on public.bookmarks (chapter_id, page_index);
