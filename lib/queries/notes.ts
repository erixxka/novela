import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type {
  StoryNotesRow,
  StoryCharacterRow,
  StorySnippetRow,
  SnippetKind,
} from '../database.types';

export const notesKeys = {
  notes:      (storyId: string) => ['story_notes', storyId] as const,
  characters: (storyId: string) => ['story_characters', storyId] as const,
  snippets:   (storyId: string) => ['story_snippets', storyId] as const,
  counts:     ['story_notes', 'counts'] as const,
};

// ── Concept / story_notes ────────────────────────────────────────────────

export function useStoryNotes(storyId: string | undefined) {
  return useQuery({
    enabled: !!storyId,
    queryKey: storyId ? notesKeys.notes(storyId) : ['story_notes', 'undefined'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_notes')
        .select('*')
        .eq('story_id', storyId!)
        .maybeSingle();
      if (error) throw error;
      return data as StoryNotesRow | null;
    },
  });
}

export function useUpsertStoryNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      storyId: string;
      possible_titles: string[];
      summary: string;
      outline: string;
      genres: string[];
      themes: string[];
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');
      const { error } = await supabase.from('story_notes').upsert({
        story_id: input.storyId,
        user_id: userId,
        possible_titles: input.possible_titles,
        summary: input.summary,
        outline: input.outline,
        genres: input.genres,
        themes: input.themes,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: notesKeys.notes(vars.storyId) });
      qc.invalidateQueries({ queryKey: notesKeys.counts });
    },
  });
}

// ── Characters ────────────────────────────────────────────────────────────

export function useCharacters(storyId: string | undefined) {
  return useQuery({
    enabled: !!storyId,
    queryKey: storyId ? notesKeys.characters(storyId) : ['story_characters', 'undefined'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_characters')
        .select('*')
        .eq('story_id', storyId!)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as StoryCharacterRow[];
    },
  });
}

export type CharacterInput = {
  name: string;
  role?: string | null;
  age?: string | null;
  gender?: string | null;
  occupation?: string | null;
  background?: string | null;
  appearance?: string | null;
  personality?: string | null;
  goals?: string | null;
};

export function useCreateCharacter(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CharacterInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('story_characters')
        .insert({
          story_id: storyId,
          user_id: userId,
          name: input.name,
          role: input.role ?? null,
          age: input.age ?? null,
          gender: input.gender ?? null,
          occupation: input.occupation ?? null,
          background: input.background ?? null,
          appearance: input.appearance ?? null,
          personality: input.personality ?? null,
          goals: input.goals ?? null,
          order_index: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data as StoryCharacterRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notesKeys.characters(storyId) });
      qc.invalidateQueries({ queryKey: notesKeys.counts });
    },
  });
}

export function useUpdateCharacter(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<CharacterInput>) => {
      const { id, ...patch } = input;
      const { data, error } = await supabase
        .from('story_characters')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as StoryCharacterRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notesKeys.characters(storyId) });
    },
  });
}

export function useDeleteCharacter(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('story_characters').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notesKeys.characters(storyId) });
      qc.invalidateQueries({ queryKey: notesKeys.counts });
    },
  });
}

// ── Snippets ──────────────────────────────────────────────────────────────

export function useSnippets(storyId: string | undefined) {
  return useQuery({
    enabled: !!storyId,
    queryKey: storyId ? notesKeys.snippets(storyId) : ['story_snippets', 'undefined'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_snippets')
        .select('*')
        .eq('story_id', storyId!)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as StorySnippetRow[];
    },
  });
}

export type SnippetInput = {
  kind: SnippetKind;
  title?: string | null;
  body: string;
};

export function useCreateSnippet(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SnippetInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('story_snippets')
        .insert({
          story_id: storyId,
          user_id: userId,
          kind: input.kind,
          title: input.title ?? null,
          body: input.body,
          order_index: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data as StorySnippetRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notesKeys.snippets(storyId) });
      qc.invalidateQueries({ queryKey: notesKeys.counts });
    },
  });
}

export function useUpdateSnippet(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<SnippetInput>) => {
      const { id, ...patch } = input;
      const { data, error } = await supabase
        .from('story_snippets')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as StorySnippetRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notesKeys.snippets(storyId) });
    },
  });
}

export function useDeleteSnippet(storyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('story_snippets').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notesKeys.snippets(storyId) });
      qc.invalidateQueries({ queryKey: notesKeys.counts });
    },
  });
}

// ── Hub counts ────────────────────────────────────────────────────────────
// Per-story counts of characters + snippets, plus whether the concept row
// has any non-empty fields. Returned as a Map keyed by story_id.

export type NoteCounts = {
  characters: number;
  snippets: number;
  hasConcept: boolean;
};

export function useNoteCounts() {
  return useQuery({
    queryKey: notesKeys.counts,
    staleTime: 30_000,
    queryFn: async () => {
      const [chars, snips, notes] = await Promise.all([
        supabase.from('story_characters').select('story_id'),
        supabase.from('story_snippets').select('story_id'),
        supabase.from('story_notes').select('*'),
      ]);
      if (chars.error) throw chars.error;
      if (snips.error) throw snips.error;
      if (notes.error) throw notes.error;

      const map = new Map<string, NoteCounts>();
      const get = (id: string): NoteCounts => {
        const existing = map.get(id);
        if (existing) return existing;
        const next: NoteCounts = { characters: 0, snippets: 0, hasConcept: false };
        map.set(id, next);
        return next;
      };

      for (const row of (chars.data ?? []) as { story_id: string }[]) {
        get(row.story_id).characters += 1;
      }
      for (const row of (snips.data ?? []) as { story_id: string }[]) {
        get(row.story_id).snippets += 1;
      }
      for (const row of (notes.data ?? []) as StoryNotesRow[]) {
        const hasConcept =
          (row.possible_titles?.length ?? 0) > 0 ||
          (row.genres?.length ?? 0) > 0 ||
          (row.themes?.length ?? 0) > 0 ||
          !!row.summary?.trim() ||
          !!row.outline?.trim();
        if (hasConcept) get(row.story_id).hasConcept = true;
      }
      return map;
    },
  });
}
