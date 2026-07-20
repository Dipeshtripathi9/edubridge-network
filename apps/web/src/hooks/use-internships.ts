'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

// ---- Enum literal unions, copied verbatim from the backend's Prisma enums ----
export type EnrollmentSubtype = 'GUIDED_LEARNING' | 'OWN_PROJECT';
export type EnrollmentStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type EnrollmentTaskStatus = 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface EnrollmentTask {
  id: string;
  enrollmentId: string;
  title: string;
  description?: string | null;
  order: number;
  status: EnrollmentTaskStatus;
  submissionUrl?: string | null;
  submittedAt?: string | null;
  reviewNote?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackAEnrollment {
  id: string;
  userId: string;
  subtype: EnrollmentSubtype;
  projectDescription: string;
  feeAmount: number;
  status: EnrollmentStatus;
  paymentReferenceNote?: string | null;
  paidAt?: string | null;
  paymentConfirmedById?: string | null;
  mentorNote?: string | null;
  completedAt?: string | null;
  completedById?: string | null;
  maintenanceUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: EnrollmentTask[];
  user?: { id: string; email: string | null; profile?: { fullName: string } | null };
}

export interface PricingInfo {
  trackA: {
    GUIDED_LEARNING: { feeAmount: number; label: string; description: string };
    OWN_PROJECT: { feeAmount: number; label: string; description: string };
  };
  trackB: { label: string; description: string };
}

/**
 * The global `ResponseInterceptor` flattens paginated payloads — a controller
 * returning `{ data, meta }` produces `{ success, data: [...], meta: {...} }`,
 * NOT `{ success, data: { data: [...], meta: {...} } }`. `api.get` only
 * unwraps the outer envelope, so admin list endpoints must go through
 * `api.paginated`, which already expects this exact flattened shape.
 */

/** Public pricing info for both tracks — `GET /internships/pricing`. */
export function usePricing() {
  return useQuery({
    queryKey: ['internships', 'pricing'],
    queryFn: () => api.get<PricingInfo>('/internships/pricing', { auth: false }),
    staleTime: Infinity,
  });
}

// ---------------- Student ----------------

export function useMyTrackAEnrollment() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['internships', 'track-a', 'me'],
    queryFn: () => api.get<TrackAEnrollment | null>('/internships/enrollments/me'),
    enabled: !!token,
  });
}

export function useCreateTrackAEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { subtype: EnrollmentSubtype; projectDescription: string }) =>
      api.post<TrackAEnrollment>('/internships/enroll', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships', 'track-a', 'me'] }),
  });
}

export function useSubmitPaymentReference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentReferenceNote }: { id: string; paymentReferenceNote: string }) =>
      api.patch<TrackAEnrollment>(`/internships/enrollments/${id}/payment-reference`, { paymentReferenceNote }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships', 'track-a', 'me'] }),
  });
}

export function useSubmitTaskWork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, submissionUrl }: { taskId: string; submissionUrl: string }) =>
      api.post<EnrollmentTask>(`/internships/tasks/${taskId}/submit`, { submissionUrl }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships', 'track-a', 'me'] }),
  });
}

// ---------------- Admin ----------------

export function useAdminTrackAEnrollments(status?: EnrollmentStatus) {
  return useQuery({
    queryKey: ['internships', 'track-a', 'admin', status ?? 'ALL'],
    queryFn: () =>
      api.paginated<TrackAEnrollment>(
        `/internships/enrollments${status ? `?status=${status}&limit=50` : '?limit=50'}`,
      ),
  });
}

function invalidateTrackA(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['internships', 'track-a'] });
}

export function useConfirmPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mentorNote }: { id: string; mentorNote?: string }) =>
      api.post<{ id: string; status: EnrollmentStatus }>(`/internships/enrollments/${id}/confirm-payment`, {
        mentorNote,
      }),
    onSuccess: () => invalidateTrackA(qc),
  });
}

export function useAssignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      title,
      description,
      order,
    }: {
      id: string;
      title: string;
      description?: string;
      order?: number;
    }) => api.post<EnrollmentTask>(`/internships/enrollments/${id}/tasks`, { title, description, order }),
    onSuccess: () => invalidateTrackA(qc),
  });
}

export function useReviewTaskSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      approve,
      reviewNote,
    }: {
      taskId: string;
      approve: boolean;
      reviewNote?: string;
    }) => api.post<EnrollmentTask>(`/internships/tasks/${taskId}/review`, { approve, reviewNote }),
    onSuccess: () => invalidateTrackA(qc),
  });
}

export function useMarkTrackAComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ id: string; status: EnrollmentStatus; maintenanceUntil: string | null; certificateId: string }>(
        `/internships/enrollments/${id}/complete`,
      ),
    onSuccess: () => {
      invalidateTrackA(qc);
      qc.invalidateQueries({ queryKey: ['certificates', 'me'] });
    },
  });
}
