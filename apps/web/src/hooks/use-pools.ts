'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

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
}

export function usePools(slug: string) {
  return useQuery({
    queryKey: ['pools', slug],
    queryFn: () => api.get<Pool[]>(`/communities/${slug}/pools`),
    enabled: !!slug,
  });
}

export function useCreatePool(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string; maxMembers: number }) =>
      api.post<Pool>(`/communities/${slug}/pools`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pools', slug] }),
  });
}

export function useJoinPool(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api.post(`/pools/${poolId}/join`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pools', slug] }),
  });
}

export function useLeavePool(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api.delete(`/pools/${poolId}/leave`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pools', slug] }),
  });
}
