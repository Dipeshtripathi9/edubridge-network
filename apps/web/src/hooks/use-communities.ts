'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  type: 'COLLEGE' | 'TOPIC' | 'STARTUP';
  topic?: string | null;
  hiringOpen?: boolean;
  hiringNote?: string | null;
  memberCount: number;
  postCount: number;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  isMember?: boolean;
  myRole?: string | null;
  college?: { id: string; name: string; slug: string; logoUrl?: string | null } | null;
}

export interface CommunityMember {
  id: string;
  role: string;
  mutedUntil?: string | null;
  bannedAt?: string | null;
  user: {
    id: string;
    reputationPoints: number;
    profile?: { fullName: string; username?: string | null; avatarUrl?: string | null } | null;
  };
}

// Per-community roles that can moderate/manage (mirrors the backend's isMod).
export const COMMUNITY_MANAGER_ROLES = [
  'ADMIN',
  'MODERATOR',
  'CAMPUS_LEAD',
  'OPPORTUNITY_HEAD',
  'STUDENT_RELATIONS_HEAD',
];

export const isCommunityManager = (role?: string | null) =>
  !!role && COMMUNITY_MANAGER_ROLES.includes(role);

export interface ManagedCommunity {
  role: string;
  community: { id: string; name: string; slug: string; type: string; memberCount: number };
}

export function useManagedCommunities() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['communities', 'managed'],
    queryFn: () => api.get<ManagedCommunity[]>('/communities/managed'),
    enabled: !!token,
  });
}

export function useCommunities(filters: { type?: string; topic?: string; q?: string } = {}) {
  return useInfiniteQuery({
    queryKey: ['communities', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20' });
      if (filters.type) params.set('type', filters.type);
      if (filters.topic) params.set('topic', filters.topic);
      if (filters.q) params.set('q', filters.q);
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<Community>(`/communities?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
  });
}

export function useCommunity(slug: string) {
  return useQuery({
    queryKey: ['community', slug],
    queryFn: () => api.get<Community>(`/communities/${slug}`),
    enabled: !!slug,
  });
}

export function useJoinCommunity(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (join: boolean) =>
      join
        ? api.post(`/communities/${slug}/join`)
        : api.delete(`/communities/${slug}/leave`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['community', slug] });
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useUpdateCommunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, ...data }: { slug: string; name?: string; description?: string; topic?: string }) =>
      api.patch<Community>(`/communities/${slug}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communities'] });
      qc.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

export function useDeleteCommunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => api.delete(`/communities/${slug}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] }),
  });
}

export function useCreateCommunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => api.post<Community>('/communities', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] }),
  });
}

export function useMembers(slug: string) {
  return useQuery({
    queryKey: ['members', slug],
    queryFn: () => api.paginated<CommunityMember>(`/communities/${slug}/members?limit=50`),
    enabled: !!slug,
    // Roles change via appoint/moderate — always show fresh data when opened.
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useSetMemberRole(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      api.patch(`/communities/${slug}/members/${userId}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', slug] }),
  });
}

export function useModerateMember(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, action, minutes }: { userId: string; action: string; minutes?: number }) =>
      api.post(`/communities/${slug}/members/${userId}/moderate`, { action, minutes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', slug] }),
  });
}
