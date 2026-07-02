'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const HEAD_ROLES = [
  { value: 'CAMPUS_LEAD', label: 'Campus Lead' },
  { value: 'OPPORTUNITY_HEAD', label: 'Opportunity Head' },
  { value: 'STUDENT_RELATIONS_HEAD', label: 'Student Relations Head' },
  { value: 'MODERATOR', label: 'Moderator' },
] as const;

export interface HeadApplication {
  id: string;
  requestedRole: string;
  status: string;
  pitch?: string | null;
  createdAt: string;
  community: { id: string; name: string; slug: string };
  user?: { id: string; email: string | null; profile?: { fullName: string } | null };
}

export function useSetCommunityHiring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { slug: string; open: boolean; note?: string }) =>
      api.patch(`/communities/${input.slug}/hiring`, { open: input.open, note: input.note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communities'] });
      qc.invalidateQueries({ queryKey: ['community'] });
    },
  });
}

export function useApplyHead(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { requestedRole: string; pitch?: string }) =>
      api.post(`/communities/${slug}/head-applications`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['head-apps', 'me'] }),
  });
}

export function useMyHeadApplications() {
  return useQuery({
    queryKey: ['head-apps', 'me'],
    queryFn: () => api.get<HeadApplication[]>('/head-applications/me'),
  });
}

export function useHeadAppQueue() {
  return useQuery({
    queryKey: ['head-apps', 'queue'],
    queryFn: () => api.paginated<HeadApplication>('/head-applications?limit=50'),
  });
}

export function useDecideHeadApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      api.post(`/head-applications/${id}/${approve ? 'approve' : 'reject'}`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['head-apps', 'queue'] }),
  });
}

export function useAppointHead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, email, role }: { slug: string; email: string; role: string }) =>
      api.post(`/communities/${slug}/appoint-head`, { email, role }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['members', vars.slug] });
      qc.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}
