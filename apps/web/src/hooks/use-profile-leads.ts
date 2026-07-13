'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type StepData = Record<string, unknown>;

export interface ProfileLead {
  id: string;
  userId: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  step1?: StepData | null;
  step2?: StepData | null;
  step3?: StepData | null;
  step4?: StepData | null;
  step5?: StepData | null;
  completionPct: number;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { profile?: { avatarUrl?: string | null; collegeVerification?: string } | null } | null;
}

export interface UpsertStepInput {
  step: 1 | 2 | 3 | 4 | 5;
  completionPct: number;
  data: StepData;
  name?: string;
  phone?: string;
  email?: string;
}

// ---- student ----
export function useMyProfileLead(enabled = true) {
  return useQuery({
    queryKey: ['profile-lead', 'me'],
    queryFn: () => api.get<ProfileLead | null>('/profile-leads/me'),
    enabled,
    staleTime: 0,
  });
}

export function useUpsertProfileStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertStepInput) => api.post<ProfileLead>('/profile-leads/step', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile-lead', 'me'] }),
  });
}

// ---- admin ----
export function useProfileLeads() {
  return useQuery({
    queryKey: ['admin', 'profile-leads'],
    queryFn: () => api.get<ProfileLead[]>('/profile-leads'),
  });
}

export function useSetProfileLeadNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      api.patch<ProfileLead>(`/profile-leads/${id}/note`, { note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profile-leads'] }),
  });
}

export function useDeleteProfileLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.delete<{ ok: boolean }>(`/profile-leads/${id}`, { body: { reason } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'profile-leads'] }),
  });
}
