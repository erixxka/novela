import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { X } from 'lucide-react-native';

export function ChipListEditor({
  label,
  value,
  onChange,
  placeholder = 'Add…',
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (value.includes(t)) {
      setDraft('');
      return;
    }
    onChange([...value, t]);
    setDraft('');
  };

  const remove = (chip: string) => onChange(value.filter((c) => c !== chip));

  return (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          letterSpacing: 2.2,
          textTransform: 'uppercase',
          color: 'rgba(47,65,86,0.42)',
        }}
      >
        {label}
      </Text>

      {value.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {value.map((chip) => (
            <Pressable
              key={chip}
              onPress={() => remove(chip)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: 'rgba(86,124,141,0.12)',
                borderRadius: 999,
                paddingLeft: 10,
                paddingRight: 6,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#567C8D' }}>
                {chip}
              </Text>
              <X size={12} color="rgba(86,124,141,0.65)" />
            </Pressable>
          ))}
        </View>
      ) : null}

      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        placeholderTextColor="rgba(47,65,86,0.42)"
        returnKeyType="done"
        onSubmitEditing={add}
        blurOnSubmit={false}
        style={{
          fontFamily: 'CormorantGaramond_400Regular',
          fontSize: 16,
          color: '#2F4156',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(47,65,86,0.18)',
          paddingVertical: 6,
        }}
      />
    </View>
  );
}
