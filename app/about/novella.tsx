import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Feather, BookOpen, Lock, Sparkles } from 'lucide-react-native';

const B = 'noveḷɑ'; // noveḷɑ

const FEATURES = [
  {
    icon: Feather,
    title: 'Write without distraction',
    body: 'A clean, focused editor that stays out of your way. No notifications, no feeds — just you and your story.',
  },
  {
    icon: BookOpen,
    title: 'Organize your chapters',
    body: 'Structure your novel chapter by chapter. Reorder, rename, and navigate with ease as your story grows.',
  },
  {
    icon: Lock,
    title: 'Your stories, private by default',
    body: 'Everything you write stays yours. We do not publish or share your work without your explicit action.',
  },
  {
    icon: Sparkles,
    title: 'Built for the long form',
    body: 'Whether you\'re drafting your first chapter or finishing your third novel, this app is designed to grow with you.',
  },
];

function Brand({ size = 17, color = '#2F4156' }: { size?: number; color?: string }) {
  return (
    <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: size, color }}>{B}</Text>
  );
}

export default function AboutNovellaScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Nav */}
        <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
          <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}>
          <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: 48, color: '#2F4156', lineHeight: 52 }}>
            {B}
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 18, color: 'rgba(47,65,86,0.65)', marginTop: 8, lineHeight: 24 }}>
            A personal writing companion for long-form storytellers.
          </Text>
        </View>

        {/* Story */}
        <View style={{
          marginHorizontal: 20, marginBottom: 28,
          backgroundColor: '#FAF6F2',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
          padding: 20,
        }}>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 12 }}>
            The idea
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 17, color: '#2F4156', lineHeight: 26 }}>
            Most writing apps are built for short bursts — notes, ideas, quick drafts. <Brand /> is built differently. It is made for the slow, patient work of writing a novel: the chapters that take weeks, the characters that live in your head for years, the story you keep coming back to.
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 17, color: '#2F4156', lineHeight: 26, marginTop: 14 }}>
            The name comes from the literary form — shorter than a novel, longer than a short story. Something with weight. Something that takes commitment to finish.
          </Text>
        </View>

        {/* Features */}
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginLeft: 20, marginBottom: 10 }}>
          What it does
        </Text>
        <View style={{
          marginHorizontal: 20,
          backgroundColor: '#FAF6F2',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
        }}>
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <View
              key={title}
              style={{
                flexDirection: 'row', gap: 14,
                paddingVertical: 16, paddingHorizontal: 16,
                borderBottomWidth: i < FEATURES.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(47,65,86,0.10)',
              }}
            >
              <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: 'rgba(86,124,141,0.10)',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 1,
              }}>
                <Icon size={17} color="#567C8D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2F4156', lineHeight: 20 }}>{title}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(47,65,86,0.65)', marginTop: 4, lineHeight: 18 }}>{body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: '#2F4156', textAlign: 'center', marginTop: 36, marginHorizontal: 40, lineHeight: 24 }}>
          "A single good paragraph is a fine day's work."
        </Text>
        <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: 32, color: '#2F4156', textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
          {'noveḷɑ'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
