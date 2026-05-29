import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Home, LibraryBig, PenLine, User, Info } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';
import { useAuth } from '../../lib/auth';
import { getAvatarUrl } from '../../lib/storage';

export default function TabsLayout() {
  const { resolved } = useTheme();
  const dark = resolved === 'dark';
  const { profile } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAvatarUrl(profile.avatarPath).then((url) => {
      if (active) setAvatarUrl(url);
    });
    return () => { active = false; };
  }, [profile.avatarPath]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#2F4156',
        tabBarInactiveTintColor: dark ? '#C8D9E6' : 'rgba(47,65,86,0.42)',
        tabBarStyle: {
          backgroundColor: dark ? '#2F4156' : '#F5EFEB',
          borderTopColor: dark ? 'rgba(200,217,230,0.15)' : 'rgba(47,65,86,0.10)',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', gap: 5 }}>
              <Home color={color} size={size - 2} />
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: focused ? '#2F4156' : 'transparent' }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', gap: 5 }}>
              <LibraryBig color={color} size={size - 2} />
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: focused ? '#2F4156' : 'transparent' }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', gap: 5 }}>
              <PenLine color={color} size={size - 2} />
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: focused ? '#2F4156' : 'transparent' }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Info',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', gap: 5 }}>
              <Info color={color} size={size - 2} />
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: focused ? '#2F4156' : 'transparent' }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', gap: 5 }}>
              {avatarUrl ? (
                <View style={{
                  width: size - 2,
                  height: size - 2,
                  borderRadius: (size - 2) / 2,
                  overflow: 'hidden',
                  borderWidth: focused ? 1.5 : 0,
                  borderColor: '#2F4156',
                }}>
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </View>
              ) : (
                <User color={color} size={size - 2} />
              )}
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: focused ? '#2F4156' : 'transparent' }} />
            </View>
          ),
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
