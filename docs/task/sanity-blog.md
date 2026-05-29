# Sanity Blog + Poems / Journal Tiles

> **Status:** TESTING
> **Priority:** HIGH
> **Type:** feature
> **Version Impact:** minor
> **Created:** 2026-05-29
> **Completed:** 2026-05-29
> **Platform:** Mobile (Expo / React Native)
> **Automation:** manual
> **Implementation Notes:** Added `@sanity/client@6` (pure JS, Expo Go safe). New files: `lib/sanity.ts`, `lib/queries/blog.ts`, `components/blog/PortableText.tsx`, `components/blog/BlogCard.tsx`, `components/ComingSoon.tsx`, `app/blog.tsx`, `app/blog/[slug].tsx`, `app/poems.tsx`, `app/journal.tsx`. Modified `FeatureIcons.tsx` (Blog/Poems/Journal icons), `app/(tabs)/profile.tsx` (2nd tile row), `app/_layout.tsx` (route registration). Blog list has pull-to-refresh + error/empty/loading states; reader handles missing mainImage/author. `tsc` clean for all new files (36 pre-existing Supabase `never`-typing errors remain in untouched files). Expo typed-routes regenerated to include the new routes. Not yet run on a device/simulator — needs `/test`.

## Overview

Add a second row of three feature tiles to the Profile screen — **Blog**, **Poems**, and **Journal / Diary** — directly below the existing Calendar / Music / Movies row. **Blog** pulls posts from the existing Sanity project (`writtenbyericka`, project `fq4q2dq2`, dataset `production`) and displays them read-only inside the app: a list screen and a per-post reader. **Poems** and **Journal / Diary** ship as "Coming soon" placeholders for now.

The Sanity Studio at `C:\Users\Ericka Dichon\Documents\Personal\novella\sanity` already owns the content model and is where Ericka writes posts. This app only **reads** from Sanity using the same public credentials — no Studio, no writes, no auth token.

## Requirements

### Must Have
- [ ] Three new feature tiles (Blog, Poems, Journal/Diary) below the Calendar/Music/Movies row, using `assets/images/blog.svg`, `poems.svg`, `journal.svg`.
- [ ] Tiles match the existing `FeatureTile` look and equal-sizing (already fixed).
- [ ] Blog tile → `/blog` list screen showing all Sanity posts (newest first) with cover image, title, author, date.
- [ ] Tapping a post → `/blog/[slug]` reader screen rendering the post's Portable Text `body` with the app's design system.
- [ ] Poems tile → `/poems` "Coming soon" screen.
- [ ] Journal/Diary tile → `/journal` "Coming soon" screen.
- [ ] Reuse the same Sanity credentials as the reference project (project `fq4q2dq2`, dataset `production`).
- [ ] All new routes registered in `app/_layout.tsx`.

### Nice to Have
- [ ] Pull-to-refresh on the blog list.
- [ ] Loading and empty states consistent with `music.tsx` / `movies.tsx`.
- [ ] Graceful offline / fetch-error state (Sanity unreachable).
- [ ] Prev / next post navigation on the reader (the web app has this).

## Current State

The Profile screen already has one feature-tile row (Calendar / Music / Movies) wired through `FeatureTile` + `FeatureIcons`. The codebase has **no Sanity integration yet** — `lib/` contains only Supabase, auth, theme, storage, and query modules. There is an existing hand-written block renderer for the reader (`components/reader/renderBlocks.tsx`) that we mirror for Portable Text.

**Current Files:**
| File | Purpose |
|------|---------|
| `app/(tabs)/profile.tsx` | Profile screen; holds the existing 3-tile row at ~L171 |
| `components/profile/FeatureTile.tsx` | Tile component (equal-size fix already applied) |
| `components/profile/FeatureIcons.tsx` | Hand-ported SVG icon components (Calendar/Music/Movie) |
| `app/_layout.tsx` | Root Stack; route registration (calendar/music/movies at L76–78) |
| `app/music.tsx`, `app/movies.tsx`, `app/calendar.tsx` | Header + list pattern to reuse for new screens |
| `components/reader/renderBlocks.tsx` | Existing custom block renderer — pattern reference for Portable Text |
| `lib/queries/*.ts` | TanStack Query hook pattern to mirror for blog |
| `assets/images/blog.svg`, `poems.svg`, `journal.svg` | Source SVGs for the new tile icons |

