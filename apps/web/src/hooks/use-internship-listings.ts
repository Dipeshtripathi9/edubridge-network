'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface InternshipListing {
  id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  isRemote: boolean;
  stipend?: number | null;
  duration: string;
  category: string;
  description: string;
  applyUrl: string;
  deadline?: string | null;
}

export function useInternshipListings(filters: { q?: string; category?: string } = {}) {
  return useInfiniteQuery({
    queryKey: ['internship-listings', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '18' });
      if (filters.q) params.set('q', filters.q);
      if (filters.category) params.set('category', filters.category);
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<InternshipListing>(`/internship-listings?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
  });
}

export function useInternshipListing(slug: string) {
  return useQuery({
    queryKey: ['internship-listing', slug],
    queryFn: () => api.get<InternshipListing>(`/internship-listings/${slug}`),
    enabled: !!slug,
  });
}
