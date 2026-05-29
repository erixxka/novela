import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useStoryNotes, useUpsertStoryNotes } from '../../lib/queries/notes';
import { ChipListEditor } from './ChipListEditor';
import { SectionCard } from './SectionCard';

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

function TextArea({
  label,
  value,
  onChangeText,
  minHeight,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  minHeight: number;
  placeholder?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(47,65,86,0.35)"
        multiline
        textAlignVertical="top"
        style={{
          minHeight,
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

export function ConceptSection({ storyId }: { storyId: string }) {
  const { data, isLoading } = useStoryNotes(storyId);
  const upsert = useUpsertStoryNotes();
  const hasLoadedRef = useRef(false);

  const [titles, setTitles] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [outline, setOutline] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Initialize from data when it first arrives
  useEffect(() => {
    if (hasLoadedRef.current) return;
    if (isLoading) return;
    hasLoadedRef.current = true;
    if (data) {
      setTitles(data.possible_titles ?? []);
      setSummary(data.summary ?? '');
      setOutline(data.outline ?? '');
      setGenres(data.genres ?? []);
      setThemes(data.themes ?? []);
    }
  }, [data, isLoading]);

  // Debounced auto-save
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const t = setTimeout(() => {
      upsert.mutate(
        {
          storyId,
          possible_titles: titles,
          summary,
          outline,
          genres,
          themes,
        },
        {
          onSuccess: () => setSavedAt(Date.now()),
        }
      );
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titles, summary, outline, genres, themes]);

  const savedRecently = savedAt != null && Date.now() - savedAt < 4000;

  return (
    <SectionCard
      title="Outline & Concept"
      eyebrow="Section one"
      rightSlot={
        savedRecently ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Check size={12} color="rgba(86,124,141,0.85)" />
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 11,
                color: 'rgba(86,124,141,0.85)',
              }}
            >
              Saved
            </Text>
          </View>
        ) : null
      }
    >
      <ChipListEditor
        label="Possible titles"
        value={titles}
        onChange={setTitles}
        placeholder="Add a title…"
      />
      <TextArea
        label="Summary"
        value={summary}
        onChangeText={setSummary}
        minHeight={80}
        placeholder="A short pitch of the story…"
      />
      <TextArea
        label="Outline"
        value={outline}
        onChangeText={setOutline}
        minHeight={160}
        placeholder="Beats, acts, turning points…"
      />
      <ChipListEditor label="Genres" value={genres} onChange={setGenres} placeholder="Add a genre…" />
      <ChipListEditor label="Themes" value={themes} onChange={setThemes} placeholder="Add a theme…" />
    </SectionCard>
  );
}
