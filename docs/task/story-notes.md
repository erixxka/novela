# Story Notes/Writing Prompts

> **Status:** TESTING
> **Priority:** HIGH
> **Type:** feature
> **Version Impact:** minor
> **Created:** 2026-05-28
> **Completed:** 2026-05-28
> **Platform:** Expo / React Native (iOS + Android)
> **Automation:** manual
>
> **Implementation Notes:**
>
> - Run `supabase/migrations/0006_story_notes.sql` in the Supabase SQL editor before testing — the client will fail until the three tables exist.
> - Concept section auto-saves with an 800ms debounce; a "Saved" indicator appears beside the section header for ~4s after each save. On first load the concept row gets one redundant upsert (only refreshes `updated_at`).
> - The existing Supabase typing tech debt produces `tsc` errors in `lib/queries/notes.ts` matching the same pattern as `chapters.ts` / `stories.ts` (chained client resolves to `never`). Result types are cast to the proper row types. Out of scope per task notes.
> - Routing: `/notes/[storyId]` uses the object-form `router.push({ pathname, params })` because the typed-routes `.expo/types/router.d.ts` was generated before this file existed. It will pick up the template-literal form after the next `expo start`.

## Overview

Replace the Notes tab placeholder with a real workspace where Ericka can plan and prep each of her novels. Picking a novel opens a per-story notes page that holds three sections: **Outline & Concept** (possible titles, summary, outline, genres, themes), **Characters** (a list of character profiles with age / gender / occupation / background, etc.), and **Snippets** (a list of typed cards for general notes, quotes, dialogue, outlines, and prompts). The `noveḷɑ` brand sits at the top of both the hub and the per-story page.

## Requirements

### Must Have

- [ ] Notes tab hub lists every novel with note counts (characters · snippets · whether concept is filled in)
- [ ] `noveḷɑ` brand mark (CormorantGlyphs) at the top of the Notes hub and at the top of each story's notes page
- [ ] Per-story notes page at `/notes/[storyId]` with three collapsible sections
- [ ] **Section 1 — Outline & Concept** with editable fields:
  - Possible titles (chip list — add/remove)
  - Summary (multiline text)
  - Outline (long multiline text)
  - Genres (chip list)
  - Themes (chip list)
- [ ] **Section 2 — Characters**: list of character cards with name + role badge; tap to edit; long-press / swipe to delete
- [ ] Character editor sheet with: name (required), role (Protagonist / Antagonist / Supporting / Other), age, gender, occupation, background, appearance, personality, goals
- [ ] **Section 3 — Snippets**: list of snippet cards, each with a `kind` badge (Note / Quote / Dialogue / Outline / Prompt) and body text
- [ ] Snippet editor sheet with: kind (segmented), title (optional), body (required, multiline)
- [ ] All three sections persist to Supabase, scoped to the user via RLS
- [ ] Empty states for each section ("Add your first character", etc.)
- [ ] When a story is deleted, its notes/characters/snippets cascade-delete
- [ ] Loading + error states for fetches
- [ ] Notes hub "back to library" empty state if the user has zero stories

### Nice to Have

- [ ] Search across all snippets/characters/concept fields
- [ ] Character avatar/initials tile (color tone matches story cover tone)
- [ ] Reorder characters via long-press drag
- [ ] Markdown rendering for snippet bodies
- [ ] Export notes as a single shareable text file
- [ ] Link a character to a chapter where they appear (reverse-references)
- [ ] Pin / favorite a snippet to surface on the hub

## Current State

The Notes tab at [app/(tabs)/notes.tsx](<app/(tabs)/notes.tsx>) renders three hard-coded placeholder cards (Characters, World, Plot) and a "coming soon" panel. There is no underlying data layer. Story selection happens only via the Library; stories themselves have no attached "notes" concept yet.

**Current Files:**

