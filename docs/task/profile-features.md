# Profile Features — Calendar, Music, Movies

> **Status:** TESTING
> **Priority:** MEDIUM
> **Type:** feature
> **Version Impact:** minor
> **Created:** 2026-05-29
> **Completed:** 2026-05-29
> **Platform:** Expo / React Native (iOS + Android)
> **Automation:** manual
>
> **Implementation Notes for tester:**
> - Run migrations `0007_media.sql` and `0008_media_bucket.sql` in the Supabase SQL editor **before** opening any of the new screens — Music/Movies will throw RLS/table-missing errors until then.
> - The three SVGs were hand-ported into [components/profile/FeatureIcons.tsx](components/profile/FeatureIcons.tsx). The MovieIcon keeps the source 32×28 viewBox so its proportions read correctly; the renderer multiplies width by 28/32 to preserve aspect.
> - Type-check shows the same pre-existing Supabase "type 'never'" errors that [lib/queries/notes.ts](lib/queries/notes.ts) already has — out of scope per task note.
> - `is_favorite` columns are in the schema but unused in v1 UI (intentional, for later).

## Overview

Add a tile row to the Profile page (below the statistics card) that links to three new personal-library screens: **Calendar**, **Music**, and **Movies**. The three custom SVG icons at `assets/images/{calendar,music,movie}.svg` are the visual anchor for each tile. Calendar is a read-only month view; Music and Movies are CRUD libraries (add / edit / delete cards) where Ericka can collect favorites with cover art, metadata, and a snippet of lyrics / a favorite quote.

## Requirements

### Must Have
- [ ] Row of three small tiles on the Profile page below the stats card, each showing the SVG icon + label (Calendar / Music / Movies)
- [ ] Tapping a tile routes to that section's screen
- [ ] **Calendar page** at `/calendar`: read-only month grid, prev/next month nav, today highlighted, weekday header row
- [ ] **Music page** at `/music`: grid/list of song cards, "Add song" pill button, empty state, tap card to edit
- [ ] **Song editor** (bottom-sheet modal): title (required), artist, year, genre, cover image (upload), lyrics snippet (multiline)
- [ ] **Movies page** at `/movies`: grid/list of movie cards, "Add movie" pill button, empty state, tap card to edit
- [ ] **Movie editor** (bottom-sheet modal): title (required), director, year, genre, poster image (upload), snippet (favorite quote / notes — multiline)
- [ ] Image upload uses the existing image-picker → Supabase Storage flow, new `media` bucket scoped per user
- [ ] Songs + movies persist to Supabase, RLS-scoped to the user
- [ ] Each list page has the `noveḷɑ` brand mark at the top (consistent with Notes pattern)
- [ ] Delete confirmation Alert before removing a song or movie
- [ ] Loading + empty states for each list

### Nice to Have
- [ ] Search across title/artist/director
- [ ] Sort by year added / title / year released
- [ ] "Favorite" star pinning to surface on Profile
- [ ] Calendar: mark dates with a writing-session dot (cross-reference reading_progress / chapters.updated_at)

## Current State

The Profile page at [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx) currently shows: identity card, stats card (Novels / Words / In library), Appearance toggles, Preferences list, Sign out. Nothing exists for Calendar, Music, or Movies yet — these are entirely new sections.

**Current Files:**

| File | Purpose |
|------|---------|
| [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx) | Profile screen — to be modified (add tile row below stats) |
| [app/_layout.tsx](app/_layout.tsx) | Root stack — needs three new screen registrations |
| [lib/storage.ts](lib/storage.ts) | Existing `uploadCover` / `uploadAvatar` patterns — model the media uploader after these |
| [components/CoverPicker.tsx](components/CoverPicker.tsx) | Existing image-picker UI — pattern to reuse |
| [components/SocialIcons.tsx](components/SocialIcons.tsx) | Existing inline SVG components — pattern to follow for the new tile icons |
| [supabase/migrations/](supabase/migrations/) | Migrations directory — contains 0001–0006 |
| `assets/images/calendar.svg` | Provided by user — tile icon for Calendar |
| `assets/images/music.svg` | Provided by user — tile icon for Music |
| `assets/images/movie.svg` | Provided by user — tile icon for Movies |

## Proposed Solution

Three independent feature surfaces sharing one storage bucket and a consistent visual pattern:

