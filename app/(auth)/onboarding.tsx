import { useState } from 'react';
import {
  Pressable, Text, TextInput, View,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

const GOAL_OPTIONS = ['250', '500', '1000', '1500'];

const STEPS = [
  {
    eyebrow: 'Welcome',
    title: 'A quiet place to\nread and write',
    body: 'Novella holds your manuscripts and your reading list side by side — one identity, two modes. No streaks shouting at you. Just the work, and the books you love.',
    art: 'pages' as const,
    bg: '#C8D9E6',
  },
  {
    eyebrow: 'About you',
    title: 'What should we\ncall you?',
    body: 'This is the only place we use your name. The library and your drafts stay just yours.',
    art: 'name' as const,
    bg: '#FAF6F2',
  },
  {
    eyebrow: 'A small goal',
    title: 'How many words\na day?',
    body: 'You can change this anytime, or turn it off. Most days I aim for a single good paragraph.',
    art: 'goal' as const,
    bg: '#ECE3DC',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('1000');

  const cur = STEPS[step];

  const finish = async () => {
    if (name.trim()) {
      await supabase.auth.updateUser({ data: { display_name: name.trim() } });
    }
    await AsyncStorage.multiSet([
      ['novella.onboarded', 'true'],
      ['novella.daily_goal', goal],
    ]);
    router.replace('/(tabs)');
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EFEB' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 8 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
              Novella
            </Text>
            {step < STEPS.length - 1 && (
              <Pressable onPress={finish}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.42)' }}>
                  Skip
                </Text>
              </Pressable>
            )}
          </View>

          {/* Art area */}
          <View style={{
            marginTop: 18, height: 260, borderRadius: 16, overflow: 'hidden',
            backgroundColor: cur.bg,
            borderWidth: cur.art === 'name' ? 1 : 0,
            borderColor: 'rgba(47,65,86,0.10)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {cur.art === 'pages' && (
              <View style={{ width: 200, height: 180, position: 'relative' }}>
                {/* Back book */}
                <View style={{
                  position: 'absolute', left: 0, top: 14,
                  width: 110, height: 150,
                  backgroundColor: '#FAF6F2', borderRadius: 4,
                  transform: [{ rotate: '-6deg' }],
                  shadowColor: '#2F4156', shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.15, shadowRadius: 20, elevation: 6,
                }} />
                {/* Front book */}
                <View style={{
                  position: 'absolute', left: 40, top: 0,
                  width: 120, height: 160,
                  backgroundColor: '#F5EFEB', borderRadius: 4,
                  transform: [{ rotate: '3deg' }],
                  shadowColor: '#2F4156', shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.18, shadowRadius: 20, elevation: 8,
                  padding: 14,
                }}>
                  <Text style={{ fontFamily: 'CormorantGaramond_500Medium', fontSize: 18, color: '#2F4156', lineHeight: 20 }}>
                    Salt Light
                  </Text>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 9, color: 'rgba(47,65,86,0.42)', marginTop: 5 }}>
                    a novel in seven seasons
                  </Text>
                  <View style={{ height: 1, backgroundColor: 'rgba(47,65,86,0.10)', marginVertical: 10 }} />
                  <Text style={{ fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 9, color: 'rgba(47,65,86,0.65)', lineHeight: 14 }}>
                    The lamp had been off for nine days when Mira finally climbed the stairs.
                  </Text>
                </View>
              </View>
            )}

            {cur.art === 'name' && (
              <View style={{ width: '80%' }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginBottom: 10 }}>
                  Your name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="rgba(47,65,86,0.30)"
                  autoFocus
                  autoCapitalize="words"
                  style={{
                    fontFamily: 'CormorantGaramond_400Regular',
                    fontSize: 36, color: '#2F4156',
                    borderBottomWidth: 1, borderBottomColor: '#2F4156',
                    paddingVertical: 4, letterSpacing: -0.3,
                  }}
                />
              </View>
            )}

            {cur.art === 'goal' && (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 88, color: '#2F4156', lineHeight: 88 }}>
                  {goal}
                </Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)', marginTop: 4 }}>
                  words / day
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                  {GOAL_OPTIONS.map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setGoal(g)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                        backgroundColor: goal === g ? '#2F4156' : '#FAF6F2',
                        borderWidth: 1, borderColor: goal === g ? '#2F4156' : 'rgba(47,65,86,0.18)',
                      }}
                    >
                      <Text style={{
                        fontFamily: 'Inter_400Regular', fontSize: 13,
                        color: goal === g ? '#F5EFEB' : '#2F4156',
                      }}>
                        {g}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Text */}
          <View style={{ marginTop: 28 }}>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 10, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(47,65,86,0.42)' }}>
              {cur.eyebrow}
            </Text>
            <Text style={{ fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, color: '#2F4156', lineHeight: 33, marginTop: 10, marginBottom: 12 }}>
              {cur.title}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(47,65,86,0.65)', lineHeight: 22 }}>
              {cur.body}
            </Text>
          </View>

          <View style={{ flex: 1, minHeight: 20 }} />

          {/* Dots + CTA */}
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={{
                    height: 4, borderRadius: 2,
                    backgroundColor: i === step ? '#2F4156' : 'rgba(47,65,86,0.18)',
                    width: i === step ? 22 : 6,
                  }}
                />
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              {step > 0 && (
                <Pressable
                  onPress={() => setStep(step - 1)}
                  style={{
                    width: 50, height: 50, borderRadius: 999,
                    borderWidth: 1, borderColor: 'rgba(47,65,86,0.18)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ArrowLeft size={16} color="rgba(47,65,86,0.65)" />
                </Pressable>
              )}
              <Pressable
                onPress={next}
                style={{
                  flex: 1, height: 50, borderRadius: 999,
                  backgroundColor: '#2F4156',
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: '#F5EFEB' }}>
                  {step < STEPS.length - 1 ? 'Continue' : 'Begin'}
                </Text>
                <ArrowRight size={14} color="#F5EFEB" />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
