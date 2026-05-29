import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { ReadingListRow, StoryRow } from '../database.types';

export const readingListKeys = {
  all: ['reading_list'] as const,
};

export type ReadingListEntry = ReadingListRow & { stories: StoryRow };

export function useReadingList() {
  return useQuery({
    queryKey: readingListKeys.all,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [] as ReadingListEntry[];
      const { data, error } = await supabase
        .from('reading_list')
        .select('*, stories:story_id(*)')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReadingListEntry[];
    },
  });
}

export function useToggleReadingList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ storyId, inList }: { storyId: string; inList: boolean }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');
      if (inList) {
        const { error } = await supabase
          .from('reading_list')
          .delete()
          .eq('user_id', userId)
          .eq('story_id', storyId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('reading_list')
          .insert({ user_id: userId, story_id: storyId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: readingListKeys.all }),
  });
}
