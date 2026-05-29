# Page-Turn Reader

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
> - Migration `supabase/migrations/0003_reader_pages.sql` adds `page_index` to `reading_progress` (NOT NULL default 0) and `bookmarks` (nullable). `scroll_position` is dual-written with value `0` on writes; drop it in v2.
> - `scroll_position` column on `reading_progress` is still NOT NULL in 0001_init; the client writes `0` on every progress upsert to satisfy that constraint.
> - Bookmark order is now by `page_index` (was `scroll_position`); a `bookmarks_chapter_page_idx` index was added.
> - The `read.tsx` screen no longer renders a custom header — the `Reader` owns its own auto-hiding chrome (back / story title / chapter title / bookmark / Aa).
> - Reading prefs (`readingFontSize`, `readingLineSpacing`) persist on `auth.users.user_metadata`. Defaults: 19 px / 1.7 line ratio.
> - Profile → Reading preferences row deep-links to `/profile-settings?focus=reading` which auto-scrolls to the reading section.
> - Pre-existing Supabase-client typing tech debt: `useProgress`, `useBookmarks` etc. resolve to `never` due to chained calls. Same pattern as before — not in scope here.
> - Edit button removed from the read screen; chapter editing is reachable from the chapter list. If you want it back inside the reader chrome, add a `Pencil` icon next to the bookmark button in `Reader.tsx`.

## Overview

Replace the current scroll-based reader with a page-turn experience matching the Novella design reference. Readers tap left/right zones to flip pages, tap center to toggle chrome, and see a thin segmented progress bar at the bottom. Reading preferences (font size, line spacing) persist to the user profile. When the reader reaches the last page of a chapter, a "next chapter" hand-off card appears.

## Requirements

### Must Have
- [ ] Paginated reader: chapter content split into fixed-height pages that fit the viewport
- [ ] Tap zones: left 30% (prev page), right 30% (next page), center 40% (toggle chrome)
- [ ] Top chrome (auto-hide): back button, centered story title / chapter title, font-size button, bookmark button
- [ ] Bottom indicator (auto-fade): segmented bar + "Page X of Y" + percentage
- [ ] Font-size settings popover with 5 sizes (16 / 18 / 19 / 22 / 26 px) matching design
- [ ] Persist reading preferences (font size, line spacing) to user profile
- [ ] Smooth ~280ms fade between pages
- [ ] Save progress as `page_index` (no more pixel scroll position for paginated reading)
- [ ] Restore reader to the saved page on re-entry
- [ ] Bookmark icon in top chrome: tap to add bookmark at the current page (with optional note on iOS via `Alert.prompt`)
- [ ] Bookmarks list strip: chip per bookmark, tap to jump to that page, long-press to delete
- [ ] End-of-chapter "next chapter" card with title + tap-to-continue. Loads next chapter at page 1.
- [ ] If no next chapter, show "End of story" card with a back-to-story-detail action.
- [ ] Re-paginate automatically when font size changes (preserve approximate reading position)

### Nice to Have
- [ ] Swipe gesture (left/right) in addition to tap zones
- [ ] Line-spacing control (tight / normal / loose) in the settings popover
- [ ] Font-family toggle (Cormorant Garamond / Inter) in the settings popover
- [ ] Reading time estimate ("~3 min left in chapter")
- [ ] Haptic feedback on page turn (iOS)
- [ ] Reading-preferences screen accessible from Profile → Reading preferences row

## Current State

The reader at [components/Reader.tsx](components/Reader.tsx) is a vertical `ScrollView` rendering TipTap JSON. It tracks scroll position in pixels, saves progress with a 1.5s throttle, restores on mount, and shows bookmarks as a horizontal chip strip at the bottom with a floating navy bookmark FAB.

**Current Files:**

| File | Purpose |
|------|---------|
| [components/Reader.tsx](components/Reader.tsx) | Scroll-based reader, TipTap JSON renderer, progress + bookmarks |
| [app/story/[id]/chapter/[chapterId]/read.tsx](app/story/[id]/chapter/[chapterId]/read.tsx) | Screen wrapper: header with back + edit, then Reader |
| [lib/queries/chapters.ts](lib/queries/chapters.ts) | `useChapter`, `useChapters`, `useProgress`, `useSaveProgress`, bookmarks |
| [lib/database.types.ts](lib/database.types.ts) | `ChapterRow`, `reading_progress` (scroll_position), `bookmarks` (scroll_position) |
| [lib/auth.tsx](lib/auth.tsx) | `UserProfile` interface — no reading-prefs fields yet |
| [app/profile-settings.tsx](app/profile-settings.tsx) | Profile edit form — no reading-prefs section |

