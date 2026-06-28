'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ---- Perk 2: 45%-off web-dev discount at 600+ members ----
export interface DiscountStatus {
  eligible: boolean;
  minMembers: number;
  memberCount: number;
  claim: { id: string; status: string; createdAt: string } | null;
}

export function useDiscountStatus(slug: string) {
  return useQuery({
    queryKey: ['discount', slug],
    queryFn: () => api.get<DiscountStatus>(`/communities/${slug}/discount`),
    enabled: !!slug,
  });
}

export function useClaimDiscount(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/communities/${slug}/discount/claim`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discount', slug] }),
  });
}

// ---- Perk 3: career referrals (leaders only) ----
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
