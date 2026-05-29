import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Moon, Smartphone, Sun } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useAuth } from '../../lib/auth';

export default function SettingsScreen() {
  const { preference, setPreference } = useTheme();
  const { session, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-ink-50 dark:bg-ink-900" edges={['top']}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-3xl font-serif font-bold text-ink-900 dark:text-ink-50">
          Settings
        </Text>
      </View>

      <View className="px-5 mt-4">
        <Text className="text-xs uppercase text-ink-400 dark:text-ink-300 mb-2">
          Theme
        </Text>
        <View className="flex-row bg-ink-100 dark:bg-ink-800 rounded-xl overflow-hidden">
          {(
            [
              { key: 'light', label: 'Light', Icon: Sun },
              { key: 'dark', label: 'Dark', Icon: Moon },
              { key: 'system', label: 'System', Icon: Smartphone },
            ] as const
          ).map(({ key, label, Icon }) => {
            const active = preference === key;
            return (
              <Pressable
                key={key}
                onPress={() => setPreference(key)}
                className={`flex-1 py-3 items-center flex-row justify-center ${active ? 'bg-accent' : ''}`}
              >
                <Icon size={16} color={active ? 'white' : '#7c7c89'} />
                <Text
                  className={`ml-2 text-sm ${
                    active ? 'text-white font-semibold' : 'text-ink-700 dark:text-ink-200'
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="px-5 mt-8">
        <Text className="text-xs uppercase text-ink-400 dark:text-ink-300 mb-2">
          Account
        </Text>
        <View className="bg-ink-100 dark:bg-ink-800 rounded-xl px-4 py-3">
          <Text className="text-ink-900 dark:text-ink-50">
            {session?.user.email ?? 'Not signed in'}
          </Text>
        </View>
      </View>

      <View className="px-5 mt-6">
        <Pressable
          onPress={signOut}
          className="flex-row items-center justify-center bg-ink-100 dark:bg-ink-800 rounded-xl py-3"
        >
          <LogOut size={16} color="#b08968" />
          <Text className="ml-2 text-accent font-semibold">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