## Proposed Solution

A new `<Reader>` component that:

1. **Renders all chapter blocks once** in a hidden measurement layer to capture each block's height via `onLayout`.
2. **Bin-packs measured blocks into pages** sized to the viewport (height minus top chrome and bottom indicator).
3. **Displays one page at a time** inside an absolutely-positioned content area, animated with `Animated.View` (fade only — no horizontal slide for v1).
4. **Tap zones** detect prev / next / chrome toggle.
5. **Settings popover** anchored to the top-right Aa icon mutates font size in local state; mutation also fires `useUpdateProfile` to persist.
6. **End-of-chapter card** is the final synthetic "page" — not part of the content, but added by the paginator when `pageIdx === pages.length`.
7. **Bookmarks** store `page_index` (new column); chip strip in bottom chrome.

### Architecture

```
read.tsx (screen)
  └─ Reader (component)
       ├─ MeasurementLayer (offscreen, renders all blocks once, captures heights)
       ├─ PageView (absolute, fades between pages)
       │    └─ renderBlocks(pages[pageIdx])
       ├─ TopChrome (back, title, bookmark, Aa) — opacity animated
       ├─ TapZones (left / center / right)
       ├─ BottomChrome (segmented bar + Page X of Y + bookmarks strip) — opacity animated
       ├─ SettingsPopover (font size grid, line spacing) — anchored top-right
       └─ NextChapterCard (synthetic last page) — story-detail nav on tap
```

**Pagination algorithm** (`paginate(blocks, viewportHeight, fontSize)`):
1. After all blocks have been measured, walk in order accumulating heights.
2. Start a new page when adding the next block would exceed `viewportHeight - chromeHeight - safePad`.
3. Single block taller than a page: place alone (will overflow slightly — acceptable for v1; v2 could split paragraphs by line measurement).
4. Returns `Block[][]` — array of pages.

**Re-pagination on font-size change:** trigger a fresh measurement pass (reset `measured` state, set new font size, re-render measurement layer). Best-effort restore: find the block that was on the current page and snap to the new page containing it.

### File Changes

| Action | File | Description |
|--------|------|-------------|
| MODIFY | `components/Reader.tsx` | Full rewrite to page-turn model |
| CREATE | `components/reader/Paginator.tsx` | Measurement + bin-packing logic |
| CREATE | `components/reader/ReaderChrome.tsx` | Top + bottom chrome with opacity animation |
| CREATE | `components/reader/SettingsPopover.tsx` | Font size + line spacing controls |
| CREATE | `components/reader/NextChapterCard.tsx` | End-of-chapter hand-off page |
| MODIFY | `app/story/[id]/chapter/[chapterId]/read.tsx` | Remove top header (Reader handles its own chrome), pass next-chapter id |
| MODIFY | `lib/queries/chapters.ts` | `useProgress` / `useSaveProgress` use `page_index`; bookmarks use `page_index`; add `useChaptersForStory` helper if needed for next-chapter lookup |
| MODIFY | `lib/database.types.ts` | Add `page_index` to `ReadingProgressRow` and `BookmarkRow` |
| MODIFY | `lib/auth.tsx` | Add `readingFontSize`, `readingLineSpacing` to `UserProfile`; read/write in `extractProfile` and `updateProfile` |
| MODIFY | `app/profile-settings.tsx` | Add Reading preferences section (font size segmented control, spacing) |
| CREATE | `db/migrations/2026-05-28-reader-pages.sql` | Migration adding `page_index` columns |

## Implementation Steps

### Step 1: Database migration

Run in Supabase SQL editor:

