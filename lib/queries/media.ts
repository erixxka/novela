import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { MediaSongRow, MediaMovieRow } from '../database.types';

export const mediaKeys = {
  songs:  ['media_songs']  as const,
  movies: ['media_movies'] as const,
};

// ── Songs ─────────────────────────────────────────────────────────────────

export type SongInput = {
  title: string;
  artist?: string | null;
  year?: string | null;
  genre?: string | null;
  image_path?: string | null;
  lyrics_snippet?: string | null;
};

export function useSongs() {
  return useQuery({
    queryKey: mediaKeys.songs,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_songs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as MediaSongRow[];
    },
  });
}

export function useCreateSong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SongInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('media_songs')
        .insert({
          user_id: userId,
          title: input.title,
          artist: input.artist ?? null,
          year: input.year ?? null,
          genre: input.genre ?? null,
          image_path: input.image_path ?? null,
          lyrics_snippet: input.lyrics_snippet ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as MediaSongRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.songs });
    },
  });
}

export function useUpdateSong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<SongInput>) => {
      const { id, ...patch } = input;
      const { data, error } = await supabase
        .from('media_songs')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as MediaSongRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.songs });
    },
  });
}

export function useDeleteSong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('media_songs').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.songs });
    },
  });
}

// ── Movies ────────────────────────────────────────────────────────────────

export type MovieInput = {
  title: string;
  director?: string | null;
  year?: string | null;
  genre?: string | null;
  image_path?: string | null;
  snippet?: string | null;
};

export function useMovies() {
  return useQuery({
    queryKey: mediaKeys.movies,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_movies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as MediaMovieRow[];
    },
  });
}

export function useCreateMovie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MovieInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('media_movies')
        .insert({
          user_id: userId,
          title: input.title,
          director: input.director ?? null,
          year: input.year ?? null,
          genre: input.genre ?? null,
          image_path: input.image_path ?? null,
          snippet: input.snippet ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as MediaMovieRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.movies });
    },
  });
}

export function useUpdateMovie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<MovieInput>) => {
      const { id, ...patch } = input;
      const { data, error } = await supabase
        .from('media_movies')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as MediaMovieRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.movies });
    },
  });
}

export function useDeleteMovie() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('media_movies').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mediaKeys.movies });
    },
  });
}
