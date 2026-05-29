import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { SearchResultRow } from '../database.types';

export function useSearch(query: string) {
  const trimmed = query.trim();
  return useQuery({
    enabled: trimmed.length >= 2,
    queryKey: ['search', trimmed],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_library', { q: trimmed });
      if (error) throw error;
      return (data ?? []) as SearchResultRow[];
    },
  });
}
