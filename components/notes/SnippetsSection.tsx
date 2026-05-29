import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Plus, StickyNote } from 'lucide-react-native';
import type { StorySnippetRow } from '../../lib/database.types';
import {
  useCreateSnippet,
  useDeleteSnippet,
  useSnippets,
  useUpdateSnippet,
} from '../../lib/queries/notes';
import { SectionCard } from './SectionCard';
import { SnippetEditor } from './SnippetEditor';
import { SNIPPET_KIND } from './snippetTheme';

function SnippetCard({ snippet, onPress }: { snippet: StorySnippetRow; onPress: () => void }) {
  const meta = SNIPPET_KIND[snippet.kind];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: pressed ? 'rgba(47,65,86,0.06)' : '#F5EFEB',
        gap: 6,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            backgroundColor: meta.bg,
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
              color: meta.color,
            }}
          >
            {meta.label}
          </Text>
        </View>
        {snippet.title ? (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily: 'CormorantGaramond_500Medium',
              fontSize: 18,
              color: '#2F4156',
            }}
          >
            {snippet.title}
          </Text>
        ) : null}
      </View>
      <Text
        numberOfLines={3}
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          lineHeight: 19,
          color: 'rgba(47,65,86,0.75)',
        }}
      >
        {snippet.body}
      </Text>
    </Pressable>
  );
}

function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(47,65,86,0.20)',
        backgroundColor: pressed ? 'rgba(47,65,86,0.04)' : 'transparent',
      })}
    >
      <Plus size={14} color="#567C8D" />
      <Text
        style={{
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: '#567C8D',
        }}
      >
        {label}
      </Text>
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
      <StickyNote size={16} color="rgba(47,65,86,0.42)" />
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

export function SnippetsSection({ storyId }: { storyId: string }) {
  const { data: snippets } = useSnippets(storyId);
  const [editing, setEditing] = useState<StorySnippetRow | 'new' | null>(null);
  const createSnippet = useCreateSnippet(storyId);
  const updateSnippet = useUpdateSnippet(storyId);
  const deleteSnippet = useDeleteSnippet(storyId);

  const list = snippets ?? [];

  return (
    <SectionCard title="Snippets" eyebrow="Section three" count={list.length}>
      {list.length === 0 ? (
        <EmptyRow text="Add your first snippet" onPress={() => setEditing('new')} />
      ) : (
        list.map((s) => <SnippetCard key={s.id} snippet={s} onPress={() => setEditing(s)} />)
      )}
      <AddButton label="Add snippet" onPress={() => setEditing('new')} />

      <SnippetEditor
        visible={editing !== null}
        initial={editing && editing !== 'new' ? editing : null}
        saving={createSnippet.isPending || updateSnippet.isPending}
        onClose={() => setEditing(null)}
        onSave={async (values) => {
          if (editing === 'new') {
            await createSnippet.mutateAsync(values);
          } else if (editing) {
            await updateSnippet.mutateAsync({ id: editing.id, ...values });
          }
          setEditing(null);
        }}
        onDelete={
          editing && editing !== 'new'
            ? async () => {
                await deleteSnippet.mutateAsync(editing.id);
                setEditing(null);
              }
            : undefined
        }
      />
    </SectionCard>
  );
}
