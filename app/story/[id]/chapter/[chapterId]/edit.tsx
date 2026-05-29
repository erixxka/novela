import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import {
  useChapter,
  useDeleteChapter,
  useUpdateChapter,
} from '../../../../../lib/queries/chapters';
import { RichTextEditor } from '../../../../../components/RichTextEditor';

const SAVE_DEBOUNCE_MS = 3000;

function textToTipTap(text: string): Record<string, unknown> {
  return {
    type: 'doc',
    content: text.split('\n').map((line) => ({
      type: 'paragraph',
      content: line ? [{ type: 'text', text: line }] : [],
    })),
  };
}

export default function EditChapterScreen() {
  const { id, chapterId } = useLocalSearchParams<{ id: string; chapterId: string }>();
  const router = useRouter();
  const { data: chapter, isLoading } = useChapter(chapterId);
  const update = useUpdateChapter(chapterId!);
  const remove = useDeleteChapter(id!);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef('');

  useEffect(() => {
    if (!chapter) return;
    setTitle(chapter.title);
    const text = chapter.content_text ?? '';
    setBody(text);
    lastSaved.current = text;
  }, [chapter]);

  const queueSave = (currentTitle: string, currentBody: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setStatus('saving');
    saveTimer.current = setTimeout(async () => {
      try {
        await update.mutateAsync({
          title: currentTitle.trim() || 'Untitled chapter',
          content: textToTipTap(currentBody),
          content_text: currentBody,
        });
        lastSaved.current = currentBody;
        setStatus('saved');
      } catch {
        setStatus('idle');
      }
    }, SAVE_DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const saveNow = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await update.mutateAsync({
      title: title.trim() || 'Untitled chapter',
      content: textToTipTap(body),
      content_text: body,
    });
    router.back();
  };

  if (isLoading || !chapter) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#567C8D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      {/* Nav bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 4, paddingTop: 4, paddingBottom: 8,
        borderBottomWidth: 1, borderBottomColor: 'rgba(47,65,86,0.10)',
      }}>
        <Pressable onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={22} color="rgba(47,65,86,0.65)" />
        </Pressable>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(47,65,86,0.42)' }}>
          {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : ' '}
        </Text>
        <Pressable
          onPress={saveNow}
          style={{
            marginRight: 8,
            paddingHorizontal: 18, paddingVertical: 8,
            backgroundColor: '#2F4156', borderRadius: 999,
          }}
        >
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: '#F5EFEB' }}>
            Done
          </Text>
        </Pressable>
      </View>

      {/* Chapter title */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <TextInput
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            queueSave(t, body);
          }}
          placeholder="Chapter title"
          placeholderTextColor="rgba(47,65,86,0.35)"
          style={{
            fontFamily: 'CormorantGaramond_500Medium',
            fontSize: 26, color: '#2F4156', lineHeight: 30,
          }}
        />
      </View>

      <RichTextEditor
        value={body}
        onChange={(text) => {
          setBody(text);
          queueSave(title, text);
        }}
      />
    </SafeAreaView>
  );
}
