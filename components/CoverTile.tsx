import { View, Text } from 'react-native';

export type CoverTone = 'beige' | 'sky' | 'navy' | 'paper';

const TONE_STYLES: Record<CoverTone, { bg: string; text: string; border?: string }> = {
  beige: { bg: '#ECE3DC', text: '#2F4156' },
  sky:   { bg: '#C8D9E6', text: '#2F4156' },
  navy:  { bg: '#2F4156', text: '#F5EFEB' },
  paper: { bg: '#FAF6F2', text: '#2F4156', border: 'rgba(47,65,86,0.18)' },
};

const SIZE = {
  full: { width: undefined, aspectRatio: 3 / 4, padding: 14, titleSize: 22, numSize: 40, radius: 12 },
  sm:   { width: 64,        aspectRatio: 3 / 4, padding: 8,  titleSize: 12, numSize: 24, radius: 6  },
  xs:   { width: 48,        aspectRatio: 3 / 4, padding: 6,  titleSize: 10, numSize: 18, radius: 4  },
};

type Props = {
  tone: CoverTone;
  title: string;
  index?: number;
  size?: keyof typeof SIZE;
};

export function CoverTile({ tone, title, index = 0, size = 'full' }: Props) {
  const s = TONE_STYLES[tone];
  const d = SIZE[size];
  const num = String(index + 1).padStart(2, '0');

  return (
    <View
      style={{
        width: d.width,
        aspectRatio: d.aspectRatio,
        borderRadius: d.radius,
        backgroundColor: s.bg,
        borderWidth: s.border ? 1 : 0,
        borderColor: s.border,
        padding: d.padding,
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      {/* Large background number */}
      <Text
        style={{
          fontFamily: 'CormorantGaramond_400Regular',
          fontSize: d.numSize,
          color: s.text,
          opacity: 0.4,
          lineHeight: d.numSize,
        }}
      >
        {num}
      </Text>

      {/* Title at bottom */}
      <Text
        numberOfLines={3}
        style={{
          fontFamily: 'CormorantGaramond_500Medium',
          fontSize: d.titleSize,
          color: s.text,
          lineHeight: d.titleSize * 1.1,
          letterSpacing: -0.2,
        }}
      >
        {title}
      </Text>
    </View>
  );
}
