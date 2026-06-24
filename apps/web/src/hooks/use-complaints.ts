'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Complaint {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  user?: { id: string; email: string | null; profile?: { fullName: string } | null };
  community?: { id: string; name: string; slug: string } | null;
}

export function useSubmitComplaint() {
  return useMutation({
    mutationFn: (input: { body: string; communityId?: string }) => api.post('/complaints', input),
  });
}

export function useComplaints() {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: () => api.paginated<Complaint>('/complaints?limit=50'),
  });
}

export function useResolveComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/complaints/${id}/resolve`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['complaints'] }),
  });
}
