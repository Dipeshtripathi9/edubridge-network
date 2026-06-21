'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface ActivityPost {
  id: string;
  body: string;
  kind: string;
  status: string;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: { id: string; profile?: { fullName: string } | null };
}

export interface CommunityReport {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string | null;
  createdAt: string;
  reporter?: { id: string; profile?: { fullName: string } | null } | null;
}

export interface CommunityAnalytics {
  members: number;
  posts: number;
  postsThisWeek: number;
  comments: number;
  openReports: number;
  topContributors: { id: string; fullName: string; reputationPoints: number; role: string }[];
}

export function useCommunityActivity(slug: string, enabled: boolean) {
  return useQuery({
    queryKey: ['monitor', 'activity', slug],
    queryFn: () => api.paginated<ActivityPost>(`/communities/${slug}/activity?limit=25`),
    enabled,
  });
}

export function useCommunityReports(slug: string, enabled: boolean) {
  return useQuery({
    queryKey: ['monitor', 'reports', slug],
    queryFn: () => api.paginated<CommunityReport>(`/communities/${slug}/reports?limit=30`),
    enabled,
  });
}

export function useResolveCommunityReport(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'RESOLVED' | 'DISMISSED' }) =>
      api.post(`/communities/${slug}/reports/${id}/resolve`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitor', 'reports', slug] }),
  });
}

export function useCommunityAnalytics(slug: string, enabled: boolean) {
  return useQuery({
    queryKey: ['monitor', 'analytics', slug],
    queryFn: () => api.get<CommunityAnalytics>(`/communities/${slug}/analytics`),
    enabled,
  });
}
