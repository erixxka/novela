import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Pencil, PenLine, BookMarked, ChevronDown } from 'lucide-react-native';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  'on-going': 'On-going',
  hiatus: 'Hiatus',
  completed: 'Completed',
  published: 'Published',
};
const STATUS_ORDER = ['draft', 'on-going', 'hiatus', 'completed', 'published'] as const;
import { useStory, useStoryTags, useUpdateStory, useDeleteStory } from '../../../lib/queries/stories';
import { useChapters, useCreateChapter, useDeleteChapter } from '../../../lib/queries/chapters';
import { useReadingList, useToggleReadingList } from '../../../lib/queries/reading_list';
import { ChapterListItem } from '../../../components/ChapterListItem';
import { CoverTile, CoverTone } from '../../../components/CoverTile';
import { getCoverUrl } from '../../../lib/storage';

const COVER_TONES: CoverTone[] = ['beige', 'sky', 'navy', 'paper'];

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: story, isLoading } = useStory(id);
  const { data: tags } = useStoryTags(id);
  const { data: chapters } = useChapters(id);
  const updateStory = useUpdateStory(id!);
  const deleteStory = useDeleteStory();
  const createChapter = useCreateChapter(id!);
  const deleteChapter = useDeleteChapter(id!);

  const { data: readingList } = useReadingList();
  const toggleReadingList = useToggleReadingList();

  const [cover, setCover] = useState<string | null>(null);
  const [addingChapter, setAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const inList = readingList?.some((r) => r.story_id === story?.id) ?? false;

  const storyIndex = 0;
  const tone = COVER_TONES[storyIndex % 4];

  useEffect(() => {
    let active = true;
    getCoverUrl(story?.cover_url).then((url) => {
      if (active) setCover(url);
    });
    return () => { active = false; };
  }, [story?.cover_url]);

  if (isLoading || !story) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#567C8D" />
      </SafeAreaView>
    );
  }

  const cycleStatus = () => {
    const idx = STATUS_ORDER.indexOf(story.status as typeof STATUS_ORDER[number]);
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
    updateStory.mutate({ status: next });
  };

  const confirmDelete = () => {
    Alert.alert('Delete story?', 'This will delete all chapters too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteStory.mutateAsync(story.id);
          router.replace('/(tabs)/library');
        },
      },
    ]);
  };

  const addChapter = async () => {
    const title = newChapterTitle.trim() || `Chapter ${(chapters?.length ?? 0) + 1}`;
    const ch = await createChapter.mutateAsync(title);
    setAddingChapter(false);
    setNewChapterTitle('');
    router.push(`/story/${story.id}/chapter/${ch.id}/edit`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Nav bar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8 }}>
          <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
          </Pressable>
          <View style={{ flexDirection: 'row' }}>
            <Link href={`/story/${story.id}/edit`} asChild>
              <Pressable style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                <Pencil size={18} color="rgba(47,65,86,0.65)" />
              </Pressable>
            </Link>
            <Pressable onPress={confirmDelete} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={18} color="rgba(47,65,86,0.65)" />
            </Pressable>
          </View>
        </View>

        {/* Cover hero */}
        <View style={{ paddingHorizontal: 48, paddingTop: 8 }}>
          {cover ? (
            <View style={{
              aspectRatio: 3 / 4, borderRadius: 12, overflow: 'hidden',
              shadowColor: '#2F4156', shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25, shadowRadius: 30, elevation: 12,
            }}>
              <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            </View>
          ) : (
            <View style={{
              shadowColor: '#2F4156', shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25, shadowRadius: 30, elevation: 12,
            }}>
              <CoverTile tone={tone} title={story.title} index={storyIndex} size="full" />
            </View>
          )}
        </View>

        {/* Title + meta */}
        <View style={{ paddingHorizontal: 24, paddingTop: 28, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 30, color: '#2F4156', lineHeight: 32, textAlign: 'center', letterSpacing: -0.3 }}>
            {story.title}
          </Text>
          {story.description ? (
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: 'rgba(47,65,86,0.65)', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>
              {story.description}
            </Text>
          ) : null}
          {/* Genre + Mature badges */}
          {(story.genre || story.mature) ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              {story.genre ? (
                <View style={{ backgroundColor: 'rgba(86,124,141,0.14)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#567C8D' }}>{story.genre}</Text>
                </View>
              ) : null}
              {story.mature ? (
                <View style={{ backgroundColor: 'rgba(196,83,74,0.12)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#C4534A' }}>18+</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {tags && tags.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 10 }}>
              {tags.map((t) => (
                <View key={t.id} style={{
                  backgroundColor: 'rgba(86,124,141,0.12)',
                  borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
                }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: '#567C8D' }}>
                    {t.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* CTAs */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              style={{
                flex: 1, backgroundColor: '#2F4156', borderRadius: 999,
                paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onPress={() => {
                if (chapters && chapters.length > 0) {
                  router.push(`/story/${story.id}/chapter/${chapters[0].id}/edit`);
                } else {
                  setAddingChapter(true);
                }
              }}
            >
              <PenLine size={14} color="#F5EFEB" />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: '#F5EFEB' }}>
                Continue writing
              </Text>
            </Pressable>
            <Pressable
              onPress={cycleStatus}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                paddingHorizontal: 14, paddingVertical: 13, borderRadius: 999,
                borderWidth: 1, borderColor: 'rgba(47,65,86,0.18)',
              }}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(47,65,86,0.65)' }}>
                {STATUS_LABELS[story.status] ?? story.status}
              </Text>
              <ChevronDown size={11} color="rgba(47,65,86,0.40)" />
            </Pressable>
          </View>

          {/* Add to library */}
          <Pressable
            onPress={() => {
              if (inList) {
                Alert.alert('Remove from library?', `"${story.title}" will be removed from your reading list.`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => toggleReadingList.mutate({ storyId: story.id, inList: true }) },
                ]);
              } else {
                setShowLibraryModal(true);
              }
            }}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              paddingVertical: 13, borderRadius: 999,
              borderWidth: 1,
              borderColor: inList ? '#567C8D' : 'rgba(47,65,86,0.18)',
              backgroundColor: inList ? 'rgba(86,124,141,0.08)' : 'transparent',
            }}
          >
            <BookMarked
              size={14}
              color={inList ? '#567C8D' : 'rgba(47,65,86,0.65)'}
              fill={inList ? '#567C8D' : 'transparent'}
            />
            <Text style={{
              fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
              color: inList ? '#567C8D' : 'rgba(47,65,86,0.65)',
            }}>
              {inList ? 'In your library' : 'Add to library'}
            </Text>
          </Pressable>
        </View>

        {/* Chapters section */}
        <View style={{ marginTop: 36 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
              Chapters · {chapters?.length ?? 0}
            </Text>
            <Pressable onPress={() => setAddingChapter((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Plus size={14} color="#567C8D" />
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#567C8D' }}>Add</Text>
            </Pressable>
          </View>

          {addingChapter ? (
            <View style={{ paddingHorizontal: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <TextInput
                value={newChapterTitle}
                onChangeText={setNewChapterTitle}
                placeholder="Chapter title"
                placeholderTextColor="rgba(47,65,86,0.42)"
                autoFocus
                style={{
                  flex: 1, fontFamily: 'CormorantGaramond_400Regular', fontSize: 18,
                  color: '#2F4156', borderBottomWidth: 1, borderBottomColor: 'rgba(47,65,86,0.20)',
                  paddingVertical: 6,
                }}
                onSubmitEditing={addChapter}
              />
              <Pressable onPress={addChapter} disabled={createChapter.isPending}
                style={{ backgroundColor: '#2F4156', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}
              >
                {createChapter.isPending
                  ? <ActivityIndicator color="#F5EFEB" size="small" />
                  : <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#F5EFEB' }}>Create</Text>
                }
              </Pressable>
            </View>
          ) : null}

          {chapters && chapters.length > 0 ? (
            <View style={{
              marginHorizontal: 20,
              backgroundColor: '#FAF6F2',
              borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
              overflow: 'hidden',
            }}>
              {chapters.map((ch, i) => (
                <ChapterListItem
                  key={ch.id}
                  storyId={story.id}
                  chapter={ch}
                  index={i}
                  onDelete={() =>
                    Alert.alert('Delete chapter?', `"${ch.title}" will be permanently deleted.`, [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => deleteChapter.mutateAsync(ch.id) },
                    ])
                  }
                />
              ))}
            </View>
          ) : (
            <View style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.42)' }}>
                No chapters yet. Add your first.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to library confirmation modal */}
      <Modal
        visible={showLibraryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLibraryModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(47,65,86,0.40)', justifyContent: 'flex-end' }}
          onPress={() => setShowLibraryModal(false)}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#FAF6F2',
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              paddingHorizontal: 24, paddingTop: 28, paddingBottom: 36,
            }}
          >
            {/* Handle */}
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(47,65,86,0.15)', alignSelf: 'center', marginBottom: 24 }} />

            <View style={{
              width: 52, height: 52, borderRadius: 16,
              backgroundColor: 'rgba(86,124,141,0.12)',
              alignItems: 'center', justifyContent: 'center',
              alignSelf: 'center', marginBottom: 16,
            }}>
              <BookMarked size={24} color="#567C8D" />
            </View>

            <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 24, color: '#2F4156', textAlign: 'center', lineHeight: 28, marginBottom: 8 }}>
              Add to library?
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.65)', textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15 }}>"{story.title}"</Text>
              {' '}will be added to your reading list.
            </Text>

            <View style={{ gap: 10 }}>
              <Pressable
                onPress={() => {
                  toggleReadingList.mutate({ storyId: story.id, inList: false });
                  setShowLibraryModal(false);
                }}
                style={{
                  backgroundColor: '#2F4156', borderRadius: 999,
                  paddingVertical: 14, flexDirection: 'row',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <BookMarked size={14} color="#F5EFEB" />
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', color: '#F5EFEB' }}>
                  Add to library
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowLibraryModal(false)}
                style={{
                  paddingVertical: 14, borderRadius: 999,
                  borderWidth: 1, borderColor: 'rgba(47,65,86,0.15)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', color: 'rgba(47,65,86,0.55)' }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
