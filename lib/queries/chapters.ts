import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { ChapterRow, ReadingProgressRow } from '../database.types';

export const chapterKeys = {
  forStory: (storyId: string) => ['chapters', 'story', storyId] as const,
  detail: (id: string) => ['chapters', id] as const,
  progress: (storyId: string) => ['reading_progress', storyId] as const,
  bookmarks: (chapterId: string) => ['bookmarks', chapterId] as const,
};

export function useChapters(storyId: string | undefined) {
  return useQuery({
    enabled: !!storyId,
    queryKey: storyId
      ? chapterKeys.forStory(storyId)
      : ['chapters', 'story', 'undefined'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', storyId!)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as ChapterRow[];
    },
  });
}

export function useChapter(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? chapterKeys.detail(id) : ['chapters', 'undefined'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as ChapterRow;
    },
  });
}

export function useCreateChapter(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const { data: existing } = await supabase
        .from('chapters')
        .select('order_index')
        .eq('story_id', storyId)
        .order('order_index', { ascending: false })
        .limit(1);
      const nextIndex = (existing?.[0]?.order_index ?? -1) + 1;

      const { data, error } = await supabase
        .from('chapters')
        .insert({
          story_id: storyId,
          title,
          content: {},
          content_text: '',
          order_index: nextIndex,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ChapterRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chapterKeys.forStory(storyId) }),
  });
}

export function useUpdateChapter(chapterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title?: string;
      content?: Record<string, unknown>;
      content_text?: string;
      order_index?: number;
    }) => {
      const { data, error } = await supabase
        .from('chapters')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', chapterId)
        .select()
        .single();
      if (error) throw error;
      return data as ChapterRow;
    },
    onSuccess: (chapter) => {
      qc.invalidateQueries({ queryKey: chapterKeys.detail(chapterId) });
      qc.invalidateQueries({ queryKey: chapterKeys.forStory(chapter.story_id) });
    },
  });
}

export function useDeleteChapter(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('chapters').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chapterKeys.forStory(storyId) }),
  });
}

export function useSaveProgress() {
  return useMutation({
    mutationFn: async (input: {
      storyId: string;
      chapterId: string;
      pageIndex: number;
      scrollPosition?: number;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;
      const { error } = await supabase.from('reading_progress').upsert({
        user_id: userId,
        story_id: input.storyId,
        chapter_id: input.chapterId,
        page_index: input.pageIndex,
        scroll_position: input.scrollPosition ?? 0,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
  });
}

export function useTotalWordCount() {
  return useQuery({
    queryKey: ['chapters', 'word-count'] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('content_text');
      if (error) throw error;
      return (data ?? []).reduce((sum: number, ch: any) => {
        const text: string = ch?.content_text?.trim() ?? '';
        if (!text) return sum;
        return sum + text.split(/\s+/).filter(Boolean).length;
      }, 0);
    },
  });
}

export function useTotalChapterCount() {
  return useQuery({
    queryKey: ['chapters', 'count'] as const,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('chapters')
        .select('id', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useAllProgress() {
  return useQuery({
    queryKey: ['reading_progress', 'all'] as const,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return [] as ReadingProgressRow[];
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReadingProgressRow[];
    },
  });
}

export function useRecentProgress() {
  return useQuery({
    queryKey: ['reading_progress', 'recent'] as const,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return null;
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as ReadingProgressRow | null;
    },
  });
}

export function useProgress(storyId: string | undefined) {
  return useQuery({
    enabled: !!storyId,
    queryKey: storyId
      ? chapterKeys.progress(storyId)
      : ['reading_progress', 'undefined'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*')
        .eq('story_id', storyId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useBookmarks(chapterId: string | undefined) {
  return useQuery({
    enabled: !!chapterId,
    queryKey: chapterId
      ? chapterKeys.bookmarks(chapterId)
      : ['bookmarks', 'undefined'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('chapter_id', chapterId!)
        .order('page_index', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddBookmark(chapterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { pageIndex?: number; scrollPosition?: number; note?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');

      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: userId,
          chapter_id: chapterId,
          page_index: input.pageIndex ?? 0,
          scroll_position: input.scrollPosition ?? 0,
          note: input.note ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chapterKeys.bookmarks(chapterId) }),
  });
}

export function useDeleteBookmark(chapterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: chapterKeys.bookmarks(chapterId) }),
  });
}
