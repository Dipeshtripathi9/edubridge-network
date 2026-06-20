'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface College {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  state?: string | null;
  nirfRank?: number | null;
  avgRating: number;
  reviewCount: number;
  avgPlacementPackage?: number | null;
  logoUrl?: string | null;
  university?: { id: string; name: string } | null;
}

export function useColleges(filters: { q?: string; state?: string; sort?: string } = {}) {
  return useInfiniteQuery({
    queryKey: ['colleges', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '18' });
      if (filters.q) params.set('q', filters.q);
      if (filters.state) params.set('state', filters.state);
      if (filters.sort) params.set('sort', filters.sort);
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<College>(`/colleges?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
  });
}

export function useCollege(slug: string) {
  return useQuery({
    queryKey: ['college', slug],
    queryFn: () => api.get<College>(`/colleges/${slug}`),
    enabled: !!slug,
  });
}
