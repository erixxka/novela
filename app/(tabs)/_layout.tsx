import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Home, LibraryBig, PenLine, User, Info } from 'lucide-react-native';
import { useTheme } from '../../lib/theme';

export default function TabsLayout() {
  const { resolved } = useTheme();
  const dark = resolved === 'dark';

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
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', gap: 5 }}>
              <User color={color} size={size - 2} />
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
      {/* Hidden tabs */}
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