### Reference Sanity setup (from `…\Personal\novella`)

- **Client:** `@sanity/client` `createClient({ projectId: 'fq4q2dq2', dataset: 'production', useCdn: true, apiVersion: '2023-01-01' })` — see reference `lib/sanity.ts`. `projectId`/`dataset` are **public**, client-side values (safe to hardcode; they appear verbatim in `sanity.config.ts`).
- **`post` schema:** `title` (string), `slug` (slug), `author` (ref → `{name, image}`), `mainImage` (image + `alt`), `categories` (ref[]), `publishedAt` (datetime), `body` (`blockContent` = Portable Text).
- **`blockContent`:** styles `normal / h1–h4 / blockquote`, `bullet` list, marks `strong` / `em`, `link` annotation (`href`), and inline `image` members.
- **List GROQ (reference web):**
  ```groq
  *[_type == "post"]{
    _id, title, slug, publishedAt,
    author->{ name, image{ asset->{url} } },
    mainImage{ asset->{url} }
  } | order(publishedAt desc)
  ```
- **Detail GROQ:** same fields plus `body`, `mainImage{ asset->{url}, alt }`, queried by `slug.current`.
- Because GROQ dereferences `asset->{url}`, posts come back with **direct CDN image URLs** — `expo-image` loads them as-is, so we do **not** need `@sanity/image-url` or `next-sanity`.

## Proposed Solution

### Architecture

1. **Sanity client** — add `@sanity/client` and a thin `lib/sanity.ts` mirroring the reference (hardcoded public project/dataset; `useCdn: true`). Read-only.
2. **Query layer** — `lib/queries/blog.ts` with `useBlogPosts()` and `useBlogPost(slug)` TanStack hooks, mirroring the existing query-module pattern. GROQ strings ported from the reference app.
3. **Types** — `lib/sanity.types.ts` (or inline in the query file) for `BlogPostSummary`, `BlogPost`, and the Portable Text block shape.
4. **Portable Text renderer** — `components/blog/PortableText.tsx`, a small hand-written renderer in the spirit of `renderBlocks.tsx`. Handles block styles (`normal`, `h1–h4`, `blockquote`), `bullet` lists, marks (`strong`/`em`/`link`), and inline images. **Chosen over `@portabletext/react`** to keep the dependency footprint small, guarantee Expo Go compatibility, and reuse the app's exact typography/colors. (Alternative noted below.)
5. **Icons** — extend `components/profile/FeatureIcons.tsx` with `BlogIcon`, `PoemsIcon`, `JournalIcon`, hand-porting the three SVGs (same technique as the existing icons; normalize each `fill`/`stroke` to the passed `color`).
6. **Screens** — `app/blog.tsx` (list), `app/blog/[slug].tsx` (reader), `app/poems.tsx` + `app/journal.tsx` (Coming soon, via a shared `components/ComingSoon.tsx`).
7. **Profile row** — add a second `FeatureTile` row under the existing one in `profile.tsx`.
8. **Routes** — register `blog`, `blog/[slug]`, `poems`, `journal` in `app/_layout.tsx`.

### File Changes

| Action | File | Description |
|--------|------|-------------|
| MODIFY | `package.json` | Add `@sanity/client` dependency |
| CREATE | `lib/sanity.ts` | Read-only Sanity client (project `fq4q2dq2`, dataset `production`) |
| CREATE | `lib/queries/blog.ts` | `useBlogPosts()`, `useBlogPost(slug)` + GROQ + types |
| MODIFY | `components/profile/FeatureIcons.tsx` | Add `BlogIcon`, `PoemsIcon`, `JournalIcon` |
| CREATE | `components/blog/PortableText.tsx` | Custom RN Portable Text renderer |
| CREATE | `components/blog/BlogCard.tsx` | List-row card (cover, title, author, date) |
| CREATE | `components/ComingSoon.tsx` | Shared placeholder body (icon + message) |
| CREATE | `app/blog.tsx` | Blog list screen |
| CREATE | `app/blog/[slug].tsx` | Blog post reader screen |
| CREATE | `app/poems.tsx` | Coming-soon screen |
| CREATE | `app/journal.tsx` | Coming-soon screen |
| MODIFY | `app/(tabs)/profile.tsx` | Add second feature-tile row |
| MODIFY | `app/_layout.tsx` | Register `blog`, `blog/[slug]`, `poems`, `journal` |

