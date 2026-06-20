'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  reputationPoints: number;
  profile?: {
    fullName: string;
    username?: string | null;
    avatarUrl?: string | null;
    college?: { id: string; name: string } | null;
  } | null;
  _count: { userBadges: number };
}

export interface Badge {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  threshold?: number | null;
}

export interface MyReputation {
  points: number;
  badges: Badge[];
  recentEvents: { id: string; action: string; points: number; createdAt: string }[];
}

export function useLeaderboard(collegeId?: string) {
  return useInfiniteQuery({
    queryKey: ['leaderboard', collegeId],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '25' });
      if (collegeId) params.set('collegeId', collegeId);
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<LeaderboardEntry>(`/reputation/leaderboard?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
  });
}

export function useBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: () => api.get<Badge[]>('/reputation/badges'),
  });
}

export function useMyReputation() {
  return useQuery({
    queryKey: ['reputation', 'me'],
    queryFn: () => api.get<MyReputation>('/reputation/me'),
  });
}
