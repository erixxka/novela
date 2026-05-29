import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Grid2X2, List, X, Plus, Star, BookMarked } from 'lucide-react-native';
import { useStories, useToggleFavorite } from '../../lib/queries/stories';
import { useAllProgress } from '../../lib/queries/chapters';
import { useSearch } from '../../lib/queries/search';
import { useReadingList, useToggleReadingList } from '../../lib/queries/reading_list';
import { StoryCover } from '../../components/StoryCover';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  'on-going': 'On-going',
  hiatus: 'Hiatus',
  completed: 'Completed',
  published: 'Published',
};

const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  draft:      { bg: 'rgba(47,65,86,0.10)',   color: 'rgba(47,65,86,0.60)' },
  'on-going': { bg: 'rgba(86,141,103,0.14)', color: '#3D7A57' },
  hiatus:     { bg: 'rgba(196,153,74,0.14)', color: '#9A6B1A' },
  completed:  { bg: 'rgba(86,124,141,0.14)', color: '#567C8D' },
  published:  { bg: 'rgba(86,124,141,0.14)', color: '#567C8D' },
};

const COVER_TONES = ['beige', 'sky', 'navy', 'paper'] as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function LibraryScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'writing' | 'reading'>('writing');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');

  const { data: stories, isLoading, error, refetch, isRefetching } = useStories();
  const { data: searchResults, isLoading: searchLoading } = useSearch(q);
  const toggleFavorite = useToggleFavorite();

  const { data: readingList } = useReadingList();
  const toggleReadingList = useToggleReadingList();
  const { data: allProgress } = useAllProgress();

  const readingListIds = new Set((readingList ?? []).map((r) => r.story_id));
  const progressByStory = new Map((allProgress ?? []).map((p) => [p.story_id, p]));

  const showSearch = searching && q.trim().length >= 2;

  return (
    <SafeAreaView className="flex-1 bg-beige" edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        {searching ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{
              flex: 1, flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#FAF6F2', borderRadius: 12,
              borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
              paddingHorizontal: 12, paddingVertical: 8, gap: 8,
            }}>
              <Search size={16} color="rgba(47,65,86,0.42)" />
              <TextInput
                value={q}
                onChangeText={setQ}
                placeholder="Search stories and chapters…"
                placeholderTextColor="rgba(47,65,86,0.42)"
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2F4156' }}
              />
            </View>
            <Pressable onPress={() => { setSearching(false); setQ(''); }}>
              <X size={20} color="rgba(47,65,86,0.65)" />
            </Pressable>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, color: '#2F4156', lineHeight: 32 }}>
              Library
            </Text>
            <View style={{ flexDirection: 'row', gap: 2 }}>
              <Pressable onPress={() => router.push('/story/new')} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={20} color="rgba(47,65,86,0.65)" />
              </Pressable>
              <Pressable onPress={() => setSearching(true)} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Search size={18} color="rgba(47,65,86,0.65)" />
              </Pressable>
              {mode === 'writing' && (
                <Pressable onPress={() => setView(v => v === 'grid' ? 'list' : 'grid')} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  {view === 'grid'
                    ? <List size={18} color="rgba(47,65,86,0.65)" />
                    : <Grid2X2 size={18} color="rgba(47,65,86,0.65)" />}
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Mode toggle */}
      {!searching && (
        <View style={{
          marginHorizontal: 20, marginTop: 14,
          backgroundColor: '#FAF6F2',
          borderRadius: 999, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
          padding: 4, flexDirection: 'row',
        }}>
          {(['writing', 'reading'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 999,
                backgroundColor: mode === m ? '#2F4156' : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase',
                color: mode === m ? '#F5EFEB' : 'rgba(47,65,86,0.42)',
              }}>
                {m === 'writing'
                  ? `My novels · ${stories?.length ?? 0}`
                  : `Reading · ${readingList?.length ?? 0}`}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Search results */}
      {searching && (
        <>
          {q.trim().length < 2 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.42)', textAlign: 'center' }}>
                Type at least 2 characters to search.
              </Text>
            </View>
          ) : searchLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#567C8D" />
            </View>
          ) : !searchResults || searchResults.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.42)' }}>
                No matches found.
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(r) => `${r.story_id}-${r.chapter_id}`}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: 'rgba(47,65,86,0.10)' }} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/story/${item.story_id}/chapter/${item.chapter_id}/read`)}
                  style={{ paddingVertical: 14 }}
                >
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#567C8D', marginBottom: 2 }}>
                    {item.story_title}
                  </Text>
                  <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: '#2F4156', lineHeight: 22 }}>
                    {item.chapter_title}
                  </Text>
                  {item.snippet ? (
                    <Text numberOfLines={2} style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(47,65,86,0.65)', marginTop: 4, lineHeight: 18 }}>
                      {item.snippet.replace(/<[^>]+>/g, '')}
                    </Text>
                  ) : null}
                </Pressable>
              )}
            />
          )}
        </>
      )}

      {/* ── Writing mode ──────────────────────────────────────────── */}
      {!searching && mode === 'writing' && (
        <>
          {isLoading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#567C8D" />
            </View>
          ) : error ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: '#ef4444', textAlign: 'center', fontFamily: 'Inter_400Regular' }}>
                {(error as Error).message}
              </Text>
            </View>
          ) : view === 'grid' ? (
            <FlatList
              data={stories ?? []}
              keyExtractor={(s) => s.id}
              numColumns={2}
              contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 100 }}
              columnWrapperStyle={{ gap: 14 }}
              refreshing={isRefetching}
              onRefresh={refetch}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
                  <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 22, color: '#2F4156', textAlign: 'center', marginBottom: 8 }}>
                    Your library is empty.
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.42)', textAlign: 'center' }}>
                    Tap New novel above to get started.
                  </Text>
                </View>
              }
              renderItem={({ item, index }) => {

                return (
                  <Pressable onPress={() => router.push(`/story/${item.id}`)} style={{ flex: 1, marginBottom: 20 }}>
                    <View style={{ position: 'relative' }}>
                      <StoryCover coverPath={item.cover_url} tone={COVER_TONES[index % 4]} title={item.title} index={index} />
                      {/* Favorite */}
                      <Pressable
                        onPress={() => toggleFavorite.mutate({ id: item.id, current: (item as any).is_favorite ?? false })}
                        style={{
                          position: 'absolute', top: 7, right: 7,
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: 'rgba(47,65,86,0.45)',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Star
                          size={13}
                          color={(item as any).is_favorite ? '#F5C842' : '#F5EFEB'}
                          fill={(item as any).is_favorite ? '#F5C842' : 'transparent'}
                        />
                      </Pressable>
                    </View>
                    <Text numberOfLines={2} style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 17, color: '#2F4156', lineHeight: 20, marginTop: 10 }}>
                      {item.title}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      <View style={{ backgroundColor: (STATUS_PILL[item.status] ?? STATUS_PILL.draft).bg, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
                        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: (STATUS_PILL[item.status] ?? STATUS_PILL.draft).color }}>
                          {STATUS_LABELS[item.status] ?? item.status}
                        </Text>
                      </View>
                      {item.genre ? (
                        <View style={{ backgroundColor: 'rgba(86,124,141,0.12)', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: '#567C8D' }}>{item.genre}</Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          ) : (
            <FlatList
              data={stories ?? []}
              keyExtractor={(s) => s.id}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
              refreshing={isRefetching}
              onRefresh={refetch}
              ItemSeparatorComponent={() => <View style={{ height: 1, marginHorizontal: 20, backgroundColor: 'rgba(47,65,86,0.10)' }} />}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingTop: 60 }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.42)' }}>No stories yet.</Text>
                </View>
              }
              renderItem={({ item, index }) => {

                return (
                  <Pressable
                    onPress={() => router.push(`/story/${item.id}`)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 20 }}
                  >
                    <StoryCover coverPath={item.cover_url} tone={COVER_TONES[index % 4]} title={item.title} index={index} size="xs" />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 19, color: '#2F4156', lineHeight: 22 }}>
                        {item.title}
                      </Text>
                      {item.description ? (
                        <Text numberOfLines={1} style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(47,65,86,0.65)', marginTop: 2 }}>
                          {item.description}
                        </Text>
                      ) : null}
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                        <View style={{ backgroundColor: (STATUS_PILL[item.status] ?? STATUS_PILL.draft).bg, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
                          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: (STATUS_PILL[item.status] ?? STATUS_PILL.draft).color }}>
                            {STATUS_LABELS[item.status] ?? item.status}
                          </Text>
                        </View>
                        {item.genre ? (
                          <View style={{ backgroundColor: 'rgba(86,124,141,0.12)', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 }}>
                            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 10, color: '#567C8D' }}>{item.genre}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                    <Pressable
                      onPress={() => toggleFavorite.mutate({ id: item.id, current: (item as any).is_favorite ?? false })}
                      style={{ padding: 8 }}
                    >
                      <Star
                        size={16}
                        color={(item as any).is_favorite ? '#F5C842' : 'rgba(47,65,86,0.30)'}
                        fill={(item as any).is_favorite ? '#F5C842' : 'transparent'}
                      />
                    </Pressable>
                  </Pressable>
                );
              }}
            />
          )}
        </>
      )}

      {/* ── Reading mode ──────────────────────────────────────────── */}
      {!searching && mode === 'reading' && (
        <>
          {!readingList ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#567C8D" />
            </View>
          ) : readingList.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 22, color: '#2F4156', textAlign: 'center', marginBottom: 10 }}>
                Your reading list is empty.
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.42)', textAlign: 'center' }}>
                Tap the bookmark icon on any novel to add it here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={readingList}
              keyExtractor={(r) => r.story_id}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
              ItemSeparatorComponent={() => <View style={{ height: 1, marginHorizontal: 20, backgroundColor: 'rgba(47,65,86,0.10)' }} />}
              renderItem={({ item, index }) => {
                const story = item.stories;
                const progress = progressByStory.get(story.id);
                const pct = progress ? Math.min(100, Math.round(((progress.page_index + 1) / 10) * 100)) : 0;
                return (
                  <Pressable
                    onPress={() => router.push(
                      progress
                        ? `/story/${story.id}/chapter/${progress.chapter_id}/read`
                        : `/story/${story.id}`
                    )}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 20 }}
                  >
                    <StoryCover coverPath={story.cover_url} tone={COVER_TONES[index % 4]} title={story.title} index={index} size="xs" />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 19, color: '#2F4156', lineHeight: 22 }}>
                        {story.title}
                      </Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 2 }}>
                        {progress ? `Reading · added ${timeAgo(item.added_at)}` : `Not started · added ${timeAgo(item.added_at)}`}
                      </Text>
                      {progress ? (
                        <View style={{ marginTop: 6, height: 2, backgroundColor: 'rgba(47,65,86,0.10)', borderRadius: 1, overflow: 'hidden' }}>
                          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: '#567C8D', borderRadius: 1 }} />
                        </View>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => toggleReadingList.mutate({ storyId: story.id, inList: true })}
                      style={{ padding: 8 }}
                    >
                      <BookMarked size={16} color="#567C8D" fill="#567C8D" />
                    </Pressable>
                  </Pressable>
                );
              }}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
