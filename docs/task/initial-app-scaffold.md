# Novella App — Initial Scaffold & Core Features

> **Status:** TESTING
> **Completed:** 2026-05-27
> **Implementation Notes:** All files created and npm install succeeded. Supabase project still needs to be configured (run 0001_init.sql, add redirect URL, fill .env.local). See README for setup steps.
> **Priority:** HIGH
> **Type:** feature
> **Version Impact:** minor
> **Created:** 2026-05-27
> **Platform:** Mobile (iOS + Android via Expo)
> **Automation:** manual

## Overview

Build a personal writing/reading mobile app called **Novella** — a single-user, Wattpad-style platform where the owner (Ericka) can write, organize, and read her own stories on her phone. Built with Expo + React Native + Supabase. v1 ships a complete library experience: stories with chapters, rich text writing, covers, tags, drafts/published states, reading progress, bookmarks, search, and dark mode.

## Requirements

### Must Have (v1)
- [ ] Expo (React Native) project initialized with TypeScript
- [ ] Expo Router for file-based navigation
- [ ] NativeWind (Tailwind) for styling
- [ ] Supabase backend (database + auth + storage)
- [ ] Single-user auth via Supabase email magic link
- [ ] Stories with multiple ordered chapters
- [ ] Rich text editor for writing chapters (bold, italic, headings, quotes)
- [ ] Cover image upload per story (Supabase Storage)
- [ ] Tags / genres per story
- [ ] Draft vs Published toggle per story
- [ ] Reading progress tracking (last-read chapter + scroll position)
- [ ] Bookmarks (saved positions inside a chapter)
- [ ] Full-text search across story titles, descriptions, and chapter content
- [ ] Dark / Light theme toggle (persisted)
- [ ] Library home screen showing all stories with covers

### Nice to Have (future tasks)
- [ ] Offline reading (local cache)
- [ ] Export to PDF / EPUB
- [ ] Writing stats (word count, daily streak)
- [ ] Story templates
- [ ] Audio dictation for writing
- [ ] iCloud / Drive backup of media

## Current State

Greenfield project. No existing code. Folder created at `C:\Users\Ericka Dichon\Documents\Personal\novella-app`.

## Proposed Solution

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Expo SDK 51+** (managed workflow) | Easiest path to native iOS + Android with one codebase |
| Language | **TypeScript** | Type safety, scales with the codebase |
| Routing | **Expo Router v3** | File-based routing, familiar Next.js pattern |
| Styling | **NativeWind v4** | Tailwind classes in React Native |
| UI Primitives | **React Native core + Gluestack UI** (optional) | Native feel, accessible |
| Backend | **Supabase** | Postgres + Auth + Storage in one |
| State / Data | **TanStack Query v5** | Caching, optimistic updates, sync with Supabase |
| Local Storage | **expo-secure-store** + **AsyncStorage** | Tokens secure, prefs in AsyncStorage |
| Rich Text Editor | **@10play/tentap-editor** | TipTap on React Native, most mature option |
| Forms | **react-hook-form** + **zod** | Validation for story metadata |
| Icons | **lucide-react-native** | Consistent icon set |
| Theme | **NativeWind dark mode** + custom ThemeProvider | Persist via AsyncStorage |

### Architecture

**App Routes (Expo Router):**
```
app/
  _layout.tsx                    # Root layout, theme provider, auth guard
  (auth)/
    login.tsx                    # Magic link login
  (tabs)/
    _layout.tsx                  # Tab navigator
    index.tsx                    # Library (all stories grid)
    write.tsx                    # Quick action: new story
    search.tsx                   # Search bar + results
    settings.tsx                 # Theme, account, sign out
  story/
    [id]/
      index.tsx                  # Story detail (chapters list, cover, metadata)
      edit.tsx                   # Edit story metadata (title, desc, cover, tags)
      chapter/
        [chapterId]/
          read.tsx               # Reading view
          edit.tsx               # Rich text writing view
  story/new.tsx                  # Create new story
```

