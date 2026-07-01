'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type VerificationMethod = 'COLLEGE_EMAIL' | 'ID_CARD' | 'ADMISSION_PROOF';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MyVerification {
  id: string;
  method: VerificationMethod;
  status: VerificationStatus;
  note?: string | null;
  collegeEmail?: string | null;
  college?: { id: string; name: string } | null;
  createdAt: string;
}

export interface VerificationRequestRow {
  id: string;
  method: VerificationMethod;
  collegeEmail?: string | null;
  evidenceKey?: string | null;
  createdAt: string;
  college?: { id: string; name: string } | null;
  collegeName?: string | null;
  collegeEmailVerified?: boolean;
  feedback?: Record<string, string> | null;
  user: {
    id: string;
    email: string | null;
    profile?: { fullName: string; branch?: string | null; year?: number | null } | null;
  };
}

export function useMyVerification() {
  return useQuery({
    queryKey: ['verification', 'me'],
    queryFn: () => api.get<MyVerification | null>('/verification/me'),
  });
}

export function useSubmitVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      method: VerificationMethod;
      collegeId?: string;
      collegeName?: string;
      collegeEmail?: string;
      collegeEmailVerified?: boolean;
      feedback?: Record<string, string>;
      evidenceUrl?: string; // Google Drive link for ID card / admission proof
    }) => {
      return api.post('/verification/request', {
        method: input.method,
        collegeId: input.collegeId,
        collegeName: input.collegeName,
        collegeEmail: input.collegeEmail,
        collegeEmailVerified: input.collegeEmailVerified,
        feedback: input.feedback,
        // Store the Drive link in evidenceKey (a plain string).
        evidenceKey: input.method !== 'COLLEGE_EMAIL' ? input.evidenceUrl : undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['verification', 'me'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useRequestCollegeEmail() {
  return useMutation({
    mutationFn: (email: string) =>
      api.post<{ message: string; devLink?: string }>('/verification/college-email/request', { email }),
  });
}

export function useConfirmCollegeEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      api.post<{ verified: boolean; email: string }>('/verification/college-email/confirm', { token }),
  });
}

export function useVerificationQueue() {
  return useQuery({
    queryKey: ['verification', 'queue'],
    queryFn: () => api.paginated<VerificationRequestRow>('/verification/requests?limit=30'),
  });
}

export function useDecideVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approve, note }: { id: string; approve: boolean; note?: string }) =>
      api.post(`/verification/requests/${id}/${approve ? 'approve' : 'reject'}`, { note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verification', 'queue'] }),
  });
}
