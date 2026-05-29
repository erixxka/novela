import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, useColorScheme as useRNColorScheme } from 'react-native';
import { colorScheme as nwColorScheme } from 'nativewind';

type ThemePref = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';

const STORAGE_KEY = 'novella.theme';

type ThemeContextValue = {
  preference: ThemePref;
  resolved: Resolved;
  setPreference: (p: ThemePref) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const [preference, setPreferenceState] = useState<ThemePref>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
      setHydrated(true);
    });
  }, []);

  const resolved: Resolved = useMemo(() => {
    if (preference === 'system') {
      return (systemScheme ?? Appearance.getColorScheme() ?? 'light') as Resolved;
    }
    return preference;
  }, [preference, systemScheme]);

  useEffect(() => {
    if (!hydrated) return;
    nwColorScheme.set(preference);
  }, [preference, hydrated]);

  const setPreference = (p: ThemePref) => {
    setPreferenceState(p);
    AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
  };

  const value = useMemo(
    () => ({ preference, resolved, setPreference }),
    [preference, resolved]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
