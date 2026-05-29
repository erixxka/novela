import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  findNodeHandle,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { InstagramIcon, FacebookIcon, WattpadIcon } from '../components/SocialIcons';
import { useAuth } from '../lib/auth';
import { uploadAvatar, getAvatarUrl } from '../lib/storage';

const FONT_SIZES = [16, 18, 19, 22, 26] as const;
const LINE_SPACINGS = [
  { label: 'Tight', value: 1.5 },
  { label: 'Normal', value: 1.7 },
  { label: 'Loose', value: 1.95 },
] as const;
type FontFamily = 'cormorant' | 'inter';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useAuth();
  const { focus } = useLocalSearchParams<{ focus?: string }>();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [quote, setQuote] = useState(profile.quote);
  const [instagram, setInstagram] = useState(profile.instagram);
  const [facebook, setFacebook] = useState(profile.facebook);
  const [wattpad, setWattpad] = useState(profile.wattpad);
  const [avatarPath, setAvatarPath] = useState(profile.avatarPath);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [readingFontSize, setReadingFontSize] = useState(profile.readingFontSize);
  const [readingLineSpacing, setReadingLineSpacing] = useState(profile.readingLineSpacing);
  const [readingFont, setReadingFont] = useState<FontFamily>(profile.readingFont);
  const [readingMode, setReadingMode] = useState<'pages' | 'scroll'>(profile.readingMode);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const readingSectionRef = useRef<View>(null);

  useEffect(() => {
    getAvatarUrl(avatarPath).then(setAvatarUrl);
  }, [avatarPath]);

  useEffect(() => {
    if (focus !== 'reading') return;
    const t = setTimeout(() => {
      const scrollNode = findNodeHandle(scrollRef.current);
      if (scrollNode == null) return;
      readingSectionRef.current?.measureLayout(
        scrollNode,
        (_x, y) => scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true }),
        () => {},
      );
    }, 350);
    return () => clearTimeout(t);
  }, [focus]);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow access to your photos to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    try {
      setUploadingAvatar(true);
      const path = await uploadAvatar(result.assets[0].uri);
      setAvatarPath(path);
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message ?? 'Could not upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        quote: quote.trim(),
        avatarPath,
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        wattpad: wattpad.trim(),
        readingFontSize,
        readingLineSpacing,
        readingFont,
        readingMode,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (displayName || profile.username || 'N')
    .slice(0, 2).toUpperCase();

  const hasChanges =
    displayName.trim() !== profile.displayName ||
    username.trim().toLowerCase() !== profile.username ||
    quote.trim() !== profile.quote ||
    avatarPath !== profile.avatarPath ||
    instagram.trim() !== profile.instagram ||
    facebook.trim() !== profile.facebook ||
    wattpad.trim() !== profile.wattpad ||
    readingFontSize !== profile.readingFontSize ||
    Math.abs(readingLineSpacing - profile.readingLineSpacing) > 0.001 ||
    readingFont !== profile.readingFont ||
    readingMode !== profile.readingMode;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: 'rgba(47,65,86,0.10)',
        }}>
          <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
          </Pressable>
          <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 20, color: '#2F4156' }}>
            Edit profile
          </Text>
          <Pressable
            onPress={save}
            disabled={saving || !hasChanges}
            style={{ paddingHorizontal: 16, paddingVertical: 8 }}
          >
            {saving
              ? <ActivityIndicator size="small" color="#567C8D" />
              : <Text style={{
                  fontFamily: 'Inter_500Medium', fontSize: 13,
                  color: hasChanges ? '#567C8D' : 'rgba(47,65,86,0.30)',
                }}>
                  Save
                </Text>
            }
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar picker */}
          <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 28 }}>
            <Pressable onPress={pickAvatar} disabled={uploadingAvatar}>
              <View style={{
                width: 96, height: 96, borderRadius: 48,
                backgroundColor: '#C8D9E6',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 32, color: '#2F4156' }}>
                    {initials}
                  </Text>
                )}
                {uploadingAvatar && (
                  <View style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(47,65,86,0.5)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ActivityIndicator color="#F5EFEB" />
                  </View>
                )}
              </View>

              {/* Camera badge */}
              <View style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: '#2F4156',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: '#F5EFEB',
              }}>
                <Camera size={13} color="#F5EFEB" />
              </View>
            </Pressable>

            <Pressable onPress={pickAvatar} disabled={uploadingAvatar} style={{ marginTop: 12 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#567C8D' }}>
                {avatarUrl ? 'Change photo' : 'Add photo'}
              </Text>
            </Pressable>
          </View>

          {/* Fields */}
          <View style={{ paddingHorizontal: 20, gap: 20 }}>

            {/* Display name */}
            <View style={{
              backgroundColor: '#FAF6F2',
              borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
              overflow: 'hidden',
            }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
                  Display name
                </Text>
              </View>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor="rgba(47,65,86,0.30)"
                autoCapitalize="words"
                style={{
                  fontFamily: 'Inter_400Regular', fontSize: 16, color: '#2F4156',
                  paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4,
                }}
              />
            </View>

            {/* Username */}
            <View style={{
              backgroundColor: '#FAF6F2',
              borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
              overflow: 'hidden',
            }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
                  Username
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, color: 'rgba(47,65,86,0.42)' }}>@</Text>
                <TextInput
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                  placeholder="username"
                  placeholderTextColor="rgba(47,65,86,0.30)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    fontFamily: 'Inter_400Regular', fontSize: 16, color: '#2F4156',
                  }}
                />
              </View>
            </View>

            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(47,65,86,0.42)', lineHeight: 18, marginTop: -8 }}>
              Username can only contain letters, numbers, dots and underscores.
            </Text>

            {/* Quote */}
            <View style={{
              backgroundColor: '#FAF6F2',
              borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
              overflow: 'hidden',
            }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
                  Quote
                </Text>
              </View>
              <TextInput
                value={quote}
                onChangeText={setQuote}
                placeholder="A sentence you return to…"
                placeholderTextColor="rgba(47,65,86,0.30)"
                multiline
                maxLength={160}
                style={{
                  fontFamily: 'CormorantGaramond_400Regular_Italic',
                  fontSize: 17, color: '#2F4156', lineHeight: 24,
                  paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4,
                  minHeight: 80,
                }}
              />
              <Text style={{
                fontFamily: 'Inter_400Regular', fontSize: 11,
                color: 'rgba(47,65,86,0.35)',
                textAlign: 'right', paddingHorizontal: 16, paddingBottom: 10,
              }}>
                {quote.length}/160
              </Text>
            </View>

            {/* Social links */}
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginTop: 4 }}>
              Social links
            </Text>
            {[
              { Icon: InstagramIcon, label: 'Instagram', value: instagram, onChange: setInstagram, placeholder: 'https://instagram.com/your_profile' },
              { Icon: FacebookIcon,  label: 'Facebook',  value: facebook,  onChange: setFacebook,  placeholder: 'https://facebook.com/your_profile'  },
              { Icon: WattpadIcon,   label: 'Wattpad',   value: wattpad,   onChange: setWattpad,   placeholder: 'https://wattpad.com/user/your_profile' },
            ].map(({ Icon, label, value, onChange, placeholder }, i, arr) => (
              <View
                key={label}
                style={{
                  backgroundColor: '#FAF6F2',
                  borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
                  overflow: 'hidden',
                  marginTop: i === 0 ? 8 : 0,
                  borderBottomLeftRadius: i < arr.length - 1 ? 0 : 16,
                  borderBottomRightRadius: i < arr.length - 1 ? 0 : 16,
                  borderTopLeftRadius: i > 0 ? 0 : 16,
                  borderTopRightRadius: i > 0 ? 0 : 16,
                  borderTopWidth: i > 0 ? 0 : 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
                  <Icon size={18} />
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
                    {label}
                  </Text>
                </View>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder={placeholder}
                  placeholderTextColor="rgba(47,65,86,0.30)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  style={{
                    fontFamily: 'Inter_400Regular', fontSize: 14, color: '#2F4156',
                    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4,
                  }}
                />
              </View>
            ))}

            {/* Reading preferences */}
            <View ref={readingSectionRef} style={{ marginTop: 12 }}>
              <Text style={{
                fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2,
                textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 10,
              }}>
                Reading preferences
              </Text>

              <View style={{
                backgroundColor: '#FAF6F2',
                borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
                padding: 16, gap: 16,
              }}>
                {/* Font */}
                <View>
                  <Text style={{
                    fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2,
                    textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 8,
                  }}>
                    Font
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {([
                      { key: 'cormorant' as FontFamily, label: 'Serif', displayFont: 'CormorantGaramond_500Medium' },
                      { key: 'inter' as FontFamily, label: 'Sans', displayFont: 'Inter_600SemiBold' },
                    ]).map(({ key, label, displayFont }) => {
                      const active = readingFont === key;
                      return (
                        <Pressable
                          key={key}
                          onPress={() => setReadingFont(key)}
                          style={{
                            flex: 1, paddingVertical: 10, borderRadius: 8,
                            borderWidth: 1,
                            borderColor: active ? '#2F4156' : 'rgba(47,65,86,0.10)',
                            backgroundColor: active ? '#2F4156' : 'transparent',
                            alignItems: 'center', gap: 2,
                          }}
                        >
                          <Text style={{ fontFamily: displayFont, fontSize: 17, color: active ? '#F5EFEB' : '#2F4156' }}>Aa</Text>
                          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: active ? '#F5EFEB' : 'rgba(47,65,86,0.55)' }}>{label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Reading mode */}
                <View>
                  <Text style={{
                    fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2,
                    textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 8,
                  }}>
                    Reading mode
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(['pages', 'scroll'] as const).map((mode) => {
                      const active = readingMode === mode;
                      return (
                        <Pressable
                          key={mode}
                          onPress={() => setReadingMode(mode)}
                          style={{
                            flex: 1, paddingVertical: 10, borderRadius: 8,
                            borderWidth: 1,
                            borderColor: active ? '#2F4156' : 'rgba(47,65,86,0.10)',
                            backgroundColor: active ? '#2F4156' : 'transparent',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: active ? '#F5EFEB' : 'rgba(47,65,86,0.65)' }}>
                            {mode === 'pages' ? 'Pages' : 'Scroll'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Text size */}
                <View>
                  <Text style={{
                    fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2,
                    textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 8,
                  }}>
                    Text size
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {FONT_SIZES.map((s) => {
                      const active = readingFontSize === s;
                      return (
                        <Pressable
                          key={s}
                          onPress={() => setReadingFontSize(s)}
                          style={{
                            flex: 1, paddingVertical: 10, borderRadius: 8,
                            borderWidth: 1,
                            borderColor: active ? '#2F4156' : 'rgba(47,65,86,0.10)',
                            backgroundColor: active ? '#2F4156' : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Text style={{
                            fontFamily: 'CormorantGaramond_500Medium',
                            fontSize: Math.max(12, s / 1.4),
                            color: active ? '#F5EFEB' : '#2F4156',
                          }}>
                            Aa
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View>
                  <Text style={{
                    fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2,
                    textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 8,
                  }}>
                    Line spacing
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {LINE_SPACINGS.map(({ label, value }) => {
                      const active = Math.abs(readingLineSpacing - value) < 0.01;
                      return (
                        <Pressable
                          key={label}
                          onPress={() => setReadingLineSpacing(value)}
                          style={{
                            flex: 1, paddingVertical: 10, borderRadius: 8,
                            borderWidth: 1,
                            borderColor: active ? '#2F4156' : 'rgba(47,65,86,0.10)',
                            backgroundColor: active ? '#2F4156' : 'transparent',
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Text style={{
                            fontFamily: 'Inter_500Medium', fontSize: 11,
                            letterSpacing: 1.2, textTransform: 'uppercase',
                            color: active ? '#F5EFEB' : 'rgba(47,65,86,0.65)',
                          }}>
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Preview */}
                <View style={{
                  marginTop: 4,
                  borderTopWidth: 1, borderTopColor: 'rgba(47,65,86,0.10)',
                  paddingTop: 12,
                }}>
                  <Text style={{
                    fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2,
                    textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 8,
                  }}>
                    Preview
                  </Text>
                  <Text style={{
                    fontFamily: readingFont === 'inter' ? 'Inter_400Regular' : 'CormorantGaramond_400Regular',
                    fontSize: readingFontSize,
                    lineHeight: readingFontSize * readingLineSpacing,
                    color: '#2F4156',
                  }}>
                    The slow rain fell against the window, and she let the page settle in her lap.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