| File                                                | Purpose                                                   |
| --------------------------------------------------- | --------------------------------------------------------- |
| [app/(tabs)/notes.tsx](<app/(tabs)/notes.tsx>)      | Placeholder Notes screen — to be replaced                 |
| [app/(tabs)/\_layout.tsx](<app/(tabs)/_layout.tsx>) | Tab bar — Notes tab already wired with `PenLine` icon     |
| [lib/database.types.ts](lib/database.types.ts)      | Database row types (no notes types yet)                   |
| [lib/queries/stories.ts](lib/queries/stories.ts)    | `useStories`, `useStory` — used by the hub to list novels |
| [supabase/migrations/](supabase/migrations/)        | Migrations directory — already contains 0001–0005         |

## Proposed Solution

Three new Supabase tables (`story_notes`, `story_characters`, `story_snippets`), all RLS-scoped via the parent story's user, and a small `lib/queries/notes.ts` module of React-Query hooks. The Notes tab becomes a "pick a novel" hub. Each novel routes to `/notes/[storyId]` which renders three sections backed by the new tables. Character + snippet editing happens in a bottom-sheet modal pattern (consistent with the "Add to library" modal in [app/story/[id]/index.tsx](app/story/[id]/index.tsx)).

### Architecture

```
app/(tabs)/notes.tsx
  └─ NotesHub
       ├─ Brand mark (noveḷɑ)
       ├─ Header "Notes"
       └─ FlatList of stories
            └─ NoteSummaryCard (cover, title, "3 characters · 5 snippets · concept ✓")

app/notes/[storyId].tsx
  └─ StoryNotesScreen
       ├─ Brand mark (noveḷɑ)
       ├─ Header (back + story title)
       ├─ ConceptSection
       │    ├─ ChipListEditor (titles)
       │    ├─ TextArea (summary)
       │    ├─ TextArea (outline)
       │    ├─ ChipListEditor (genres)
       │    └─ ChipListEditor (themes)
       ├─ CharactersSection
       │    ├─ List of CharacterCard
       │    └─ Add button → CharacterEditor (modal)
       └─ SnippetsSection
            ├─ List of SnippetCard
            └─ Add button → SnippetEditor (modal)
```

### Data model

**`story_notes`** — one row per story (1:1)

| Column            | Type        | Notes                                                                     |
| ----------------- | ----------- | ------------------------------------------------------------------------- |
| `story_id`        | uuid PK     | FK → stories.id ON DELETE CASCADE                                         |
| `user_id`         | uuid        | FK → auth.users; redundant with story.user_id but lets RLS check directly |
| `possible_titles` | text[]      | Default `'{}'`                                                            |
| `summary`         | text        | Default `''`                                                              |
| `outline`         | text        | Default `''`                                                              |
| `genres`          | text[]      | Default `'{}'`                                                            |
| `themes`          | text[]      | Default `'{}'`                                                            |
| `updated_at`      | timestamptz | Default `now()`                                                           |

**`story_characters`** — one row per character (1:many)

| Column                    | Type          | Notes                                         |
| ------------------------- | ------------- | --------------------------------------------- |
| `id`                      | uuid PK       | `gen_random_uuid()`                           |
| `story_id`                | uuid          | FK → stories.id ON DELETE CASCADE             |
| `user_id`                 | uuid          | FK → auth.users                               |
| `name`                    | text NOT NULL |                                               |
| `role`                    | text          | nullable; e.g. 'Protagonist'                  |
| `age`                     | text          | text, not int — allows "early 20s", "ancient" |
| `gender`                  | text          | nullable                                      |
| `occupation`              | text          | nullable                                      |
| `background`              | text          | nullable                                      |
| `appearance`              | text          | nullable                                      |
| `personality`             | text          | nullable                                      |
| `goals`                   | text          | nullable                                      |
| `order_index`             | int           | Default 0 — for future drag reorder           |
| `created_at`/`updated_at` | timestamptz   |                                               |

**`story_snippets`** — one row per snippet (1:many)

| Column                    | Type          | Notes                                                                                |
| ------------------------- | ------------- | ------------------------------------------------------------------------------------ |
| `id`                      | uuid PK       | `gen_random_uuid()`                                                                  |
| `story_id`                | uuid          | FK → stories.id ON DELETE CASCADE                                                    |
| `user_id`                 | uuid          | FK → auth.users                                                                      |
| `kind`                    | text NOT NULL | Check constraint: `('note','quote','dialogue','outline','prompt')`. Default `'note'` |
| `title`                   | text          | Optional                                                                             |
| `body`                    | text NOT NULL |                                                                                      |
| `order_index`             | int           | Default 0                                                                            |
| `created_at`/`updated_at` | timestamptz   |                                                                                      |