```sql
ALTER TABLE reading_progress
  ADD COLUMN IF NOT EXISTS page_index integer NOT NULL DEFAULT 0;

ALTER TABLE bookmarks
  ADD COLUMN IF NOT EXISTS page_index integer;
-- Keep scroll_position for backfill; readers will write both columns until v2.

-- Optional: backfill page_index for existing bookmarks/progress (set to 0)
UPDATE reading_progress SET page_index = 0 WHERE page_index IS NULL;
UPDATE bookmarks SET page_index = 0 WHERE page_index IS NULL;
```

### Step 2: Type + query updates

In [lib/database.types.ts](lib/database.types.ts):
- Add `page_index: number` to `ReadingProgressRow`.
- Add `page_index: number | null` to `BookmarkRow`.

In [lib/queries/chapters.ts](lib/queries/chapters.ts):
- Change `useSaveProgress` payload from `scrollPosition` to `pageIndex`, write to `page_index`.
- Change `useAddBookmark` payload from `scrollPosition` to `pageIndex`.
- Keep `scroll_position: 0` in writes for now (column still NOT NULL) until a follow-up migration drops it.

### Step 3: User profile reading prefs

In [lib/auth.tsx](lib/auth.tsx):

```ts
export interface UserProfile {
  // …existing
  readingFontSize: number;   // default 19
  readingLineSpacing: number; // default 1.7
}

// extractProfile additions:
readingFontSize: typeof meta.reading_font_size === 'number' ? meta.reading_font_size : 19,
readingLineSpacing: typeof meta.reading_line_spacing === 'number' ? meta.reading_line_spacing : 1.7,

// updateProfile additions:
reading_font_size: input.readingFontSize,
reading_line_spacing: input.readingLineSpacing,
```

### Step 4: Pagination utility

Create `components/reader/Paginator.tsx`:

```tsx
// Renders blocks into a hidden View; uses onLayout to capture heights,
// then groups blocks into pages that fit `viewportHeight`.
// Calls onPaginated(pages) once measurement completes.

export function Paginator({
  blocks,
  fontSize,
  lineHeight,
  viewportHeight,
  onPaginated,
}: {
  blocks: Block[];
  fontSize: number;
  lineHeight: number;
  viewportHeight: number;
  onPaginated: (pages: Block[][]) => void;
}) {
  const heightsRef = useRef<number[]>([]);
  const [measuredCount, setMeasuredCount] = useState(0);

  useEffect(() => {
    if (measuredCount === blocks.length && blocks.length > 0) {
      const pages: Block[][] = [];
      let current: Block[] = [];
      let used = 0;
      blocks.forEach((b, i) => {
        const h = heightsRef.current[i] ?? 0;
        if (used + h > viewportHeight && current.length > 0) {
          pages.push(current);
          current = [];
          used = 0;
        }
        current.push(b);
        used += h;
      });
      if (current.length) pages.push(current);
      onPaginated(pages);
    }
  }, [measuredCount, blocks.length, viewportHeight]);

  return (
    <View style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '100%' }}>
      {blocks.map((b, i) => (
        <View
          key={i}
          onLayout={(e) => {
            heightsRef.current[i] = e.nativeEvent.layout.height;
            setMeasuredCount((c) => c + 1);
          }}
        >
          {renderBlock(b, { fontSize, lineHeight })}
        </View>
      ))}
    </View>
  );
}
```

### Step 5: Reader chrome + tap zones

New `Reader.tsx` skeleton:

