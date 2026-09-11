'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type CertificateSourceType = 'TRACK_A_ENROLLMENT' | 'TRACK_B_APPLICATION' | 'VIRTUAL_INTERNSHIP';

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

export function usePublicCertificate(code: string) {
  return useQuery({
    queryKey: ['certificates', 'verify', code],
    queryFn: () => api.get<PublicCertificate>(`/internships/certificates/verify/${code}`, { auth: false }),
    enabled: !!code,
    retry: false,
  });
}