**RLS** for all three tables: owner via `auth.uid() = user_id`. Indexes on `story_id` for the list tables.

### File Changes

| Action | File                                       | Description                                                                                                                                                                                                                                   |
| ------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CREATE | `supabase/migrations/0006_story_notes.sql` | The three tables, indexes, RLS policies                                                                                                                                                                                                       |
| MODIFY | `lib/database.types.ts`                    | Add `StoryNotesRow`, `StoryCharacterRow`, `StorySnippetRow`, register in `Database`                                                                                                                                                           |
| CREATE | `lib/queries/notes.ts`                     | Hooks: `useStoryNotes`, `useUpsertStoryNotes`, `useCharacters`, `useCreateCharacter`, `useUpdateCharacter`, `useDeleteCharacter`, `useSnippets`, `useCreateSnippet`, `useUpdateSnippet`, `useDeleteSnippet`, plus `useNoteCounts` for the hub |
| MODIFY | `app/(tabs)/notes.tsx`                     | Replace placeholder with Notes hub: brand mark + list of novels with counts                                                                                                                                                                   |
| CREATE | `app/notes/[storyId].tsx`                  | Per-story notes screen, three sections                                                                                                                                                                                                        |
| CREATE | `components/notes/ConceptSection.tsx`      | Section 1 UI (titles / summary / outline / genres / themes)                                                                                                                                                                                   |
| CREATE | `components/notes/CharactersSection.tsx`   | Section 2 UI (list + add button + sheet trigger)                                                                                                                                                                                              |
| CREATE | `components/notes/SnippetsSection.tsx`     | Section 3 UI (list + add button + sheet trigger)                                                                                                                                                                                              |
| CREATE | `components/notes/CharacterEditor.tsx`     | Bottom-sheet modal for create/edit character                                                                                                                                                                                                  |
| CREATE | `components/notes/SnippetEditor.tsx`       | Bottom-sheet modal for create/edit snippet                                                                                                                                                                                                    |
| CREATE | `components/notes/ChipListEditor.tsx`      | Reusable add-and-remove chip input (titles, genres, themes)                                                                                                                                                                                   |
| CREATE | `components/notes/SectionCard.tsx`         | Shared wrapper card with collapse toggle + section header                                                                                                                                                                                     |

## Implementation Steps

### Step 1 — Migration

Create `supabase/migrations/0006_story_notes.sql`:

```sql
-- Story-level notes (1:1 with story)
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
```

> **Run in Supabase SQL editor before deploying client changes.**

### Step 2 — Types

Update [lib/database.types.ts](lib/database.types.ts):

```ts
export type SnippetKind = "note" | "quote" | "dialogue" | "outline" | "prompt";

export interface StoryNotesRow {
  story_id: string;
  user_id: string;
  possible_titles: string[];
  summary: string;
  outline: string;
  genres: string[];
  themes: string[];
  updated_at: string;
}

export interface StoryCharacterRow {
  id: string;
  story_id: string;
  user_id: string;
  name: string;
  role: string | null;
  age: string | null;
  gender: string | null;
  occupation: string | null;
  background: string | null;
  appearance: string | null;
  personality: string | null;
  goals: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface StorySnippetRow {
  id: string;
  story_id: string;
  user_id: string;
  kind: SnippetKind;
  title: string | null;
  body: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}
```

Register all three in the `Database` interface, matching the pattern used for `reading_list`.

### Step 3 — Queries

Create `lib/queries/notes.ts`:

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import type {
  StoryNotesRow,
  StoryCharacterRow,
  StorySnippetRow,
  SnippetKind,
} from "../database.types";

const keys = {
  notes: (storyId: string) => ["story_notes", storyId] as const,
  characters: (storyId: string) => ["story_characters", storyId] as const,
  snippets: (storyId: string) => ["story_snippets", storyId] as const,
  counts: ["story_notes", "counts"] as const,
};

