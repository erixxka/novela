import { Pressable, Text, View } from 'react-native';
import { ArrowRight, BookOpen } from 'lucide-react-native';
import type { ChapterRow } from '../../lib/database.types';

export function NextChapterCard({
  nextChapter,
  onContinue,
  onExit,
}: {
  nextChapter: ChapterRow | null;
  onContinue: () => void;
  onExit: () => void;
}) {
  if (!nextChapter) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={eyebrow}>End of story</Text>
        <Text
          style={{
            fontFamily: 'CormorantGaramond_400Regular_Italic',
            fontSize: 26,
            color: '#2F4156',
            textAlign: 'center',
            marginTop: 14,
            lineHeight: 32,
          }}
        >
          Thank you for reading.
        </Text>
        <Pressable
          onPress={onExit}
          style={{
            marginTop: 28,
            paddingHorizontal: 22,
            paddingVertical: 12,
            borderRadius: 999,
            backgroundColor: '#2F4156',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <BookOpen size={14} color="#F5EFEB" />
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 12,
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              color: '#F5EFEB',
            }}
          >
            Back to story
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      <Text style={eyebrow}>Up next</Text>
      <Text
        style={{
          fontFamily: 'CormorantGaramond_500Medium',
          fontSize: 28,
          color: '#2F4156',
          textAlign: 'center',
          marginTop: 12,
          lineHeight: 34,
        }}
      >
        {nextChapter.title}
      </Text>
      <Pressable
        onPress={onContinue}
        style={{
          marginTop: 28,
          paddingHorizontal: 22,
          paddingVertical: 12,
          borderRadius: 999,
          backgroundColor: '#2F4156',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: 12,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: '#F5EFEB',
          }}
        >
          Continue reading
        </Text>
        <ArrowRight size={14} color="#F5EFEB" />
      </Pressable>
    </View>
  );
}

const eyebrow = {
  fontFamily: 'Inter_500Medium',
  fontSize: 10,
  letterSpacing: 2.2,
  textTransform: 'uppercase' as const,
  color: 'rgba(47,65,86,0.42)',
};
