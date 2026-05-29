import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import {
  useStory,
  useStoryTags,
  useUpdateStory,
  useSetStoryTags,
} from '../../../lib/queries/stories';
import type { StoryStatus } from '../../../lib/database.types';
import { CoverPicker } from '../../../components/CoverPicker';
import { TagPicker } from '../../../components/TagPicker';

const STATUSES: { value: StoryStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'on-going', label: 'On-going' },
  { value: 'hiatus', label: 'Hiatus' },
  { value: 'completed', label: 'Completed' },
];

const GENRES = [
  'Romance', 'Fantasy', 'Mystery', 'Thriller', 'Horror',
  'Sci-Fi', 'Historical', 'Contemporary', 'Literary', 'Poetry', 'Other',
];

function Label({ text }: { text: string }) {
  return (
    <Text style={{
      fontFamily: 'Inter_500Medium', fontSize: 10,
      letterSpacing: 2.2, textTransform: 'uppercase',
      color: 'rgba(47,65,86,0.42)', marginBottom: 8,
    }}>
      {text}
    </Text>
  );
}

export default function EditStoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: story, isLoading } = useStory(id);
  const { data: existingTags } = useStoryTags(id);
  const updateStory = useUpdateStory(id!);
  const setStoryTags = useSetStoryTags(id!);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<StoryStatus>('draft');
  const [genre, setGenre] = useState<string | null>(null);
  const [mature, setMature] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (story) {
      setTitle(story.title);
      setDescription(story.description ?? '');
      setCover(story.cover_url);
      setStatus(story.status);
      setGenre(story.genre ?? null);
      setMature(story.mature ?? false);
    }
  }, [story]);

  useEffect(() => {
    if (existingTags) {
      setTags(existingTags.map((t) => t.name));
    }
  }, [existingTags]);

  const save = async () => {
    setError(null);
    if (!title.trim()) { setError('Title is required'); return; }
    try {
      await updateStory.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        cover_url: cover,
        status,
        genre,
        mature,
      });
      await setStoryTags.mutateAsync(tags);
      router.back();
    } catch (e: any) {
      setError(e?.message ?? 'Could not save');
    }
  };

  if (isLoading || !story) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#567C8D" />
      </SafeAreaView>
    );
  }

  const pending = updateStory.isPending || setStoryTags.isPending;

  const inputStyle = {
    backgroundColor: '#FAF6F2',
    borderWidth: 1, borderColor: 'rgba(47,65,86,0.18)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2F4156',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
          borderBottomWidth: 1, borderBottomColor: 'rgba(47,65,86,0.10)',
        }}>
          <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 24, color: '#2F4156' }}>
            Edit story
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} color="rgba(47,65,86,0.65)" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cover */}
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <CoverPicker value={cover} onChange={setCover} />
          </View>

          {/* Title */}
          <Label text="Title" />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="An untitled novella"
            placeholderTextColor="rgba(47,65,86,0.35)"
            style={{ ...inputStyle, marginBottom: 20 }}
          />

          {/* Description */}
          <Label text="Description" />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What's it about?"
            placeholderTextColor="rgba(47,65,86,0.35)"
            multiline
            numberOfLines={4}
            style={{ ...inputStyle, minHeight: 100, textAlignVertical: 'top', marginBottom: 20 }}
          />

          {/* Status */}
          <Label text="Status" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {STATUSES.map((s) => (
              <Pressable
                key={s.value}
                onPress={() => setStatus(s.value)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: status === s.value ? '#2F4156' : '#FAF6F2',
                  borderWidth: 1,
                  borderColor: status === s.value ? '#2F4156' : 'rgba(47,65,86,0.18)',
                }}
              >
                <Text style={{
                  fontFamily: 'Inter_500Medium', fontSize: 12,
                  color: status === s.value ? '#F5EFEB' : 'rgba(47,65,86,0.65)',
                }}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Genre */}
          <Label text="Genre" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
            contentContainerStyle={{ gap: 8, paddingRight: 4 }}
          >
            {GENRES.map((g) => (
              <Pressable
                key={g}
                onPress={() => setGenre(genre === g ? null : g)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: genre === g ? '#567C8D' : '#FAF6F2',
                  borderWidth: 1,
                  borderColor: genre === g ? '#567C8D' : 'rgba(47,65,86,0.18)',
                }}
              >
                <Text style={{
                  fontFamily: 'Inter_400Regular', fontSize: 13,
                  color: genre === g ? '#F5EFEB' : 'rgba(47,65,86,0.65)',
                }}>
                  {g}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Mature toggle */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: '#FAF6F2',
            borderRadius: 12, borderWidth: 1, borderColor: 'rgba(47,65,86,0.18)',
            paddingHorizontal: 14, paddingVertical: 12,
            marginBottom: 20,
          }}>
            <View>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2F4156' }}>
                Mature content
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(47,65,86,0.42)', marginTop: 2 }}>
                18+ themes, violence, or explicit content
              </Text>
            </View>
            <Switch
              value={mature}
              onValueChange={setMature}
              trackColor={{ false: 'rgba(47,65,86,0.15)', true: '#2F4156' }}
              thumbColor="#F5EFEB"
            />
          </View>

          {/* Tags */}
          <Label text="Tags" />
          <TagPicker tags={tags} onChange={setTags} />

          {error ? (
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#ef4444', marginTop: 12 }}>
              {error}
            </Text>
          ) : null}

          {/* Save button */}
          <Pressable
            onPress={save}
            disabled={pending}
            style={{
              marginTop: 28,
              backgroundColor: '#2F4156',
              borderRadius: 999,
              paddingVertical: 15,
              alignItems: 'center',
            }}
          >
            {pending ? (
              <ActivityIndicator color="#F5EFEB" />
            ) : (
              <Text style={{
                fontFamily: 'Inter_500Medium', fontSize: 12,
                letterSpacing: 2, textTransform: 'uppercase', color: '#F5EFEB',
              }}>
                Save changes
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
