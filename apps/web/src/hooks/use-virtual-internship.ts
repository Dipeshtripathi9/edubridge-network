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
  /** GST percent applied on top of feeAmount (computed server-side, not stored). */
  gstPercent: number;
  gstAmount: number;
  /** feeAmount + gstAmount — the amount to actually pay. */
  totalAmount: number;
  /** Admin-configured external payment link for this track, if set. */
  paymentLink: string | null;
  status: VirtualInternshipStatus;
  paymentReferenceNote?: string | null;
  paymentLinkClickedAt?: string | null;
  paidAt?: string | null;
  paymentConfirmedById?: string | null;
  completedAt?: string | null;
  completedById?: string | null;
  evaluationStatus: VirtualInternshipEvaluationStatus;
  evaluatedAt?: string | null;
  evaluatedById?: string | null;
  evaluationNote?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string | null; phone?: string | null; profile?: { fullName: string } | null };
}

/** Public per-track pricing breakdown (used by the landing/enroll pages). */
export interface VirtualInternshipPricing {
  track: VirtualInternshipTrack;
  baseAmount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
}

/** Admin view of a track's config: the override (if any) + the effective breakdown. */
export interface VirtualInternshipTrackConfig extends VirtualInternshipPricing {
  url: string | null;
  baseFeeAmount: number | null;
  defaultBaseFeeAmount: number;
}

export function useVirtualInternshipPricing() {
  return useQuery({
    queryKey: ['virtual-internship', 'pricing'],
    queryFn: () => api.get<VirtualInternshipPricing[]>('/virtual-internship/pricing', { auth: false }),
  });
}

// ---------------- Curriculum tasks (admin-editable content) ----------------

export type VirtualInternshipTaskSubmissionStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface VirtualInternshipTask {
  id: string;
  track: VirtualInternshipTrack;
  /** null for FOUR_WEEK (flat); 1-4 for FOUR_MONTH */
  monthNum: number | null;
  weekNum: number;
  monthTitle?: string | null;
  monthDesc?: string | null;
  title: string;
  objective: string;
  deliverable: string;
  steps: string[];
  hours: string;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualInternshipTaskSubmission {
  id: string;
  taskId: string;
  enrollmentId: string;
  userId: string;
  githubUrl: string;
  status: VirtualInternshipTaskSubmissionStatus;
  reviewNote?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  task?: { id: string; track: VirtualInternshipTrack; monthNum: number | null; weekNum: number; title: string };
  user?: { id: string; email: string | null; phone?: string | null; profile?: { fullName: string } | null };
}

export function useVirtualInternshipTasks(track: VirtualInternshipTrack | undefined) {
  return useQuery({
    queryKey: ['virtual-internship', 'tasks', track],
    queryFn: () => api.get<VirtualInternshipTask[]>(`/virtual-internship/tasks?track=${track}`, { auth: false }),
    enabled: !!track,
  });
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

/** Fired when the student clicks "Pay ₹X" — best-effort, no UI feedback needed. */
export function useMarkVirtualInternshipPaymentLinkClicked() {
  return useMutation({
    mutationFn: (id: string) => api.post<{ ok: true }>(`/virtual-internship/enrollments/${id}/payment-link-clicked`, {}),
  });
}

export function useMyVirtualInternshipTaskSubmissions(enrollmentId: string | undefined) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['virtual-internship', 'submissions', 'me', enrollmentId],
    queryFn: () =>
      api.get<VirtualInternshipTaskSubmission[]>(`/virtual-internship/enrollments/${enrollmentId}/submissions`),
    enabled: !!token && !!enrollmentId,
  });
}

export function useSubmitVirtualInternshipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, githubUrl }: { taskId: string; githubUrl: string }) =>
      api.post<VirtualInternshipTaskSubmission>(`/virtual-internship/tasks/${taskId}/submit`, { githubUrl }),
    onSuccess: (submission) =>
      qc.invalidateQueries({ queryKey: ['virtual-internship', 'submissions', 'me', submission.enrollmentId] }),
  });
}

