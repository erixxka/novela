import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ComingSoon } from '../components/ComingSoon';
import { JournalIcon } from '../components/profile/FeatureIcons';

export default function JournalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        >
          <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
        </Pressable>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 10,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: 'rgba(47,65,86,0.42)',
            }}
          >
            Daily pages
          </Text>
          <Text
            style={{
              fontFamily: 'CormorantGaramond_500Medium',
              fontSize: 30,
              color: '#2F4156',
              lineHeight: 34,
              marginTop: 2,
            }}
          >
            Journal
          </Text>
        </View>

        <ComingSoon icon={JournalIcon} message="A private journal is coming soon — a quiet space for daily entries and passing thoughts." />
      </ScrollView>
    </SafeAreaView>
  );
}
