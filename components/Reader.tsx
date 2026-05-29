import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Bookmark as BookmarkIcon, ChevronLeft, Type as TypeIcon } from 'lucide-react-native';
import {
  useAddBookmark,
  useBookmarks,
  useDeleteBookmark,
  useProgress,
  useSaveProgress,
} from '../lib/queries/chapters';
import { useAuth } from '../lib/auth';
import type { ChapterRow } from '../lib/database.types';
import { Paginator } from './reader/Paginator';
import { NextChapterCard } from './reader/NextChapterCard';
import { SettingsPopover } from './reader/SettingsPopover';
import { parseTipTap, renderBlock, type Block, type FontFamily } from './reader/renderBlocks';

const PAGE_PAD_H = 28;
const PAGE_PAD_V = 24;
const TOP_CHROME = 64;
const BOTTOM_CHROME = 96;
const FADE_DURATION = 140;

type ReaderProps = {
  chapter: ChapterRow;
  storyId: string;
  storyTitle?: string;
  nextChapter?: ChapterRow | null;
  onExit: () => void;
  onOpenChapter?: (chapterId: string) => void;
};

export function Reader({
  chapter,
  storyId,
  storyTitle,
  nextChapter,
  onExit,
  onOpenChapter,
}: ReaderProps) {
  const { profile, updateProfile } = useAuth();
  const saveProgress = useSaveProgress();
  const { data: progress } = useProgress(storyId);
  const { data: bookmarks } = useBookmarks(chapter.id);
  const addBookmark = useAddBookmark(chapter.id);
  const deleteBookmark = useDeleteBookmark(chapter.id);

  const blocks = useMemo<Block[]>(() => parseTipTap(chapter.content), [chapter.content]);

  const [fontSize, setFontSize] = useState(profile.readingFontSize);
  const [lineSpacing, setLineSpacing] = useState(profile.readingLineSpacing);
  const [fontFamily, setFontFamily] = useState<FontFamily>(profile.readingFont);
  const [readingMode, setReadingMode] = useState<'pages' | 'scroll'>(profile.readingMode);
  const [pages, setPages] = useState<Block[][] | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [restored, setRestored] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const restoreTargetBlockRef = useRef<number | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const chromeAnim = useRef(new Animated.Value(1)).current;

  // ── chrome animation ─────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(chromeAnim, {
      toValue: chromeVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [chromeVisible, chromeAnim]);

  // ── reset pagination when relevant props change ───────────────────────────
  useEffect(() => {
    setPages(null);
    setRestored(false);
  }, [chapter.id, fontSize, lineSpacing, fontFamily, containerSize?.w, containerSize?.h]);

  useEffect(() => {
    setRestored(false);
  }, [readingMode]);

  // ── restore progress once pagination is ready (pages mode) ───────────────
  useEffect(() => {
    if (readingMode !== 'pages') return;
    if (!pages || restored) return;
    if (progress?.chapter_id === chapter.id && typeof progress.page_index === 'number') {
      setPageIdx(Math.min(progress.page_index, Math.max(0, pages.length - 1)));
    } else {
      setPageIdx(0);
    }
    setRestored(true);
  }, [pages, progress, chapter.id, restored, readingMode]);

  // ── restore scroll position (scroll mode) ────────────────────────────────
  useEffect(() => {
    if (readingMode !== 'scroll') return;
    if (restored) return;
    const y = progress?.chapter_id === chapter.id ? (progress.scroll_position ?? 0) : 0;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
    }, 100);
    setRestored(true);
  }, [readingMode, progress, chapter.id, restored]);

  // ── re-pagination font-change: restore block position ────────────────────
  useEffect(() => {
    if (!pages || restoreTargetBlockRef.current == null) return;
    const targetBlock = restoreTargetBlockRef.current;
    restoreTargetBlockRef.current = null;
    let cumulative = 0;
    for (let i = 0; i < pages.length; i++) {
      if (targetBlock < cumulative + pages[i].length) {
        setPageIdx(i);
        return;
      }
      cumulative += pages[i].length;
    }
    setPageIdx(Math.max(0, pages.length - 1));
  }, [pages]);

  // ── persist page progress — pages mode ───────────────────────────────────
  useEffect(() => {
    if (readingMode !== 'pages') return;
    if (!pages || !restored) return;
    if (pageIdx >= pages.length) return;
    const t = setTimeout(() => {
      saveProgress.mutate({ storyId, chapterId: chapter.id, pageIndex: pageIdx });
    }, 400);
    return () => clearTimeout(t);
  }, [pageIdx, pages, restored, storyId, chapter.id, readingMode, saveProgress]);

  // ── container layout ──────────────────────────────────────────────────────
  const onContainerLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!containerSize || containerSize.w !== width || containerSize.h !== height) {
      setContainerSize({ w: width, h: height });
    }
  };

  // ── pages mode helpers ────────────────────────────────────────────────────
  const totalContentPages = pages?.length ?? 0;
  const onNextCard = pageIdx >= totalContentPages;

  const fadeTo = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: FADE_DURATION, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: FADE_DURATION, useNativeDriver: true }),
    ]).start();
    setPageIdx(next);
  };

  const goNext = () => {
    if (!pages) return;
    if (pageIdx < totalContentPages) fadeTo(pageIdx + 1);
  };

  const goPrev = () => {
    if (!pages) return;
    if (pageIdx > 0) fadeTo(pageIdx - 1);
  };

  const jumpToPage = (idx: number) => {
    if (!pages) return;
    fadeTo(Math.max(0, Math.min(idx, totalContentPages)));
  };

  // ── scroll mode helpers ───────────────────────────────────────────────────
  const lastScrollSaveRef = useRef(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollYRef.current = y;
    const now = Date.now();
    if (now - lastScrollSaveRef.current > 1200) {
      lastScrollSaveRef.current = now;
      saveProgress.mutate({ storyId, chapterId: chapter.id, pageIndex: 0, scrollPosition: y });
    }
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollYRef.current = y;
    saveProgress.mutate({ storyId, chapterId: chapter.id, pageIndex: 0, scrollPosition: y });
  };

  // ── chrome toggle ─────────────────────────────────────────────────────────
  const toggleChrome = () => {
    if (showSettings) {
      setShowSettings(false);
      return;
    }
    setChromeVisible((v) => !v);
  };

  // ── bookmarks ─────────────────────────────────────────────────────────────
  const promptBookmark = () => {
    const doAdd = (note?: string) => {
      if (readingMode === 'scroll') {
        addBookmark.mutate({ scrollPosition: scrollYRef.current, note });
      } else {
        addBookmark.mutate({ pageIndex: pageIdx, note });
      }
    };
    if (Platform.OS === 'ios' && typeof Alert.prompt === 'function') {
      Alert.prompt('Add bookmark', 'Optional note', (note) => doAdd(note ?? undefined), 'plain-text');
    } else {
      doAdd();
    }
  };

  const jumpToBookmark = (b: { page_index: number | null; scroll_position: number }) => {
    if (readingMode === 'scroll') {
      scrollRef.current?.scrollTo({ y: b.scroll_position, animated: true });
    } else {
      jumpToPage(b.page_index ?? 0);
    }
  };

  // ── settings changes ──────────────────────────────────────────────────────
  const captureBlockPosition = () => {
    if (readingMode === 'pages' && pages && pages[pageIdx]) {
      let cumulative = 0;
      for (let i = 0; i < pageIdx; i++) cumulative += pages[i].length;
      restoreTargetBlockRef.current = cumulative;
    }
  };

  const onChangeFontSize = (size: number) => {
    if (size === fontSize) return;
    captureBlockPosition();
    setFontSize(size);
    updateProfile({ readingFontSize: size }).catch(() => {});
  };

  const onChangeLineSpacing = (spacing: number) => {
    if (spacing === lineSpacing) return;
    captureBlockPosition();
    setLineSpacing(spacing);
    updateProfile({ readingLineSpacing: spacing }).catch(() => {});
  };

  const onChangeFontFamily = (family: FontFamily) => {
    if (family === fontFamily) return;
    captureBlockPosition();
    setFontFamily(family);
    updateProfile({ readingFont: family }).catch(() => {});
  };

  const onChangeReadingMode = (mode: 'pages' | 'scroll') => {
    if (mode === readingMode) return;
    setReadingMode(mode);
    updateProfile({ readingMode: mode }).catch(() => {});
    setShowSettings(false);
  };

  const onContinueNextChapter = () => {
    if (nextChapter && onOpenChapter) onOpenChapter(nextChapter.id);
  };

  // ── derived layout ────────────────────────────────────────────────────────
  const viewportHeight = containerSize
    ? Math.max(120, containerSize.h - TOP_CHROME - BOTTOM_CHROME - PAGE_PAD_V * 2)
    : 0;
  const contentWidth = containerSize ? containerSize.w - PAGE_PAD_H * 2 : 0;
  const lineHeight = fontSize * lineSpacing;
  const typoOpts = { fontSize, lineHeight, fontFamily };

  const pageLabel = pages
    ? onNextCard
      ? `Page ${totalContentPages + 1} of ${totalContentPages + 1}`
      : `Page ${pageIdx + 1} of ${totalContentPages + 1}`
    : '';
  const percentage =
    pages && pages.length > 0
      ? Math.round(((Math.min(pageIdx + 1, totalContentPages + 1)) / (totalContentPages + 1)) * 100)
      : 0;

  const chapterTitle = chapter.title || 'Chapter';

  // ── top/bottom chrome (shared) ────────────────────────────────────────────
  const topChrome = (
    <Animated.View
      pointerEvents={chromeVisible ? 'box-none' : 'none'}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: TOP_CHROME,
        opacity: chromeAnim,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: 'rgba(245,239,235,0.97)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(47,65,86,0.10)',
      }}
    >
      <Pressable
        onPress={onExit}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronLeft size={22} color="rgba(47,65,86,0.65)" />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
        {storyTitle ? (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Inter_500Medium', fontSize: 10,
              letterSpacing: 1.6, textTransform: 'uppercase',
              color: 'rgba(47,65,86,0.42)',
            }}
          >
            {storyTitle}
          </Text>
        ) : null}
        <Text
          numberOfLines={1}
          style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 16, color: '#2F4156', marginTop: 2 }}
        >
          {chapterTitle}
        </Text>
      </View>
      <Pressable
        onPress={promptBookmark}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <BookmarkIcon size={18} color="rgba(47,65,86,0.65)" />
      </Pressable>
      <Pressable
        onPress={() => { setShowSettings((s) => !s); setChromeVisible(true); }}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <TypeIcon size={18} color="rgba(47,65,86,0.65)" />
      </Pressable>
    </Animated.View>
  );

  const bottomChrome = (
    <Animated.View
      pointerEvents={chromeVisible ? 'box-none' : 'none'}
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: BOTTOM_CHROME,
        opacity: chromeAnim,
        backgroundColor: 'rgba(245,239,235,0.97)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(47,65,86,0.10)',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      {/* Segmented progress bar — pages mode only */}
      {readingMode === 'pages' && pages ? (
        <>
          <View style={{ flexDirection: 'row', gap: 3, marginBottom: 8 }}>
            {Array.from({ length: totalContentPages + 1 }).map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1, height: 3, borderRadius: 2,
                  backgroundColor: i <= pageIdx ? '#2F4156' : 'rgba(47,65,86,0.15)',
                }}
              />
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={counterText}>{pageLabel}</Text>
            <Text style={counterText}>{percentage}%</Text>
          </View>
        </>
      ) : null}

      {/* Bookmarks strip */}
      {bookmarks && bookmarks.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: readingMode === 'pages' ? 8 : 0 }}
          contentContainerStyle={{ paddingRight: 8 }}
        >
          {bookmarks.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => jumpToBookmark(b)}
              onLongPress={() => deleteBookmark.mutate(b.id)}
              style={{
                backgroundColor: 'rgba(47,65,86,0.08)',
                borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8,
              }}
            >
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#2F4156' }}>
                {b.note
                  ? b.note
                  : readingMode === 'scroll'
                    ? `@${Math.round(b.scroll_position)}`
                    : `p.${(b.page_index ?? 0) + 1}`}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </Animated.View>
  );

  const settingsOverlay = showSettings ? (
    <>
      <Pressable
        onPress={() => setShowSettings(false)}
        style={{ position: 'absolute', top: TOP_CHROME, left: 0, right: 0, bottom: 0 }}
      />
      <SettingsPopover
        fontSize={fontSize}
        lineSpacing={lineSpacing}
        fontFamily={fontFamily}
        readingMode={readingMode}
        onChangeFontSize={onChangeFontSize}
        onChangeLineSpacing={onChangeLineSpacing}
        onChangeFontFamily={onChangeFontFamily}
        onChangeReadingMode={onChangeReadingMode}
      />
    </>
  ) : null;

  // ── scroll mode render ────────────────────────────────────────────────────
  if (readingMode === 'scroll') {
    return (
      <View onLayout={onContainerLayout} style={{ flex: 1, backgroundColor: '#F5EFEB' }}>
        <ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          onMomentumScrollEnd={onScrollEnd}
          onScrollEndDrag={onScrollEnd}
          scrollEventThrottle={32}
          contentContainerStyle={{
            paddingHorizontal: PAGE_PAD_H,
            paddingTop: TOP_CHROME + PAGE_PAD_V,
            paddingBottom: BOTTOM_CHROME + PAGE_PAD_V,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={toggleChrome}>
            {blocks.length === 0 ? (
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_400Regular_Italic',
                  fontSize: 18, color: 'rgba(47,65,86,0.55)', textAlign: 'center', marginTop: 40,
                }}
              >
                This chapter is empty.
              </Text>
            ) : (
              blocks.map((b, i) => renderBlock(b, i, typoOpts))
            )}
            {nextChapter ? (
              <View
                style={{
                  marginTop: 40,
                  borderTopWidth: 1, borderTopColor: 'rgba(47,65,86,0.12)',
                  paddingTop: 32, alignItems: 'center',
                }}
              >
                <Text style={{
                  fontFamily: 'Inter_500Medium', fontSize: 10,
                  letterSpacing: 2.2, textTransform: 'uppercase',
                  color: 'rgba(47,65,86,0.42)', marginBottom: 8,
                }}>
                  Up next
                </Text>
                <Pressable
                  onPress={onContinueNextChapter}
                  style={{
                    paddingHorizontal: 22, paddingVertical: 12,
                    borderRadius: 999, backgroundColor: '#2F4156',
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                  }}
                >
                  <Text style={{
                    fontFamily: 'CormorantGaramond_500Medium',
                    fontSize: 17, color: '#F5EFEB',
                  }}>
                    {nextChapter.title}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ marginTop: 40, alignItems: 'center' }}>
                <Text style={{
                  fontFamily: 'CormorantGaramond_400Regular_Italic',
                  fontSize: 18, color: 'rgba(47,65,86,0.45)',
                }}>
                  End of story.
                </Text>
              </View>
            )}
          </Pressable>
        </ScrollView>

        {topChrome}
        {bottomChrome}
        {settingsOverlay}
      </View>
    );
  }

  // ── pages mode render ─────────────────────────────────────────────────────
  return (
    <View onLayout={onContainerLayout} style={{ flex: 1, backgroundColor: '#F5EFEB' }}>
      {/* Measurement layer */}
      {containerSize && !pages && blocks.length > 0 ? (
        <Paginator
          blocks={blocks}
          fontSize={fontSize}
          lineHeight={lineHeight}
          fontFamily={fontFamily}
          viewportHeight={viewportHeight}
          contentWidth={contentWidth}
          onPaginated={setPages}
        />
      ) : null}

      {/* Empty chapter fallback */}
      {pages && pages.length === 0 && !onNextCard ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{
            fontFamily: 'CormorantGaramond_400Regular_Italic',
            fontSize: 18, color: 'rgba(47,65,86,0.55)', textAlign: 'center',
          }}>
            This chapter is empty.
          </Text>
        </View>
      ) : null}

      {/* Page content */}
      {containerSize ? (
        <Animated.View
          style={{
            position: 'absolute',
            top: TOP_CHROME, left: 0, right: 0, bottom: BOTTOM_CHROME,
            paddingHorizontal: PAGE_PAD_H, paddingVertical: PAGE_PAD_V,
            opacity: fadeAnim,
          }}
          pointerEvents="box-none"
        >
          {onNextCard ? (
            <NextChapterCard
              nextChapter={nextChapter ?? null}
              onContinue={onContinueNextChapter}
              onExit={onExit}
            />
          ) : pages && pages[pageIdx] ? (
            pages[pageIdx].map((b, i) => renderBlock(b, i, typoOpts))
          ) : null}
        </Animated.View>
      ) : null}

      {/* Tap zones */}
      <Pressable
        onPress={goPrev}
        style={{ position: 'absolute', left: 0, top: TOP_CHROME, bottom: BOTTOM_CHROME, width: '30%' }}
      />
      <Pressable
        onPress={goNext}
        style={{ position: 'absolute', right: 0, top: TOP_CHROME, bottom: BOTTOM_CHROME, width: '30%' }}
      />
      <Pressable
        onPress={toggleChrome}
        style={{ position: 'absolute', left: '30%', right: '30%', top: TOP_CHROME, bottom: BOTTOM_CHROME }}
      />

      {topChrome}
      {bottomChrome}
      {settingsOverlay}
    </View>
  );
}

const counterText = {
  fontFamily: 'Inter_500Medium',
  fontSize: 10,
  letterSpacing: 1.6,
  textTransform: 'uppercase' as const,
  color: 'rgba(47,65,86,0.55)',
};
