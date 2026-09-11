'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type BlogCategory = 'CAREER' | 'COLLEGE' | 'JOB';

export interface BlogListItem {
  slug: string;
  title: string;
  category: BlogCategory;
  readMinutes: number;
  author: { profile: { fullName: string } | null } | null;
}

export function useBlogPosts(limit = 6) {
  return useQuery({
    queryKey: ['blog-posts', limit],
    queryFn: () => api.paginated<BlogListItem>(`/blog?limit=${limit}`),
  });
}
