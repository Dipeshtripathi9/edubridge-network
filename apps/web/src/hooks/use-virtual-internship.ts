'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, API_URL } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

// ---- Enum literal unions, copied verbatim from the backend's Prisma enums ----
export type VirtualInternshipTrack = 'WEEK' | 'MONTH';
export type VirtualInternshipEnrollmentStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type VirtualInternshipTaskStatus = 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface VirtualInternshipEnrollment {
  id: string;
  userId: string;
  track: VirtualInternshipTrack;
  referralApplied: boolean;
  donateApplied: boolean;
  feeAmount: number;
  status: VirtualInternshipEnrollmentStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VirtualInternshipTaskView {
  id: string;
  taskIndex: number;
  status: VirtualInternshipTaskStatus;
  submissionUrl?: string | null;
  submissionNote?: string | null;
  submittedAt?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  unlocked: boolean;
  title: string;
  objective: string;
  deliverables: string;
  steps: string[];
  evaluationCriteria: string;
  estimatedHours: string;
}

export interface VirtualInternshipTasksResponse {
  enrollment: { id: string; track: VirtualInternshipTrack; status: VirtualInternshipEnrollmentStatus };
  progress: number;
  tasks: VirtualInternshipTaskView[];
}

export interface VirtualInternshipAdminStats {
  active: number;
  pendingPayment: number;
  byTrack: { WEEK: number; MONTH: number };
  submissionsPendingReview: number;
}

// ---------------- Student ----------------

/** My latest Virtual Internship enrollment — `GET /internships/virtual/enrollments/me`. */
export function useMyVirtualInternshipEnrollment() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['virtual-internship', 'me'],
    queryFn: () => api.get<VirtualInternshipEnrollment | null>('/internships/virtual/enrollments/me'),
    enabled: !!token,
  });
}

/** My task list merged with submission/review state — only meaningful once ACTIVE. */
export function useMyVirtualInternshipTasks() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['virtual-internship', 'me', 'tasks'],
    queryFn: () => api.get<VirtualInternshipTasksResponse>('/internships/virtual/enrollments/me/tasks'),
    enabled: !!token,
  });
}

export function useSubmitVirtualInternshipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskIndex, submissionUrl, note }: { taskIndex: number; submissionUrl: string; note?: string }) =>
      api.post(`/internships/virtual/enrollments/me/tasks/${taskIndex}/submit`, { submissionUrl, note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-internship', 'me', 'tasks'] }),
  });
}

/**
 * The invoice/document download endpoints are authenticated (JWT via
 * `Authorization` header only), so a plain `<a href>` would 401 — same
 * rationale as `certificate-card.tsx`'s `downloadCertificate`. Fetch as a
 * blob with the bearer token, then trigger the save via a throwaway anchor.
 */
async function downloadBlob(path: string, filename: string, token: string | null) {
  const res = await fetch(`${API_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new Error('Could not download this document');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadVirtualInvoice(enrollmentId: string, token: string | null) {
  return downloadBlob('/internships/virtual/enrollments/me/invoice', `invoice-${enrollmentId}.pdf`, token);
}

export function downloadVirtualRewardDocument(
  type: 'letter' | 'report',
  enrollmentId: string,
  token: string | null,
) {
  return downloadBlob(
    `/internships/virtual/enrollments/me/documents/${type}/download`,
    `${type}-${enrollmentId}.pdf`,
    token,
  );
}

// ---------------- Admin ----------------

export interface VirtualInternshipAdminEnrollment extends VirtualInternshipEnrollment {
  tasks: { id: string; taskIndex: number; status: VirtualInternshipTaskStatus }[];
  user: { id: string; email: string | null; profile?: { fullName: string } | null };
}

export function useAdminVirtualInternshipEnrollments(track?: VirtualInternshipTrack, status?: string) {
  const params = new URLSearchParams({ limit: '50' });
  if (track) params.set('track', track);
  if (status) params.set('status', status);
  return useQuery({
    queryKey: ['virtual-internship', 'admin', 'enrollments', track ?? 'ALL', status ?? 'ALL'],
    queryFn: () =>
      api.paginated<VirtualInternshipAdminEnrollment>(`/internships/virtual/admin/enrollments?${params}`),
  });
}

export function useAdminVirtualInternshipStats() {
  return useQuery({
    queryKey: ['virtual-internship', 'admin', 'stats'],
    queryFn: () => api.get<VirtualInternshipAdminStats>('/internships/virtual/admin/stats'),
  });
}

export interface VirtualInternshipAdminSubmission extends VirtualInternshipTaskView {
  enrollmentId: string;
  enrollment: {
    id: string;
    track: VirtualInternshipTrack;
    userId: string;
    user: { id: string; email: string | null; profile?: { fullName: string } | null };
  };
}

export function useAdminVirtualInternshipSubmissions() {
  return useQuery({
    queryKey: ['virtual-internship', 'admin', 'submissions'],
    queryFn: () =>
      api.get<VirtualInternshipAdminSubmission[]>('/internships/virtual/admin/submissions'),
  });
}

function invalidateAdminVirtualInternship(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['virtual-internship', 'admin'] });
}

export function useAdminReviewVirtualInternshipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, approve, reviewNote }: { taskId: string; approve: boolean; reviewNote?: string }) =>
      api.post(`/internships/virtual/admin/submissions/${taskId}/review`, { approve, reviewNote }),
    onSuccess: () => invalidateAdminVirtualInternship(qc),
  });
}
