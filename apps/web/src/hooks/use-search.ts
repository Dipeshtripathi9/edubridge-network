'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type SearchType =
  | 'college'
  | 'user'
  | 'opportunity'
  | 'resource'
  | 'review';

export interface SearchHit {
  type: SearchType;
  id: string;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  url: string | null;
  tags?: string[];
}

export interface GroupedSearch {
  groups: Record<SearchType, SearchHit[]>;
  counts: Record<SearchType, number>;
}

/** "All" view — top results per type + per-type counts. */
export function useSearchAll(q: string) {
  return useQuery({
    queryKey: ['search', 'all', q],
    queryFn: () => api.get<GroupedSearch>(`/search?q=${encodeURIComponent(q)}`),
    enabled: q.trim().length > 0,
  });
}

/** Single-type view — paginated with infinite scroll. */
export function useSearchType(q: string, type: SearchType) {
  return useInfiniteQuery({
    queryKey: ['search', 'type', type, q],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      api.paginated<SearchHit>(
        `/search?q=${encodeURIComponent(q)}&type=${type}&page=${pageParam}&limit=20`,
      ),
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.page + 1 : undefined),
    enabled: q.trim().length > 0,
  });
}