export interface VirtualInternshipFeedback {
  id: string;
  enrollmentId: string;
  userId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export function useVirtualInternshipFeedback(enrollmentId: string | undefined) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['virtual-internship', 'feedback', enrollmentId],
    queryFn: () => api.get<VirtualInternshipFeedback | null>(`/virtual-internship/enrollments/${enrollmentId}/feedback`),
    enabled: !!token && !!enrollmentId,
  });
}

export function useSubmitVirtualInternshipFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating, comment }: { id: string; rating: number; comment?: string }) =>
      api.post<VirtualInternshipFeedback>(`/virtual-internship/enrollments/${id}/feedback`, { rating, comment }),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: ['virtual-internship', 'feedback', id] }),
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

export function useRejectVirtualInternshipPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      api.post<{ id: string; status: VirtualInternshipStatus }>(
        `/virtual-internship/enrollments/${id}/reject-payment`,
        { note },
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

export interface VirtualInternshipMetrics {
  totalEnrollments: number;
  byStatus: Partial<Record<VirtualInternshipStatus, number>>;
  byTrack: Partial<Record<VirtualInternshipTrack, number>>;
  byEvaluation: Partial<Record<VirtualInternshipEvaluationStatus, number>>;
  certificatesIssued: number;
  paymentConfirmedRate: number;
  completionRate: number;
  averageSatisfactionRating: number | null;
  feedbackCount: number;
  averageQuizScorePercent: number;
}

export function useVirtualInternshipMetrics() {
  return useQuery({
    queryKey: ['virtual-internship', 'metrics'],
    queryFn: () => api.get<VirtualInternshipMetrics>('/virtual-internship/metrics'),
  });
}

export function useVirtualInternshipTrackConfigs() {
  return useQuery({
    queryKey: ['virtual-internship', 'track-config'],
    queryFn: () => api.get<VirtualInternshipTrackConfig[]>('/virtual-internship/track-config'),
  });
}

export function useUpdateVirtualInternshipTrackConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ track, url, baseFeeAmount }: { track: VirtualInternshipTrack; url?: string; baseFeeAmount?: number }) =>
      api.put<VirtualInternshipTrackConfig>(`/virtual-internship/track-config/${track}`, { url, baseFeeAmount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['virtual-internship', 'track-config'] });
      qc.invalidateQueries({ queryKey: ['virtual-internship', 'pricing'] });
      qc.invalidateQueries({ queryKey: ['virtual-internship', 'me'] });
      qc.invalidateQueries({ queryKey: ['virtual-internship', 'admin'] });
    },
  });
}

export interface UpsertVirtualInternshipTaskInput {
  track: VirtualInternshipTrack;
  monthNum?: number;
  weekNum: number;
  monthTitle?: string;
  monthDesc?: string;
  title: string;
  objective: string;
  deliverable: string;
  steps: string[];
  hours: string;
}

export function useAdminUpsertVirtualInternshipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertVirtualInternshipTaskInput) =>
      api.put<VirtualInternshipTask>('/virtual-internship/tasks', input),
    onSuccess: (task) => {
      qc.invalidateQueries({ queryKey: ['virtual-internship', 'tasks', task.track] });
    },
  });
}

export function useAdminDeleteVirtualInternshipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<{ id: string }>(`/virtual-internship/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-internship', 'tasks'] }),
  });
}

export function useAdminVirtualInternshipSubmissions(
  status?: VirtualInternshipTaskSubmissionStatus,
  track?: VirtualInternshipTrack,
) {
  return useQuery({
    queryKey: ['virtual-internship', 'submissions', 'admin', status ?? 'ALL', track ?? 'ALL'],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' });
      if (status) params.set('status', status);
      if (track) params.set('track', track);
      return api.paginated<VirtualInternshipTaskSubmission>(`/virtual-internship/submissions?${params.toString()}`);
    },
  });
}

export function useReviewVirtualInternshipSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reviewNote,
    }: {
      id: string;
      status: 'APPROVED' | 'REJECTED';
      reviewNote?: string;
    }) =>
      api.post<VirtualInternshipTaskSubmission>(`/virtual-internship/submissions/${id}/review`, {
        status,
        reviewNote,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-internship', 'submissions'] }),
  });
}
