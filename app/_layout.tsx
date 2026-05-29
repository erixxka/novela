import '../global.css';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider, useTheme } from '../lib/theme';
import { AuthProvider, useAuth } from '../lib/auth';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
});

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('novella.onboarded').then((v) => setOnboarded(v === 'true'));
  }, [session]);

  useEffect(() => {
    if (loading || onboarded === null) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(auth)' && segments[1] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && !onboarded && !inOnboarding) {
      router.replace('/(auth)/onboarding');
    } else if (session && onboarded && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, onboarded, segments, router]);

  return null;
}

function RootStack() {
  const { resolved } = useTheme();
  return (
    <View
      className={resolved === 'dark' ? 'dark flex-1' : 'flex-1'}
      style={{ backgroundColor: resolved === 'dark' ? '#2F4156' : '#F5EFEB' }}
    >
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="story/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="story/[id]/index" />
        <Stack.Screen name="story/[id]/edit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="story/[id]/chapter/[chapterId]/read" />
        <Stack.Screen name="story/[id]/chapter/[chapterId]/edit" />
        <Stack.Screen name="notes/[storyId]" />
        <Stack.Screen name="profile-settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="about/novella" />
        <Stack.Screen name="about/maker" />
        <Stack.Screen name="about/privacy" />
        <Stack.Screen name="about/terms" />
        <Stack.Screen name="about/contact" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGlyphs_400Regular: require('../assets/fonts/CormorantGaramond-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <AuthGate />
              <RootStack />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
