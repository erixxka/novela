import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { getCoverUrl } from '../lib/storage';
import { CoverTile, CoverTone } from './CoverTile';

type Size = 'full' | 'sm' | 'xs';

const SIZE_DIMS: Record<Size, { width?: number; aspectRatio: number; radius: number }> = {
  full: { width: undefined, aspectRatio: 3 / 4, radius: 12 },
  sm:   { width: 64,        aspectRatio: 3 / 4, radius: 6  },
  xs:   { width: 48,        aspectRatio: 3 / 4, radius: 4  },
};

export function StoryCover({
  coverPath,
  tone,
  title,
  index = 0,
  size = 'full',
}: {
  coverPath: string | null | undefined;
  tone: CoverTone;
  title: string;
  index?: number;
  size?: Size;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const d = SIZE_DIMS[size];

  useEffect(() => {
    let active = true;
    getCoverUrl(coverPath).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [coverPath]);

  if (url) {
    return (
      <View style={{
        width: d.width,
        aspectRatio: d.aspectRatio,
        borderRadius: d.radius,
        overflow: 'hidden',
      }}>
        <Image
          source={{ uri: url }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </View>
    );
  }

  return <CoverTile tone={tone} title={title} index={index} size={size} />;
}
