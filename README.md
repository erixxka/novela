# Novella

A private, single-user writing and reading app — Wattpad for an audience of one. Built with Expo + React Native + Supabase.

## What's in v1

- Magic-link email auth (Supabase)
- Library of stories with cover, description, tags, draft/published status
- Multiple ordered chapters per story
- Rich text writing (TipTap on RN via `@10play/tentap-editor`) with auto-save
- Reader that restores scroll position and supports bookmarks
- Full-text search across stories and chapters
- Light / Dark / System theme toggle, persisted

## Prerequisites

- Node 20+ and npm
- Expo Go on your phone (iOS or Android) for the easiest first run
- A Supabase project (free tier works)

## 1. Install

```bash
npm install
```

## 2. Configure Supabase

1. Create a project at https://supabase.com.
2. In the SQL Editor, paste and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). It creates:
   - `stories`, `chapters`, `tags`, `story_tags`, `reading_progress`, `bookmarks`
   - Row-level-security policies (owner-only)
   - Full-text search indexes + `search_library(q)` RPC
   - A private `covers` storage bucket with per-user folder policies
3. In **Authentication → URL Configuration**, add `novella://` as an additional redirect URL so magic links open the app.
4. Copy `.env.example` to `.env.local` and fill in:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Both values come from **Settings → API** in the Supabase dashboard.

## 3. Run

```bash
npm run start
```

Scan the QR code with Expo Go on your phone. The first run installs the dev client; subsequent reloads are instant.

To target a specific platform:

```bash
npm run ios       # macOS only, opens iOS simulator
npm run android   # opens Android emulator
```

## Project layout

```
app/                       # Expo Router routes
  _layout.tsx              # Providers (theme, auth, query) + auth gate
  (auth)/login.tsx         # Magic-link login
  (tabs)/                  # Library / Search / Settings
  story/new.tsx            # Create a new story
  story/[id]/              # Story detail + edit + chapters
components/                # StoryCard, Reader, RichTextEditor, etc.
lib/                       # Supabase client, theme, auth, query hooks
supabase/migrations/       # SQL migrations (run via SQL Editor)
```

## Notes

- `.env.local` is gitignored — never commit it. `.env.example` is the template.
- Theme preference is persisted in AsyncStorage; auth session is in `expo-secure-store`.
- Auto-save in the chapter editor uses a 3s debounce. The status pill in the header shows `Saving…` / `Saved`.
- The TipTap editor runs in a WebView under the hood — performance is fine up to ~20k words per chapter.

## Troubleshooting

**"Missing EXPO_PUBLIC_SUPABASE_URL"** — copy `.env.example` to `.env.local` and restart Metro (`npm run start --clear`).

**Magic link opens browser instead of the app** — make sure the redirect URL `novella://` is registered in Supabase Auth settings, and that you're tapping the link on the same device where Expo Go is installed.

**Cover upload fails with permission error** — confirm the `covers` bucket exists and the three storage policies from the migration ran successfully.
