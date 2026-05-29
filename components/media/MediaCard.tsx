import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Music, Film } from 'lucide-react-native';
import { getMediaImageUrl } from '../../lib/storage';

export function MediaCard({
  imagePath,
  title,
  subtitle,
  snippet,
  kind,
  onPress,
}: {
  imagePath: string | null;
  title: string;
  subtitle: string;
  snippet: string | null;
  kind: 'song' | 'movie';
  onPress: () => void;
}) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMediaImageUrl(imagePath).then((u) => {
      if (active) setUri(u);
    });
    return () => {
      active = false;
    };
  }, [imagePath]);

  const Fallback = kind === 'song' ? Music : Film;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
      <View
        style={{
          flexDirection: 'row',
          padding: 14,
          gap: 14,
        }}
      >
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 10,
            backgroundColor: 'rgba(86,124,141,0.12)',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {uri ? (
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <Fallback size={22} color="rgba(47,65,86,0.45)" />
          )}
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'CormorantGaramond_500Medium',
              fontSize: 19,
              color: '#2F4156',
              lineHeight: 22,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 12,
                color: 'rgba(47,65,86,0.55)',
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
          {snippet ? (
            <Text
              numberOfLines={2}
              style={{
                fontFamily: 'CormorantGaramond_400Regular_Italic',
                fontSize: 13,
                color: 'rgba(47,65,86,0.65)',
                lineHeight: 17,
                marginTop: 4,
              }}
            >
              “{snippet}”
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