## Implementation Steps

### Step 1: Add the Sanity client
Install `@sanity/client`, then create `lib/sanity.ts` mirroring the reference project exactly:
```ts
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: 'fq4q2dq2',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2023-01-01',
});
```
> Optional: read `EXPO_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` from env with these as fallbacks. Not required — values are public.

### Step 2: Query hooks
Create `lib/queries/blog.ts`:
```ts
import { useQuery } from '@tanstack/react-query';
import { sanityClient } from '../sanity';

export type BlogPostSummary = {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author?: { name?: string; image?: { asset?: { url?: string } } };
  mainImage?: { asset?: { url?: string } };
};

export type PortableTextBlock = {
  _type: string;
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: { _type: 'span'; _key: string; text: string; marks?: string[] }[];
  markDefs?: { _key: string; _type: string; href?: string }[];
  // inline image members carry asset->url + alt
  asset?: { url?: string };
  alt?: string;
};

export type BlogPost = BlogPostSummary & {
  body: PortableTextBlock[];
  mainImage?: { asset?: { url?: string }; alt?: string };
};

export const blogKeys = {
  all: ['blog'] as const,
  detail: (slug: string) => ['blog', slug] as const,
};

const LIST_QUERY = `*[_type == "post"]{
  _id, title, slug, publishedAt,
  author->{ name, image{ asset->{url} } },
  mainImage{ asset->{url} }
} | order(publishedAt desc)`;

const DETAIL_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id, title, slug, publishedAt, body,
  author->{ name, image{ asset->{url} } },
  mainImage{ asset->{url}, alt }
}`;

export function useBlogPosts() {
  return useQuery({
    queryKey: blogKeys.all,
    queryFn: () => sanityClient.fetch<BlogPostSummary[]>(LIST_QUERY),
  });
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: blogKeys.detail(slug ?? ''),
    queryFn: () => sanityClient.fetch<BlogPost>(DETAIL_QUERY, { slug }),
    enabled: !!slug,
  });
}
```

### Step 3: Port the three SVG icons
Add `BlogIcon`, `PoemsIcon`, `JournalIcon` to `FeatureIcons.tsx`, following the existing pattern (`Svg` + `Path`, `viewBox` matching the source, `fill`/`stroke` driven by `color`). Source viewBoxes: blog `0 0 64 64` (fill), poems `0 0 204 204` (fill), journal `0 0 24 24` (stroke, multiple opacities — collapse to single `color` or keep the 0.5 opacity paths for depth).

### Step 4: Portable Text renderer
Create `components/blog/PortableText.tsx`. Iterate blocks:
- `_type === 'block'`: switch on `style` (`h1–h4` → heading sizes, `blockquote` → left-border quote, default → paragraph). Render `children` as nested `<Text>`, applying `strong` → `fontWeight`/medium font, `em` → italic, and `link` markDefs → tappable `<Text>` calling `Linking.openURL(href)`.
- `listItem === 'bullet'`: render with a `•` prefix (group consecutive items).
- `_type === 'image'`: render `expo-image` from `asset.url` with `alt`.
Reuse the color/typography choices from `renderBlocks.tsx` (Cormorant body `#2F4156`, teal quote border `#567C8D`).

### Step 5: List + reader screens
- `app/blog.tsx`: copy the header/scaffold from `music.tsx` (SafeAreaView, back button, eyebrow "Words & thoughts" + title "Blog"). Use `useBlogPosts()`; render `BlogCard` rows; loading spinner + empty state. `router.push('/blog/' + slug.current)`.
- `app/blog/[slug].tsx`: `useLocalSearchParams`, `useBlogPost(slug)`. Header with back button; `mainImage` hero (`expo-image`); title (Cormorant), author + formatted `publishedAt`; then `<PortableText value={post.body} />` inside a `ScrollView`.