1. **Profile tile row** — three pressables in a horizontal `flexDirection: 'row'` View under the stats card; each tile renders the corresponding SVG icon (hand-ported into `components/profile/FeatureIcons.tsx`) and a label.
2. **Calendar** — a hand-rolled month grid in `app/calendar.tsx`. No third-party library, no data model. Uses the existing app palette.
3. **Music + Movies** — mirror each other architecturally: one Supabase table per kind (`media_songs`, `media_movies`), a small `lib/queries/media.ts` module, an `/music` and `/movies` route, and a bottom-sheet editor modal per kind. Images go to a new `media` Supabase Storage bucket.

### Architecture

```
app/(tabs)/profile.tsx
  └─ Stats card (unchanged)
  └─ FeatureTileRow  ← NEW
       ├─ FeatureTile(Calendar) → /calendar
       ├─ FeatureTile(Music)    → /music
       └─ FeatureTile(Movies)   → /movies

app/calendar.tsx                  ← NEW (read-only month view)
  └─ MonthGrid (custom)

app/music.tsx                     ← NEW (list + add)
  └─ SongCard[]
  └─ SongEditor (modal)

app/movies.tsx                    ← NEW (list + add)
  └─ MovieCard[]
  └─ MovieEditor (modal)

components/
  ├─ profile/FeatureIcons.tsx     ← NEW (CalendarIcon, MusicIcon, MovieIcon — inline SVG)
  ├─ profile/FeatureTile.tsx      ← NEW (tile pressable used by profile)
  ├─ media/MediaImagePicker.tsx   ← NEW (uploads to `media` bucket, returns storage path)
  ├─ media/SongEditor.tsx         ← NEW (bottom-sheet modal)
  ├─ media/MovieEditor.tsx        ← NEW (bottom-sheet modal)
  ├─ media/MediaCard.tsx          ← NEW (shared card UI for song + movie)
  └─ calendar/MonthGrid.tsx       ← NEW (the month-view widget)

lib/queries/media.ts              ← NEW (useSongs, useMovies + CRUD hooks)
lib/storage.ts                    ← MODIFY (add uploadMediaImage + getMediaImageUrl)
lib/database.types.ts             ← MODIFY (add MediaSongRow, MediaMovieRow, register in Database)

supabase/migrations/0007_media.sql ← NEW (tables + RLS)
supabase/migrations/0008_media_bucket.sql ← NEW (storage bucket + policies)
```

### Data Model

**`media_songs`** — one row per song

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid | FK → auth.users(id) ON DELETE CASCADE |
| `title` | text NOT NULL | |
| `artist` | text | nullable |
| `year` | text | nullable — text so "early 2000s" works |
| `genre` | text | nullable |
| `image_path` | text | nullable — storage path inside `media` bucket |
| `lyrics_snippet` | text | nullable — multiline |
| `is_favorite` | boolean | default `false` (for future "favorites" surfacing) |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | default `now()` |

**`media_movies`** — one row per movie (same shape, different field names)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid | FK → auth.users(id) ON DELETE CASCADE |
| `title` | text NOT NULL | |
| `director` | text | nullable |
| `year` | text | nullable |
| `genre` | text | nullable |
| `image_path` | text | nullable |
| `snippet` | text | nullable — favorite quote / note |
| `is_favorite` | boolean | default `false` |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | default `now()` |

**Storage bucket: `media`** (new, private)
- Path convention: `{user_id}/{kind}/{uuid}.{ext}` where `kind` is `songs` or `movies`
- Read via signed URLs (1h expiry) — matches the `covers` pattern at [lib/storage.ts](lib/storage.ts):37
- RLS scoped to the user folder

### File Changes

