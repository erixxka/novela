import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';

const B = 'noveḷɑ';

function Brand({ size = 17, color = '#2F4156' }: { size?: number; color?: string }) {
  return (
    <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: size, color }}>{B}</Text>
  );
}

export default function AboutMakerScreen() {
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
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 8 }}>
            The maker
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 38, color: '#2F4156', lineHeight: 40 }}>
            Ericka
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 18, color: 'rgba(47,65,86,0.65)', marginTop: 6, lineHeight: 24 }}>
            Writer, reader, builder of small things.
          </Text>
        </View>

        {/* Bio */}
        <View style={{
          marginHorizontal: 20, marginBottom: 20,
          backgroundColor: '#FAF6F2',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
          padding: 20,
        }}>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 12 }}>
            Hello
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 17, color: '#2F4156', lineHeight: 26 }}>
            {'I made '}
            <Brand size={17} />
            {' because I could not find an app that felt right for writing long-form fiction. Most tools are built for productivity — for getting words down fast. I wanted something quieter. Something that felt like sitting at a desk with good light.'}
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 17, color: '#2F4156', lineHeight: 26, marginTop: 14 }}>
            I am a writer first and a builder second. This is the app I wished existed — so I built it.
          </Text>
        </View>

        {/* Philosophy */}
        <View style={{
          marginHorizontal: 20, marginBottom: 20,
          backgroundColor: '#FAF6F2',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
          padding: 20,
        }}>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 12 }}>
            How it's built
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 17, color: '#2F4156', lineHeight: 26 }}>
            Slowly. No venture funding, no growth team, no roadmap driven by metrics. Each feature is added only when it feels right and only when it makes the writing experience genuinely better.
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 17, color: '#2F4156', lineHeight: 26, marginTop: 14 }}>
            If you have an idea, a bug to report, or just want to say hello — I actually read every message.
          </Text>
        </View>

        {/* Contact CTA */}
        <Pressable
          onPress={() => Linking.openURL('mailto:erickadichon@gmail.com')}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <View style={{
            marginHorizontal: 20,
            backgroundColor: '#FAF6F2',
            borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
            paddingVertical: 16, paddingHorizontal: 20,
            flexDirection: 'row', alignItems: 'center',
          }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'rgba(86,124,141,0.10)',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 14,
            }}>
              <Mail size={17} color="#567C8D" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#2F4156' }}>Say hello</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 1 }}>erickadichon@gmail.com</Text>
            </View>
          </View>
        </Pressable>

        <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: '#2F4156', textAlign: 'center', marginTop: 36, marginHorizontal: 40, lineHeight: 24 }}>
          "Every tool shapes the work it helps create."
        </Text>
        <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: 32, color: '#2F4156', textAlign: 'center', marginTop: 24, marginBottom: 8 }}>
          {'noveḷɑ'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
