import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search as SearchIcon } from 'lucide-react-native';
import { useSearch } from '../../lib/queries/search';

export default function SearchScreen() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const { data, isLoading, error } = useSearch(q);

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-3xl font-serif font-bold text-ink-900 dark:text-ink-50 mb-4">
          Search
        </Text>
        <View className="flex-row items-center border border-ink-200 dark:border-ink-700 rounded-xl px-3">
          <SearchIcon size={18} color="#7c7c89" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search stories and chapters"
            placeholderTextColor="#7c7c89"
            className="flex-1 ml-2 py-2 text-ink-900 dark:text-ink-50"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {q.trim().length < 2 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-ink-500 dark:text-ink-300 text-center">
            Type at least 2 characters to search.
          </Text>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500">{(error as Error).message}</Text>
        </View>
      ) : !data || data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-ink-500 dark:text-ink-300">No matches.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(r) => `${r.story_id}-${r.chapter_id}`}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push(`/story/${item.story_id}/chapter/${item.chapter_id}/read`)
              }
              className="py-3 border-b border-ink-100 dark:border-ink-700"
            >
              <Text className="text-xs text-accent uppercase">{item.story_title}</Text>
              <Text className="text-base font-semibold text-ink-900 dark:text-ink-50">
                {item.chapter_title}
              </Text>
              <Text
                className="text-sm text-ink-500 dark:text-ink-300 mt-1"
                numberOfLines={2}
              >
                {item.snippet?.replace(/<[^>]+>/g, '')}
              </Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
