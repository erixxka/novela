import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { StickyNote, Trash2 } from 'lucide-react-native';
import type { SnippetKind, StorySnippetRow } from '../../lib/database.types';
import type { SnippetInput } from '../../lib/queries/notes';
import { SNIPPET_KIND } from './snippetTheme';

const KINDS: SnippetKind[] = ['note', 'quote', 'dialogue', 'outline', 'prompt'];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      style={{
        fontFamily: 'Inter_500Medium',
        fontSize: 10,
        letterSpacing: 2.2,
        textTransform: 'uppercase',
        color: 'rgba(47,65,86,0.42)',
        marginBottom: 6,
      }}
    >
      {children}
    </Text>
  );
}

export function SnippetEditor({
  visible,
  initial,
  onClose,
  onSave,
  onDelete,
  saving,
}: {
  visible: boolean;
  initial: StorySnippetRow | null;
  onClose: () => void;
  onSave: (values: SnippetInput) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  saving?: boolean;
}) {
  const [kind, setKind] = useState<SnippetKind>('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    if (!visible) return;
    setKind(initial?.kind ?? 'note');
    setTitle(initial?.title ?? '');
    setBody(initial?.body ?? '');
  }, [visible, initial]);

  const handleSave = () => {
    const trimmed = body.trim();
    if (!trimmed) {
      Alert.alert('Body required', 'Write something before saving the snippet.');
      return;
    }
    onSave({
      kind,
      title: title.trim() || null,
      body: trimmed,
    });
  };

  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      'Delete snippet?',
      'This snippet will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void onDelete() },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(47,65,86,0.40)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: '#FAF6F2',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 28,
            maxHeight: '90%',
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'rgba(47,65,86,0.15)',
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'rgba(86,124,141,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StickyNote size={17} color="#567C8D" />
            </View>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_500Medium',
                fontSize: 22,
                color: '#2F4156',
              }}
            >
              {initial ? 'Edit snippet' : 'New snippet'}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 14 }}>
              <FieldLabel>Kind *</FieldLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {KINDS.map((k) => {
                  const meta = SNIPPET_KIND[k];
                  const active = kind === k;
                  return (
                    <Pressable
                      key={k}
                      onPress={() => setKind(k)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                        backgroundColor: active ? meta.color : meta.bg,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Inter_500Medium',
                          fontSize: 11,
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          color: active ? '#FAF6F2' : meta.color,
                        }}
                      >
                        {meta.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ marginBottom: 14 }}>
              <FieldLabel>Title (optional)</FieldLabel>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="A short label…"
                placeholderTextColor="rgba(47,65,86,0.35)"
                style={{
                  fontFamily: 'CormorantGaramond_400Regular',
                  fontSize: 16,
                  color: '#2F4156',
                  borderWidth: 1,
                  borderColor: 'rgba(47,65,86,0.14)',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: '#F5EFEB',
                }}
              />
            </View>

            <View style={{ marginBottom: 14 }}>
              <FieldLabel>Body *</FieldLabel>
              <TextInput
                value={body}
                onChangeText={setBody}
                placeholder="Write the note, quote, prompt…"
                placeholderTextColor="rgba(47,65,86,0.35)"
                multiline
                textAlignVertical="top"
                autoFocus={!initial}
                style={{
                  minHeight: 160,
                  fontFamily: 'CormorantGaramond_400Regular',
                  fontSize: 16,
                  lineHeight: 22,
                  color: '#2F4156',
                  borderWidth: 1,
                  borderColor: 'rgba(47,65,86,0.14)',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: '#F5EFEB',
                }}
              />
            </View>
          </ScrollView>

          <View style={{ gap: 10, marginTop: 4 }}>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={{
                backgroundColor: '#2F4156',
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 12,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  color: '#F5EFEB',
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              style={{
                paddingVertical: 14,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: 'rgba(47,65,86,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 12,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  color: 'rgba(47,65,86,0.55)',
                }}
              >
                Cancel
              </Text>
            </Pressable>
            {onDelete ? (
              <Pressable
                onPress={confirmDelete}
                style={{
                  paddingVertical: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Trash2 size={14} color="#C4534A" />
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 12,
                    letterSpacing: 1.4,
                    textTransform: 'uppercase',
                    color: '#C4534A',
                  }}
                >
                  Delete snippet
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