**Supabase Schema:**
```sql
-- Users (managed by Supabase Auth)

create table stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table chapters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references stories(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}'::jsonb,  -- TipTap JSON
  content_text text,                            -- plain text for search
  order_index int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unique (user_id, name)
);

create table story_tags (
  story_id uuid references stories(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (story_id, tag_id)
);

create table reading_progress (
  user_id uuid references auth.users(id) on delete cascade,
  story_id uuid references stories(id) on delete cascade,
  chapter_id uuid references chapters(id) on delete cascade,
  scroll_position float default 0,
  updated_at timestamptz default now(),
  primary key (user_id, story_id)
);

create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id uuid not null references chapters(id) on delete cascade,
  note text,
  scroll_position float not null,
  created_at timestamptz default now()
);

-- Full text search index
create index chapters_content_text_fts on chapters using gin (to_tsvector('english', content_text));
create index stories_title_fts on stories using gin (to_tsvector('english', title || ' ' || coalesce(description,'')));

-- RLS: user can only see their own data
alter table stories enable row level security;
alter table chapters enable row level security;
alter table tags enable row level security;
alter table story_tags enable row level security;
alter table reading_progress enable row level security;
alter table bookmarks enable row level security;

create policy "owner only" on stories for all using (auth.uid() = user_id);
create policy "owner only" on chapters for all
  using (exists (select 1 from stories s where s.id = story_id and s.user_id = auth.uid()));
-- (similar policies for the other tables)

-- Storage bucket for covers
insert into storage.buckets (id, name, public) values ('covers', 'covers', false);
```

### File Changes

| Action | File | Description |
|---|---|---|
| CREATE | `package.json` | Expo + dependencies |
| CREATE | `app.json` | Expo config (name, slug, icon, splash) |
| CREATE | `tsconfig.json` | TypeScript config |
| CREATE | `tailwind.config.js` | NativeWind config with dark mode |
| CREATE | `babel.config.js` | Babel + NativeWind preset |
| CREATE | `metro.config.js` | NativeWind metro config |
| CREATE | `global.css` | Tailwind directives |
| CREATE | `.env.example` | EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY |
| CREATE | `app/_layout.tsx` | Root layout with providers |
| CREATE | `app/(auth)/login.tsx` | Magic link login screen |
| CREATE | `app/(tabs)/_layout.tsx` | Tab navigator |
| CREATE | `app/(tabs)/index.tsx` | Library grid |
| CREATE | `app/(tabs)/search.tsx` | Search screen |
| CREATE | `app/(tabs)/settings.tsx` | Settings (theme, sign out) |
| CREATE | `app/story/new.tsx` | New story form |
| CREATE | `app/story/[id]/index.tsx` | Story detail + chapters list |
| CREATE | `app/story/[id]/edit.tsx` | Edit story metadata |
| CREATE | `app/story/[id]/chapter/[chapterId]/read.tsx` | Reader view |
| CREATE | `app/story/[id]/chapter/[chapterId]/edit.tsx` | TipTap editor |
| CREATE | `lib/supabase.ts` | Supabase client with secure-store session |
| CREATE | `lib/queries/stories.ts` | TanStack Query hooks for stories |
| CREATE | `lib/queries/chapters.ts` | Chapter hooks |
| CREATE | `lib/queries/search.ts` | Search hook |
| CREATE | `lib/theme.ts` | Theme provider + persistence |
| CREATE | `components/StoryCard.tsx` | Cover + title card |
| CREATE | `components/ChapterListItem.tsx` | Chapter row in story detail |
| CREATE | `components/RichTextEditor.tsx` | TipTap wrapper |
| CREATE | `components/Reader.tsx` | Scrollable reading view with progress save |
| CREATE | `components/TagPicker.tsx` | Multi-select tag input |
| CREATE | `components/CoverPicker.tsx` | Image picker + upload to Supabase |
| CREATE | `supabase/migrations/0001_init.sql` | Initial schema + RLS + indexes |
| CREATE | `README.md` | Setup instructions |
| CREATE | `TASKS.md` | Task tracking |

## Implementation Steps

### Step 1: Initialize Expo project
- `npx create-expo-app@latest novella-app --template blank-typescript` (run inside `Personal/`, NOT inside the empty `novella-app/` — let create-expo-app populate it; or use `--template` against existing dir)
- Confirm SDK 51+
- Install Expo Router: `npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar`
- Update `app.json` with `"scheme": "novella"` and Expo Router plugin

### Step 2: Install and configure NativeWind v4
- `npm install nativewind tailwindcss@3.4 react-native-reanimated react-native-safe-area-context`
- Create `tailwind.config.js`, `babel.config.js`, `metro.config.js`, `global.css`
- Enable dark mode via `darkMode: 'class'`

### Step 3: Install Supabase + supporting libs
- `npm install @supabase/supabase-js @react-native-async-storage/async-storage expo-secure-store`
- `npm install @tanstack/react-query`
- `npm install react-hook-form zod @hookform/resolvers`
- `npm install lucide-react-native`
- `npm install @10play/tentap-editor` + peer deps (react-native-webview)
- `npx expo install expo-image-picker expo-image expo-file-system`

