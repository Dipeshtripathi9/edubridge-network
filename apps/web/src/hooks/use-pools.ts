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
  community?: { name: string; slug: string };
}

export function usePools(slug: string) {
  return useQuery({
    queryKey: ['pools', 'community', slug],
    queryFn: () => api.get<Pool[]>(`/communities/${slug}/pools`),
    enabled: !!slug,
  });
}

export function useMyPools() {
  return useQuery({
    queryKey: ['pools', 'me'],
    queryFn: () => api.get<Pool[]>('/pools/me'),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pools'] }),
  });
}

export function useLeavePool(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poolId: string) => api.delete(`/pools/${poolId}/leave`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pools'] }),
  });
}
