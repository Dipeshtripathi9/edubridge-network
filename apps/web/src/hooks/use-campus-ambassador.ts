'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type CampusAmbassadorStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CampusAmbassadorApplication {
  id: string;
  userId: string;
  reason: string;
  status: CampusAmbassadorStatus;
  createdAt: string;
  decidedAt?: string | null;
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    profile?: { fullName: string; state?: string | null } | null;
  };
}

export interface CampusAmbassador {
  userId: string;
  email: string | null;
  phone: string | null;
  fullName: string | null;
  state: string | null;
  approvedAt: string | null;
}

export interface CampusAmbassadorReferralCount {
  userId: string;
  email: string | null;
  fullName: string | null;
  referralCode: string | null;
  referralCount: number;
}

// ---------- Student-facing ----------

export function useCampusAmbassadorSettings() {
  return useQuery({
    queryKey: ['campus-ambassador', 'settings'],
    queryFn: () => api.get<{ applicationsOpen: boolean }>('/campus-ambassador/settings'),
  });
}

export function useMyCampusAmbassadorApplication() {
  return useQuery({
    queryKey: ['campus-ambassador', 'me'],
    queryFn: () => api.get<CampusAmbassadorApplication | null>('/campus-ambassador/me'),
  });
}

export function useApplyCampusAmbassador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => api.post<CampusAmbassadorApplication>('/campus-ambassador/apply', { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campus-ambassador', 'me'] }),
  });
}

// ---------- Admin ----------

export function useCampusAmbassadorApplications(status?: CampusAmbassadorStatus) {
  return useQuery({
    queryKey: ['admin', 'campus-ambassador', 'applications', status],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (status) params.set('status', status);
      return api.paginated<CampusAmbassadorApplication>(`/campus-ambassador/applications?${params.toString()}`);
    },
  });
}

export function useDecideCampusAmbassadorApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      api.patch(`/campus-ambassador/applications/${id}/decide`, { approve }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'campus-ambassador'] });
    },
  });
}

export function useCampusAmbassadors() {
  return useQuery({
    queryKey: ['admin', 'campus-ambassador', 'ambassadors'],
    queryFn: () => api.get<CampusAmbassador[]>('/campus-ambassador/ambassadors'),
  });
}

export function useCampusAmbassadorReferrals() {
  return useQuery({
    queryKey: ['admin', 'campus-ambassador', 'referrals'],
    queryFn: () => api.get<CampusAmbassadorReferralCount[]>('/campus-ambassador/referrals'),
  });
}

export function useSetCampusAmbassadorSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationsOpen: boolean) => api.patch('/campus-ambassador/settings', { applicationsOpen }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campus-ambassador', 'settings'] }),
  });
}
