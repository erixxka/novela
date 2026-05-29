import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, WifiOff } from 'lucide-react-native';
import { useBlogPost } from '../../lib/queries/blog';
import { PortableText } from '../../components/blog/PortableText';
import { formatPostDate } from '../../components/blog/BlogCard';

export default function BlogPostScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useBlogPost(slug);

  const hero = post?.mainImage?.asset?.url;
  const date = formatPostDate(post?.publishedAt);

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

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#567C8D" />
        </View>
      ) : isError || !post ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 }}>
          <WifiOff size={28} color="rgba(47,65,86,0.30)" />
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 20, color: '#2F4156', textAlign: 'center' }}>
            Couldn’t load this post
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
            Check your connection and try again.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 56 }} showsVerticalScrollIndicator={false}>
          {hero ? (
            <Image
              source={{ uri: hero }}
              style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: '#EBE3DA' }}
              contentFit="cover"
              transition={200}
            />
          ) : null}

          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            {/* Category pills */}
            {post.categories && post.categories.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
                {post.categories.map((cat) => (
                  <View
                    key={cat._id}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: 'rgba(86,124,141,0.35)',
                      backgroundColor: 'rgba(86,124,141,0.08)',
                    }}
                  >
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: '#567C8D' }}>
                      {cat.title}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Title */}
            <Text
              style={{
                fontFamily: 'CormorantGaramond_600SemiBold',
                fontSize: 32,
                color: '#2F4156',
                lineHeight: 38,
                textAlign: 'center',
              }}
            >
              {post.title}
            </Text>

            {/* Author avatar + name · date */}
            {(post.author || date) ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                {post.author?.image?.asset?.url ? (
                  <Image
                    source={{ uri: post.author.image.asset.url }}
                    style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#C8D9E6' }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : post.author?.name ? (
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#C8D9E6', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, color: '#2F4156' }}>
                      {post.author.name.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                ) : null}
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(47,65,86,0.5)' }}>
                  {[post.author?.name, date].filter(Boolean).join(' · ')}
                </Text>
              </View>
            ) : null}

            <View
              style={{
                height: 1,
                backgroundColor: 'rgba(47,65,86,0.12)',
                marginTop: 18,
                marginBottom: 18,
              }}
            />

            <PortableText value={post.body} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
