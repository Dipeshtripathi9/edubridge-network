'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

// ---- Enum literal unions, copied verbatim from the backend's Prisma enums ----
export type TrackBApplicationStatus = 'PENDING' | 'ALLOCATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type TrackBAllocationType = 'PAID_CLIENT_WORK' | 'SKILL_BUILDING_TASK';

export interface TrackBApplication {
  id: string;
  userId: string;
  skills: string[];
  portfolioUrl?: string | null;
  bio?: string | null;
  status: TrackBApplicationStatus;
  allocationType?: TrackBAllocationType | null;
  allocationNote?: string | null;
  allocatedById?: string | null;
  allocatedAt?: string | null;
  submissionUrl?: string | null;
  submittedAt?: string | null;
  reviewNote?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  payoutAmount?: number | null;
  payoutSentAt?: string | null;
  payoutNote?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string | null; profile?: { fullName: string } | null };
}

// ---------------- Student ----------------

export function useMyTrackBApplication() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['internships', 'track-b', 'me'],
    queryFn: () => api.get<TrackBApplication | null>('/internships/applications/me'),
    enabled: !!token,
  });
}

export function useApplyTrackB() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { skills: string[]; portfolioUrl?: string; bio?: string }) =>
      api.post<TrackBApplication>('/internships/apply', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships', 'track-b', 'me'] }),
  });
}

export function useSubmitTrackBWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, submissionUrl }: { id: string; submissionUrl: string }) =>
      api.post<TrackBApplication>(`/internships/applications/${id}/submit`, { submissionUrl }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships', 'track-b', 'me'] }),
  });
}

// ---------------- Admin ----------------

export function useAdminTrackBApplications(status?: TrackBApplicationStatus) {
  return useQuery({
    queryKey: ['internships', 'track-b', 'admin', status ?? 'ALL'],
    queryFn: () =>
      api.paginated<TrackBApplication>(
        `/internships/applications${status ? `?status=${status}&limit=50` : '?limit=50'}`,
      ),
  });
}

function invalidateTrackB(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['internships', 'track-b'] });
}

export function useAllocateTrackBWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      allocationType,
      allocationNote,
      payoutAmount,
    }: {
      id: string;
      allocationType: TrackBAllocationType;
      allocationNote?: string;
      payoutAmount?: number;
    }) =>
      api.post<{ id: string; status: TrackBApplicationStatus }>(`/internships/applications/${id}/allocate`, {
        allocationType,
        allocationNote,
        payoutAmount,
      }),
    onSuccess: () => invalidateTrackB(qc),
  });
}

export function useReviewTrackBSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      approve,
      reviewNote,
    }: {
      id: string;
      approve: boolean;
      reviewNote?: string;
    }) =>
      api.post<{ id: string; status: TrackBApplicationStatus; certificateId?: string }>(
        `/internships/applications/${id}/review`,
        { approve, reviewNote },
      ),
    onSuccess: () => {
      invalidateTrackB(qc);
      qc.invalidateQueries({ queryKey: ['certificates', 'me'] });
    },
  });
}

export function useMarkPayoutSent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payoutNote }: { id: string; payoutNote?: string }) =>
      api.post<{ id: string; payoutSentAt: string }>(`/internships/applications/${id}/payout-sent`, {
        payoutNote,
      }),
    onSuccess: () => invalidateTrackB(qc),
  });
}