| Action | File | Description |
|--------|------|-------------|
| MODIFY | `app/(tabs)/profile.tsx` | Insert FeatureTileRow under the stats card |
| MODIFY | `app/_layout.tsx` | Register `calendar`, `music`, `movies` routes |
| MODIFY | `lib/database.types.ts` | Add `MediaSongRow`, `MediaMovieRow`, register tables |
| MODIFY | `lib/storage.ts` | Add `uploadMediaImage(localUri, kind)` + `getMediaImageUrl(path)` |
| CREATE | `supabase/migrations/0007_media.sql` | Two tables + RLS owner policies |
| CREATE | `supabase/migrations/0008_media_bucket.sql` | `media` bucket + storage RLS |
| CREATE | `lib/queries/media.ts` | `useSongs`, `useCreateSong`, `useUpdateSong`, `useDeleteSong`, and the matching movie hooks |
| CREATE | `app/calendar.tsx` | Read-only month view |
| CREATE | `app/music.tsx` | Songs library screen |
| CREATE | `app/movies.tsx` | Movies library screen |
| CREATE | `components/profile/FeatureIcons.tsx` | Hand-ported `CalendarIcon`, `MusicIcon`, `MovieIcon` |
| CREATE | `components/profile/FeatureTile.tsx` | Tile pressable used on Profile |
| CREATE | `components/media/MediaImagePicker.tsx` | Image picker → upload → returns storage path |
| CREATE | `components/media/MediaCard.tsx` | Shared card UI (cover, title, subtitle, snippet preview) |
| CREATE | `components/media/SongEditor.tsx` | Bottom-sheet editor modal for a song |
| CREATE | `components/media/MovieEditor.tsx` | Bottom-sheet editor modal for a movie |
| CREATE | `components/calendar/MonthGrid.tsx` | Self-contained month grid with prev/next nav |

## Implementation Steps

### Step 1 — Storage bucket + tables migration

Create `supabase/migrations/0007_media.sql`:

```sql
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
```

Create `supabase/migrations/0008_media_bucket.sql` (model on `0002_avatars_bucket.sql`):

```sql
insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- All four policies follow the same {user_id}/... folder convention as avatars
drop policy if exists "media_owner_select" on storage.objects;
create policy "media_owner_select" on storage.objects
  for select using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "media_owner_insert" on storage.objects;
create policy "media_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "media_owner_update" on storage.objects;
create policy "media_owner_update" on storage.objects
  for update using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "media_owner_delete" on storage.objects;
create policy "media_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

> Both migrations must be run in Supabase SQL editor **before** the client changes are deployed.

### Step 2 — Types

Update [lib/database.types.ts](lib/database.types.ts) following the `StoryCharacterRow` pattern:

```ts
export interface MediaSongRow {
  id: string;
  user_id: string;
  title: string;
  artist: string | null;
  year: string | null;
  genre: string | null;
  image_path: string | null;
  lyrics_snippet: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaMovieRow {
  id: string;
  user_id: string;
  title: string;
  director: string | null;
  year: string | null;
  genre: string | null;
  image_path: string | null;
  snippet: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
```

Register both in the `Database['public']['Tables']` map (matching the pattern used for `story_characters`).

### Step 3 — Storage helpers

Extend [lib/storage.ts](lib/storage.ts):

```ts
const MEDIA_BUCKET = 'media';

export async function uploadMediaImage(
  localUri: string,
  kind: 'songs' | 'movies'
): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('Not signed in');

  const ext = (localUri.split('.').pop() || 'jpg').toLowerCase();
  const path = `${userId}/${kind}/${Date.now()}.${ext}`;
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const bytes = decodeBase64(base64);
  const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, bytes, {
    contentType, upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function getMediaImageUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 3600);
  if (error) return null;
  return data?.signedUrl ?? null;
}
```

### Step 4 — Queries module

Create `lib/queries/media.ts` modeled on `lib/queries/notes.ts`:

```ts
export const mediaKeys = {
  songs:  ['media_songs']  as const,
  movies: ['media_movies'] as const,
};

export function useSongs()  { /* select all, order by created_at desc */ }
export function useMovies() { /* same */ }

export function useCreateSong()  { /* insert with user_id, invalidate songs */ }
export function useUpdateSong()  { /* update by id, invalidate songs */ }
export function useDeleteSong()  { /* delete by id, invalidate songs */ }

export function useCreateMovie() { /* … */ }
export function useUpdateMovie() { /* … */ }
export function useDeleteMovie() { /* … */ }
```

Cast results to the row type (`as MediaSongRow[]`) per the existing Supabase typing tech debt — see notes at the bottom of this doc.

### Step 5 — Tile icons (hand-ported SVGs)

Create `components/profile/FeatureIcons.tsx`. Read each SVG file in `assets/images/`, port each `<path>` / `<rect>` / `<circle>` into a `react-native-svg` component (same pattern as [components/SocialIcons.tsx](components/SocialIcons.tsx)). All three icons should accept `{ size = 28, color = '#2F4156' }` and use `stroke={color}` (the source SVGs are stroke-based with `stroke="#1C274C"`).

```tsx
export function CalendarIcon({ size = 28, color = '#2F4156' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* ported <path> elements from calendar.svg, with stroke={color} */}
    </Svg>
  );
}
// MusicIcon, MovieIcon — same shape
```

### Step 6 — Profile tile row

Create `components/profile/FeatureTile.tsx`:

```tsx
export function FeatureTile({
  icon: Icon, label, onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.75 : 1 })}>
      <View style={{
        backgroundColor: '#FAF6F2',
        borderRadius: 16,
        borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
        paddingVertical: 18,
        alignItems: 'center', gap: 8,
      }}>
        <Icon size={26} color="#2F4156" />
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(47,65,86,0.65)' }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
```

In [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx), insert this block immediately after the stats card (around line 166, before "Appearance"):

```tsx
<View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 12 }}>
  <FeatureTile icon={CalendarIcon} label="Calendar" onPress={() => router.push('/calendar')} />
  <FeatureTile icon={MusicIcon}    label="Music"    onPress={() => router.push('/music')} />
  <FeatureTile icon={MovieIcon}    label="Movies"   onPress={() => router.push('/movies')} />
