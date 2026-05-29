import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

function Brand() {
  return <Text style={{ fontFamily: 'CormorantGlyphs_400Regular' }}>{'noveḷɑ'}</Text>;
}

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
          <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28 }}>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 8 }}>
            Legal
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 34, color: '#2F4156', lineHeight: 36 }}>
            Privacy Policy
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(47,65,86,0.42)', marginTop: 8 }}>
            Last updated May 2025
          </Text>
        </View>

        <View style={{
          marginHorizontal: 20,
          backgroundColor: '#FAF6F2',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
        }}>
          {([
            {
              heading: 'What we collect',
              body: <Text>Your email address and the content you create — your stories, chapters, and profile information. This data is stored securely and used only to provide the app's features.</Text>,
            },
            {
              heading: 'What we do not do',
              body: <Text>We do not sell your data. We do not show you ads. We do not share your writing with anyone. Your stories are private by default and remain that way unless you choose otherwise.</Text>,
            },
            {
              heading: 'Third-party services',
              body: <Text><Brand /> uses Supabase for authentication and data storage. Their privacy policy governs how your data is handled at the infrastructure level. We do not use analytics trackers or third-party advertising SDKs.</Text>,
            },
            {
              heading: 'Data deletion',
              body: <Text>You can delete your account and all associated data at any time. Contact us at erickadichon@gmail.com and we will process your request promptly.</Text>,
            },
            {
              heading: 'Changes to this policy',
              body: <Text>If this policy changes in a meaningful way, we will notify you within the app. Continued use of <Brand /> after a policy update constitutes acceptance of the revised terms.</Text>,
            },
          ] as const).map(({ heading, body }, i, arr) => (
            <View
              key={heading}
              style={{
                paddingVertical: 18, paddingHorizontal: 20,
                borderBottomWidth: i < arr.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(47,65,86,0.10)',
              }}
            >
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2F4156', marginBottom: 8 }}>
                {heading}
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(47,65,86,0.65)', lineHeight: 20 }}>
                {body}
              </Text>
            </View>
          ))}
        </View>
        <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: 32, color: '#2F4156', textAlign: 'center', marginTop: 32, marginBottom: 8 }}>
          {'noveḷɑ'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
