import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

type Mode = 'signin' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim()) { setError('Enter your email'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email: email.trim(), password });
      setLoading(false);
      if (err) { setError(err.message); return; }
      setCheckEmail(true);
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setLoading(false);
      if (err) { setError(err.message); return; }
    }
  };

  if (checkEmail) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }}>
        <View style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center' }}>
          <View style={{
            backgroundColor: '#FAF6F2', borderRadius: 16,
            borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)', padding: 28,
          }}>
            <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 24, color: '#2F4156', marginBottom: 10 }}>
              Check your email
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.65)', lineHeight: 22 }}>
              We sent a confirmation link to{'\n'}
              <Text style={{ color: '#2F4156', fontFamily: 'Inter_500Medium' }}>{email}</Text>
              {'\n\n'}Tap the link in that email to activate your account, then come back and sign in.
            </Text>
            <Pressable onPress={() => { setCheckEmail(false); setMode('signin'); }} style={{ marginTop: 20 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#567C8D' }}>
                Back to sign in
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 32, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <View style={{
              width: 64, height: 64, borderRadius: 16,
              backgroundColor: '#C8D9E6',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 28, color: '#2F4156' }}>N</Text>
            </View>
            <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: 38, color: '#2F4156', lineHeight: 40 }}>
              {'noveḷɑ'}
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: 'rgba(47,65,86,0.65)', marginTop: 6 }}>
              A quiet place to read and write.
            </Text>
          </View>

          {/* Mode toggle */}
          <View style={{
            backgroundColor: '#FAF6F2', borderRadius: 999,
            borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
            padding: 4, flexDirection: 'row', marginBottom: 24,
          }}>
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => { setMode(m); setError(null); }}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 999,
                  backgroundColor: mode === m ? '#2F4156' : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontFamily: 'Inter_500Medium', fontSize: 11,
                  letterSpacing: 1.8, textTransform: 'uppercase',
                  color: mode === m ? '#F5EFEB' : 'rgba(47,65,86,0.42)',
                }}>
                  {m === 'signin' ? 'Sign in' : 'Create account'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Fields */}
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, letterSpacing: 0.5, color: 'rgba(47,65,86,0.65)', marginBottom: 6 }}>
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="rgba(47,65,86,0.35)"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                style={{
                  backgroundColor: '#FAF6F2',
                  borderWidth: 1, borderColor: 'rgba(47,65,86,0.18)',
                  borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
                  fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2F4156',
                }}
              />
            </View>

            <View>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, letterSpacing: 0.5, color: 'rgba(47,65,86,0.65)', marginBottom: 6 }}>
                Password
              </Text>
              <View style={{
                backgroundColor: '#FAF6F2',
                borderWidth: 1, borderColor: 'rgba(47,65,86,0.18)',
                borderRadius: 12, flexDirection: 'row', alignItems: 'center',
                paddingHorizontal: 16,
              }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(47,65,86,0.35)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={{
                    flex: 1, paddingVertical: 14,
                    fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2F4156',
                  }}
                />
                <Pressable onPress={() => setShowPassword(v => !v)} style={{ padding: 4 }}>
                  {showPassword
                    ? <EyeOff size={18} color="rgba(47,65,86,0.42)" />
                    : <Eye size={18} color="rgba(47,65,86,0.42)" />
                  }
                </Pressable>
              </View>
            </View>
          </View>

          {error ? (
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#ef4444', marginTop: 10 }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={submit}
            disabled={loading}
            style={{
              backgroundColor: '#2F4156', borderRadius: 999,
              paddingVertical: 15, alignItems: 'center', marginTop: 20,
            }}
          >
            {loading
              ? <ActivityIndicator color="#F5EFEB" />
              : <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#F5EFEB' }}>
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </Text>
            }
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