</View>
```

### Step 7 — Calendar page

Create `components/calendar/MonthGrid.tsx`. Pure-React, no deps. State: `currentMonth` (Date). Compute:
- First day of month, days-in-month
- Padding cells at start (so weekday alignment is correct)
- 6-row grid (42 cells max)

Render:
- Weekday header row: `S M T W T F S`
- 7-column grid of day numbers
- Today: navy filled circle with paper text
- Other-month days: dim
- Prev/next chevrons on the month name row

Create `app/calendar.tsx` with the same header pattern as [app/notes/[storyId].tsx](app/notes/%5BstoryId%5D.tsx): back button + brand mark + screen title "Calendar", then `<MonthGrid />` inside a SafeAreaView.

### Step 8 — Media image picker

Create `components/media/MediaImagePicker.tsx`. Uses `expo-image-picker` (already a dep — see [components/CoverPicker.tsx](components/CoverPicker.tsx) for the exact API). Props: `value: string | null` (storage path), `onChange: (path: string | null) => void`, `kind: 'songs' | 'movies'`. Shows a tappable thumbnail; tap → permission check → launch library → upload via `uploadMediaImage` → set value to returned path. Long-press to clear.

### Step 9 — SongEditor modal

Create `components/media/SongEditor.tsx`. Bottom-sheet `Modal` modeled on [components/notes/CharacterEditor.tsx](components/notes/CharacterEditor.tsx). Fields:

| Field | Input | Required |
|-------|-------|----------|
| Image | MediaImagePicker | — |
| Title | TextInput | ✅ |
| Artist | TextInput | — |
| Year | TextInput | — |
| Genre | TextInput | — |
| Lyrics snippet | TextInput multiline (minHeight 120) | — |

Buttons: **Save** (navy pill), **Cancel** (outline), **Delete** (text-only red) when editing existing.

### Step 10 — Music page

Create `app/music.tsx`. Header pattern: back + brand + screen title "Music" + subtitle "Songs you love". Renders a vertical list of `MediaCard` (or 2-column grid — list is simpler in v1). "Add song" navy pill at top. Tapping a card opens `SongEditor` populated with the row. Empty state: "Add your first song" with inline button.

### Step 11 — MovieEditor + Movies page

`components/media/MovieEditor.tsx` and `app/movies.tsx` mirror Steps 9 and 10 with the movie field set (`director` instead of `artist`, `snippet` instead of `lyrics_snippet`).

### Step 12 — Route registration

In [app/_layout.tsx](app/_layout.tsx), add to the Stack inside `RootStack`:

```tsx
<Stack.Screen name="calendar" />
<Stack.Screen name="music" />
<Stack.Screen name="movies" />
```

## Code Examples

**MediaCard subtitle composition** (shared between song and movie):

```tsx
const subtitleBits = [
  kind === 'song' ? row.artist : row.director,
  row.year,
  row.genre,
].filter(Boolean) as string[];
const subtitle = subtitleBits.join(' · ');
```

**Calendar today check**:

```ts
const isToday = (d: Date) =>
  d.getFullYear() === today.getFullYear() &&
  d.getMonth() === today.getMonth() &&
  d.getDate() === today.getDate();
