import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { FileText } from 'lucide-react-native';
import type { BlogPostSummary } from '../../lib/queries/blog';

export function formatPostDate(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogCard({ post, onPress }: { post: BlogPostSummary; onPress: () => void }) {
  const cover = post.mainImage?.asset?.url;
  const author = post.author?.name;
  const date = formatPostDate(post.publishedAt);
  const meta = [author, date].filter(Boolean).join(' · ');

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <View
        style={{
          backgroundColor: '#FAF6F2',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(47,65,86,0.10)',
          overflow: 'hidden',
        }}
      >
        {/* Cover image */}
        <View
          style={{
            width: '100%',
            aspectRatio: 16 / 9,
            backgroundColor: 'rgba(86,124,141,0.10)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cover ? (
            <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
          ) : (
            <FileText size={32} color="rgba(47,65,86,0.25)" />
          )}

          {/* Category pills — overlaid bottom-left of image */}
          {post.categories && post.categories.length > 0 ? (
            <View
              style={{
                position: 'absolute',
                bottom: 10,
                left: 12,
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {post.categories.map((cat) => (
                <View
                  key={cat._id}
                  style={{
                    paddingHorizontal: 9,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: 'rgba(250,246,242,0.88)',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 1.3, textTransform: 'uppercase', color: '#567C8D' }}>
                    {cat.title}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Content */}
        <View style={{ padding: 16 }}>
          <Text
            numberOfLines={2}
            style={{
              fontFamily: 'CormorantGaramond_500Medium',
              fontSize: 22,
              color: '#2F4156',
              lineHeight: 26,
            }}
          >
            {post.title}
          </Text>
          {meta ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: 'rgba(47,65,86,0.50)',
                marginTop: 6,
              }}
            >
              {meta}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
