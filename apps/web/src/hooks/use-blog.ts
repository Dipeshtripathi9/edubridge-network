'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type BlogCategory = 'CAREER' | 'COLLEGE' | 'JOB';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory;
  status: 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED';
}

export function useCreateBlogPost() {
  return useMutation({
    mutationFn: (input: { title: string; body: string; category: BlogCategory }) =>
      api.post<BlogPost>('/blog', input),
  });
}
