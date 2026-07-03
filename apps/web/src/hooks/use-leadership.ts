'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const SUPPORT_TOPICS = [
  { value: 'REFERRAL', label: 'Referral', hint: 'Ask the admin team to refer you for a role or opportunity.' },
  { value: 'MENTORSHIP', label: 'Personal mentorship', hint: 'Request 1:1 mentorship or career guidance.' },
  { value: 'GENERAL', label: 'Ask anything', hint: 'Any question or help you need from the admin team.' },
] as const;

export interface ManagerSupportRequest {
  id: string;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    profile?: {
      fullName: string;
      avatarUrl?: string | null;
      college?: { name: string } | null;
    } | null;
    communityMembers: { role: string; community: { name: string; slug: string } }[];
  };
}

export function useSubmitManagerSupport() {
  return useMutation({
    mutationFn: (input: { topic: string; message: string }) =>
      api.post('/leadership/support', input),
  });
}

export function useManagerSupportRequests() {
  return useQuery({
    queryKey: ['manager-support'],
    queryFn: () => api.get<ManagerSupportRequest[]>('/leadership/support'),
  });
}

export function useResolveManagerSupport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/leadership/support/${id}/resolve`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manager-support'] }),
  });
}
