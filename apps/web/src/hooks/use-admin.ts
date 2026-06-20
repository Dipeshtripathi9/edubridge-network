'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Analytics {
  users: {
    total: number;
    dau: number;
    mau: number;
    newToday: number;
    newThisWeek: number;
    stickiness: number;
  };
  content: {
    posts: number;
    postsThisWeek: number;
    comments: number;
    communities: number;
    reviews: number;
    resources: number;
    activeOpportunities: number;
  };
  moderation: { openReports: number };
  topCommunities: { id: string; name: string; slug: string; memberCount: number; type: string }[];
  topColleges: { id: string; name: string; reviewCount: number; avgRating: number }[];
  topContributors: { id: string; reputationPoints: number; profile?: { fullName: string } | null }[];
}

export interface AdminUser {
  id: string;
  email: string | null;
  role: string;
  status: string;
  reputationPoints: number;
  createdAt: string;
  lastLoginAt?: string | null;
  profile?: {
    fullName: string;
    avatarUrl?: string | null;
    collegeVerification: string;
    college?: { name: string } | null;
  } | null;
}

export interface AdminReport {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string | null;
  status: string;
  createdAt: string;
  reporter?: { id: string; profile?: { fullName: string } | null } | null;
  reportedUser?: { id: string; profile?: { fullName: string } | null } | null;
}

export function useAnalytics() {
  return useQuery({ queryKey: ['admin', 'analytics'], queryFn: () => api.get<Analytics>('/admin/analytics') });
}

export function useAdminUsers(filters: { q?: string; status?: string; role?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '30' });
      if (filters.q) params.set('q', filters.q);
      if (filters.status) params.set('status', filters.status);
      if (filters.role) params.set('role', filters.role);
      return api.paginated<AdminUser>(`/admin/users?${params.toString()}`);
    },
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      api.patch(`/admin/users/${id}/status`, { status, reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useVerifyCollege() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/users/${id}/verify-college`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useReports(status?: string) {
  return useQuery({
    queryKey: ['admin', 'reports', status],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '30' });
      if (status) params.set('status', status);
      return api.paginated<AdminReport>(`/admin/reports?${params.toString()}`);
    },
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) =>
      api.post(`/admin/reports/${id}/resolve`, { status, note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });
}

export function useBroadcast() {
  return useMutation({
    mutationFn: (input: { type: string; title: string; body?: string; link?: string }) =>
      api.post<{ sent: number }>('/notifications/broadcast', input),
  });
}

/** User-facing: report a piece of content. */
export function useCreateReport() {
  return useMutation({
    mutationFn: (input: {
      targetType: string;
      targetId: string;
      reportedUserId?: string;
      reason: string;
      details?: string;
    }) => api.post('/reports', input),
  });
}
