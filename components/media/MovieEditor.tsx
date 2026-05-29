import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Film, Trash2 } from 'lucide-react-native';
import type { MediaMovieRow } from '../../lib/database.types';
import type { MovieInput } from '../../lib/queries/media';
import { MediaImagePicker } from './MediaImagePicker';

function FieldLabel({ children }: { children: React.ReactNode }) {
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

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  minHeight,
  autoFocus,
  required,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  multiline?: boolean;
  minHeight?: number;
  autoFocus?: boolean;
  required?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <FieldLabel>
        {label}
        {required ? ' *' : ''}
      </FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(47,65,86,0.35)"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        autoFocus={autoFocus}
        style={{
          minHeight: multiline ? (minHeight ?? 60) : undefined,
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
  );
}

export function MovieEditor({
  visible,
  initial,
  onClose,
  onSave,
  onDelete,
  saving,
}: {
  visible: boolean;
  initial: MediaMovieRow | null;
  onClose: () => void;
  onSave: (values: MovieInput) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  saving?: boolean;
}) {
  const [title, setTitle] = useState('');
  const [director, setDirector] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [snippet, setSnippet] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? '');
    setDirector(initial?.director ?? '');
    setYear(initial?.year ?? '');
    setGenre(initial?.genre ?? '');
    setImagePath(initial?.image_path ?? null);
    setSnippet(initial?.snippet ?? '');
  }, [visible, initial]);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Title required', 'Give this movie a title before saving.');
      return;
    }
    onSave({
      title: trimmed,
      director: director.trim() || null,
      year: year.trim() || null,
      genre: genre.trim() || null,
      image_path: imagePath,
      snippet: snippet.trim() || null,
    });
  };

  const confirmDelete = () => {
    if (!onDelete || !initial) return;
    Alert.alert(
      'Delete movie?',
      `"${initial.title}" will be permanently removed.`,
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
              <Film size={17} color="#567C8D" />
            </View>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_500Medium',
                fontSize: 22,
                color: '#2F4156',
              }}
            >
              {initial ? 'Edit movie' : 'New movie'}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginBottom: 18 }}>
              <MediaImagePicker
                value={imagePath}
                onChange={setImagePath}
                kind="movies"
                aspect={[2, 3]}
              />
            </View>

            <TextField label="Title" value={title} onChangeText={setTitle} required autoFocus />
            <TextField label="Director" value={director} onChangeText={setDirector} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextField label="Year" value={year} onChangeText={setYear} placeholder="e.g. 1994" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="Genre" value={genre} onChangeText={setGenre} />
              </View>
            </View>
            <TextField
              label="Favorite quote / notes"
              value={snippet}
              onChangeText={setSnippet}
              multiline
              minHeight={120}
              placeholder="A line that stays with you…"
            />
          </ScrollView>

          <View style={{ gap: 10, marginTop: 12 }}>
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
                  Delete movie
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
