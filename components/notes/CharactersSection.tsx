import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus, Users } from 'lucide-react-native';
import type { StoryCharacterRow } from '../../lib/database.types';
import {
  useCharacters,
  useCreateCharacter,
  useDeleteCharacter,
  useUpdateCharacter,
} from '../../lib/queries/notes';
import { SectionCard } from './SectionCard';
import { CharacterEditor } from './CharacterEditor';

function CharacterCard({
  character,
  onPress,
}: {
  character: StoryCharacterRow;
  onPress: () => void;
}) {
  const initials = character.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  const summaryBits = [character.age, character.occupation].filter(Boolean) as string[];
  const subtitle = summaryBits.join(' · ');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: pressed ? 'rgba(47,65,86,0.06)' : '#F5EFEB',
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: 'rgba(86,124,141,0.14)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'CormorantGaramond_500Medium',
            fontSize: 16,
            color: '#567C8D',
          }}
        >
          {initials || '·'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: 'CormorantGaramond_500Medium',
            fontSize: 18,
            color: '#2F4156',
            lineHeight: 22,
          }}
        >
          {character.name}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: 'rgba(47,65,86,0.55)',
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {character.role ? (
        <View
          style={{
            backgroundColor: 'rgba(86,124,141,0.14)',
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 3,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 10,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: '#567C8D',
            }}
          >
            {character.role}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: '#2F4156',
      }}>
        <Plus size={14} color="#F5EFEB" />
        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: '#F5EFEB' }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyRow({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
      }}
    >
      <Users size={16} color="rgba(47,65,86,0.42)" />
      <Text
        style={{
          fontFamily: 'CormorantGaramond_400Regular_Italic',
          fontSize: 15,
          color: 'rgba(47,65,86,0.55)',
        }}
      >
        {text}
      </Text>
    </Pressable>
  );
}

export function CharactersSection({ storyId }: { storyId: string }) {
  const { data: characters } = useCharacters(storyId);
  const [editing, setEditing] = useState<StoryCharacterRow | 'new' | null>(null);
  const createCharacter = useCreateCharacter(storyId);
  const updateCharacter = useUpdateCharacter(storyId);
  const deleteCharacter = useDeleteCharacter(storyId);

  const list = characters ?? [];

  return (
    <SectionCard title="Characters" eyebrow="Section two" count={list.length}>
      {list.length === 0 ? (
        <EmptyRow text="Add your first character" onPress={() => setEditing('new')} />
      ) : (
        list.map((c) => <CharacterCard key={c.id} character={c} onPress={() => setEditing(c)} />)
      )}
      <AddButton label="Add character" onPress={() => setEditing('new')} />

      <CharacterEditor
        visible={editing !== null}
        initial={editing && editing !== 'new' ? editing : null}
        saving={createCharacter.isPending || updateCharacter.isPending}
        onClose={() => setEditing(null)}
        onSave={async (values) => {
          if (editing === 'new') {
            await createCharacter.mutateAsync(values);
          } else if (editing) {
            await updateCharacter.mutateAsync({ id: editing.id, ...values });
          }
          setEditing(null);
        }}
        onDelete={
          editing && editing !== 'new'
            ? async () => {
                await deleteCharacter.mutateAsync(editing.id);
                setEditing(null);
              }
            : undefined
        }
      />
    </SectionCard>
  );
}
