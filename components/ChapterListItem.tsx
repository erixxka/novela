import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react-native';
import type { ChapterRow } from '../lib/database.types';

export function ChapterListItem({
  storyId,
  chapter,
  index,
  isActive,
  onDelete,
}: {
  storyId: string;
  chapter: ChapterRow;
  index: number;
  isActive?: boolean;
  onDelete?: () => void;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(47,65,86,0.10)',
      backgroundColor: isActive ? 'rgba(86,124,141,0.12)' : 'transparent',
    }}>
      <Link href={`/story/${storyId}/chapter/${chapter.id}/read`} asChild>
        <Pressable style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 }}>
          {/* Chapter number */}
          <Text style={{
            fontFamily: 'CormorantGaramond_400Regular',
            fontSize: 22, fontWeight: '300', lineHeight: 24,
            color: isActive ? '#567C8D' : 'rgba(47,65,86,0.42)',
            width: 28,
          }}>
            {String(index + 1).padStart(2, '0')}
          </Text>

          {/* Title + meta */}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontFamily: isActive ? 'CormorantGaramond_500Medium' : 'CormorantGaramond_400Regular',
              fontSize: 17, lineHeight: 20, color: '#2F4156',
            }}>
              {chapter.title}
            </Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(47,65,86,0.42)', marginTop: 2 }}>
              {chapter.content_text
                ? `${chapter.content_text.trim().split(/\s+/).length.toLocaleString()} words`
                : 'empty'}
              {isActive ? ' · in progress' : ''}
            </Text>
          </View>

          {isActive
            ? <ChevronRight size={14} color="rgba(47,65,86,0.42)" />
            : <ChevronRight size={14} color="rgba(47,65,86,0.42)" />
          }
        </Pressable>
      </Link>

      <Link href={`/story/${storyId}/chapter/${chapter.id}/edit`} asChild>
        <Pressable style={{ paddingHorizontal: 10, paddingVertical: 14 }}>
          <Pencil size={15} color="rgba(47,65,86,0.42)" />
        </Pressable>
      </Link>
      {onDelete ? (
        <Pressable onPress={onDelete} style={{ paddingHorizontal: 12, paddingVertical: 14 }}>
          <Trash2 size={15} color="rgba(196,83,74,0.65)" />
        </Pressable>
      ) : null}
    </View>
  );
}
