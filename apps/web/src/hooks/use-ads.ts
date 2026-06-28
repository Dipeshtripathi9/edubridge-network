'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface AdCard {
  id: string;
  title: string;
  body?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  scheduledFor: string;
  expiresAt: string;
  createdById: string;
  createdBy?: { profile?: { fullName?: string } | null } | null;
}

export interface AdQuota {
  used: number;
  limit: number;
  remaining: number;
}

export function useCommunityAds(slug: string) {
  return useQuery({
    queryKey: ['ads', slug],
    queryFn: () => api.get<AdCard[]>(`/communities/${slug}/ads`),
    enabled: !!slug,
  });
}

export function useAdQuota(slug: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ads', slug, 'quota'],
    queryFn: () => api.get<AdQuota>(`/communities/${slug}/ads/quota`),
    enabled: !!slug && enabled,
  });
}

export function useBookAd(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      body?: string;
      imageUrl?: string;
      linkUrl?: string;
      scheduledFor: string;
    }) => api.post<AdCard>(`/communities/${slug}/ads`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ads', slug] }),
  });
}

export function useDeleteAd(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ads/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ads', slug] }),
  });
}
