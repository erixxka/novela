import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChange: (text: string) => void;
  editable?: boolean;
};

export function RichTextEditor({ value, onChange, editable = true }: Props) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          editable={editable}
          multiline
          scrollEnabled={false}
          placeholder="Begin writing…"
          placeholderTextColor="rgba(47,65,86,0.30)"
          textAlignVertical="top"
          style={{
            fontFamily: 'CormorantGaramond_400Regular',
            fontSize: 18,
            lineHeight: 30,
            color: '#2F4156',
            minHeight: 400,
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
