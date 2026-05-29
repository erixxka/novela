import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';

export default function ContactScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const canSend = name.trim() && email.trim() && message.trim();

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    const subject = encodeURIComponent(`Message from ${name.trim()}`);
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}${phone.trim() ? `\nPhone: ${phone.trim()}` : ''}\n\n${message.trim()}`
    );
    const url = `mailto:erickadichon@gmail.com?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open mail app', 'Please email erickadichon@gmail.com directly.');
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    fontFamily: 'Inter_400Regular' as const,
    fontSize: 14,
    color: '#2F4156',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(47,65,86,0.15)',
    paddingVertical: 10,
  };

  const labelStyle = {
    fontFamily: 'Inter_500Medium' as const,
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
    color: 'rgba(47,65,86,0.42)',
    marginBottom: 4,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Nav */}
          <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
            <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={20} color="rgba(47,65,86,0.65)" />
            </Pressable>
          </View>

          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28 }}>
            <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 34, color: '#2F4156', lineHeight: 36 }}>
              Get in touch
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: 'rgba(47,65,86,0.55)', marginTop: 6, lineHeight: 22 }}>
              I read every message.
            </Text>
          </View>

          {/* Form */}
          <View style={{
            marginHorizontal: 20,
            backgroundColor: '#FAF6F2',
            borderRadius: 16, borderWidth: 1, borderColor: 'rgba(47,65,86,0.10)',
            padding: 20, gap: 20,
          }}>
            {/* Name */}
            <View>
              <Text style={labelStyle}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="rgba(47,65,86,0.30)"
                style={inputStyle}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View>
              <Text style={labelStyle}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="rgba(47,65,86,0.30)"
                style={inputStyle}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Phone */}
            <View>
              <Text style={labelStyle}>Phone <Text style={{ fontFamily: 'Inter_400Regular', letterSpacing: 0, textTransform: 'none', fontSize: 10, color: 'rgba(47,65,86,0.30)' }}>optional</Text></Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+1 000 000 0000"
                placeholderTextColor="rgba(47,65,86,0.30)"
                style={inputStyle}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

            {/* Message */}
            <View>
              <Text style={labelStyle}>Message</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="What's on your mind?"
                placeholderTextColor="rgba(47,65,86,0.30)"
                style={[inputStyle, { borderBottomWidth: 0, minHeight: 100, textAlignVertical: 'top', paddingTop: 2 }]}
                multiline
                returnKeyType="default"
              />
            </View>
          </View>

          {/* Send */}
          <Pressable
            onPress={send}
            disabled={!canSend || sending}
            style={({ pressed }) => ({
              marginHorizontal: 20, marginTop: 16,
              backgroundColor: canSend ? '#2F4156' : 'rgba(47,65,86,0.20)',
              borderRadius: 999,
              paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Send size={14} color={canSend ? '#F5EFEB' : 'rgba(47,65,86,0.40)'} />
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 1.8, textTransform: 'uppercase', color: canSend ? '#F5EFEB' : 'rgba(47,65,86,0.40)' }}>
              {sending ? 'Opening mail…' : 'Send message'}
            </Text>
          </Pressable>

          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.35)', textAlign: 'center', marginTop: 12, marginHorizontal: 32 }}>
            This will open your mail app with the message pre-filled.
          </Text>
          <Text style={{ fontFamily: 'CormorantGlyphs_400Regular', fontSize: 32, color: '#2F4156', textAlign: 'center', marginTop: 32, marginBottom: 8 }}>
            {'noveḷɑ'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
