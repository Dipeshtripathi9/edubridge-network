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
  // Curriculum tasks (1-4) have the full static breakdown below; an
  // admin-assigned custom task (taskIndex 5+) has only `description` instead.
  objective?: string;
  deliverables?: string;
  steps?: string[];
  evaluationCriteria?: string;
  estimatedHours?: string;
  description?: string;
  // Set only for MONTH-track curriculum tasks — groups the 16 weekly tasks
  // into 4 month sections on the dashboard.
  monthNumber?: number;
  monthTitle?: string;
  monthDescription?: string;
}

export interface VirtualInternshipTasksResponse {
  enrollment: { id: string; track: VirtualInternshipTrack; status: VirtualInternshipEnrollmentStatus };
  progress: number;
  trackNote: string;
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

/** Every ACTIVE enrollment I hold — at most one per track — `GET /internships/virtual/enrollments/me/active`. */
export function useMyVirtualInternshipEnrollments() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['virtual-internship', 'me', 'active'],
    queryFn: () => api.get<VirtualInternshipEnrollment[]>('/internships/virtual/enrollments/me/active'),
    enabled: !!token,
  });
}

/** This enrollment's task list merged with submission/review state — only meaningful once ACTIVE. */
export function useMyVirtualInternshipTasks(enrollmentId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['virtual-internship', enrollmentId, 'tasks'],
    queryFn: () => api.get<VirtualInternshipTasksResponse>(`/internships/virtual/enrollments/${enrollmentId}/tasks`),
    enabled: !!token && !!enrollmentId,
  });
}

export function useSubmitVirtualInternshipTask(enrollmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskIndex, submissionUrl, note }: { taskIndex: number; submissionUrl: string; note?: string }) =>
      api.post(`/internships/virtual/enrollments/${enrollmentId}/tasks/${taskIndex}/submit`, { submissionUrl, note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['virtual-internship', enrollmentId, 'tasks'] }),
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
  return downloadBlob(`/internships/virtual/enrollments/${enrollmentId}/invoice`, `invoice-${enrollmentId}.pdf`, token);
}

export function downloadVirtualRewardDocument(
  type: 'letter' | 'report',
  enrollmentId: string,
  token: string | null,
) {
  return downloadBlob(
    `/internships/virtual/enrollments/${enrollmentId}/documents/${type}/download`,
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

export function useAdminAssignVirtualInternshipTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      enrollmentId,
      title,
      description,
    }: {
      enrollmentId: string;
      title: string;
      description?: string;
    }) => api.post(`/internships/virtual/admin/enrollments/${enrollmentId}/tasks`, { title, description }),
    onSuccess: () => invalidateAdminVirtualInternship(qc),
  });
}
