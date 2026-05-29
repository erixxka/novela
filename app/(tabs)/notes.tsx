import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight, PenLine } from 'lucide-react-native';
import { useStories } from '../../lib/queries/stories';
import { useNoteCounts } from '../../lib/queries/notes';
import { CoverTile, type CoverTone } from '../../components/CoverTile';
import { getCoverUrl } from '../../lib/storage';
import type { StoryRow } from '../../lib/database.types';

const COVER_TONES: CoverTone[] = ['beige', 'sky', 'navy', 'paper'];

function StoryNoteRow({
  story,
  index,
  counts,
  onPress,
}: {
  story: StoryRow;
  index: number;
  counts: { characters: number; snippets: number; hasConcept: boolean } | undefined;
  onPress: () => void;
}) {
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const tone = COVER_TONES[index % COVER_TONES.length];

  useEffect(() => {
    let active = true;
    getCoverUrl(story.cover_url).then((url) => {
      if (active) setCoverUri(url);
    });
    return () => {
      active = false;
    };
  }, [story.cover_url]);

  const c = counts;
  const subtitleBits: string[] = [];
  subtitleBits.push(`${c?.characters ?? 0} character${(c?.characters ?? 0) === 1 ? '' : 's'}`);
  subtitleBits.push(`${c?.snippets ?? 0} snippet${(c?.snippets ?? 0) === 1 ? '' : 's'}`);
  if (c?.hasConcept) subtitleBits.push('concept ✓');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
        {coverUri ? (
          <View style={{ width: 48, height: 64, borderRadius: 4, overflow: 'hidden', marginRight: 12 }}>
            <Image source={{ uri: coverUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </View>
        ) : (
          <View style={{ marginRight: 12 }}>
            <CoverTile tone={tone} title={story.title} index={index} size="xs" />
          </View>
        )}
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'CormorantGaramond_500Medium',
              fontSize: 18,
              color: '#2F4156',
              lineHeight: 22,
            }}
          >
            {story.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: 'rgba(47,65,86,0.55)',
              marginTop: 2,
            }}
          >
            {subtitleBits.join(' · ')}
          </Text>
        </View>
        <ChevronRight size={16} color="rgba(47,65,86,0.40)" />
      </View>
    </Pressable>
  );
}

function EmptyHub({ onCreate }: { onCreate: () => void }) {
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: '#FAF6F2',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(47,65,86,0.10)',
        padding: 24,
        alignItems: 'center',
        gap: 12,
      }}
    >
      <PenLine size={28} color="rgba(47,65,86,0.30)" />
      <Text
        style={{
          fontFamily: 'CormorantGaramond_400Regular',
          fontSize: 20,
          color: '#2F4156',
          textAlign: 'center',
        }}
      >
        No novels yet
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          color: 'rgba(47,65,86,0.55)',
          textAlign: 'center',
          lineHeight: 19,
        }}
      >
        Start your first novel to begin collecting characters, outlines, and snippets here.
      </Text>
      <Pressable
        onPress={onCreate}
        style={{
          marginTop: 4,
          backgroundColor: '#2F4156',
          borderRadius: 999,
          paddingHorizontal: 18,
          paddingVertical: 11,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: '#F5EFEB',
          }}
        >
          Start a novel
        </Text>
      </Pressable>
    </View>
  );
}

export default function NotesScreen() {
  const router = useRouter();
  const { data: stories, isLoading } = useStories();
  const { data: counts } = useNoteCounts();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Title + intro */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
          <Text
            style={{
              fontFamily: 'CormorantGaramond_400Regular',
              fontSize: 30,
              color: '#2F4156',
              lineHeight: 32,
            }}
          >
            Notes
          </Text>
          <Text
            style={{
              fontFamily: 'CormorantGaramond_400Regular_Italic',
              fontSize: 14,
              color: 'rgba(47,65,86,0.55)',
              marginTop: 4,
            }}
          >
            Pick a novel to plan its world.
          </Text>
        </View>

        {/* Body */}
        {isLoading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color="#567C8D" />
          </View>
        ) : !stories || stories.length === 0 ? (
          <EmptyHub onCreate={() => router.push('/story/new')} />
        ) : (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 16,
              backgroundColor: '#FAF6F2',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(47,65,86,0.10)',
              overflow: 'hidden',
            }}
          >
            {stories.map((s, i) => (
              <View
                key={s.id}
                style={{
                  borderBottomWidth: i < stories.length - 1 ? 1 : 0,
                  borderBottomColor: 'rgba(47,65,86,0.10)',
                }}
              >
                <StoryNoteRow
                  story={s}
                  index={i}
                  counts={counts?.get(s.id)}
                  onPress={() => router.push({ pathname: '/notes/[storyId]', params: { storyId: s.id } })}
                />
              </View>
            ))}
          </View>
        )}

        {/* Brand */}
        <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 8 }}>
          <Text
            style={{
              fontFamily: 'CormorantGlyphs_400Regular',
              fontSize: 32,
              color: '#2F4156',
            }}
          >
            {'noveḷɑ'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
