'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Scholarship {
  id: string;
  title: string;
  slug: string;
  provider: string;
  amountPerYear: number;
  renewalYears?: number | null;
  category: string;
  eligibilityText: string;
  minCgpa?: number | null;
  eligibleCourses: string[];
  eligibleStates: string[];
  applyUrl: string;
  deadline: string;
}

export function useScholarships(filters: { q?: string; category?: string; sort?: string } = {}) {
  return useInfiniteQuery({
    queryKey: ['scholarships', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '18' });
      if (filters.q) params.set('q', filters.q);
      if (filters.category) params.set('category', filters.category);
      if (filters.sort) params.set('sort', filters.sort);
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<Scholarship>(`/scholarships?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
  });
}

export function useScholarship(slug: string) {
  return useQuery({
    queryKey: ['scholarship', slug],
    queryFn: () => api.get<Scholarship>(`/scholarships/${slug}`),
    enabled: !!slug,
  });
}

export function useScholarshipCategories() {
  return useQuery({
    queryKey: ['scholarship-categories'],
    queryFn: () => api.get<string[]>('/scholarships/categories'),
  });
}