// ── Concept / story_notes ────────────────────────────────────────────────
export function useStoryNotes(storyId: string | undefined) {
  /* maybeSingle() */
}
export function useUpsertStoryNotes() {
  // Upsert by story_id; always include user_id from auth.getUser().
  // Cast result to StoryNotesRow.
}

// ── Characters ────────────────────────────────────────────────────────────
export function useCharacters(storyId: string | undefined) {
  /* order by order_index, created_at */
}
export function useCreateCharacter(storyId: string) {
  /* invalidate characters + counts */
}
export function useUpdateCharacter(storyId: string) {
  /* by id */
}
export function useDeleteCharacter(storyId: string) {
  /* by id */
}

// ── Snippets ──────────────────────────────────────────────────────────────
export function useSnippets(storyId: string | undefined) {
  /* order by order_index, created_at desc */
}
export function useCreateSnippet(storyId: string) {
  /* invalidate snippets + counts */
}
export function useUpdateSnippet(storyId: string) {
  /* by id */
}
export function useDeleteSnippet(storyId: string) {
  /* by id */
}

// ── Hub counts (one query, joined client-side) ───────────────────────────
export function useNoteCounts() {
  // Two queries:
  //   - story_characters → group by story_id (use .select('story_id', { count: 'exact', head: false }))
  //   - story_snippets   → same
  //   - story_notes      → list of story_id with any non-empty field
  // Reduce client-side to: Map<storyId, { characters: number; snippets: number; hasConcept: boolean }>.
  // Stale time ~30s; this is called only on the hub.
}
```

Follow the existing pattern in [lib/queries/chapters.ts](lib/queries/chapters.ts) for typing (cast results because the Supabase chained client returns `never` in this codebase).

### Step 4 — Reusable ChipListEditor

Create `components/notes/ChipListEditor.tsx`:

```tsx
export function ChipListEditor({
  label,
  value,
  onChange,
  placeholder = "Add…",
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (value.includes(t)) {
      setDraft("");
      return;
    }
    onChange([...value, t]);
    setDraft("");
  };
  const remove = (chip: string) => onChange(value.filter((c) => c !== chip));
  // …chips row + TextInput with returnKeyType="done" and onSubmitEditing={add}
}
```

Used three times in Section 1 (possible_titles, genres, themes).

### Step 5 — Notes hub (`app/(tabs)/notes.tsx`)

Replace the placeholder. New structure:

```tsx
export default function NotesScreen() {
  const router = useRouter();
  const { data: stories } = useStories();
  const { data: counts } = useNoteCounts();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Brand */}
        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 4 }}>
          <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: 32, color: '#2F4156' }}>
            {'noveḷɑ'}
          </Text>
        </View>

        {/* Title + intro */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 }}>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, color: '#2F4156' }}>
            Notes
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: 'rgba(47,65,86,0.55)', marginTop: 4 }}>
            Pick a novel to plan its world.
          </Text>
        </View>

        {/* List of novels */}
        {stories?.length === 0
          ? <EmptyHub onCreate={() => router.push('/story/new')} />
          : stories?.map((s, i) => {
              const c = counts?.get(s.id);
              return (
                <Pressable key={s.id} onPress={() => router.push(`/notes/${s.id}`)} style={…}>
                  <StoryCover coverPath={s.cover_url} tone={COVER_TONES[i % 4]} title={s.title} size="xs" />
                  <View style={{ flex: 1 }}>
                    <Text>{s.title}</Text>
                    <Text>
                      {(c?.characters ?? 0)} characters · {(c?.snippets ?? 0)} snippets
                      {c?.hasConcept ? ' · concept ✓' : ''}
                    </Text>
                  </View>
                  <ChevronRight />
                </Pressable>
              );
            })}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Step 6 — Per-story notes screen

Create `app/notes/[storyId].tsx`. Outer skeleton:

```tsx
export default function StoryNotesScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const router = useRouter();
  const { data: story } = useStory(storyId);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F5EFEB" }}
      edges={["top"]}
    >
      {/* Back + brand */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingTop: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
        </Pressable>
        <Text
          style={{
            fontFamily: "CormorantGlyphs_400Regular",
            fontSize: 26,
            color: "#2F4156",
          }}
        >
          {"noveḷɑ"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Story header */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: "uppercase",
              color: "rgba(47,65,86,0.42)",
            }}
          >
            Notes for
          </Text>
          <Text
            style={{
              fontFamily: "CormorantGaramond_500Medium",
              fontSize: 30,
              color: "#2F4156",
              lineHeight: 34,
            }}
          >
            {story?.title ?? "…"}
          </Text>
        </View>

        <ConceptSection storyId={storyId!} />
        <CharactersSection storyId={storyId!} />
        <SnippetsSection storyId={storyId!} />
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Step 7 — ConceptSection

```tsx
function ConceptSection({ storyId }: { storyId: string }) {
  const { data, isLoading } = useStoryNotes(storyId);
  const upsert = useUpsertStoryNotes();
  const [titles, setTitles] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [outline, setOutline] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);

  // Initialize from data when it loads
  useEffect(() => {
    if (!data) return;
    setTitles(data.possible_titles);
    setSummary(data.summary);
    setOutline(data.outline);
    setGenres(data.genres);
    setThemes(data.themes);
  }, [data]);

  // Debounced auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      upsert.mutate({
        storyId,
        possible_titles: titles,
        summary,
        outline,
        genres,
        themes,
      });
    }, 800);
    return () => clearTimeout(t);
  }, [titles, summary, outline, genres, themes]);

  return (
    <SectionCard title="Outline & Concept" eyebrow="Section one">
      <ChipListEditor
        label="Possible titles"
        value={titles}
        onChange={setTitles}
        placeholder="Add a title…"
      />
      <TextArea
        label="Summary"
        value={summary}
        onChangeText={setSummary}
        minHeight={80}
      />
      <TextArea
        label="Outline"
        value={outline}
        onChangeText={setOutline}
        minHeight={160}
      />
      <ChipListEditor label="Genres" value={genres} onChange={setGenres} />
      <ChipListEditor label="Themes" value={themes} onChange={setThemes} />
    </SectionCard>
  );
}
```

> **Auto-save** with 800ms debounce — no save button needed. Show a quiet "Saved" indicator beside the section header when the mutation succeeds.

### Step 8 — CharactersSection + editor

```tsx
function CharactersSection({ storyId }: { storyId: string }) {
  const { data: characters } = useCharacters(storyId);
  const [editing, setEditing] = useState<StoryCharacterRow | "new" | null>(
    null,
  );
  const createCharacter = useCreateCharacter(storyId);
  const updateCharacter = useUpdateCharacter(storyId);
  const deleteCharacter = useDeleteCharacter(storyId);

  return (
    <SectionCard
      title="Characters"
      eyebrow="Section two"
      count={characters?.length}
    >
      {characters?.length ? (
        characters.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            onPress={() => setEditing(c)}
          />
        ))
      ) : (
        <EmptyRow
          icon={Users}
          text="Add your first character"
          onPress={() => setEditing("new")}
        />
      )}
      <AddButton label="Add character" onPress={() => setEditing("new")} />

      {editing ? (
        <CharacterEditor
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(values) =>
            editing === "new"
              ? createCharacter.mutateAsync(values).then(() => setEditing(null))
              : updateCharacter
                  .mutateAsync({ id: editing.id, ...values })
                  .then(() => setEditing(null))
          }
          onDelete={
            editing !== "new"
              ? () =>
                  deleteCharacter
                    .mutateAsync(editing.id)
                    .then(() => setEditing(null))
              : undefined
          }
        />
      ) : null}
    </SectionCard>
  );
}
```

**CharacterEditor** is a bottom-sheet `Modal` (follow the pattern at [app/story/[id]/index.tsx](app/story/[id]/index.tsx) lines 218–286, the "Add to library" modal). Fields:

| Field       | Input                                                           | Required |
| ----------- | --------------------------------------------------------------- | -------- |
| Name        | TextInput                                                       | ✅       |
| Role        | Segmented chips (Protagonist / Antagonist / Supporting / Other) | —        |
| Age         | TextInput                                                       | —        |
| Gender      | TextInput                                                       | —        |
| Occupation  | TextInput                                                       | —        |
| Background  | TextInput (multiline, minHeight 80)                             | —        |
| Appearance  | TextInput (multiline, minHeight 60)                             | —        |
| Personality | TextInput (multiline, minHeight 60)                             | —        |
| Goals       | TextInput (multiline, minHeight 60)                             | —        |

Buttons: **Save** (primary, navy), **Cancel** (outline), and **Delete** (text-only red) if editing existing.

### Step 9 — SnippetsSection + editor

Same shape as CharactersSection. SnippetCard shows:

- Kind badge (small uppercase pill, color per kind — note: navy/slate, quote: teal, dialogue: rose, outline: sand, prompt: sky)
- Title (Cormorant 18, optional)
- Body (Inter 13, max 3 lines)

**SnippetEditor** modal fields:

| Field | Input                                                        | Required |
| ----- | ------------------------------------------------------------ | -------- |
| Kind  | Segmented chips (Note / Quote / Dialogue / Outline / Prompt) | ✅       |
| Title | TextInput                                                    | —        |
| Body  | TextInput multiline minHeight 160                            | ✅       |

### Step 10 — SectionCard + small helpers

`components/notes/SectionCard.tsx` — a wrapper that gives every section a consistent eyebrow + title + chevron-collapse and stores collapse state per section in component state.

```tsx
export function SectionCard({
  title,
  eyebrow,
  count,
  children,
}: {
  title: string;
  eyebrow: string;
  count?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 16,
        backgroundColor: "#FAF6F2",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(47,65,86,0.10)",
        overflow: "hidden",
      }}
    >
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={{ padding: 16, flexDirection: "row", alignItems: "center" }}
      >
        <View style={{ flex: 1 }}>
          <Text style={eyebrowStyle}>{eyebrow}</Text>
          <Text style={titleStyle}>
            {title}
            {count != null ? ` · ${count}` : ""}
          </Text>
        </View>
        {open ? (
          <ChevronUp size={16} color="rgba(47,65,86,0.42)" />
        ) : (
          <ChevronDown size={16} color="rgba(47,65,86,0.42)" />
        )}
      </Pressable>
      {open ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 14 }}>
          {children}
        </View>
      ) : null}
    </View>
  );
}
```

## Code Examples

**Snippet kind badge colors** (suggested palette — match the rest of the app):

```ts
const SNIPPET_KIND: Record<
  SnippetKind,
  { label: string; bg: string; color: string }
