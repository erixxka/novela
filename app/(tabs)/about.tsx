import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Shield, FileText, Heart, ChevronRight, Feather } from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();

  const SECTIONS = [
    {
      title: 'noveḷɑ',
      items: [
        {
          icon: Feather,
          label: 'About noveḷɑ',
          sub: 'A quiet place for writers',
          onPress: () => router.push('/about/novella'),
        },
        {
          icon: Heart,
          label: 'About the maker',
          sub: 'Built slowly, with care',
          onPress: () => router.push('/about/maker'),
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          icon: Shield,
          label: 'Privacy Policy',
          sub: 'How we handle your data',
          onPress: () => router.push('/about/privacy'),
        },
        {
          icon: FileText,
          label: 'Terms & Conditions',
          sub: 'Rules of use',
          onPress: () => router.push('/about/terms'),
        },
      ],
    },
    {
      title: 'Get in touch',
      items: [
        {
          icon: Mail,
          label: 'Contact',
          sub: 'erickadichon@gmail.com',
          onPress: () => router.push('/about/contact'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Brand mark */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 32, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: 52, color: '#2F4156', lineHeight: 56 }}>
            {'noveḷɑ'}
          </Text>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: 'rgba(47,65,86,0.55)', marginTop: 4 }}>
            for readers and dreamers
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={{
              fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2,
              textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)',
              marginLeft: 20, marginTop: 4, marginBottom: 10,
            }}>
              {section.title}
            </Text>
            <View style={{
              marginHorizontal: 20,
              backgroundColor: '#FAF6F2',
              borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
            }}>
              {section.items.map(({ icon: Icon, label, sub, onPress }, i) => (
                <Pressable
                  key={label}
                  onPress={onPress}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingVertical: 14, paddingHorizontal: 16,
                    borderBottomWidth: i < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(47,65,86,0.10)',
                  }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 10,
                      backgroundColor: 'rgba(86,124,141,0.10)',
                      alignItems: 'center', justifyContent: 'center',
                      marginRight: 14,
                    }}>
                      <Icon size={17} color="#567C8D" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#2F4156' }}>{label}</Text>
                      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 1 }}>{sub}</Text>
                    </View>
                    <ChevronRight size={15} color="rgba(47,65,86,0.30)" />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <Text style={{
          fontFamily: 'Inter_400Regular', fontSize: 11,
          color: 'rgba(47,65,86,0.30)',
          textAlign: 'center', marginTop: 36,
        }}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