### Step 6: Coming-soon screens
Create `components/ComingSoon.tsx` (icon + "Coming soon" + one supporting line, centered). `app/poems.tsx` and `app/journal.tsx` reuse the `music.tsx` header scaffold (back button + eyebrow/title) and render `ComingSoon` with the matching icon and copy.

### Step 7: Profile row + routes
- In `profile.tsx`, add a second row right after the existing tile row (L171–175):
  ```tsx
  <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 10 }}>
    <FeatureTile icon={BlogIcon}    label="Blog"    onPress={() => router.push('/blog')} />
    <FeatureTile icon={PoemsIcon}   label="Poems"   onPress={() => router.push('/poems')} />
    <FeatureTile icon={JournalIcon} label="Journal" onPress={() => router.push('/journal')} />
  </View>
  ```
- In `app/_layout.tsx`, add after the movies screen (L78):
  ```tsx
  <Stack.Screen name="blog" />
  <Stack.Screen name="blog/[slug]" />
  <Stack.Screen name="poems" />
  <Stack.Screen name="journal" />
  ```

## Testing Checklist

- [ ] Profile shows two tile rows; all six tiles are equal size and aligned.
- [ ] Blog tile opens the list; real Sanity posts load, newest first, with cover/author/date.
- [ ] Tapping a post opens the reader; Portable Text renders headings, paragraphs, quotes, bullets, bold/italic, links (tappable), and inline images.
- [ ] Posts with a missing `mainImage` / `author` render without crashing.
- [ ] Poems and Journal tiles each open a clean "Coming soon" screen.
- [ ] Back navigation works from every new screen.
- [ ] Loading spinner appears while fetching; empty state shows when there are no posts.
- [ ] Sanity-unreachable (airplane mode) shows a graceful error rather than a crash.
- [ ] Dark mode is acceptable (or explicitly matches the existing screens' behavior).

## Dependencies

- **New package:** `@sanity/client` (pure JS — Expo Go compatible; no native module). Pin a version compatible with RN 0.76 / Node fetch (v6 is safe; the reference uses v7 via `next-sanity`).
- **APIs:** Sanity read API for project `fq4q2dq2`, dataset `production` (public, no token).
- **Blocked by:** none.

## Notes for Implementation Agent

- **Read-only.** Do not add Sanity Studio, write mutations, or tokens. Only `sanityClient.fetch`.
- `projectId` / `dataset` are public (they're in plaintext in the reference `sanity.config.ts`) — hardcoding in `lib/sanity.ts` is intentional and matches the reference app's `lib/sanity.ts`.
- Image URLs arrive pre-resolved via `asset->{url}` in GROQ; load directly with `expo-image`. No `@sanity/image-url`.
- The web reference uses `@portabletext/react` (renders HTML) — **do not** copy that; it won't render in RN. Use the custom renderer in Step 4. If a future need arises for richer Portable Text features, `@portabletext/react` *can* work in RN by overriding every `block`/`mark`/`list`/`type` component with RN primitives, but that's out of scope here.
- Match the visual language of `music.tsx` / `movies.tsx` (beige `#F5EFEB`, paper `#FAF6F2`, navy `#2F4156`, teal `#567C8D`, Cormorant headings, Inter labels).
- `FeatureTile`'s equal-size fix is already in place (inner `View` has `flex: 1` + `justifyContent: 'center'`).
- Keep `apiVersion: '2023-01-01'` to match the schema the content was authored against.

## Related

- Reference implementation: `C:\Users\Ericka Dichon\Documents\Personal\novella` — `lib/sanity.ts`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `sanity/schemaTypes/postType.ts`, `blockContentType.ts`.
- Existing pattern: [profile-features.md](profile-features.md) (Calendar/Music/Movies tiles), [reading-reader.md](reading-reader.md) (block renderer).
