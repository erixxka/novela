import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { X } from 'lucide-react-native';

export function TagPicker({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim().toLowerCase();
    if (!value) return;
    if (!tags.includes(value)) onChange([...tags, value]);
    setDraft('');
  };

  const remove = (t: string) => onChange(tags.filter((x) => x !== t));

  return (
    <View>
      {tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {tags.map((t) => (
            <Pressable
              key={t}
              onPress={() => remove(t)}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: 'rgba(86,124,141,0.12)',
                borderRadius: 999,
                paddingHorizontal: 12, paddingVertical: 6,
              }}
            >
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#567C8D' }}>
                {t}
              </Text>
              <X size={11} color="#567C8D" />
            </Pressable>
          ))}
        </View>
      )}
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={add}
        placeholder="Add a tag and press return"
        placeholderTextColor="rgba(47,65,86,0.35)"
        autoCapitalize="none"
        returnKeyType="done"
        style={{
          backgroundColor: '#FAF6F2',
          borderWidth: 1, borderColor: 'rgba(47,65,86,0.18)',
          borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
          fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2F4156',
        }}
      />
    </View>
  );
}
