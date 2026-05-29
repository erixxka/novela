import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { StoryRow, StoryStatus, TagRow } from '../database.types';

export const storyKeys = {
  all: ['stories'] as const,
  detail: (id: string) => ['stories', id] as const,
  tags: (id: string) => ['stories', id, 'tags'] as const,
};

export function useStories() {
  return useQuery({
    queryKey: storyKeys.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as StoryRow[];
    },
  });
}

export function useStory(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: id ? storyKeys.detail(id) : ['stories', 'undefined'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as StoryRow;
    },
  });
}

export function useStoryTags(storyId: string | undefined) {
  return useQuery({
    enabled: !!storyId,
    queryKey: storyId ? storyKeys.tags(storyId) : ['stories', 'undefined', 'tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_tags')
        .select('tag_id, tags(*)')
        .eq('story_id', storyId!);
      if (error) throw error;
      return (data ?? [])
        .map((row: any) => row.tags as TagRow | null)
        .filter((t): t is TagRow => !!t);
    },
  });
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      coverUrl?: string | null;
      genre?: string | null;
      mature?: boolean;
      status?: StoryStatus;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');

      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: userId,
          title: input.title,
          description: input.description ?? null,
          cover_url: input.coverUrl ?? null,
          status: input.status ?? 'draft',
          genre: input.genre ?? null,
          mature: input.mature ?? false,
        })
        .select()
        .single();
      if (error) throw error;
      return data as StoryRow;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: storyKeys.all }),
  });
}

export function useUpdateStory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title?: string;
      description?: string | null;
      cover_url?: string | null;
      status?: StoryStatus;
      genre?: string | null;
      mature?: boolean;
      is_favorite?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('stories')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as StoryRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: storyKeys.all });
      qc.invalidateQueries({ queryKey: storyKeys.detail(id) });
    },
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, current }: { id: string; current: boolean }) => {
      const { error } = await supabase
        .from('stories')
        .update({ is_favorite: !current, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: storyKeys.all }),
  });
}

export function useDeleteStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stories').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: storyKeys.all }),
  });
}

export function useSetStoryTags(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tagNames: string[]) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');

      const cleaned = Array.from(
        new Set(tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean))
      );

      const tagIds: string[] = [];
      for (const name of cleaned) {
        const { data: upserted, error: upErr } = await supabase
          .from('tags')
          .upsert({ user_id: userId, name }, { onConflict: 'user_id,name' })
          .select()
          .single();
        if (upErr) throw upErr;
        tagIds.push(upserted!.id);
      }

      const { error: delErr } = await supabase
        .from('story_tags')
        .delete()
        .eq('story_id', storyId);
      if (delErr) throw delErr;

      if (tagIds.length) {
        const { error: insErr } = await supabase
          .from('story_tags')
          .insert(tagIds.map((tag_id) => ({ story_id: storyId, tag_id })));
        if (insErr) throw insErr;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: storyKeys.tags(storyId) }),
  });
}
