import { CertificateSourceType } from '@prisma/client';

/** Shape returned by the public `GET /internships/certificates/verify/:code` route. */
export interface PublicCertificateDto {
  code: string;
  recipientName: string;
  title: string;
  sourceType: CertificateSourceType;
  issuedAt: Date;
  revoked: boolean;
  metadata: unknown;
}
