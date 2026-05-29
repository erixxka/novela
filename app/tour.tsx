import { useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  PenLine,
  BookOpen,
  StickyNote,
  Users,
  Home,
  ArrowRight,
  X,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    icon: Home,
    iconBg: 'rgba(200,217,230,0.5)',
    iconColor: '#2F4156',
    eyebrow: 'Home',
    title: 'Your\ndashboard',
    body: 'See what you\'re writing and reading at a glance. Pick up where you left off — writing or reading — in one tap.',
    bg: '#C8D9E6',
  },
  {
    icon: PenLine,
    iconBg: 'rgba(47,65,86,0.12)',
    iconColor: '#2F4156',
    eyebrow: 'Write',
    title: 'Your stories,\nyour way',
    body: 'Create stories, write chapters with a rich text editor, track your status from Draft to Published. No word-count streaks — just the work.',
    bg: '#ECE3DC',
  },
  {
    icon: BookOpen,
    iconBg: 'rgba(86,124,141,0.14)',
    iconColor: '#567C8D',
    eyebrow: 'Library',
    title: 'Read what\nyou love',
    body: 'Add any of your stories to your reading list. The reader tracks your page position so you\'re always right where you left off.',
    bg: '#FAF6F2',
  },
  {
    icon: StickyNote,
    iconBg: 'rgba(196,83,74,0.10)',
    iconColor: '#C4534A',
    eyebrow: 'Notes',
    title: 'Plan your\nnovel',
    body: 'Every story gets its own planning space — possible titles, outline, genres, themes, character sheets, and freeform snippets for quotes, dialogue, or prompts.',
    bg: '#F5EFEB',
  },
  {
    icon: Users,
    iconBg: 'rgba(86,124,141,0.14)',
    iconColor: '#567C8D',
    eyebrow: 'Characters',
    title: 'Know your\ncast',
    body: 'Build character profiles — name, role, age, background, goals. Tap any card to edit. Your cast lives alongside your draft.',
    bg: '#ECE3DC',
  },
];

export default function TourScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(0);

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
    setCurrent(i);
  };

  const next = () => {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      router.back();
    }
  };

  const slide = SLIDES[current];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: slide.bg }} edges={['top', 'bottom']}>
      {/* Close */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, alignItems: 'flex-end' }}>
        <Pressable
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(47,65,86,0.08)', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={16} color="rgba(47,65,86,0.65)" />
        </Pressable>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => {
          const Icon = s.icon;
          return (
            <View key={i} style={{ width: SCREEN_WIDTH, paddingHorizontal: 32, justifyContent: 'center' }}>
              {/* Icon illustration */}
              <View style={{
                width: 96, height: 96, borderRadius: 28,
                backgroundColor: s.iconBg,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 36,
              }}>
                <Icon size={44} color={s.iconColor} />
              </View>

              {/* Text */}
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 10 }}>
                {s.eyebrow}
              </Text>
              <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 44, color: '#2F4156', lineHeight: 48, marginBottom: 20 }}>
                {s.title}
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(47,65,86,0.70)', lineHeight: 24 }}>
                {s.body}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom nav */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 32, gap: 24 }}>
        {/* Dots */}
        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
          {SLIDES.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)}>
              <View style={{
                width: i === current ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === current ? '#2F4156' : 'rgba(47,65,86,0.20)',
              }} />
            </Pressable>
          ))}
        </View>

        {/* Next / Done */}
        <Pressable onPress={next} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
          <View style={{
            backgroundColor: '#2F4156',
            borderRadius: 999,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', color: '#F5EFEB' }}>
              {current < SLIDES.length - 1 ? 'Next' : 'Done'}
            </Text>
            {current < SLIDES.length - 1 ? <ArrowRight size={14} color="#F5EFEB" /> : null}
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