### Step 4: Create Supabase project + run migration
- User creates project at supabase.com
- Save URL + anon key to `.env.local`
- Run `supabase/migrations/0001_init.sql` via Supabase SQL editor
- Create `covers` storage bucket with RLS

### Step 5: Build auth flow
- `app/(auth)/login.tsx` with email magic link
- Root `_layout.tsx` redirects to login if no session
- Session restored from SecureStore

### Step 6: Build Library + Story CRUD
- Library grid showing all stories with covers
- New story flow → creates story, redirects to story detail
- Story detail: cover, metadata, chapters list, "Add chapter" button

### Step 7: Build Chapter editor
- TipTap editor with toolbar (bold/italic/headings/quote/list)
- Auto-save every 5s (debounced)
- Plain-text mirror saved to `content_text` for search

### Step 8: Build Reader + progress + bookmarks
- ScrollView that emits scroll position
- Save progress to `reading_progress` on scroll end / blur
- Long-press to add bookmark with optional note

### Step 9: Build Search
- Single search bar in tab
- Calls Supabase RPC using `to_tsvector` on stories + chapters
- Results grouped by story

### Step 10: Theme + Settings
- ThemeProvider with light/dark/system
- Persist choice to AsyncStorage
- Settings screen: theme toggle, account info, sign out

### Step 11: Polish + manual test on device
- Add app icon and splash
- Test full create-story → write → publish → read → bookmark flow on phone via Expo Go

## Code Examples

**Supabase client with SecureStore:**
```ts
// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

**Search RPC (Supabase SQL):**
```sql
create or replace function search_library(q text)
returns table (
  story_id uuid,
  story_title text,
  chapter_id uuid,
  chapter_title text,
  snippet text,
  rank real
) language sql stable as $$
  select s.id, s.title, c.id, c.title,
         ts_headline('english', c.content_text, plainto_tsquery('english', q)),
         ts_rank(to_tsvector('english', c.content_text), plainto_tsquery('english', q))
  from chapters c join stories s on s.id = c.story_id
  where s.user_id = auth.uid()
    and to_tsvector('english', c.content_text) @@ plainto_tsquery('english', q)
  order by rank desc
  limit 50;
$$;
```

## Testing Checklist

- [ ] App launches on Expo Go (iOS + Android)
- [ ] Magic link login completes round-trip
- [ ] Can create a story with cover, title, description, tags
- [ ] Can add multiple chapters and reorder
- [ ] Rich text editor saves and reloads formatting
- [ ] Reader scrolls smoothly, dark mode is readable
- [ ] Reading progress resumes correctly after leaving and returning
- [ ] Bookmark creation and jump-to-bookmark works
- [ ] Search returns matching chapters with snippets
- [ ] Sign out clears session and returns to login
- [ ] RLS verified: a second test user cannot read first user's stories

## Dependencies

**Required packages:**
- expo, expo-router, react-native
- nativewind, tailwindcss
- @supabase/supabase-js, expo-secure-store
- @tanstack/react-query
- @10play/tentap-editor, react-native-webview
- react-hook-form, zod, @hookform/resolvers
- lucide-react-native
- expo-image-picker, expo-image, expo-file-system

**Required external setup:**
- Supabase project (free tier OK)
- Expo account (free) for EAS Build later
- Apple Developer account ($99/yr) only when shipping to TestFlight/App Store
- Google Play Developer ($25 one-time) only when shipping to Play Store

**Blocked by:** none — this is the first task.

## Notes for Implementation Agent

- This is a **greenfield** project. The folder `C:\Users\Ericka Dichon\Documents\Personal\novella-app` is empty except for `docs/task/initial-app-scaffold.md` and `TASKS.md`.
- Use `npx create-expo-app@latest .` from inside the folder so it scaffolds in place. If it refuses because the dir isn't empty, scaffold to a temp dir then move files in (preserve `docs/` and `TASKS.md`).
- Default to **NativeWind v4** with the new Metro-based setup, not v2.
- TipTap on RN uses a WebView under the hood — performance is fine for typical chapter sizes but be mindful for very long chapters (>20k words).
- Single-user app but **still use Supabase Auth + RLS** — it future-proofs for adding friends later and is barely more work.
- Use `expo-image` not the RN `Image` component for cover thumbnails (caching).
- Do not commit `.env.local`. Provide `.env.example` only.
- Auto-save in the editor should debounce ~3-5s and show a subtle "Saved" indicator.

## Related

- Expo Router docs: https://docs.expo.dev/router/introduction/
- NativeWind v4: https://www.nativewind.dev/
- Supabase + Expo guide: https://supabase.com/docs/guides/auth/quickstarts/react-native
- TipTap for React Native (10tap): https://github.com/10play/10tap-editor