```

## Testing Checklist

- [ ] Profile shows the three tiles in a row directly under the stats card
- [ ] Each tile renders its SVG icon and label
- [ ] Tapping Calendar / Music / Movies routes to the right page
- [ ] Calendar shows the current month with today highlighted in navy
- [ ] Prev / next month chevrons navigate correctly across year boundaries (Dec → Jan, Jan → Dec)
- [ ] Music page empty state shows "Add your first song"
- [ ] Add song flow: image picker → upload → form fields → save → card appears in list immediately
- [ ] Saving without a title is blocked with an inline alert
- [ ] Editing a song pre-fills all fields including the image
- [ ] Delete song shows a confirmation Alert before removing
- [ ] Same flows for Movies
- [ ] Image uploads land in `media/{userId}/{songs|movies}/...`
- [ ] Signed URLs render in the card thumbnails (no broken images)
- [ ] RLS: a row inserted with a different `user_id` is invisible
- [ ] `noveḷɑ` brand mark sits at the top of each of the three new screens
- [ ] Back navigation returns to Profile

## Dependencies

- Required packages: **none new** — uses existing `react-native`, `lucide-react-native`, `@tanstack/react-query`, `@supabase/supabase-js`, `react-native-svg`, `expo-image-picker`, `expo-file-system`, `expo-image`
- Required APIs: new Supabase tables `media_songs`, `media_movies`, new storage bucket `media`
- Blocked by: migrations `0007_media.sql` and `0008_media_bucket.sql` must be run in Supabase **before** the client changes are deployed

## Notes for Implementation Agent

- **Brand mark on each new screen**: Calendar, Music, Movies all show the `noveḷɑ` glyph at the top — copy the header pattern from [app/notes/[storyId].tsx](app/notes/%5BstoryId%5D.tsx) lines 17–46 (back button + glyph + spacer in a `paddingHorizontal: 12` row, then story-title-style heading below).
- **SVG porting**: don't try to render the `.svg` files directly — React Native can't render raw SVG via `<Image>`. Hand-port each file's `<path>` / `<rect>` / `<circle>` elements into a `react-native-svg` component, exactly like [components/SocialIcons.tsx](components/SocialIcons.tsx). Source files use `stroke="#1C274C"` — replace with `stroke={color}` so the navy app palette flows through.
- **Image-picker permissions**: the photo permissions string is already declared in [app.json](app.json) under `expo-image-picker`. Reuse it.
- **Supabase typing tech debt**: cast all `from(...).insert(...).select().single()` results with `as MediaSongRow` / `as MediaMovieRow[]` etc., matching the pattern in [lib/queries/notes.ts](lib/queries/notes.ts). Do not try to fix the upstream typing — out of scope.
- **Layout-style on Pressable warning**: this codebase has had repeated issues with `Pressable style={({ pressed }) => ({ flexDirection: 'row', ... })}` not applying layout styles on Android. Always put layout styles on a static inner `View` and limit the function-form style to `{ opacity: pressed ? 0.X : 1 }`. See [app/(tabs)/notes.tsx](app/(tabs)/notes.tsx) line 46 for the canonical fix pattern.
- **Calendar scope is intentionally minimal in v1**: no events, no data model, no taps-do-anything. Just a beautiful read-only month view. Resist adding event storage in this task — that belongs in a follow-up.
- **`is_favorite` column** is wired into the schema for future favorites surfacing but is not exposed in v1 UI. Leave it at `false` for new rows.
- **Two migrations, two files**: keep `0007_media.sql` (tables + RLS) separate from `0008_media_bucket.sql` (storage bucket + policies). The user runs them in order in the Supabase SQL editor.

## Related

- Existing storage upload pattern: [lib/storage.ts](lib/storage.ts) `uploadCover` / `uploadAvatar`
- Existing image picker UI: [components/CoverPicker.tsx](components/CoverPicker.tsx)
- Existing bottom-sheet editor: [components/notes/CharacterEditor.tsx](components/notes/CharacterEditor.tsx)
- Existing query module pattern: [lib/queries/notes.ts](lib/queries/notes.ts)
- Existing per-section header pattern: [app/notes/[storyId].tsx](app/notes/%5BstoryId%5D.tsx)
- Inline SVG pattern: [components/SocialIcons.tsx](components/SocialIcons.tsx)
