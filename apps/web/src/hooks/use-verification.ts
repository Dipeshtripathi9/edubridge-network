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
  user: {
    id: string;
    email: string | null;
    profile?: { fullName: string; branch?: string | null; year?: number | null } | null;
  };
}

interface UploadResult {
  uploadUrl: string | null;
  key: string;
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
      collegeEmail?: string;
      file?: File | null;
    }) => {
      let evidenceKey: string | undefined;
      if (input.method !== 'COLLEGE_EMAIL' && input.file) {
        const presign = await api.post<UploadResult>('/verification/upload-url', {
          fileName: input.file.name,
          contentType: input.file.type || 'application/octet-stream',
        });
        if (presign.uploadUrl) {
          await fetch(presign.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': input.file.type || 'application/octet-stream' },
            body: input.file,
          });
        }
        evidenceKey = presign.key;
      }
      return api.post('/verification/request', {
        method: input.method,
        collegeId: input.collegeId,
        collegeEmail: input.collegeEmail,
        evidenceKey,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['verification', 'me'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
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
