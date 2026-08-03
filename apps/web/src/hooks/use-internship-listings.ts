'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type OpportunityType = 'INTERNSHIP' | 'PART_TIME' | 'FREELANCE' | 'BLOGGING' | 'STARTUP';

export const OPPORTUNITY_TYPE_LABEL: Record<OpportunityType, string> = {
  INTERNSHIP: 'Internship',
  PART_TIME: 'Part-time work',
  FREELANCE: 'Freelance gig',
  BLOGGING: 'Blogging',
  STARTUP: 'Startup project',
};

export interface InternshipListing {
  id: string;
  title: string;
  slug: string;
  company: string;
  location: string;
  isRemote: boolean;
  type: OpportunityType;
  stipend?: number | null;
  duration: string;
  category: string;
  description: string;
  applyUrl: string;
  deadline?: string | null;
}

export function useInternshipListings(filters: { q?: string; category?: string; type?: OpportunityType } = {}) {
  return useInfiniteQuery({
    queryKey: ['internship-listings', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '18' });
      if (filters.q) params.set('q', filters.q);
      if (filters.category) params.set('category', filters.category);
      if (filters.type) params.set('type', filters.type);
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

export function useInternshipCategories() {
  return useQuery({
    queryKey: ['internship-listing-categories'],
    queryFn: () => api.get<string[]>('/internship-listings/categories'),
  });
}
