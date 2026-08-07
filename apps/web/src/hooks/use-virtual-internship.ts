'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

// ---- Enum literal unions, copied verbatim from the backend's Prisma enums ----
export type VirtualInternshipTrack = 'FOUR_WEEK' | 'FOUR_MONTH';
export type VirtualInternshipStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type VirtualInternshipEvaluationStatus = 'PENDING' | 'PASSED' | 'FAILED';

export interface VirtualInternshipEnrollment {
  id: string;
  userId: string;
  track: VirtualInternshipTrack;
  feeAmount: number;
  status: VirtualInternshipStatus;
  paymentReferenceNote?: string | null;
  paidAt?: string | null;
  paymentConfirmedById?: string | null;
  evaluationStatus: VirtualInternshipEvaluationStatus;
  evaluatedAt?: string | null;
  evaluatedById?: string | null;
  evaluationNote?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string | null; profile?: { fullName: string } | null };
}

// ---------------- Student ----------------

export function useMyVirtualInternshipEnrollment() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['virtual-internship', 'me'],
    queryFn: () => api.get<VirtualInternshipEnrollment | null>('/virtual-internship/enrollments/me'),
    enabled: !!token,
  });
}

export function useCreateVirtualInternshipEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { track: VirtualInternshipTrack }) =>
      api.post<VirtualInternshipEnrollment>('/virtual-internship/enroll', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-internship', 'me'] }),
  });
}

export function useSubmitVirtualInternshipPaymentReference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentReferenceNote }: { id: string; paymentReferenceNote: string }) =>
      api.patch<VirtualInternshipEnrollment>(`/virtual-internship/enrollments/${id}/payment-reference`, {
        paymentReferenceNote,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-internship', 'me'] }),
  });
}

// ---------------- Admin ----------------

export function useAdminVirtualInternshipEnrollments(status?: VirtualInternshipStatus) {
  return useQuery({
    queryKey: ['virtual-internship', 'admin', status ?? 'ALL'],
    queryFn: () =>
      api.paginated<VirtualInternshipEnrollment>(
        `/virtual-internship/enrollments${status ? `?status=${status}&limit=50` : '?limit=50'}`,
      ),
  });
}

export function useConfirmVirtualInternshipPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mentorNote }: { id: string; mentorNote?: string }) =>
      api.post<{ id: string; status: VirtualInternshipStatus }>(
        `/virtual-internship/enrollments/${id}/confirm-payment`,
        { mentorNote },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-internship'] }),
  });
}

export function useEvaluateVirtualInternshipEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, passed, note }: { id: string; passed: boolean; note?: string }) =>
      api.post<{ id: string; evaluationStatus: VirtualInternshipEvaluationStatus }>(
        `/virtual-internship/enrollments/${id}/evaluate`,
        { passed, note },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-internship'] }),
  });
}

export function useCompleteVirtualInternshipEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ id: string; status: VirtualInternshipStatus; certificateId: string }>(
        `/virtual-internship/enrollments/${id}/complete`,
        {},
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-internship'] }),
  });
}
