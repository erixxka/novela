import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Moon, Sun, Smartphone, LogOut, Type, Bell, Lock, Heart, Pencil, Compass } from 'lucide-react-native';
import { InstagramIcon, FacebookIcon, WattpadIcon } from '../../components/SocialIcons';
import { CalendarIcon, MusicIcon, MovieIcon } from '../../components/profile/FeatureIcons';
import { FeatureTile } from '../../components/profile/FeatureTile';
import { useTheme } from '../../lib/theme';
import { useAuth } from '../../lib/auth';
import { useStories } from '../../lib/queries/stories';
import { useTotalWordCount } from '../../lib/queries/chapters';
import { useReadingList } from '../../lib/queries/reading_list';
import { getAvatarUrl } from '../../lib/storage';

function formatWords(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

type SettingHref = '/profile-settings?focus=reading' | '/about/privacy' | '/about/contact' | '/tour' | null;

const SETTINGS: { icon: typeof Type; label: string; sub: string; href: SettingHref }[] = [
  { icon: Type,    label: 'Reading preferences', sub: 'Font, size, spacing',       href: '/profile-settings?focus=reading' },
  { icon: Compass, label: 'App tour',            sub: 'A quick look at features',  href: '/tour' },
  { icon: Bell,    label: 'Notifications',       sub: 'Daily reminders, off',      href: null },
  { icon: Lock,    label: 'Privacy',             sub: 'Your work stays private',   href: '/about/privacy' },
  { icon: Heart,   label: 'Support noveḷɑ',      sub: 'About the maker',           href: '/about/contact' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { preference, setPreference } = useTheme();
  const { session, profile, signOut } = useAuth();
  const { data: stories } = useStories();
  const { data: totalWords } = useTotalWordCount();
  const { data: readingList } = useReadingList();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    getAvatarUrl(profile.avatarPath).then(setAvatarUrl);
  }, [profile.avatarPath]);

  const email = session?.user.email ?? '';
  const displayName = profile.displayName || email.split('@')[0] || 'Writer';
  const initials = displayName.slice(0, 2).toUpperCase();
  const storyCount = stories?.length ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-beige" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
          <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, color: '#2F4156', lineHeight: 32 }}>
            Profile
          </Text>
          <Pressable
            onPress={() => router.push('/profile-settings')}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
              borderWidth: 1, borderColor: 'rgba(47,65,86,0.18)',
            }}
          >
            <Pencil size={13} color="rgba(47,65,86,0.65)" />
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(47,65,86,0.65)' }}>
              Edit
            </Text>
          </Pressable>
        </View>

        {/* Identity card */}
        <View style={{
          marginHorizontal: 20, marginTop: 18,
          backgroundColor: '#FAF6F2',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
          padding: 20, alignItems: 'center',
        }}>
          {/* Avatar */}
          <Pressable onPress={() => router.push('/profile-settings')} style={{ marginBottom: 14 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: '#C8D9E6',
              alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              ) : (
                <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 30, color: '#2F4156' }}>
                  {initials}
                </Text>
              )}
            </View>
          </Pressable>

          <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 24, color: '#2F4156', lineHeight: 26 }}>
            {displayName}
          </Text>
          {profile.username ? (
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(47,65,86,0.42)', marginTop: 3 }}>
              @{profile.username}
            </Text>
          ) : null}
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.35)', marginTop: 3 }}>
            {email}
          </Text>
          {(profile.quote || !profile.displayName) ? (
            <Text style={{
              fontFamily: 'CormorantGaramond_400Regular_Italic',
              fontSize: 14, color: 'rgba(47,65,86,0.65)',
              marginTop: 14, lineHeight: 20, textAlign: 'center',
            }}>
              "{profile.quote || 'Writing is the slow practice of paying attention.'}"
            </Text>
          ) : null}

          {/* Social links — only shown when a link is set */}
          {(profile.instagram || profile.facebook || profile.wattpad) ? (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, justifyContent: 'center' }}>
              {profile.instagram ? (
                <Pressable onPress={() => Linking.openURL(profile.instagram)}>
                  <InstagramIcon size={32} />
                </Pressable>
              ) : null}
              {profile.facebook ? (
                <Pressable onPress={() => Linking.openURL(profile.facebook)}>
                  <FacebookIcon size={32} />
                </Pressable>
              ) : null}
              {profile.wattpad ? (
                <Pressable onPress={() => Linking.openURL(profile.wattpad)}>
                  <WattpadIcon size={32} />
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Stats */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 20, marginTop: 20,
          backgroundColor: '#FAF6F2',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
          overflow: 'hidden',
        }}>
          {[
            { n: storyCount,                                l: 'Novels' },
            { n: totalWords != null ? formatWords(totalWords) : '—', l: 'Words' },
            { n: readingList != null ? readingList.length : '—',     l: 'In library' },
          ].map((s, i) => (
            <View key={i} style={{
              flex: 1, paddingVertical: 20, paddingHorizontal: 8, alignItems: 'center',
              borderLeftWidth: i > 0 ? 1 : 0,
              borderLeftColor: 'rgba(47,65,86,0.10)',
            }}>
              <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 28, color: '#2F4156', lineHeight: 30 }}>
                {s.n}
              </Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginTop: 6 }}>
                {s.l}
              </Text>
            </View>
          ))}
        </View>

        {/* Feature tiles — Calendar / Music / Movies */}
        <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 12 }}>
          <FeatureTile icon={CalendarIcon} label="Calendar" onPress={() => router.push('/calendar')} />
          <FeatureTile icon={MusicIcon}    label="Music"    onPress={() => router.push('/music')} />
          <FeatureTile icon={MovieIcon}    label="Movies"   onPress={() => router.push('/movies')} />
        </View>

        {/* Appearance */}
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginLeft: 20, marginTop: 28, marginBottom: 10 }}>
          Appearance
        </Text>
        <View style={{
          marginHorizontal: 20,
          backgroundColor: '#FAF6F2',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
          padding: 4, flexDirection: 'row',
        }}>
          {([
            { key: 'light', label: 'Light', Icon: Sun },
            { key: 'dark', label: 'Dark', Icon: Moon },
            { key: 'system', label: 'System', Icon: Smartphone },
          ] as const).map(({ key, label, Icon }) => {
            const active = preference === key;
            return (
              <Pressable
                key={key}
                onPress={() => setPreference(key)}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 999,
                  backgroundColor: active ? '#2F4156' : 'transparent',
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Icon size={14} color={active ? '#F5EFEB' : 'rgba(47,65,86,0.42)'} />
                <Text style={{
                  fontFamily: 'Inter_500Medium', fontSize: 11,
                  letterSpacing: 1.4, textTransform: 'uppercase',
                  color: active ? '#F5EFEB' : 'rgba(47,65,86,0.42)',
                }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Preferences list */}
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginLeft: 20, marginTop: 28, marginBottom: 10 }}>
          Preferences
        </Text>
        <View style={{
          marginHorizontal: 20,
          backgroundColor: '#FAF6F2',
          borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
        }}>
          {SETTINGS.map(({ icon: Icon, label, sub, href }, i) => (
            <Pressable
              key={label}
              onPress={href ? () => router.push(href) : undefined}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 14,
                paddingVertical: 14, paddingHorizontal: 16,
                borderBottomWidth: i < SETTINGS.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(47,65,86,0.10)',
              }}
            >
              <Icon size={18} color="rgba(47,65,86,0.65)" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#2F4156' }}>{label}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 1 }}>{sub}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Sign out */}
        <Pressable
          onPress={signOut}
          style={{
            marginHorizontal: 20, marginTop: 20,
            borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.18)',
            paddingVertical: 14, flexDirection: 'row',
            alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <LogOut size={16} color="rgba(47,65,86,0.65)" />
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(47,65,86,0.65)' }}>
            Sign out
          </Text>
        </Pressable>

        <Text style={{
          fontFamily: 'CormorantGlyphs_400Regular',
          fontSize: 32, color: '#2F4156',
          textAlign: 'center', marginTop: 24, marginBottom: 8,
        }}>
          {'noveḷɑ'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
