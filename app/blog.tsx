import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, WifiOff, type LucideIcon } from 'lucide-react-native';
import { useBlogPosts } from '../lib/queries/blog';
import { BlogCard } from '../components/blog/BlogCard';

export default function BlogScreen() {
  const router = useRouter();
  const { data: posts, isLoading, isError, refetch, isRefetching } = useBlogPosts();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
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
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
        </Pressable>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#567C8D" />}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: 'rgba(47,65,86,0.42)',
            }}
          >
            Words & thoughts
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
            Blog Articles
          </Text>
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color="#567C8D" />
          </View>
        ) : isError ? (
          <EmptyCard
            icon={WifiOff}
            title="Couldn’t load posts"
            body="Check your connection and pull down to try again."
          />
        ) : !posts || posts.length === 0 ? (
          <EmptyCard
            icon={FileText}
            title="No posts yet"
            body="New writing will show up here."
          />
        ) : (
          <View style={{ marginHorizontal: 20, marginTop: 16, gap: 16 }}>
            {posts.map((post) => (
              <BlogCard
                key={post._id}
                post={post}
                onPress={() => router.push(`/blog/${post.slug.current}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
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
      <Icon size={28} color="rgba(47,65,86,0.30)" />
      <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 20, color: '#2F4156', textAlign: 'center' }}>
        {title}
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
        {body}
      </Text>
    </View>
  );
}
