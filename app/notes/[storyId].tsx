import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useStory } from '../../lib/queries/stories';
import { ConceptSection } from '../../components/notes/ConceptSection';
import { CharactersSection } from '../../components/notes/CharactersSection';
import { SnippetsSection } from '../../components/notes/SnippetsSection';

export default function StoryNotesScreen() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const router = useRouter();
  const { data: story, isLoading } = useStory(storyId);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      {/* Header bar: back + brand */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
        </Pressable>
        <Text
          style={{
            fontFamily: 'CormorantGlyphs_400Regular',
            fontSize: 26,
            color: '#2F4156',
          }}
        >
          {'noveḷɑ'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Story header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: 'rgba(47,65,86,0.42)',
            }}
          >
            Notes for
          </Text>
          <Text
            style={{
              fontFamily: 'CormorantGaramond_500Medium',
              fontSize: 30,
              color: '#2F4156',
              lineHeight: 34,
              marginTop: 2,
            }}
          >
            {story?.title ?? '…'}
          </Text>
        </View>

        {isLoading || !storyId ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color="#567C8D" />
          </View>
        ) : (
          <>
            <ConceptSection storyId={storyId} />
            <CharactersSection storyId={storyId} />
            <SnippetsSection storyId={storyId} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
