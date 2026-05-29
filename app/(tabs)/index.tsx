import { useEffect, useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { PenLine, BookOpen, TrendingUp, Sparkles } from 'lucide-react-native';
import { useStories, useStory } from '../../lib/queries/stories';
import {
  useChapter,
  useChapters,
  useRecentProgress,
  useAllProgress,
  useTotalChapterCount,
} from '../../lib/queries/chapters';
import { useAuth } from '../../lib/auth';
import { getAvatarUrl } from '../../lib/storage';
import { StoryCover } from '../../components/StoryCover';
import { useReadingList } from '../../lib/queries/reading_list';
import { BookMarked } from 'lucide-react-native';

const COVER_TONES = ['beige', 'sky', 'navy', 'paper'] as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const { data: stories } = useStories();
  const { data: totalChapters } = useTotalChapterCount();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    getAvatarUrl(profile.avatarPath).then(setAvatarUrl);
  }, [profile.avatarPath]);

  const fallbackName = session?.user.email?.split('@')[0] ?? 'Writer';
  const displayName = profile.displayName || (fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1));

  // ── Continue writing ────────────────────────────────────────────────────
  const recentStory = stories?.[0];
  const coverTone = recentStory ? COVER_TONES[stories!.indexOf(recentStory) % 4] : 'beige';

  // ── Continue reading ────────────────────────────────────────────────────
  const { data: recentProgress } = useRecentProgress();
  const { data: allProgress } = useAllProgress();
  const { data: progressStory } = useStory(recentProgress?.story_id);
  const { data: progressChapter } = useChapter(recentProgress?.chapter_id);
  const { data: progressChapters } = useChapters(recentProgress?.story_id);

  const hasProgress = !!(recentProgress && progressStory && progressChapter && progressChapters?.length);
  const progressPct = hasProgress
    ? Math.min(100, Math.round(((progressChapter!.order_index + 1) / progressChapters!.length) * 100))
    : 0;
  const progressCoverTone = progressStory && stories
    ? COVER_TONES[(stories.findIndex((s) => s.id === progressStory.id) + 1) % 4]
    : 'sky';
  const pageLabel = recentProgress && recentProgress.page_index > 0
    ? ` · page ${recentProgress.page_index + 1}`
    : '';

  // ── Recent — merge written + read + library, sorted by most recent ─────
  const { data: readingList } = useReadingList();
  const inLibraryAt = new Map(
    (readingList ?? []).map((r) => [r.story_id, r.added_at])
  );
  const progressByStory = new Map(
    (allProgress ?? []).map((p) => [p.story_id, p.updated_at])
  );
  const interacted = (stories ?? []).map((s) => {
    const readAt = progressByStory.get(s.id);
    const libAt = inLibraryAt.get(s.id);
    const candidates = [s.updated_at, readAt, libAt].filter(Boolean) as string[];
    const lastAt = candidates.reduce((a, b) => (a > b ? a : b));
    const inLibrary = !!libAt;
    const hasRead = !!readAt;
    return { story: s, lastAt, hasRead, inLibrary };
  });
  interacted.sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));

  // Exclude the top-card stories so they don't repeat in Recent
  const excludeIds = new Set([recentStory?.id, recentProgress?.story_id].filter(Boolean) as string[]);
  const recentItems = interacted.filter((x) => !excludeIds.has(x.story.id)).slice(0, 4);

  return (
    <SafeAreaView className="flex-1 bg-beige" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(47,65,86,0.08)',
          paddingBottom: 16,
        }}>
          <View className="flex-row items-start justify-between px-5 pt-4 pb-2">
            <View>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
                {greeting()}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 36, lineHeight: 38, color: '#2F4156' }}>
                  {displayName}
                </Text>
                <Sparkles size={20} color="#C8D9E6" />
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/profile')}
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: '#C8D9E6',
                alignItems: 'center', justifyContent: 'center',
                marginTop: 6, overflow: 'hidden',
              }}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40 }} contentFit="cover" />
              ) : (
                <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: '#2F4156' }}>
                  {displayName.charAt(0)}
                </Text>
              )}
            </Pressable>
          </View>

          {/* Today's intention */}
          <View style={{ marginHorizontal: 20, marginTop: 12, paddingLeft: 14, position: 'relative' }}>
            <View style={{ position: 'absolute', left: 0, top: 2, bottom: 2, width: 2, backgroundColor: '#567C8D', borderRadius: 1 }} />
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 4 }}>
              Today
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 18, lineHeight: 24, color: '#2F4156' }}>
              A single good paragraph is a fine day's work.
            </Text>
          </View>
        </View>

        {/* ── Continue writing ─────────────────────────────────────── */}
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginLeft: 20, marginTop: 28, marginBottom: 10 }}>
          Continue writing
        </Text>

        {recentStory ? (
          <Pressable
            onPress={() => router.push(`/story/${recentStory.id}`)}
            style={{
              marginHorizontal: 20,
              backgroundColor: '#FAF6F2',
              borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
              padding: 18,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <StoryCover coverPath={recentStory.cover_url} tone={coverTone} title={recentStory.title} size="sm" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 4 }}>
                  {recentStory.status === 'draft' ? 'Draft' : recentStory.status}
                </Text>
                <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 22, lineHeight: 24, color: '#2F4156', marginBottom: 4 }}>
                  {recentStory.title}
                </Text>
                {recentStory.description ? (
                  <Text numberOfLines={2} style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(47,65,86,0.65)', lineHeight: 18 }}>
                    {recentStory.description}
                  </Text>
                ) : null}
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 4 }}>
                  {timeAgo(recentStory.updated_at)}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push(`/story/${recentStory.id}`)}
              style={{
                marginTop: 14, backgroundColor: '#2F4156',
                borderRadius: 999, paddingVertical: 12,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <PenLine size={14} color="#F5EFEB" />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: '#F5EFEB' }}>
                Continue
              </Text>
            </Pressable>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/story/new')}
            style={{
              marginHorizontal: 20, backgroundColor: '#FAF6F2',
              borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
              padding: 24, alignItems: 'center', gap: 10,
            }}
          >
            <PenLine size={24} color="rgba(47,65,86,0.42)" />
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 20, color: '#2F4156' }}>
              Start your first story
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(47,65,86,0.65)', textAlign: 'center' }}>
              Every novel begins with a single sentence.
            </Text>
          </Pressable>
        )}

        {/* ── Continue reading ─────────────────────────────────────── */}
        {hasProgress ? (
          <>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginLeft: 20, marginTop: 28, marginBottom: 10 }}>
              Continue reading
            </Text>
            <Pressable
              onPress={() => router.push(`/story/${progressStory!.id}/chapter/${progressChapter!.id}/read`)}
              style={{
                marginHorizontal: 20,
                backgroundColor: '#FAF6F2',
                borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
                padding: 18,
              }}
            >
              <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                <StoryCover
                  coverPath={progressStory!.cover_url}
                  tone={progressCoverTone}
                  title={progressStory!.title}
                  size="sm"
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 4 }}>
                    You're {progressPct}% through
                  </Text>
                  <Text numberOfLines={2} style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 22, lineHeight: 24, color: '#2F4156', marginBottom: 4 }}>
                    {progressStory!.title}
                  </Text>
                  <Text numberOfLines={1} style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(47,65,86,0.55)', lineHeight: 16 }}>
                    {progressChapter!.title}{pageLabel}
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 16, height: 3, backgroundColor: 'rgba(47,65,86,0.10)', borderRadius: 2, overflow: 'hidden' }}>
                <View style={{ width: `${progressPct}%`, height: '100%', backgroundColor: '#567C8D', borderRadius: 2 }} />
              </View>
            </Pressable>
          </>
        ) : null}

        {/* ── Stats row ────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 24 }}>
          <View style={{ flex: 1, backgroundColor: '#FAF6F2', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)', padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
                Stories
              </Text>
              <TrendingUp size={14} color="#567C8D" />
            </View>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 36, color: '#2F4156', lineHeight: 42, marginTop: 8 }}>
              {stories?.length ?? 0}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 2 }}>
              in your library
            </Text>
          </View>

          <View style={{ flex: 1, backgroundColor: '#FAF6F2', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)', padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
                Chapters
              </Text>
              <BookOpen size={14} color="#567C8D" />
            </View>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 36, color: '#2F4156', lineHeight: 42, marginTop: 8 }}>
              {totalChapters ?? 0}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 2 }}>
              written so far
            </Text>
          </View>
        </View>

        {/* ── Recent ───────────────────────────────────────────────── */}
        {recentItems.length > 0 && (
          <>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginLeft: 20, marginTop: 28, marginBottom: 12 }}>
              Recent
            </Text>
            <View style={{ marginHorizontal: 20 }}>
              {recentItems.map(({ story, hasRead, inLibrary, lastAt }, i) => {
                const isReading = hasRead;
                const isWriting = !isReading;
                const icon = isReading
                  ? <BookOpen size={14} color="#567C8D" />
                  : inLibrary
                    ? <BookMarked size={14} color="#567C8D" />
                    : <PenLine size={14} color="rgba(47,65,86,0.65)" />;
                const iconBg = (isReading || inLibrary)
                  ? 'rgba(86,124,141,0.12)'
                  : 'rgba(47,65,86,0.10)';
                const sublabel = isReading
                  ? 'Reading'
                  : inLibrary
                    ? 'In library'
                    : 'Writing';
                return (
                  <Pressable
                    key={story.id}
                    onPress={() => router.push(`/story/${story.id}`)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                      paddingVertical: 12,
                      borderBottomWidth: i < recentItems.length - 1 ? 1 : 0,
                      borderBottomColor: 'rgba(47,65,86,0.10)',
                    }}
                  >
                    <View style={{
                      width: 32, height: 32, borderRadius: 16,
                      backgroundColor: iconBg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {icon}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#2F4156' }}>
                        {story.title}
                      </Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 2 }}>
                        {sublabel} · {timeAgo(lastAt)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
