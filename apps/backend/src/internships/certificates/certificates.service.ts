import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { CertificateSourceType, EnrollmentSubtype, Prisma, TrackBAllocationType, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

const CODE_ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no ambiguous I/O
const genCodeSuffix = customAlphabet(CODE_ALPHABET, 8);

export interface IssueCertificateInput {
  sourceType: CertificateSourceType;
  sourceId: string;
  recipientId: string;
  recipientName: string;
  subtype?: EnrollmentSubtype;
  allocationType?: TrackBAllocationType;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Server-generated title — never admin-free-typed, so it can't drift from the real facts. */
  private buildTitle(input: Pick<IssueCertificateInput, 'sourceType' | 'subtype' | 'allocationType'>): string {
    if (input.sourceType === CertificateSourceType.TRACK_A_ENROLLMENT) {
      return input.subtype === EnrollmentSubtype.OWN_PROJECT
        ? 'EduBridge Internship — Own Project Track'
        : 'EduBridge Internship — Guided Learning Track';
    }
    return input.allocationType === TrackBAllocationType.PAID_CLIENT_WORK
      ? 'EduBridge Internship — Paid Client Work'
      : 'EduBridge Internship — Skill Building Program';
  }

  /**
   * Single shared trigger point for issuing a certificate + the CERTIFICATE_ISSUED
   * notification. Called from TrackAService.complete() and TrackBService.review()
   * (on approve) — never duplicated per track. Idempotent: if a certificate already
   * exists for this (sourceType, sourceId) pair, it is returned as-is.
   */
  async issue(input: IssueCertificateInput) {
    const existing = await this.prisma.certificate.findUnique({
      where: { sourceType_sourceId: { sourceType: input.sourceType, sourceId: input.sourceId } },
    });
    if (existing) return existing;

    const title = this.buildTitle(input);

    // Retry on the astronomically unlikely code collision.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = `EB-${genCodeSuffix()}`;
      try {
        const cert = await this.prisma.certificate.create({
          data: {
            code,
            recipientId: input.recipientId,
            recipientName: input.recipientName,
            title,
            sourceType: input.sourceType,
            sourceId: input.sourceId,
            metadata: input.metadata,
          },
        });
        await this.notifications.create({
          recipientId: input.recipientId,
          type: 'CERTIFICATE_ISSUED',
          title: 'Your certificate is ready 🎓',
          body: `${title} — certificate code ${cert.code}.`,
          data: { certificateId: cert.id, code: cert.code },
        });
        return cert;
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') continue;
        throw err;
      }
    }
    throw new Error('Could not generate a unique certificate code');
  }

  /** Public verification payload — no sensitive fields, works for anonymous callers. */
  async verifyByCode(code: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { code } });
    if (!cert) throw new NotFoundException('No certificate found for this code');
    return {
      code: cert.code,
      recipientName: cert.recipientName,
      title: cert.title,
      sourceType: cert.sourceType,
      issuedAt: cert.issuedAt,
      revoked: !!cert.revokedAt,
      metadata: cert.metadata,
    };
  }

  async getForPublicPdf(code: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { code } });
    if (!cert) throw new NotFoundException('No certificate found for this code');
    return cert;
  }

  async myCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { recipientId: userId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async getForDownload(userId: string, role: string, id: string) {
    const cert = await this.prisma.certificate.findUnique({ where: { id } });
    if (!cert) throw new NotFoundException('Certificate not found');
    const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
    if (cert.recipientId !== userId && !isAdmin) {
      throw new ForbiddenException('Not your certificate');
    }
    return cert;
  }
}
