'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export type CertificateSourceType = 'TRACK_A_ENROLLMENT' | 'TRACK_B_APPLICATION';

export interface Certificate {
  id: string;
  code: string;
  recipientId: string;
  recipientName: string;
  title: string;
  sourceType: CertificateSourceType;
  sourceId: string;
  issuedAt: string;
  metadata?: unknown;
  revokedAt?: string | null;
}

/** Shape returned by the public `GET /internships/certificates/verify/:code` route. */
export interface PublicCertificate {
  code: string;
  recipientName: string;
  title: string;
  sourceType: CertificateSourceType;
  issuedAt: string;
  revoked: boolean;
  metadata: unknown;
}

export function useMyCertificates() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['certificates', 'me'],
    queryFn: () => api.get<Certificate[]>('/internships/certificates/me'),
    enabled: !!token,
  });
}

export function usePublicCertificate(code: string) {
  return useQuery({
    queryKey: ['certificates', 'verify', code],
    queryFn: () => api.get<PublicCertificate>(`/internships/certificates/verify/${code}`, { auth: false }),
    enabled: !!code,
    retry: false,
  });
}