```tsx
export function Reader({ chapter, story, nextChapter, onExit }: ReaderProps) {
  const { profile, updateProfile } = useAuth();
  const [fontSize, setFontSize] = useState(profile.readingFontSize);
  const [lineSpacing, setLineSpacing] = useState(profile.readingLineSpacing);
  const [pages, setPages] = useState<Block[][] | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const chromeAnim = useRef(new Animated.Value(1)).current;

  // …measurement, pagination, progress restore, save on page change

  const totalPages = (pages?.length ?? 0) + 1; // +1 for NextChapterCard
  const onLastPage = pageIdx >= (pages?.length ?? 0);

  const next = () => {
    if (pageIdx < totalPages - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 140, useNativeDriver: true }),
      ]).start();
      setPageIdx(pageIdx + 1);
    }
  };

  const prev = () => { /* same with -1 */ };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5EFEB' }} onLayout={…}>
      {/* Measurement layer (hidden) — only while !pages */}
      {!pages && (
        <Paginator
          blocks={parseTipTap(chapter.content)}
          fontSize={fontSize}
          lineHeight={fontSize * lineSpacing}
          viewportHeight={viewportHeight}
          onPaginated={setPages}
        />
      )}

      {/* Page content */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, padding: 28, paddingTop: 80 }}>
        {onLastPage
          ? <NextChapterCard nextChapter={nextChapter} onContinue={…} onExit={onExit} />
          : pages?.[pageIdx].map((b, i) => renderBlock(b, { fontSize, lineHeight: fontSize * lineSpacing }))}
      </Animated.View>

      {/* Top chrome */}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, opacity: chromeAnim }}>
        …back button, title, bookmark icon, Aa icon
      </Animated.View>

      {/* Tap zones */}
      <Pressable onPress={() => setChromeVisible(v => !v)}
                 style={{ position: 'absolute', left: '30%', right: '30%', top: 0, bottom: 60 }} />
      <Pressable onPress={prev}
                 style={{ position: 'absolute', left: 0, top: 0, bottom: 60, width: '30%' }} />
      <Pressable onPress={next}
                 style={{ position: 'absolute', right: 0, top: 0, bottom: 60, width: '30%' }} />

      {/* Bottom chrome */}
      <Animated.View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: chromeAnim }}>
        …segmented bar + page X of Y + bookmark chips
      </Animated.View>

      {/* Settings popover */}
      {showSettings && <SettingsPopover fontSize={fontSize} onChange={…} />}
    </View>
  );
}
```

### Step 6: Settings popover

```tsx
function SettingsPopover({ fontSize, lineSpacing, onChange }: Props) {
  return (
    <View style={{ position: 'absolute', top: 56, right: 12, ...card }}>
      <Text style={eyebrow}>Text size</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[16, 18, 19, 22, 26].map(s => (
          <Pressable key={s} onPress={() => onChange({ fontSize: s })}
            style={{
              flex: 1, paddingVertical: 8,
              backgroundColor: fontSize === s ? '#2F4156' : 'transparent',
              borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
              borderRadius: 8,
            }}>
            <Text style={{
              fontFamily: 'CormorantGaramond_400Regular',
              fontSize: s / 1.4,
              color: fontSize === s ? '#F5EFEB' : '#2F4156',
              textAlign: 'center',
            }}>Aa</Text>
          </Pressable>
        ))}
      </View>
      {/* Optional line spacing row */}
    </View>
  );
}
```

### Step 7: Next-chapter card

```tsx
function NextChapterCard({ nextChapter, onContinue, onExit }) {
  if (!nextChapter) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={eyebrow}>End of story</Text>
        <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 22 }}>
          Thank you for reading.
        </Text>
        <Pressable onPress={onExit}>…Back to story…</Pressable>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={eyebrow}>Up next</Text>
      <Text style={titleSerif}>{nextChapter.title}</Text>
      <Pressable onPress={onContinue}>…Continue reading…</Pressable>
    </View>
  );
}
```

### Step 8: Profile settings — Reading preferences

Add a section in [app/profile-settings.tsx](app/profile-settings.tsx) with a segmented font-size control mirroring the popover, and a line-spacing control. Save via existing `updateProfile`.

### Step 9: Wire up Profile → Reading preferences row

Make the existing `Type` row in [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx) navigate to `profile-settings` and scroll to the reading section. (Simpler than a separate screen; we can split later.)

## Code Examples

**Block renderer** (extracted, used by both measurement layer and visible page):

```tsx
function renderBlock(b: Block, { fontSize, lineHeight }: TypoOpts) {
  if (b.type === 'heading') {
    const level = b.attrs?.level ?? 2;
    const size = level === 1 ? fontSize * 1.6 : level === 2 ? fontSize * 1.3 : fontSize * 1.15;
    return (
      <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: size, color: '#2F4156', marginTop: 20, marginBottom: 8, lineHeight: size * 1.2 }}>
        {renderInline(b.content)}
      </Text>
    );
  }
  if (b.type === 'blockquote') { /* … */ }
  if (b.type === 'bulletList' || b.type === 'orderedList') { /* … */ }
  // default paragraph
  return (
    <Text style={{
      fontFamily: 'CormorantGaramond_400Regular',
      fontSize, lineHeight, color: '#2F4156',
      marginBottom: fontSize * 0.9,
      // first-paragraph-of-page detection done by caller; for design fidelity each <Text> uses no text-indent in RN
    }}>
      {renderInline(b.content)}
    </Text>
  );
}
```

