import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { CoverTile, CoverTone } from './CoverTile';
import type { StoryRow } from '../lib/database.types';
import { getCoverUrl } from '../lib/storage';

const COVER_TONES: CoverTone[] = ['beige', 'sky', 'navy', 'paper'];

export function StoryCard({ story, index = 0 }: { story: StoryRow; index?: number }) {
  const [cover, setCover] = useState<string | null>(null);
  const tone = COVER_TONES[index % 4];

  useEffect(() => {
    let active = true;
    getCoverUrl(story.cover_url).then((url) => {
      if (active) setCover(url);
    });
    return () => { active = false; };
  }, [story.cover_url]);

  return (
    <Link href={`/story/${story.id}`} asChild>
      <Pressable style={{ flex: 1, margin: 1 }}>
        {cover ? (
          <View style={{ aspectRatio: 3 / 4, borderRadius: 12, overflow: 'hidden' }}>
            <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </View>
        ) : (
          <CoverTile tone={tone} title={story.title} index={index} />
        )}
        <Text
          numberOfLines={2}
          style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 17, color: '#2F4156', lineHeight: 20, marginTop: 10 }}
        >
          {story.title}
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 3 }}>
          {story.status === 'draft' ? 'Draft' : 'Published'}
        </Text>
      </Pressable>
    </Link>
  );
}
