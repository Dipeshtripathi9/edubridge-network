'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ReviewCategory = 'PLACEMENT' | 'HOSTEL' | 'FACULTY' | 'CAMPUS_LIFE';

export interface Review {
  id: string;
  category: ReviewCategory;
  rating: number;
  title?: string | null;
  body: string;
  isVerified: boolean;
  upvotes: number;
  downvotes: number;
  myVote: number;
  createdAt: string;
  author: {
    id: string;
    profile?: {
      fullName: string;
      username?: string | null;
      avatarUrl?: string | null;
      branch?: string | null;
      year?: number | null;
    } | null;
  };
}

export interface ReviewSummary {
  overall: { avgRating: number; count: number };
  categories: { category: ReviewCategory; avgRating: number; count: number }[];
}

export function useReviewSummary(collegeId?: string) {
  return useQuery({
    queryKey: ['reviews', 'summary', collegeId],
    queryFn: () => api.get<ReviewSummary>(`/colleges/${collegeId}/reviews/summary`),
    enabled: !!collegeId,
  });
}

export function useReviews(
  collegeId: string | undefined,
  filters: { category?: string; sort?: string } = {},
) {
  return useQuery({
    queryKey: ['reviews', collegeId, filters],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '30' });
      if (filters.category) params.set('category', filters.category);
      if (filters.sort) params.set('sort', filters.sort);
      return api.paginated<Review>(`/colleges/${collegeId}/reviews?${params.toString()}`);
    },
    enabled: !!collegeId,
  });
}

export function useCreateReview(collegeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { category: string; rating: number; title?: string; body: string }) =>
      api.post(`/colleges/${collegeId}/reviews`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', collegeId] });
      qc.invalidateQueries({ queryKey: ['reviews', 'summary', collegeId] });
    },
  });
}

// ---------------- Community-manager reviews ----------------
export function useCommunityReviews(slug: string) {
  return useQuery({
    queryKey: ['community-reviews', slug],
    queryFn: () => api.paginated<Review>(`/communities/${slug}/reviews?limit=30`),
    enabled: !!slug,
  });
}

export function useCommunityReviewSummary(slug: string) {
  return useQuery({
    queryKey: ['community-reviews', 'summary', slug],
    queryFn: () => api.get<{ avgRating: number; count: number }>(`/communities/${slug}/reviews/summary`),
    enabled: !!slug,
  });
}

export function useCreateCommunityReview(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { rating: number; title?: string; body: string }) =>
      api.post(`/communities/${slug}/reviews`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community-reviews', slug] });
      qc.invalidateQueries({ queryKey: ['community-reviews', 'summary', slug] });
    },
  });
}

export function useVerifyReview(collegeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ isVerified: boolean }>(`/reviews/${id}/verify`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', collegeId] }),
  });
}

export function useVoteReview(collegeId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) =>
      api.post(`/reviews/${id}/vote`, { value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews', collegeId] }),
  });
}
