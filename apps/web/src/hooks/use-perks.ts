'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ---- Career referrals ----
export interface Referral {
  id: string;
  role: string;
  company: string;
  description?: string | null;
  link?: string | null;
  createdAt: string;
  postedBy?: { profile?: { fullName?: string } | null } | null;
}

export function useReferrals(enabled: boolean) {
  return useQuery({
    queryKey: ['referrals'],
    queryFn: () => api.get<Referral[]>('/referrals'),
    enabled,
  });
}

export function useCreateReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { role: string; company: string; description?: string; link?: string }) =>
      api.post<Referral>('/referrals', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });
}

export function useDeleteReferral() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/referrals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['referrals'] }),
  });
}