> = {
  note: {
    label: "Note",
    bg: "rgba(47,65,86,0.10)",
    color: "rgba(47,65,86,0.65)",
  },
  quote: { label: "Quote", bg: "rgba(86,124,141,0.14)", color: "#567C8D" },
  dialogue: { label: "Dialogue", bg: "rgba(196,83,74,0.12)", color: "#C4534A" },
  outline: { label: "Outline", bg: "rgba(196,153,74,0.14)", color: "#9A6B1A" },
  prompt: { label: "Prompt", bg: "rgba(86,141,103,0.14)", color: "#3D7A57" },
};
```

**Upsert pattern for story_notes**:

```ts
export function useUpsertStoryNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      storyId: string;
      possible_titles: string[];
      summary: string;
      outline: string;
      genres: string[];
      themes: string[];
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("story_notes").upsert({
        story_id: input.storyId,
        user_id: userId,
        possible_titles: input.possible_titles,
        summary: input.summary,
        outline: input.outline,
        genres: input.genres,
        themes: input.themes,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: keys.notes(vars.storyId) });
      qc.invalidateQueries({ queryKey: keys.counts });
    },
  });
}
```

## Testing Checklist

- [ ] Notes hub shows the `noveḷɑ` brand at top, then "Notes" header
- [ ] Hub lists every story with cover, title, and live counts (characters · snippets · concept ✓)
- [ ] Hub shows a "Start your first novel" CTA when there are zero stories
- [ ] Tapping a story routes to `/notes/[storyId]`
- [ ] Per-story page shows brand at top, story title below
- [ ] Concept section: editing any field auto-saves within ~800ms (no Save button)
- [ ] Possible-titles chips: add via enter, remove via tap on chip
- [ ] Genres + themes chips behave identically
- [ ] Summary and outline persist after navigating away and back
- [ ] Characters section: add a character via modal — appears in the list immediately
- [ ] Editing an existing character pre-fills all fields
- [ ] Saving an empty name is blocked
- [ ] Delete in character modal shows confirmation Alert before removing
- [ ] Snippets section: add each of the 5 kinds — badges render with the right colors
- [ ] Editing a snippet pre-fills kind, title, body
- [ ] Section cards collapse / expand independently
- [ ] Deleting a story (from `/story/[id]`) cascade-deletes its notes, characters, snippets (verify via SQL)
- [ ] RLS: a row inserted with a different `user_id` is invisible (verify in Supabase dashboard with a second test user)
- [ ] Counts on the hub update after add/delete
- [ ] Empty section states show "Add your first …" with an inline add button
- [ ] Loading spinner while initial fetch is in flight

## Dependencies

- Required packages: none new — uses existing `react-native`, `lucide-react-native`, `@tanstack/react-query`, `@supabase/supabase-js`
- Required APIs: new Supabase tables `story_notes`, `story_characters`, `story_snippets`
- Blocked by: migration `0006_story_notes.sql` must be run in Supabase **before** the client changes are deployed (otherwise inserts return RLS / table-missing errors)

## Notes for Implementation Agent

- **Brand mark**: use `fontFamily: 'CormorantGlyphs_400Regular'`, size 32 on the hub and size 26 in the per-story page header. Color `#2F4156`. The literal is `'noveḷɑ'` (note the ḷ and ɑ — already standard across the app, see [app/(tabs)/profile.tsx](<app/(tabs)/profile.tsx>) bottom for an exact reference).
- **Supabase typing tech debt**: this codebase has pre-existing `tsc` errors where chained Supabase queries resolve to `never`. Cast the result with `as StoryNotesRow | null` / `as StoryCharacterRow[]` etc., matching the pattern in [lib/queries/chapters.ts](lib/queries/chapters.ts). Do **not** try to fix the upstream typing — out of scope.
- **Modal pattern**: copy the bottom-sheet from [app/story/[id]/index.tsx](app/story/[id]/index.tsx) (search "showLibraryModal"). Outer `Pressable` is the scrim (closes on tap), inner `Pressable` with `onPress={() => {}}` absorbs taps so the sheet itself doesn't close.
- **Routing**: the new screen at `app/notes/[storyId].tsx` is **outside** `(tabs)`, so the tab bar will still render. That's intentional — Ericka stays in the Notes section while editing.
- **Auto-save**: debounce concept-section saves at 800ms. Don't trigger an upsert before the initial fetch has populated state, or you'll overwrite the row with empty strings. Guard with a `hasLoadedRef`.
- **`order_index`** is wired into the schema for future drag-reorder but not exposed in v1 — leave it at 0 for new rows.
- **Reading-list pattern**: the `reading_list` queries in [lib/queries/reading_list.ts](lib/queries/reading_list.ts) are the closest mental model — small focused module with a single query key namespace.
- **Brand at top of every notes screen** is a hard requirement from the user. Don't skip it.
- **Don't add a separate "Writing prompts" shelf** — `prompt` is one of the snippet kinds inside a story's notes. We confirmed this with the user during planning.

## Related

- Existing modal pattern: [app/story/[id]/index.tsx](app/story/[id]/index.tsx) (Add to library bottom sheet)
- Existing query module pattern: [lib/queries/reading_list.ts](lib/queries/reading_list.ts)
- Existing chip / tag picker (do NOT reuse directly — TagPicker is global tags; we want plain text chips per-field): [components/TagPicker.tsx](components/TagPicker.tsx)
- Brand mark usage: [app/(tabs)/profile.tsx](<app/(tabs)/profile.tsx>), [app/(tabs)/about.tsx](<app/(tabs)/about.tsx>), [app/about/novella.tsx](app/about/novella.tsx)
