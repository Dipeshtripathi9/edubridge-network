'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export interface Pool {
  id: string;
  title: string;
  description?: string | null;
  maxMembers: number;
  chatId: string;
  createdById: string;
  memberCount: number;
  isMember: boolean;
  isFull: boolean;
  likeCount?: number;
  shareCount?: number;
  likedByMe?: boolean;
  community?: { name: string; slug: string };
}

export function usePools(slug: string) {
  return useQuery({
    queryKey: ['pools', 'community', slug],
    queryFn: () => api.get<Pool[]>(`/communities/${slug}/pools`),
    enabled: !!slug,
  });
}

export function useSimilarPools(slug: string, q: string) {
  const term = q.trim();
  return useQuery({
    queryKey: ['pools', 'similar', slug, term],
    queryFn: () => api.get<Pool[]>(`/communities/${slug}/pools/similar?q=${encodeURIComponent(term)}`),
    enabled: !!slug && term.length >= 2,
  });
}

export function useMyPools() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['pools', 'me'],
    queryFn: () => api.get<Pool[]>('/pools/me'),
    enabled: !!token,
  });
}

export function usePool(id: string | null) {
  return useQuery({
    queryKey: ['pool', id],
    queryFn: () => api.get<Pool & { members: { id: string; fullName: string }[] }>(`/pools/${id}`),
    enabled: !!id,
  });
}

export function useCreatePool(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string; maxMembers: number }) =>
      api.post<Pool>(`/communities/${slug}/pools`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pools'] }),
  });
}

export function useJoinPool(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api.post(`/pools/${poolId}/join`),
    // Also refresh the pool DETAIL key (['pool', id]) — ['pools'] doesn't
    // prefix-match it, so without this the detail view stays on the locked
    // "join" card until a manual refresh.
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pool'] });
      qc.invalidateQueries({ queryKey: ['pools'] });
    },
  });
}

export function useLeavePool(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api.delete(`/pools/${poolId}/leave`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pool'] });
      qc.invalidateQueries({ queryKey: ['pools'] });
    },
  });
}

/** Delete a pool entirely — platform admins (any pool) or the pool creator. */
export function useDeletePool(slug?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api.delete(`/pools/${poolId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pools', slug] });
      qc.invalidateQueries({ queryKey: ['pools'] });
      qc.invalidateQueries({ queryKey: ['my-pools'] });
    },
  });
}

export function useLikePool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api.post<{ liked: boolean }>(`/pools/${poolId}/like`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pool'] });
      qc.invalidateQueries({ queryKey: ['pools'] });
    },
  });
}

export function useSharePool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api.post<{ shareCount: number }>(`/pools/${poolId}/share`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pool'] });
      qc.invalidateQueries({ queryKey: ['pools'] });
    },
  });
}
