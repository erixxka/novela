import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

function Brand() {
  return <Text style={{ fontFamily: 'CormorantGlyphs_400Regular' }}>{'noveḷɑ'}</Text>;
}

export default function TermsScreen() {
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
            Terms & Conditions
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
              heading: 'Using ' + 'noveḷɑ',
              body: <Text><Brand /> is a personal writing tool. You may use it to write, edit, and organize your own original work. You are responsible for the content you create and store within the app.</Text>,
            },
            {
              heading: 'Your content',
              body: <Text>You retain full ownership of everything you write. <Brand /> does not claim any rights to your stories, characters, or any other content you create. We store your work only to make the app function.</Text>,
            },
            {
              heading: 'Acceptable use',
              body: <Text>Please do not use <Brand /> to store or distribute content that is illegal, harmful, or violates others' rights. We reserve the right to terminate accounts that violate these terms.</Text>,
            },
            {
              heading: 'No warranty',
              body: <Text><Brand /> is provided as-is. While we work hard to keep your data safe and the app running smoothly, we cannot guarantee uninterrupted service. Please keep backups of writing that is important to you.</Text>,
            },
            {
              heading: 'Changes to these terms',
              body: <Text>We may update these terms from time to time. When we do, we will notify you within the app. Continued use of <Brand /> after changes are posted means you accept the updated terms.</Text>,
            },
            {
              heading: 'Contact',
              body: <Text>Questions about these terms? Reach us at erickadichon@gmail.com.</Text>,
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
