import { Pressable, Text, View } from 'react-native';
import type { FontFamily } from './renderBlocks';

const FONT_SIZES = [16, 18, 19, 22, 26] as const;
const LINE_SPACINGS = [
  { label: 'Tight', value: 1.5 },
  { label: 'Normal', value: 1.7 },
  { label: 'Loose', value: 1.95 },
] as const;

export function SettingsPopover({
  fontSize,
  lineSpacing,
  fontFamily,
  readingMode,
  onChangeFontSize,
  onChangeLineSpacing,
  onChangeFontFamily,
  onChangeReadingMode,
}: {
  fontSize: number;
  lineSpacing: number;
  fontFamily: FontFamily;
  readingMode: 'pages' | 'scroll';
  onChangeFontSize: (size: number) => void;
  onChangeLineSpacing: (spacing: number) => void;
  onChangeFontFamily: (family: FontFamily) => void;
  onChangeReadingMode: (mode: 'pages' | 'scroll') => void;
}) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 64,
        right: 12,
        width: 272,
        backgroundColor: '#FAF6F2',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(47,65,86,0.10)',
        padding: 14,
        shadowColor: '#2F4156',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 18,
        elevation: 10,
      }}
    >
      {/* Font family */}
      <Text style={eyebrow}>Font</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <Pressable
          onPress={() => onChangeFontFamily('cormorant')}
          style={[chipStyle, fontFamily === 'cormorant' && chipActiveStyle]}
        >
          <Text
            style={{
              fontFamily: 'CormorantGaramond_500Medium',
              fontSize: 17,
              color: fontFamily === 'cormorant' ? '#F5EFEB' : '#2F4156',
            }}
          >
            Aa
          </Text>
          <Text style={[chipLabel, { color: fontFamily === 'cormorant' ? '#F5EFEB' : 'rgba(47,65,86,0.55)' }]}>
            Serif
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onChangeFontFamily('inter')}
          style={[chipStyle, fontFamily === 'inter' && chipActiveStyle]}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 13,
              color: fontFamily === 'inter' ? '#F5EFEB' : '#2F4156',
            }}
          >
            Aa
          </Text>
          <Text style={[chipLabel, { color: fontFamily === 'inter' ? '#F5EFEB' : 'rgba(47,65,86,0.55)' }]}>
            Sans
          </Text>
        </Pressable>
      </View>

      {/* Text size */}
      <Text style={[eyebrow, { marginTop: 16 }]}>Text size</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
        {FONT_SIZES.map((s) => {
          const active = fontSize === s;
          return (
            <Pressable
              key={s}
              onPress={() => onChangeFontSize(s)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: active ? '#2F4156' : 'rgba(47,65,86,0.10)',
                backgroundColor: active ? '#2F4156' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'CormorantGaramond_500Medium',
                  fontSize: Math.max(12, s / 1.4),
                  color: active ? '#F5EFEB' : '#2F4156',
                }}
              >
                Aa
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Line spacing */}
      <Text style={[eyebrow, { marginTop: 16 }]}>Line spacing</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
        {LINE_SPACINGS.map(({ label, value }) => {
          const active = Math.abs(lineSpacing - value) < 0.01;
          return (
            <Pressable
              key={label}
              onPress={() => onChangeLineSpacing(value)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: active ? '#2F4156' : 'rgba(47,65,86,0.10)',
                backgroundColor: active ? '#2F4156' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: active ? '#F5EFEB' : 'rgba(47,65,86,0.65)',
                }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Reading mode */}
      <Text style={[eyebrow, { marginTop: 16 }]}>Reading</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        {(['pages', 'scroll'] as const).map((mode) => {
          const active = readingMode === mode;
          return (
            <Pressable
              key={mode}
              onPress={() => onChangeReadingMode(mode)}
              style={[chipStyle, active && chipActiveStyle, { flex: 1 }]}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 11,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  color: active ? '#F5EFEB' : 'rgba(47,65,86,0.65)',
                }}
              >
                {mode === 'pages' ? 'Pages' : 'Scroll'}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const eyebrow = {
  fontFamily: 'Inter_500Medium',
  fontSize: 10,
  letterSpacing: 2,
  textTransform: 'uppercase' as const,
  color: 'rgba(47,65,86,0.42)',
};

const chipStyle = {
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: 'rgba(47,65,86,0.10)' as string,
  backgroundColor: 'transparent' as string,
  alignItems: 'center' as const,
  gap: 2,
};

const chipActiveStyle = {
  backgroundColor: '#2F4156',
  borderColor: '#2F4156',
};

const chipLabel = {
  fontFamily: 'Inter_500Medium',
  fontSize: 10,
  letterSpacing: 1.4,
  textTransform: 'uppercase' as const,
};
