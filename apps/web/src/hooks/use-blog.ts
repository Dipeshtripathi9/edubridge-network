'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type BlogCategory = 'CAREER' | 'COLLEGE' | 'JOB';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory;
  status: 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';
}

export interface BlogListItem {
  slug: string;
  title: string;
  category: BlogCategory;
  readMinutes: number;
  author: { profile: { fullName: string } | null } | null;
}

export function useCreateBlogPost() {
  return useMutation({
    mutationFn: (input: { title: string; body: string; category: BlogCategory }) =>
      api.post<BlogPost>('/blog', input),
  });
}

export function useBlogPosts(limit = 6) {
  return useQuery({
    queryKey: ['blog-posts', limit],
    queryFn: () => api.paginated<BlogListItem>(`/blog?limit=${limit}`),
  });
}
