import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChapter, useChapters } from '../../../../../lib/queries/chapters';
import { useStory } from '../../../../../lib/queries/stories';
import { Reader } from '../../../../../components/Reader';

export default function ReadChapterScreen() {
  const { id, chapterId } = useLocalSearchParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const { data: chapter, isLoading } = useChapter(chapterId);
  const { data: story } = useStory(id);
  const { data: chapters } = useChapters(id);

  if (isLoading || !chapter) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#567C8D" />
      </SafeAreaView>
    );
  }

  const sorted = chapters ?? [];
  const currentIdx = sorted.findIndex((c) => c.id === chapter.id);
  const nextChapter = currentIdx >= 0 && currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  const openChapter = (nextId: string) => {
    router.replace(`/story/${id}/chapter/${nextId}/read`);
  };

  const exit = () => {
    if (router.canGoBack()) router.back();
    else router.replace(`/story/${id}`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <View style={{ flex: 1 }}>
        <Reader
          chapter={chapter}
          storyId={id!}
          storyTitle={story?.title}
          nextChapter={nextChapter}
          onExit={exit}
          onOpenChapter={openChapter}
        />
      </View>
    </SafeAreaView>
  );
}
