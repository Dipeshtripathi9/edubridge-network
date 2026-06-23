'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface HelpRequest {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  user?: { id: string; profile?: { fullName: string } | null };
}

export function useHelpRequests(slug: string, enabled: boolean) {
  return useQuery({
    queryKey: ['help', slug],
    queryFn: () => api.paginated<HelpRequest>(`/communities/${slug}/help?limit=50`),
    enabled: enabled && !!slug,
  });
}

export function useSubmitHelp(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post(`/communities/${slug}/help`, { body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['help', slug] }),
  });
}

export function useResolveHelp(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/communities/${slug}/help/${id}/resolve`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['help', slug] }),
  });
}