(Note: React Native `<Text>` does not support CSS `text-indent`. To approximate the design, insert a leading `'　'` ideographic space — wide indent — to all paragraphs except the first of each page. Decide during implementation if this is worth the visual fidelity.)

**Progress save** debounced on page change:

```tsx
useEffect(() => {
  if (!pages) return;
  const t = setTimeout(() => {
    saveProgress.mutate({ storyId: story.id, chapterId: chapter.id, pageIndex: pageIdx });
  }, 400);
  return () => clearTimeout(t);
}, [pageIdx, pages]);
```

## Testing Checklist

- [ ] Open a chapter — measurement runs once, content renders paginated
- [ ] Tap right zone — page advances with fade
- [ ] Tap left zone — page goes back
- [ ] Tap center — top + bottom chrome fade in / out together
- [ ] Aa button opens settings popover; tapping outside closes it
- [ ] Selecting a font size re-paginates and persists across app restart
- [ ] Bookmark icon adds a bookmark on the current page; chip appears in bottom strip
- [ ] Tapping a bookmark chip jumps to that page
- [ ] Long-pressing a bookmark chip deletes it
- [ ] Closing and reopening a chapter restores to the saved page
- [ ] Reaching the last page shows "Up next" card with next chapter title
- [ ] Tapping continue on the next-chapter card loads next chapter at page 1
- [ ] Last chapter shows "End of story" card with back-to-story action
- [ ] Re-pagination handles font-size change without crashing or losing place
- [ ] Empty chapter (no content) shows a graceful placeholder, not a blank screen
- [ ] Single very-long block (taller than viewport) renders on its own page (acceptable overflow for v1)

## Dependencies

- Required packages: none new — uses existing `react-native`, `lucide-react-native`, existing TipTap JSON shape
- Required APIs: Supabase `reading_progress` + `bookmarks` tables (new `page_index` columns)
- Blocked by: SQL migration must run in Supabase before deploying client changes

## Notes for Implementation Agent

- **Do not** delete the `scroll_position` column or stop writing it yet — keep dual-writing during this task. Plan a v2 migration to drop it once we're confident.
- The `Reader` component must measure inside a layout-stable container — use `onLayout` on the outer `View` to get `viewportHeight` (subtract top chrome ~64 and bottom chrome ~72 to derive content height).
- Animations should use `useNativeDriver: true` for opacity to avoid jank on Android.
- The "tap center toggles chrome" zone must sit *above* the prev/next zones in the JSX tree so taps in the middle 40% are caught before the side zones. Use `Pressable` with explicit `style={{ position: 'absolute', … }}` and stack order.
- Settings popover on tap outside: wrap the visible chrome with a transparent backdrop `Pressable` that closes the popover but does not interfere with page-flip taps when the popover is closed.
- When font size changes, set `pages = null` to trigger a fresh measurement pass; cache the "current block id" before changing so you can re-locate the user after re-pagination.
- Watch for stale `useSaveProgress` mutations on rapid page flips — debounce by 400ms or use a ref-tracked latest pageIdx.
- Cormorant Garamond's `CormorantGlyphs_400Regular` is *not* the right font for body text — keep using `CormorantGaramond_400Regular`. Only the brand name uses Glyphs.

## Related

- Design reference: `C:\Users\Ericka Dichon\Downloads\Novella App\novella-screens-b.jsx` (Reader function, lines 178–292)
- Design styles: `C:\Users\Ericka Dichon\Downloads\Novella App\novella-styles.css` (`.reader-page` block, lines 340–352)
- Related setting row stub: [app/(tabs)/profile.tsx](app/(tabs)/profile.tsx) — "Reading preferences" entry
- Companion to the existing chapter editor at [app/story/[id]/chapter/[chapterId]/edit.tsx](app/story/[id]/chapter/[chapterId]/edit.tsx)
