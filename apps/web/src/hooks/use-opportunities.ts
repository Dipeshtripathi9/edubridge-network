'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export type OpportunityType =
  | 'INTERNSHIP'
  | 'SCHOLARSHIP'
  | 'COMPETITION'
  | 'FELLOWSHIP'
  | 'RESEARCH'
  | 'CERTIFICATION';

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  organization?: string | null;
  description: string;
  location?: string | null;
  isRemote: boolean;
  applyUrl?: string | null;
  tags: string[];
  stipend?: string | null;
  deadline?: string | null;
  communityId?: string | null;
  score?: number;
}

export function useOpportunities(
  filters: { type?: string; q?: string; collegeId?: string; communityId?: string } = {},
) {
  return useInfiniteQuery({
    queryKey: ['opportunities', filters],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '15' });
      if (filters.type) params.set('type', filters.type);
      if (filters.q) params.set('q', filters.q);
      if (filters.collegeId) params.set('collegeId', filters.collegeId);
      if (filters.communityId) params.set('communityId', filters.communityId);
      if (pageParam) params.set('cursor', pageParam);
      return api.paginated<Opportunity>(`/opportunities?${params.toString()}`);
    },
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.nextCursor ?? undefined : undefined),
    // Always fetch fresh on mount so newly-added opportunities appear immediately.
    refetchOnMount: 'always',
    staleTime: 0,
  });
}

export function useRecommendedOpportunities() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['opportunities', 'recommended'],
    queryFn: () => api.get<Opportunity[]>('/opportunities/recommended'),
    enabled: !!token,
  });
}

export interface Application {
  id: string;
  status: ApplicationStatus;
  notes?: string | null;
  opportunity: Opportunity;
}

export function useMyApplications() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['applications', 'me'],
    queryFn: () => api.get<Application[]>('/opportunities/applications/me'),
    enabled: !!token,
  });
}

export function useSubmitOpportunity(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      api.post('/opportunities', { ...input, communityId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      qc.invalidateQueries({ queryKey: ['opportunities', 'pending', communityId] });
    },
  });
}

export function usePendingOpportunities(communityId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['opportunities', 'pending', communityId],
    queryFn: () => api.get<Opportunity[]>(`/opportunities/pending?communityId=${communityId}`),
    enabled: enabled && !!communityId,
  });
}

export function useDecideOpportunity(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      api.post(`/opportunities/${id}/${approve ? 'approve' : 'reject'}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities', 'pending', communityId] });
      qc.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useDeleteOpportunity(communityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/opportunities/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities'] });
      void communityId;
    },
  });
}

export function useApply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: ApplicationStatus; notes?: string }) =>
      api.post(`/opportunities/${id}/application`, { status, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications', 'me'] });
      qc.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

/** Remove a saved/applied opportunity from "my applications" (e.g. unsave). */
export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => api.delete(`/opportunities/applications/${applicationId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications', 'me'] }),
  });
}
