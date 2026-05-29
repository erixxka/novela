import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { Database } from './database.types';

// react-native-url-polyfill is only needed on native (web has URL built in)
if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

function getAuthStorage() {
  if (Platform.OS === 'web') return undefined;
  // Lazy-require so the native module is never touched during web bundling
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SecureStore = require('expo-secure-store');
  return {
    getItem: (key: string) => SecureStore.getItemAsync(key) as Promise<string | null>,
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value) as Promise<void>,
    removeItem: (key: string) => SecureStore.deleteItemAsync(key) as Promise<void>,
  };
}

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in.'
  );
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: getAuthStorage() as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
